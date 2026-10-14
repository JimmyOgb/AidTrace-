import { expect } from "chai";
import { ethers } from "hardhat";
import { AidTraceCore } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AidTraceCore Smart Contract Test Suite", function () {
  let aidTrace: AidTraceCore;
  let admin: HardhatEthersSigner;
  let coordinator: HardhatEthersSigner;
  let reviewer: HardhatEthersSigner;
  let donor: HardhatEthersSigner;
  let unauthorizedUser: HardhatEthersSigner;

  const sampleEvidenceHash = ethers.keccak256(ethers.toUtf8Bytes("Water_Purification_Delivery_Manifest_2026.pdf"));
  const sampleRationaleHash = ethers.keccak256(ethers.toUtf8Bytes("Verified physical borehole drilling via GPS photo logs."));

  beforeEach(async function () {
    [admin, coordinator, reviewer, donor, unauthorizedUser] = await ethers.getSigners();

    const AidTraceFactory = await ethers.getContractFactory("AidTraceCore");
    aidTrace = await AidTraceFactory.deploy();
    await aidTrace.waitForDeployment();
  });

  describe("Deployment & Access Initialization", function () {
    it("should set deployer as admin and authorized reviewer", async function () {
      expect(await aidTrace.admin()).to.equal(admin.address);
      expect(await aidTrace.authorizedReviewers(admin.address)).to.be.true;
      expect(await aidTrace.getProjectCount()).to.equal(0);
    });

    it("should allow admin to grant and revoke reviewer role", async function () {
      await expect(aidTrace.setReviewerAuthorization(reviewer.address, true))
        .to.emit(aidTrace, "ReviewerAuthorizationChanged")
        .withArgs(reviewer.address, true);

      expect(await aidTrace.authorizedReviewers(reviewer.address)).to.be.true;

      await expect(aidTrace.setReviewerAuthorization(reviewer.address, false))
        .to.emit(aidTrace, "ReviewerAuthorizationChanged")
        .withArgs(reviewer.address, false);

      expect(await aidTrace.authorizedReviewers(reviewer.address)).to.be.false;
    });

    it("should prevent non-admin from modifying reviewers", async function () {
      await expect(
        aidTrace.connect(unauthorizedUser).setReviewerAuthorization(reviewer.address, true)
      ).to.be.revertedWithCustomError(aidTrace, "UnauthorizedAdmin");
    });
  });

  describe("Project Registration & Lifecycle", function () {
    it("should allow coordinator to create an aid project with aggregate metrics", async function () {
      const tx = await aidTrace.connect(coordinator).createProject(
        "Clean Water Initiative",
        "Community borehole drilling and water purification.",
        "Turkana County, Kenya",
        ethers.parseEther("10"), // 10 ETH target
        500, // 500 households aggregate target
        "3 boreholes drilled, 500 households served"
      );

      await expect(tx)
        .to.emit(aidTrace, "ProjectCreated")
        .withArgs(1, coordinator.address, "Clean Water Initiative", "Turkana County, Kenya", ethers.parseEther("10"), 500);

      const project = await aidTrace.getProject(1);
      expect(project.id).to.equal(1);
      expect(project.coordinator).to.equal(coordinator.address);
      expect(project.title).to.equal("Clean Water Initiative");
      expect(project.coarseLocation).to.equal("Turkana County, Kenya");
      expect(project.targetFunding).to.equal(ethers.parseEther("10"));
      expect(project.totalReceived).to.equal(0);
      expect(project.aggregateBeneficiariesTarget).to.equal(500);
      expect(project.status).to.equal(0); // ACTIVE
      expect(project.milestoneCount).to.equal(0);
    });

    it("should revert if title or location is empty", async function () {
      await expect(
        aidTrace.connect(coordinator).createProject(
          "",
          "Description",
          "Region",
          ethers.parseEther("5"),
          100,
          "Outcomes"
        )
      ).to.be.revertedWithCustomError(aidTrace, "EmptyTitleOrLocation");

      await expect(
        aidTrace.connect(coordinator).createProject(
          "Title",
          "Description",
          "",
          ethers.parseEther("5"),
          100,
          "Outcomes"
        )
      ).to.be.revertedWithCustomError(aidTrace, "EmptyTitleOrLocation");
    });

    it("should allow coordinator to pause or complete project", async function () {
      await aidTrace.connect(coordinator).createProject(
        "Food Aid Relief",
        "Emergency food grain distribution",
        "Wajir, Kenya",
        ethers.parseEther("5"),
        200,
        "200 bags distributed"
      );

      await expect(aidTrace.connect(coordinator).setProjectStatus(1, 1)) // PAUSED
        .to.emit(aidTrace, "ProjectStatusChanged")
        .withArgs(1, 0, 1);

      let project = await aidTrace.getProject(1);
      expect(project.status).to.equal(1); // PAUSED
    });

    it("should prevent unauthorized user from updating project status", async function () {
      await aidTrace.connect(coordinator).createProject(
        "Project A", "Desc", "Region", ethers.parseEther("1"), 50, "Outcomes"
      );

      await expect(
        aidTrace.connect(unauthorizedUser).setProjectStatus(1, 1)
      ).to.be.revertedWithCustomError(aidTrace, "UnauthorizedCoordinator");
    });
  });

  describe("Transparent Direct Funding Ledger", function () {
    beforeEach(async function () {
      await aidTrace.connect(coordinator).createProject(
        "Emergency Flood Relief",
        "Sandbag barriers and emergency shelters",
        "River Basin District",
        ethers.parseEther("20"),
        1000,
        "100 shelters erected"
      );
    });

    it("should accept direct donations and track received funds vs declared target", async function () {
      const donationAmount = ethers.parseEther("2.5");

      await expect(aidTrace.connect(donor).fundProject(1, { value: donationAmount }))
        .to.emit(aidTrace, "ProjectFunded")
        .withArgs(1, donor.address, donationAmount, donationAmount);

      const project = await aidTrace.getProject(1);
      expect(project.targetFunding).to.equal(ethers.parseEther("20")); // Target is unchanged
      expect(project.totalReceived).to.equal(donationAmount);          // Received is updated

      // Second donation
      await aidTrace.connect(donor).fundProject(1, { value: ethers.parseEther("1.0") });
      const updatedProject = await aidTrace.getProject(1);
      expect(updatedProject.totalReceived).to.equal(ethers.parseEther("3.5"));
    });

    it("should revert if funding a non-existent project", async function () {
      await expect(
        aidTrace.connect(donor).fundProject(999, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(aidTrace, "ProjectDoesNotExist");
    });

    it("should revert if funding a paused project", async function () {
      await aidTrace.connect(coordinator).setProjectStatus(1, 1); // PAUSED

      await expect(
        aidTrace.connect(donor).fundProject(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(aidTrace, "InvalidProjectStatus");
    });
  });

  describe("Milestone Definition & Evidence Submission", function () {
    beforeEach(async function () {
      await aidTrace.connect(coordinator).createProject(
        "Solar Clinic Power",
        "Solar power kits for rural clinics",
        "Eastern Province",
        ethers.parseEther("8"),
        300,
        "5 clinics electrified"
      );
    });

    it("should allow coordinator to add structured milestones", async function () {
      await expect(
        aidTrace.connect(coordinator).addMilestone(
          1,
          "Procurement of 20 Solar Panels",
          "Panels delivered to staging warehouse",
          ethers.parseEther("3")
        )
      )
        .to.emit(aidTrace, "MilestoneAdded")
        .withArgs(1, 1, "Procurement of 20 Solar Panels", "Panels delivered to staging warehouse", ethers.parseEther("3"));

      const milestone = await aidTrace.getMilestone(1, 1);
      expect(milestone.id).to.equal(1);
      expect(milestone.title).to.equal("Procurement of 20 Solar Panels");
      expect(milestone.status).to.equal(0); // PENDING
    });

    it("should allow coordinator to commit evidence hash client-side", async function () {
      await aidTrace.connect(coordinator).addMilestone(
        1,
        "Panel Delivery",
        "Delivery confirmation",
        ethers.parseEther("3")
      );

      const metadataUri = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

      const tx = await aidTrace.connect(coordinator).submitMilestoneEvidence(
        1,
        1,
        sampleEvidenceHash,
        metadataUri
      );

      await expect(tx)
        .to.emit(aidTrace, "EvidenceSubmitted");

      const milestone = await aidTrace.getMilestone(1, 1);
      expect(milestone.evidenceHash).to.equal(sampleEvidenceHash);
      expect(milestone.metadataUri).to.equal(metadataUri);
      expect(milestone.status).to.equal(1); // SUBMITTED
      expect(milestone.submittedAt).to.be.gt(0);
    });

    it("should revert if evidence hash is empty bytes32(0)", async function () {
      await aidTrace.connect(coordinator).addMilestone(
        1,
        "Milestone",
        "Outcome",
        ethers.parseEther("1")
      );

      await expect(
        aidTrace.connect(coordinator).submitMilestoneEvidence(
          1,
          1,
          ethers.ZeroHash,
          "ipfs://empty"
        )
      ).to.be.revertedWithCustomError(aidTrace, "ZeroHashNotAllowed");
    });
  });

  describe("Role-Based Verification & State Machine Workflow", function () {
    beforeEach(async function () {
      await aidTrace.connect(coordinator).createProject(
        "Community Nutrition Hub",
        "Distribution of fortified nutritional porridge",
        "Southern Sector",
        ethers.parseEther("6"),
        800,
        "800 children supplemented"
      );

      await aidTrace.connect(coordinator).addMilestone(
        1,
        "Batch 1 Distribution",
        "Distribution to 400 families",
        ethers.parseEther("3")
      );

      await aidTrace.connect(coordinator).submitMilestoneEvidence(
        1,
        1,
        sampleEvidenceHash,
        "ipfs://sample-metadata-cid"
      );

      // Authorize reviewer
      await aidTrace.setReviewerAuthorization(reviewer.address, true);
    });

    it("should allow authorized reviewer to move milestone to UNDER_REVIEW", async function () {
      await expect(aidTrace.connect(reviewer).setMilestoneUnderReview(1, 1))
        .to.emit(aidTrace, "MilestoneStatusUpdated")
        .withArgs(1, 1, 1, 2); // SUBMITTED (1) -> UNDER_REVIEW (2)

      const milestone = await aidTrace.getMilestone(1, 1);
      expect(milestone.status).to.equal(2); // UNDER_REVIEW
    });

    it("should allow authorized reviewer to attest VERIFIED", async function () {
      await aidTrace.connect(reviewer).setMilestoneUnderReview(1, 1);

      await expect(
        aidTrace.connect(reviewer).reviewMilestoneEvidence(1, 1, 3, sampleRationaleHash) // 3 = VERIFIED
      )
        .to.emit(aidTrace, "EvidenceReviewed");

      const milestone = await aidTrace.getMilestone(1, 1);
      expect(milestone.status).to.equal(3); // VERIFIED
      expect(milestone.reviewer).to.equal(reviewer.address);
      expect(milestone.rationaleHash).to.equal(sampleRationaleHash);
      expect(milestone.reviewedAt).to.be.gt(0);

      expect(await aidTrace.getVerifiedMilestonesCount(1)).to.equal(1);
    });

    it("should allow authorized reviewer to attest REJECTED with recorded rationale", async function () {
      await expect(
        aidTrace.connect(reviewer).reviewMilestoneEvidence(1, 1, 4, sampleRationaleHash) // 4 = REJECTED
      )
        .to.emit(aidTrace, "EvidenceReviewed");

      const milestone = await aidTrace.getMilestone(1, 1);
      expect(milestone.status).to.equal(4); // REJECTED
      expect(milestone.reviewer).to.equal(reviewer.address);
      expect(milestone.rationaleHash).to.equal(sampleRationaleHash);
      expect(milestone.reviewedAt).to.be.gt(0);
    });

    it("should prevent unauthorized users from reviewing evidence (Fail-Closed)", async function () {
      await expect(
        aidTrace.connect(unauthorizedUser).reviewMilestoneEvidence(1, 1, 3, sampleRationaleHash)
      ).to.be.revertedWithCustomError(aidTrace, "UnauthorizedReviewer");
    });

    it("should prevent overwriting or tampering with a finalized VERIFIED milestone", async function () {
      // Step 1: Verify milestone
      await aidTrace.connect(reviewer).reviewMilestoneEvidence(1, 1, 3, sampleRationaleHash); // VERIFIED

      // Step 2: Attempt to review again -> Reverts
      await expect(
        aidTrace.connect(reviewer).reviewMilestoneEvidence(1, 1, 4, sampleRationaleHash)
      ).to.be.revertedWithCustomError(aidTrace, "MilestoneAlreadyFinalized");

      // Step 3: Attempt to overwrite evidence hash -> Reverts
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("Tampered_Document.pdf"));
      await expect(
        aidTrace.connect(coordinator).submitMilestoneEvidence(1, 1, newHash, "ipfs://fake")
      ).to.be.revertedWithCustomError(aidTrace, "MilestoneAlreadyFinalized");
    });
  });

  describe("Public Query & Aggregated View Functions", function () {
    it("should return milestone arrays and verified counters accurately", async function () {
      await aidTrace.connect(coordinator).createProject(
        "Project Multi", "Desc", "Region", ethers.parseEther("10"), 400, "Outcomes"
      );

      await aidTrace.connect(coordinator).addMilestone(1, "M1", "Target 1", ethers.parseEther("5"));
      await aidTrace.connect(coordinator).addMilestone(1, "M2", "Target 2", ethers.parseEther("5"));

      const milestones = await aidTrace.getProjectMilestones(1);
      expect(milestones.length).to.equal(2);
      expect(milestones[0].title).to.equal("M1");
      expect(milestones[1].title).to.equal("M2");

      expect(await aidTrace.getVerifiedMilestonesCount(1)).to.equal(0);

      // Verify M1
      await aidTrace.connect(coordinator).submitMilestoneEvidence(1, 1, sampleEvidenceHash, "ipfs://uri");
      await aidTrace.reviewMilestoneEvidence(1, 1, 3, sampleRationaleHash);

      expect(await aidTrace.getVerifiedMilestonesCount(1)).to.equal(1);
    });
  });
});
