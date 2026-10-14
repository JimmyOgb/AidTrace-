# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json

class AidTrace(gl.Contract):
    # Persistent storage annotations
    admin: Address
    project_counter: u256
    projects: TreeMap[str, str]
    milestones: TreeMap[str, str]
    milestone_counts: TreeMap[str, u256]
    authorized_reviewers: TreeMap[str, bool]
    audit_events: DynArray[str]

    def __init__(self):
        self.admin = gl.message.sender_address
        self.project_counter = u256(0)
        deployer_str = str(gl.message.sender_address).lower()
        self.authorized_reviewers[deployer_str] = True
        self._record_audit_event("CONTRACT_INITIALIZED", {
            "admin": deployer_str,
            "deployer_authorized": True
        })

    # -------------------------------------------------------------------------
    # Internal Helpers
    # -------------------------------------------------------------------------
    def _record_audit_event(self, event_type: str, payload: dict) -> None:
        event = {
            "type": event_type,
            "payload": payload,
            "sender": str(gl.message.sender_address).lower()
        }
        self.audit_events.append(json.dumps(event))

    def _require_admin(self) -> None:
        if gl.message.sender_address != self.admin:
            raise gl.vm.UserError("[EXPECTED] Unauthorized: caller is not admin")

    def _require_authorized_reviewer(self) -> None:
        caller = str(gl.message.sender_address).lower()
        is_auth = self.authorized_reviewers.get(caller, False)
        is_admin = (gl.message.sender_address == self.admin)
        if not is_auth and not is_admin:
            raise gl.vm.UserError(f"[EXPECTED] Unauthorized reviewer: {caller}")

    # -------------------------------------------------------------------------
    # Access Control Management
    # -------------------------------------------------------------------------
    @gl.public.write
    def set_reviewer_authorization(self, reviewer_address: str, authorized: bool) -> None:
        self._require_admin()
        clean_addr = str(reviewer_address).strip().lower()
        if not clean_addr:
            raise gl.vm.UserError("[EXPECTED] Invalid reviewer address")
        self.authorized_reviewers[clean_addr] = authorized
        self._record_audit_event("REVIEWER_ROLE_UPDATED", {
            "reviewer": clean_addr,
            "authorized": authorized
        })

    # -------------------------------------------------------------------------
    # Project Registry
    # -------------------------------------------------------------------------
    @gl.public.write
    def create_project(
        self,
        title: str,
        description: str,
        coarse_location: str,
        target_funding: str,
        aggregate_beneficiaries_target: int,
        measurable_outcomes: str
    ) -> int:
        if not title.strip() or not coarse_location.strip():
            raise gl.vm.UserError("[EXPECTED] Project title and coarse location are required")
        if aggregate_beneficiaries_target < 0:
            raise gl.vm.UserError("[EXPECTED] Aggregate beneficiaries target cannot be negative")

        self.project_counter += 1
        project_id = int(self.project_counter)
        p_key = str(project_id)

        project_data = {
            "id": project_id,
            "coordinator": str(gl.message.sender_address).lower(),
            "title": title.strip(),
            "description": description.strip(),
            "coarse_location": coarse_location.strip(),
            "target_funding": target_funding.strip(),
            "total_received": "0",
            "aggregate_beneficiaries_target": aggregate_beneficiaries_target,
            "measurable_outcomes": measurable_outcomes.strip(),
            "status": "ACTIVE",
            "milestone_count": 0
        }

        self.projects[p_key] = json.dumps(project_data)
        self.milestone_counts[p_key] = u256(0)

        self._record_audit_event("PROJECT_CREATED", {
            "project_id": project_id,
            "title": title.strip(),
            "coordinator": project_data["coordinator"],
            "target_funding": target_funding.strip()
        })

        return project_id

    @gl.public.write
    def set_project_status(self, project_id: int, new_status: str) -> None:
        p_key = str(project_id)
        raw_p = self.projects.get(p_key, "")
        if not raw_p:
            raise gl.vm.UserError(f"[EXPECTED] Project {project_id} does not exist")

        project = json.loads(raw_p)
        caller = str(gl.message.sender_address).lower()
        if caller != project["coordinator"] and gl.message.sender_address != self.admin:
            raise gl.vm.UserError("[EXPECTED] Caller is not authorized coordinator or admin")

        valid_statuses = ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]
        if new_status not in valid_statuses:
            raise gl.vm.UserError(f"[EXPECTED] Invalid status {new_status}")

        old_status = project["status"]
        project["status"] = new_status
        self.projects[p_key] = json.dumps(project)

        self._record_audit_event("PROJECT_STATUS_UPDATED", {
            "project_id": project_id,
            "old_status": old_status,
            "new_status": new_status
        })

    @gl.public.write
    def record_funding(self, project_id: int, amount: str, contributor: str) -> None:
        p_key = str(project_id)
        raw_p = self.projects.get(p_key, "")
        if not raw_p:
            raise gl.vm.UserError(f"[EXPECTED] Project {project_id} does not exist")

        project = json.loads(raw_p)
        if project["status"] != "ACTIVE":
            raise gl.vm.UserError(f"[EXPECTED] Project {project_id} is not ACTIVE")

        # Update received balance
        try:
            curr_val = float(project.get("total_received", "0"))
            add_val = float(amount)
            new_val = curr_val + add_val
            project["total_received"] = str(new_val)
        except ValueError:
            project["total_received"] = str(amount)

        self.projects[p_key] = json.dumps(project)

        self._record_audit_event("FUNDING_RECORDED", {
            "project_id": project_id,
            "amount": amount,
            "contributor": contributor,
            "total_received": project["total_received"]
        })

    # -------------------------------------------------------------------------
    # Milestone Management
    # -------------------------------------------------------------------------
    @gl.public.write
    def add_milestone(
        self,
        project_id: int,
        title: str,
        target_outcome: str,
        allocation_amount: str
    ) -> int:
        p_key = str(project_id)
        raw_p = self.projects.get(p_key, "")
        if not raw_p:
            raise gl.vm.UserError(f"[EXPECTED] Project {project_id} does not exist")

        project = json.loads(raw_p)
        caller = str(gl.message.sender_address).lower()
        if caller != project["coordinator"] and gl.message.sender_address != self.admin:
            raise gl.vm.UserError("[EXPECTED] Caller is not authorized coordinator")
        if project["status"] != "ACTIVE":
            raise gl.vm.UserError(f"[EXPECTED] Cannot add milestone to {project['status']} project")
        if not title.strip():
            raise gl.vm.UserError("[EXPECTED] Milestone title cannot be empty")

        current_count = self.milestone_counts.get(p_key, u256(0))
        milestone_id = int(current_count) + 1
        m_key = f"{project_id}:{milestone_id}"

        milestone_data = {
            "id": milestone_id,
            "project_id": project_id,
            "title": title.strip(),
            "target_outcome": target_outcome.strip(),
            "allocation_amount": allocation_amount.strip(),
            "evidence_hash": "",
            "metadata_uri": "",
            "status": "PENDING",
            "assessment_status": "NONE",
            "assessment_rationale": "",
            "reviewer": "",
            "rationale_hash": ""
        }

        self.milestones[m_key] = json.dumps(milestone_data)
        self.milestone_counts[p_key] = u256(milestone_id)
        project["milestone_count"] = milestone_id
        self.projects[p_key] = json.dumps(project)

        self._record_audit_event("MILESTONE_ADDED", {
            "project_id": project_id,
            "milestone_id": milestone_id,
            "title": title.strip(),
            "allocation_amount": allocation_amount.strip()
        })

        return milestone_id

    # -------------------------------------------------------------------------
    # Evidence Submission
    # -------------------------------------------------------------------------
    @gl.public.write
    def submit_milestone_evidence(
        self,
        project_id: int,
        milestone_id: int,
        evidence_hash: str,
        metadata_uri: str
    ) -> None:
        p_key = str(project_id)
        raw_p = self.projects.get(p_key, "")
        if not raw_p:
            raise gl.vm.UserError(f"[EXPECTED] Project {project_id} does not exist")

        project = json.loads(raw_p)
        caller = str(gl.message.sender_address).lower()
        if caller != project["coordinator"] and gl.message.sender_address != self.admin:
            raise gl.vm.UserError("[EXPECTED] Caller is not authorized coordinator")
        if project["status"] != "ACTIVE":
            raise gl.vm.UserError(f"[EXPECTED] Project is not ACTIVE")

        clean_hash = evidence_hash.strip().lower()
        if not clean_hash or clean_hash == "0x0" or clean_hash == "0" * 64:
            raise gl.vm.UserError("[EXPECTED] Valid non-zero evidence hash is required")

        m_key = f"{project_id}:{milestone_id}"
        raw_m = self.milestones.get(m_key, "")
        if not raw_m:
            raise gl.vm.UserError(f"[EXPECTED] Milestone {milestone_id} does not exist")

        milestone = json.loads(raw_m)
        if milestone["status"] == "VERIFIED":
            raise gl.vm.UserError("[EXPECTED] Cannot overwrite finalized VERIFIED milestone")

        milestone["evidence_hash"] = clean_hash
        milestone["metadata_uri"] = metadata_uri.strip()
        milestone["status"] = "SUBMITTED"
        self.milestones[m_key] = json.dumps(milestone)

        self._record_audit_event("EVIDENCE_SUBMITTED", {
            "project_id": project_id,
            "milestone_id": milestone_id,
            "evidence_hash": clean_hash,
            "metadata_uri": metadata_uri.strip(),
            "submitter": caller
        })

    # -------------------------------------------------------------------------
    # Intelligent Evidence Assessment (GenLayer Non-Deterministic Consensus)
    # -------------------------------------------------------------------------
    @gl.public.write
    def assess_evidence_criteria(
        self,
        project_id: int,
        milestone_id: int,
        criteria: str,
        evidence_summary: str
    ) -> str:
        """
        Executes constrained intelligent assessment using GenLayer LLM consensus.
        Compares submitted evidence claims against stated milestone criteria.
        
        HUMILITY IN AI PRINCIPLE:
        This assessment records an AI evaluation status only.
        It DOES NOT replace or equate to authorized human reviewer verification.
        """
        p_key = str(project_id)
        raw_p = self.projects.get(p_key, "")
        if not raw_p:
            raise gl.vm.UserError(f"[EXPECTED] Project {project_id} does not exist")

        m_key = f"{project_id}:{milestone_id}"
        raw_m = self.milestones.get(m_key, "")
        if not raw_m:
            raise gl.vm.UserError(f"[EXPECTED] Milestone {milestone_id} does not exist")

        milestone = json.loads(raw_m)
        if milestone["status"] not in ["SUBMITTED", "UNDER_REVIEW"]:
            raise gl.vm.UserError(f"[EXPECTED] Milestone must be in SUBMITTED or UNDER_REVIEW state")
        if not criteria.strip() or not evidence_summary.strip():
            raise gl.vm.UserError("[EXPECTED] Criteria and evidence summary must not be empty")

        # Define non-deterministic execution task
        def run_assessment():
            prompt = f"""You are an objective auditor assessing whether non-sensitive humanitarian aid evidence metadata matches project criteria.
CRITERIA:
{criteria.strip()}

SUBMITTED EVIDENCE SUMMARY:
{evidence_summary.strip()}

Evaluate whether the evidence summary provides coherent, plausible documentation supporting the criteria.
Return ONLY valid JSON with keys:
- "assessment": exactly one of "SATISFACTORY", "INSUFFICIENT", or "DISCREPANCY"
- "reasoning": a concise 1-2 sentence explanation of your finding."""

            analysis = gl.nondet.exec_prompt(prompt, response_format="json")
            if isinstance(analysis, str):
                try:
                    analysis = json.loads(analysis)
                except Exception:
                    raise gl.vm.UserError("[LLM_ERROR] LLM returned invalid JSON")
            if not isinstance(analysis, dict):
                raise gl.vm.UserError(f"[LLM_ERROR] LLM returned non-dict response")

            raw_decision = str(analysis.get("assessment", "")).strip().upper()
            if raw_decision not in ["SATISFACTORY", "INSUFFICIENT", "DISCREPANCY"]:
                raw_decision = "INSUFFICIENT"

            reasoning = str(analysis.get("reasoning", "")).strip()
            return {
                "assessment": raw_decision,
                "reasoning": reasoning
            }

        # Equivalence principle: validators must agree on the assessment decision
        result = gl.eq_principle.prompt_comparative(
            run_assessment,
            principle="`assessment` field must be exactly the same. `reasoning` must convey equivalent rationale."
        )

        decision = result.get("assessment", "INSUFFICIENT")
        rationale = result.get("reasoning", "")

        milestone["assessment_status"] = f"ASSESSED_{decision}"
        milestone["assessment_rationale"] = rationale
        self.milestones[m_key] = json.dumps(milestone)

        self._record_audit_event("INTELLIGENT_ASSESSMENT_COMPLETED", {
            "project_id": project_id,
            "milestone_id": milestone_id,
            "assessment_status": milestone["assessment_status"],
            "rationale": rationale
        })

        return milestone["assessment_status"]

    # -------------------------------------------------------------------------
    # Reviewer Verification Workflow
    # -------------------------------------------------------------------------
    @gl.public.write
    def set_milestone_under_review(self, project_id: int, milestone_id: int) -> None:
        self._require_authorized_reviewer()
        m_key = f"{project_id}:{milestone_id}"
        raw_m = self.milestones.get(m_key, "")
        if not raw_m:
            raise gl.vm.UserError(f"[EXPECTED] Milestone {milestone_id} does not exist")

        milestone = json.loads(raw_m)
        if milestone["status"] != "SUBMITTED":
            raise gl.vm.UserError(f"[EXPECTED] Milestone status must be SUBMITTED to move to UNDER_REVIEW")

        milestone["status"] = "UNDER_REVIEW"
        self.milestones[m_key] = json.dumps(milestone)

        self._record_audit_event("MILESTONE_UNDER_REVIEW", {
            "project_id": project_id,
            "milestone_id": milestone_id,
            "reviewer": str(gl.message.sender_address).lower()
        })

    @gl.public.write
    def review_milestone_evidence(
        self,
        project_id: int,
        milestone_id: int,
        outcome: str,
        rationale_hash: str
    ) -> None:
        self._require_authorized_reviewer()
        m_key = f"{project_id}:{milestone_id}"
        raw_m = self.milestones.get(m_key, "")
        if not raw_m:
            raise gl.vm.UserError(f"[EXPECTED] Milestone {milestone_id} does not exist")

        milestone = json.loads(raw_m)
        if milestone["status"] == "VERIFIED":
            raise gl.vm.UserError("[EXPECTED] Cannot modify finalized VERIFIED milestone")

        if milestone["status"] not in ["SUBMITTED", "UNDER_REVIEW", "DISPUTED"]:
            raise gl.vm.UserError(f"[EXPECTED] Invalid state {milestone['status']} for review")

        valid_outcomes = ["VERIFIED", "REJECTED", "DISPUTED"]
        if outcome not in valid_outcomes:
            raise gl.vm.UserError(f"[EXPECTED] Invalid review outcome {outcome}")

        reviewer_addr = str(gl.message.sender_address).lower()
        milestone["status"] = outcome
        milestone["reviewer"] = reviewer_addr
        milestone["rationale_hash"] = rationale_hash.strip().lower()
        self.milestones[m_key] = json.dumps(milestone)

        self._record_audit_event("EVIDENCE_REVIEWED", {
            "project_id": project_id,
            "milestone_id": milestone_id,
            "outcome": outcome,
            "reviewer": reviewer_addr,
            "rationale_hash": rationale_hash.strip().lower()
        })

    # -------------------------------------------------------------------------
    # Public Read Methods (Zero-Wallet Exploration)
    # -------------------------------------------------------------------------
    @gl.public.view
    def get_project_count(self) -> int:
        return int(self.project_counter)

    @gl.public.view
    def get_project(self, project_id: int) -> dict:
        raw_p = self.projects.get(str(project_id), "")
        if not raw_p:
            raise gl.vm.UserError(f"[EXPECTED] Project {project_id} does not exist")
        return json.loads(raw_p)

    @gl.public.view
    def get_milestone(self, project_id: int, milestone_id: int) -> dict:
        raw_m = self.milestones.get(f"{project_id}:{milestone_id}", "")
        if not raw_m:
            raise gl.vm.UserError(f"[EXPECTED] Milestone {milestone_id} does not exist")
        return json.loads(raw_m)

    @gl.public.view
    def get_project_milestones(self, project_id: int) -> list:
        p_key = str(project_id)
        count = int(self.milestone_counts.get(p_key, u256(0)))
        items = []
        for i in range(1, count + 1):
            raw_m = self.milestones.get(f"{project_id}:{i}", "")
            if raw_m:
                items.append(json.loads(raw_m))
        return items

    @gl.public.view
    def get_verified_milestones_count(self, project_id: int) -> int:
        p_key = str(project_id)
        count = int(self.milestone_counts.get(p_key, u256(0)))
        verified = 0
        for i in range(1, count + 1):
            raw_m = self.milestones.get(f"{project_id}:{i}", "")
            if raw_m:
                m = json.loads(raw_m)
                if m.get("status") == "VERIFIED":
                    verified += 1
        return verified

    @gl.public.view
    def is_authorized_reviewer(self, reviewer_address: str) -> bool:
        clean = str(reviewer_address).strip().lower()
        return self.authorized_reviewers.get(clean, False) or (clean == str(self.admin).lower())

    @gl.public.view
    def get_audit_trail(self) -> list:
        events = []
        for raw in self.audit_events:
            events.append(json.loads(raw))
        return events
