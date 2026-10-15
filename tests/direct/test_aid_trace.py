import json
import pytest

def to_hex(addr) -> str:
    if isinstance(addr, bytes):
        return "0x" + addr.hex().lower()
    return str(addr).lower()


def test_initialization_and_admin_role(direct_vm, direct_deploy, direct_owner, direct_alice):
    direct_vm.sender = direct_owner
    contract = direct_deploy("contracts/aid_trace.py")

    assert contract.get_project_count() == 0
    assert contract.is_authorized_reviewer(to_hex(direct_owner)) is True
    assert contract.is_authorized_reviewer(to_hex(direct_alice)) is False


def test_reviewer_authorization_management(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    direct_vm.sender = direct_owner
    contract = direct_deploy("contracts/aid_trace.py")

    # Admin grants reviewer
    contract.set_reviewer_authorization(to_hex(direct_alice), True)
    assert contract.is_authorized_reviewer(to_hex(direct_alice)) is True

    # Non-admin attempts to grant reviewer -> Reverts
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("caller is not admin"):
        contract.set_reviewer_authorization(to_hex(direct_bob), True)

    # Admin revokes reviewer
    direct_vm.sender = direct_owner
    contract.set_reviewer_authorization(to_hex(direct_alice), False)
    assert contract.is_authorized_reviewer(to_hex(direct_alice)) is False


def test_project_registration_and_validation(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice

    # Valid creation
    p_id = contract.create_project(
        "Horn of Africa Emergency Water Logistics",
        "Solar-powered borehole drilling in Turkana County.",
        "Turkana County, Kenya",
        "10 ETH",
        1200,
        "3 boreholes drilled, 1200 households served"
    )
    assert p_id == 1
    assert contract.get_project_count() == 1

    project = contract.get_project(1)
    assert project["title"] == "Horn of Africa Emergency Water Logistics"
    assert project["coarse_location"] == "Turkana County, Kenya"
    assert project["coordinator"] == to_hex(direct_alice)
    assert project["target_funding"] == "10 ETH"
    assert project["total_received"] == "0"
    assert project["aggregate_beneficiaries_target"] == 1200
    assert project["status"] == "ACTIVE"

    # Empty title validation -> Reverts
    with direct_vm.expect_revert("Project title and coarse location are required"):
        contract.create_project("", "Desc", "Region", "5 ETH", 50, "Outcomes")

    # Negative beneficiaries validation -> Reverts
    with direct_vm.expect_revert("Aggregate beneficiaries target cannot be negative"):
        contract.create_project("Title", "Desc", "Region", "5 ETH", -10, "Outcomes")


def test_project_status_transitions_and_auth(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Project 1", "Desc", "Region", "5 ETH", 100, "Outcomes")

    # Unauthorized caller cannot change status
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Caller is not authorized coordinator"):
        contract.set_project_status(1, "PAUSED")

    # Coordinator can pause project
    direct_vm.sender = direct_alice
    contract.set_project_status(1, "PAUSED")
    assert contract.get_project(1)["status"] == "PAUSED"

    # Coordinator can reactivate
    contract.set_project_status(1, "ACTIVE")
    assert contract.get_project(1)["status"] == "ACTIVE"


def test_transparent_funding_accounting(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Clean Water Project", "Desc", "Region", "10.0 ETH", 500, "Outcomes")

    direct_vm.sender = direct_bob
    contract.record_funding(1, "2.5", to_hex(direct_bob))

    project = contract.get_project(1)
    assert project["target_funding"] == "10.0 ETH"  # Static declared target
    assert project["total_received"] == "2.5"       # Accumulated balance

    # Additional contribution
    contract.record_funding(1, "1.5", to_hex(direct_bob))
    updated = contract.get_project(1)
    assert updated["total_received"] == "4.0"


def test_milestone_creation_and_evidence_submission(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Solar Clinic", "Desc", "Region", "5 ETH", 300, "Outcomes")

    # Add milestone
    m_id = contract.add_milestone(
        1,
        "Procurement of 20 Solar Panels",
        "Panels delivered to regional logistics warehouse",
        "2.0 ETH"
    )
    assert m_id == 1

    milestones = contract.get_project_milestones(1)
    assert len(milestones) == 1
    assert milestones[0]["title"] == "Procurement of 20 Solar Panels"
    assert milestones[0]["status"] == "PENDING"
    assert milestones[0]["assessment_status"] == "NONE"

    # Unauthorized caller cannot submit evidence
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Caller is not authorized coordinator"):
        contract.submit_milestone_evidence(1, 1, "0xabcd1234", "ipfs://uri")

    # Empty hash reverts
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("Valid non-zero evidence hash is required"):
        contract.submit_milestone_evidence(1, 1, "", "ipfs://uri")

    # Valid evidence submission
    evidence_hash = "0x70f20de1d9de31c6c4eb330538123c5b0ce719d394bc28e67025f6ff5df1e9e9"
    contract.submit_milestone_evidence(1, 1, evidence_hash, "ipfs://bafybeicid123")

    m = contract.get_milestone(1, 1)
    assert m["status"] == "SUBMITTED"
    assert m["evidence_hash"] == evidence_hash
    assert m["metadata_uri"] == "ipfs://bafybeicid123"


def test_intelligent_evidence_assessment(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Water Borehole", "Desc", "Region", "10 ETH", 500, "Outcomes")
    contract.add_milestone(1, "Drilling Borehole", "Water flow 25000L/day", "4 ETH")
    contract.submit_milestone_evidence(1, 1, "0xabcdef123456", "ipfs://manifest")

    # Mock GenLayer LLM response for SATISFACTORY consensus
    direct_vm.mock_llm(
        r".*assessing whether non-sensitive humanitarian aid evidence.*",
        json.dumps({
            "assessment": "SATISFACTORY",
            "reasoning": "Dispatch manifest and borehole flow rate logs match stated criteria."
        })
    )

    assessment = contract.assess_evidence_criteria(
        1,
        1,
        "3 boreholes drilled and verified water flow rate",
        "Official dispatch receipt batch #01 with certified flow rate test report"
    )

    assert assessment == "ASSESSED_SATISFACTORY"
    m = contract.get_milestone(1, 1)
    assert m["assessment_status"] == "ASSESSED_SATISFACTORY"
    assert "borehole flow rate" in m["assessment_rationale"]
    # CRITICAL: Intelligent assessment DOES NOT verify or complete milestone!
    assert m["status"] == "SUBMITTED"


def test_intelligent_assessment_insufficient_evidence(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Nutrition Aid", "Desc", "Region", "5 ETH", 200, "Outcomes")
    contract.add_milestone(1, "Porridge Distribution", "500 bags to clinics", "2 ETH")
    contract.submit_milestone_evidence(1, 1, "0x11223344", "ipfs://notes")

    # Mock GenLayer LLM response for INSUFFICIENT evidence
    direct_vm.mock_llm(
        r".*assessing whether non-sensitive humanitarian aid evidence.*",
        json.dumps({
            "assessment": "INSUFFICIENT",
            "reasoning": "Provided notes mention intention but lack warehouse dispatch manifest or delivery sign-off."
        })
    )

    assessment = contract.assess_evidence_criteria(
        1,
        1,
        "500 bags distributed with signed clinic manifests",
        "Informal internal email thread discussing procurement"
    )

    assert assessment == "ASSESSED_INSUFFICIENT"
    m = contract.get_milestone(1, 1)
    assert m["assessment_status"] == "ASSESSED_INSUFFICIENT"
    assert m["status"] == "SUBMITTED"


def test_reviewer_attestation_and_fail_closed_security(direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob):
    direct_vm.sender = direct_owner
    contract = direct_deploy("contracts/aid_trace.py")

    # Authorize Bob as reviewer
    contract.set_reviewer_authorization(to_hex(direct_bob), True)

    # Alice creates project and submits evidence
    direct_vm.sender = direct_alice
    contract.create_project("Medical Kits", "Desc", "Region", "8 ETH", 400, "Outcomes")
    contract.add_milestone(1, "Kit Assembly", "400 first aid kits packed", "3 ETH")
    contract.submit_milestone_evidence(1, 1, "0xhash999", "ipfs://manifest-999")

    # Unauthorized user (Alice) cannot review evidence
    with direct_vm.expect_revert("Unauthorized reviewer"):
        contract.review_milestone_evidence(1, 1, "VERIFIED", "0xrationale")

    # Authorized reviewer Bob reviews
    direct_vm.sender = direct_bob
    contract.set_milestone_under_review(1, 1)
    assert contract.get_milestone(1, 1)["status"] == "UNDER_REVIEW"

    rationale_hash = "0xfee1deadcafebabe"
    contract.review_milestone_evidence(1, 1, "VERIFIED", rationale_hash)

    m = contract.get_milestone(1, 1)
    assert m["status"] == "VERIFIED"
    assert m["reviewer"] == to_hex(direct_bob)
    assert m["rationale_hash"] == rationale_hash

    # Immutability: Cannot overwrite verified milestone
    with direct_vm.expect_revert("Cannot modify finalized VERIFIED milestone"):
        contract.review_milestone_evidence(1, 1, "REJECTED", "0xtamper")

    # Coordinator cannot resubmit evidence to finalized milestone
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("Cannot overwrite finalized VERIFIED milestone"):
        contract.submit_milestone_evidence(1, 1, "0xnewhash", "ipfs://newuri")

    # Verified count query
    assert contract.get_verified_milestones_count(1) == 1


def test_audit_trail_recording(direct_vm, direct_deploy, direct_owner, direct_alice):
    direct_vm.sender = direct_owner
    contract = direct_deploy("contracts/aid_trace.py")

    direct_vm.sender = direct_alice
    contract.create_project("Project Audit", "Desc", "Region", "1 ETH", 10, "Outcomes")

    audit_trail = contract.get_audit_trail()
    assert len(audit_trail) >= 2  # CONTRACT_INITIALIZED + PROJECT_CREATED
    assert audit_trail[0]["type"] == "CONTRACT_INITIALIZED"
    assert audit_trail[1]["type"] == "PROJECT_CREATED"
    assert audit_trail[1]["payload"]["project_id"] == 1


def test_invalid_evidence_hash_and_tamper_prevention(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Water Filter Kits", "Desc", "Region", "5 ETH", 100, "Outcomes")
    contract.add_milestone(1, "Procurement", "50 filters", "2 ETH")

    # Empty hash reverts
    with direct_vm.expect_revert("Valid non-zero evidence hash is required"):
        contract.submit_milestone_evidence(1, 1, "", "ipfs://doc")

    # 0x0 hash reverts
    with direct_vm.expect_revert("Valid non-zero evidence hash is required"):
        contract.submit_milestone_evidence(1, 1, "0x0", "ipfs://doc")

    # All-zero 64-char hash reverts
    with direct_vm.expect_revert("Valid non-zero evidence hash is required"):
        contract.submit_milestone_evidence(1, 1, "0" * 64, "ipfs://doc")


def test_funding_record_accounting_and_non_active_guard(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Solar Clinics", "Desc", "Region", "10 ETH", 200, "Outcomes")

    # Alice pauses project
    contract.set_project_status(1, "PAUSED")
    assert contract.get_project(1)["status"] == "PAUSED"

    # Bob attempts funding on paused project -> Reverts
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Project 1 is not ACTIVE"):
        contract.record_funding(1, "1.0", to_hex(direct_bob))

    # Reactivate and verify accounting accumulation
    direct_vm.sender = direct_alice
    contract.set_project_status(1, "ACTIVE")
    direct_vm.sender = direct_bob
    contract.record_funding(1, "3.5", to_hex(direct_bob))
    contract.record_funding(1, "1.5", to_hex(direct_bob))

    project = contract.get_project(1)
    assert float(project["total_received"]) == 5.0
    assert project["target_funding"] == "10 ETH"


def test_multiple_milestones_and_state_consistency(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/aid_trace.py")
    direct_vm.sender = direct_alice
    contract.create_project("Logistics Pipeline", "Desc", "Region", "20 ETH", 500, "Outcomes")

    m1 = contract.add_milestone(1, "Phase 1 Logistics", "Warehousing", "5 ETH")
    m2 = contract.add_milestone(1, "Phase 2 Delivery", "Ground Transport", "10 ETH")
    m3 = contract.add_milestone(1, "Phase 3 Handover", "Community sign-off", "5 ETH")

    assert m1 == 1
    assert m2 == 2
    assert m3 == 3

    all_milestones = contract.get_project_milestones(1)
    assert len(all_milestones) == 3
    assert all_milestones[0]["title"] == "Phase 1 Logistics"
    assert all_milestones[1]["title"] == "Phase 2 Delivery"
    assert all_milestones[2]["title"] == "Phase 3 Handover"

    # Nonexistent milestone query reverts
    with direct_vm.expect_revert("Milestone 99 does not exist"):
        contract.get_milestone(1, 99)


def test_permissionless_creation_and_independent_read(direct_vm, direct_deploy, direct_alice, direct_bob):
    """
    Acceptance Test:
    1. An individual wallet (Alice) permissionlessly creates a project.
    2. Contract records Alice as the authenticated coordinator.
    3. Another wallet (Bob) independently reads the project and verifies state.
    4. Bob is prevented from adding milestones or modifying status of Alice's project.
    5. Alice successfully adds a milestone and Bob independently verifies it.
    """
    contract = direct_deploy("contracts/aid_trace.py")

    # 1. Alice creates project
    direct_vm.sender = direct_alice
    p_id = contract.create_project(
        "Permissionless Clean Water Initiative",
        "Community managed solar water filtration system.",
        "Garissa County, Kenya",
        "12 ETH",
        650,
        "Continuous potable water delivery to 650 households"
    )
    assert p_id == 1

    # 2. Contract records Alice as authenticated coordinator
    project_read_by_alice = contract.get_project(1)
    assert project_read_by_alice["coordinator"] == to_hex(direct_alice)
    assert project_read_by_alice["status"] == "ACTIVE"
    assert project_read_by_alice["total_received"] == "0"

    # 3. Bob independently reads the project
    direct_vm.sender = direct_bob
    project_read_by_bob = contract.get_project(1)
    assert project_read_by_bob["id"] == 1
    assert project_read_by_bob["coordinator"] == to_hex(direct_alice)
    assert project_read_by_bob["title"] == "Permissionless Clean Water Initiative"

    # 4. Bob cannot modify Alice's project (Access Control)
    with direct_vm.expect_revert("Caller is not authorized coordinator"):
        contract.add_milestone(1, "Unauthorized Milestone", "Outcome", "1 ETH")

    with direct_vm.expect_revert("Caller is not authorized coordinator"):
        contract.set_project_status(1, "PAUSED")

    # 5. Alice adds milestone and Bob independently reads it
    direct_vm.sender = direct_alice
    m_id = contract.add_milestone(1, "Filtration Unit Delivery", "Delivered on site", "3 ETH")
    assert m_id == 1

    direct_vm.sender = direct_bob
    bob_milestones = contract.get_project_milestones(1)
    assert len(bob_milestones) == 1
    assert bob_milestones[0]["title"] == "Filtration Unit Delivery"
    assert bob_milestones[0]["status"] == "PENDING"


