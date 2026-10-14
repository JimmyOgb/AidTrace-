// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AidTraceCore
 * @notice Transparent Aid. Verifiable Impact.
 * @dev Manages aid project registries, fund accounting, milestone lifecycles,
 *      and cryptographic evidence submission with role-based reviewer authorization.
 *      
 *      HUMILITY IN CRYPTOGRAPHY:
 *      Cryptographic hashes (evidenceHash) guarantee byte-for-byte data integrity
 *      and temporal ordering on-chain. They DO NOT guarantee real-world truth.
 *      Physical aid delivery is attested by authorized reviewers whose signatures
 *      and rationale hashes are immutably recorded in the event log.
 */
contract AidTraceCore is ReentrancyGuard {
    // -------------------------------------------------------------------------
    // Enums
    // -------------------------------------------------------------------------
    enum ProjectStatus {
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    enum MilestoneStatus {
        PENDING,
        SUBMITTED,
        UNDER_REVIEW,
        VERIFIED,
        REJECTED,
        DISPUTED
    }

    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------
    struct Project {
        uint256 id;
        address coordinator;
        string title;
        string description;
        string coarseLocation; // e.g. "Turkana County, Kenya" (Never exact coordinates/PII)
        uint256 targetFunding;  // Declared target in wei
        uint256 totalReceived;  // Actual on-chain funds received in wei
        uint256 aggregateBeneficiariesTarget; // Aggregated beneficiary count target
        string measurableOutcomes; // Human-readable outcome description
        ProjectStatus status;
        uint256 createdAt;
        uint256 milestoneCount;
    }

    struct Milestone {
        uint256 id;
        uint256 projectId;
        string title;
        string targetOutcome;      // Outcome metric target (e.g., "1,000 hygiene kits")
        uint256 allocationAmount;   // Milestone budget allocation in wei
        bytes32 evidenceHash;       // SHA-256 / keccak256 fingerprint of evidence bundle
        string metadataUri;         // Off-chain URI (IPFS CID, public schema URI)
        address reviewer;           // Address of authorized reviewer who attested
        bytes32 rationaleHash;      // Optional hash of reviewer's evaluation notes
        MilestoneStatus status;
        uint256 submittedAt;
        uint256 reviewedAt;
    }

    // -------------------------------------------------------------------------
    // Custom Errors (Fail-Closed & Gas Efficient)
    // -------------------------------------------------------------------------
    error UnauthorizedAdmin(address caller);
    error UnauthorizedCoordinator(address caller, uint256 projectId);
    error UnauthorizedReviewer(address caller);
    error ProjectDoesNotExist(uint256 projectId);
    error MilestoneDoesNotExist(uint256 projectId, uint256 milestoneId);
    error InvalidProjectStatus(uint256 projectId, ProjectStatus currentStatus);
    error InvalidMilestoneState(uint256 milestoneId, MilestoneStatus currentStatus);
    error MilestoneAlreadyFinalized(uint256 milestoneId);
    error ZeroAddressNotAllowed();
    error EmptyTitleOrLocation();
    error ZeroHashNotAllowed();
    error InvalidReviewStatus(MilestoneStatus status);
    error FundingTargetExceeded(uint256 currentTotal, uint256 attemptedAddition);

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed coordinator,
        string title,
        string coarseLocation,
        uint256 targetFunding,
        uint256 aggregateBeneficiariesTarget
    );

    event ProjectFunded(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount,
        uint256 totalReceived
    );

    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus previousStatus,
        ProjectStatus newStatus
    );

    event MilestoneAdded(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        string title,
        string targetOutcome,
        uint256 allocationAmount
    );

    event EvidenceSubmitted(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        bytes32 indexed evidenceHash,
        string metadataUri,
        address submitter,
        uint256 timestamp
    );

    event MilestoneStatusUpdated(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        MilestoneStatus previousStatus,
        MilestoneStatus newStatus
    );

    event EvidenceReviewed(
        uint256 indexed projectId,
        uint256 indexed milestoneId,
        MilestoneStatus status,
        address indexed reviewer,
        bytes32 rationaleHash,
        uint256 timestamp
    );

    event ReviewerAuthorizationChanged(address indexed reviewer, bool isAuthorized);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    // -------------------------------------------------------------------------
    // State Storage
    // -------------------------------------------------------------------------
    address public admin;
    uint256 private _projectCounter;

    // projectId => Project
    mapping(uint256 => Project) public projects;

    // projectId => milestoneId => Milestone
    mapping(uint256 => mapping(uint256 => Milestone)) public projectMilestones;

    // Reviewer whitelist: reviewerAddress => isAuthorized
    mapping(address => bool) public authorizedReviewers;

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------
    modifier onlyAdmin() {
        if (msg.sender != admin) {
            revert UnauthorizedAdmin(msg.sender);
        }
        _;
    }

    modifier onlyCoordinator(uint256 projectId) {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        if (msg.sender != projects[projectId].coordinator && msg.sender != admin) {
            revert UnauthorizedCoordinator(msg.sender, projectId);
        }
        _;
    }

    modifier onlyAuthorizedReviewer() {
        if (!authorizedReviewers[msg.sender] && msg.sender != admin) {
            revert UnauthorizedReviewer(msg.sender);
        }
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor() {
        admin = msg.sender;
        authorizedReviewers[msg.sender] = true;
        emit ReviewerAuthorizationChanged(msg.sender, true);
    }

    // -------------------------------------------------------------------------
    // Administrative Functions
    // -------------------------------------------------------------------------
    function setReviewerAuthorization(address reviewer, bool authorized) external onlyAdmin {
        if (reviewer == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        authorizedReviewers[reviewer] = authorized;
        emit ReviewerAuthorizationChanged(reviewer, authorized);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) {
            revert ZeroAddressNotAllowed();
        }
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(oldAdmin, newAdmin);
    }

    // -------------------------------------------------------------------------
    // Project Registry Management
    // -------------------------------------------------------------------------
    function createProject(
        string calldata title,
        string calldata description,
        string calldata coarseLocation,
        uint256 targetFunding,
        uint256 aggregateBeneficiariesTarget,
        string calldata measurableOutcomes
    ) external returns (uint256) {
        if (bytes(title).length == 0 || bytes(coarseLocation).length == 0) {
            revert EmptyTitleOrLocation();
        }

        _projectCounter++;
        uint256 newProjectId = _projectCounter;

        projects[newProjectId] = Project({
            id: newProjectId,
            coordinator: msg.sender,
            title: title,
            description: description,
            coarseLocation: coarseLocation,
            targetFunding: targetFunding,
            totalReceived: 0,
            aggregateBeneficiariesTarget: aggregateBeneficiariesTarget,
            measurableOutcomes: measurableOutcomes,
            status: ProjectStatus.ACTIVE,
            createdAt: block.timestamp,
            milestoneCount: 0
        });

        emit ProjectCreated(
            newProjectId,
            msg.sender,
            title,
            coarseLocation,
            targetFunding,
            aggregateBeneficiariesTarget
        );

        return newProjectId;
    }

    function setProjectStatus(uint256 projectId, ProjectStatus newStatus)
        external
        onlyCoordinator(projectId)
    {
        Project storage project = projects[projectId];
        ProjectStatus oldStatus = project.status;
        project.status = newStatus;
        emit ProjectStatusChanged(projectId, oldStatus, newStatus);
    }

    // -------------------------------------------------------------------------
    // Transparent Direct Funding
    // -------------------------------------------------------------------------
    function fundProject(uint256 projectId) external payable nonReentrant {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.ACTIVE) {
            revert InvalidProjectStatus(projectId, project.status);
        }

        project.totalReceived += msg.value;

        emit ProjectFunded(projectId, msg.sender, msg.value, project.totalReceived);
    }

    // -------------------------------------------------------------------------
    // Milestone Management
    // -------------------------------------------------------------------------
    function addMilestone(
        uint256 projectId,
        string calldata title,
        string calldata targetOutcome,
        uint256 allocationAmount
    ) external onlyCoordinator(projectId) returns (uint256) {
        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.ACTIVE) {
            revert InvalidProjectStatus(projectId, project.status);
        }
        if (bytes(title).length == 0) {
            revert EmptyTitleOrLocation();
        }

        project.milestoneCount++;
        uint256 newMilestoneId = project.milestoneCount;

        projectMilestones[projectId][newMilestoneId] = Milestone({
            id: newMilestoneId,
            projectId: projectId,
            title: title,
            targetOutcome: targetOutcome,
            allocationAmount: allocationAmount,
            evidenceHash: bytes32(0),
            metadataUri: "",
            reviewer: address(0),
            rationaleHash: bytes32(0),
            status: MilestoneStatus.PENDING,
            submittedAt: 0,
            reviewedAt: 0
        });

        emit MilestoneAdded(projectId, newMilestoneId, title, targetOutcome, allocationAmount);

        return newMilestoneId;
    }

    // -------------------------------------------------------------------------
    // Evidence Submission
    // -------------------------------------------------------------------------
    function submitMilestoneEvidence(
        uint256 projectId,
        uint256 milestoneId,
        bytes32 evidenceHash,
        string calldata metadataUri
    ) external onlyCoordinator(projectId) {
        if (evidenceHash == bytes32(0)) {
            revert ZeroHashNotAllowed();
        }

        Project storage project = projects[projectId];
        if (project.status != ProjectStatus.ACTIVE) {
            revert InvalidProjectStatus(projectId, project.status);
        }
        if (milestoneId == 0 || milestoneId > project.milestoneCount) {
            revert MilestoneDoesNotExist(projectId, milestoneId);
        }

        Milestone storage milestone = projectMilestones[projectId][milestoneId];
        if (milestone.status == MilestoneStatus.VERIFIED) {
            revert MilestoneAlreadyFinalized(milestoneId);
        }

        milestone.evidenceHash = evidenceHash;
        milestone.metadataUri = metadataUri;
        milestone.status = MilestoneStatus.SUBMITTED;
        milestone.submittedAt = block.timestamp;

        emit EvidenceSubmitted(
            projectId,
            milestoneId,
            evidenceHash,
            metadataUri,
            msg.sender,
            block.timestamp
        );
        emit MilestoneStatusUpdated(
            projectId,
            milestoneId,
            MilestoneStatus.PENDING,
            MilestoneStatus.SUBMITTED
        );
    }

    // -------------------------------------------------------------------------
    // Verification & Review Workflow
    // -------------------------------------------------------------------------
    function setMilestoneUnderReview(uint256 projectId, uint256 milestoneId)
        external
        onlyAuthorizedReviewer
    {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        Project storage project = projects[projectId];
        if (milestoneId == 0 || milestoneId > project.milestoneCount) {
            revert MilestoneDoesNotExist(projectId, milestoneId);
        }

        Milestone storage milestone = projectMilestones[projectId][milestoneId];
        if (milestone.status != MilestoneStatus.SUBMITTED) {
            revert InvalidMilestoneState(milestoneId, milestone.status);
        }

        milestone.status = MilestoneStatus.UNDER_REVIEW;
        emit MilestoneStatusUpdated(
            projectId,
            milestoneId,
            MilestoneStatus.SUBMITTED,
            MilestoneStatus.UNDER_REVIEW
        );
    }

    function reviewMilestoneEvidence(
        uint256 projectId,
        uint256 milestoneId,
        MilestoneStatus outcome,
        bytes32 rationaleHash
    ) external onlyAuthorizedReviewer {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        Project storage project = projects[projectId];
        if (milestoneId == 0 || milestoneId > project.milestoneCount) {
            revert MilestoneDoesNotExist(projectId, milestoneId);
        }

        Milestone storage milestone = projectMilestones[projectId][milestoneId];

        // Fail-closed: Cannot overwrite finalized verified milestone
        if (milestone.status == MilestoneStatus.VERIFIED) {
            revert MilestoneAlreadyFinalized(milestoneId);
        }

        // Must be in SUBMITTED, UNDER_REVIEW, or DISPUTED to be reviewed
        if (
            milestone.status != MilestoneStatus.SUBMITTED &&
            milestone.status != MilestoneStatus.UNDER_REVIEW &&
            milestone.status != MilestoneStatus.DISPUTED
        ) {
            revert InvalidMilestoneState(milestoneId, milestone.status);
        }

        // Only valid finalization states allowed
        if (
            outcome != MilestoneStatus.VERIFIED &&
            outcome != MilestoneStatus.REJECTED &&
            outcome != MilestoneStatus.DISPUTED
        ) {
            revert InvalidReviewStatus(outcome);
        }

        MilestoneStatus prevStatus = milestone.status;
        milestone.status = outcome;
        milestone.reviewer = msg.sender;
        milestone.rationaleHash = rationaleHash;
        milestone.reviewedAt = block.timestamp;

        emit EvidenceReviewed(
            projectId,
            milestoneId,
            outcome,
            msg.sender,
            rationaleHash,
            block.timestamp
        );
        emit MilestoneStatusUpdated(projectId, milestoneId, prevStatus, outcome);
    }

    // -------------------------------------------------------------------------
    // View Functions (Read-Only Public Exploration)
    // -------------------------------------------------------------------------
    function getProjectCount() external view returns (uint256) {
        return _projectCounter;
    }

    function getProject(uint256 projectId) external view returns (Project memory) {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        return projects[projectId];
    }

    function getMilestone(uint256 projectId, uint256 milestoneId)
        external
        view
        returns (Milestone memory)
    {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        if (milestoneId == 0 || milestoneId > projects[projectId].milestoneCount) {
            revert MilestoneDoesNotExist(projectId, milestoneId);
        }
        return projectMilestones[projectId][milestoneId];
    }

    function getProjectMilestones(uint256 projectId)
        external
        view
        returns (Milestone[] memory)
    {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        uint256 count = projects[projectId].milestoneCount;
        Milestone[] memory list = new Milestone[](count);
        for (uint256 i = 1; i <= count; i++) {
            list[i - 1] = projectMilestones[projectId][i];
        }
        return list;
    }

    function getVerifiedMilestonesCount(uint256 projectId)
        external
        view
        returns (uint256)
    {
        if (projectId == 0 || projectId > _projectCounter) {
            revert ProjectDoesNotExist(projectId);
        }
        uint256 count = projects[projectId].milestoneCount;
        uint256 verifiedCount = 0;
        for (uint256 i = 1; i <= count; i++) {
            if (projectMilestones[projectId][i].status == MilestoneStatus.VERIFIED) {
                verifiedCount++;
            }
        }
        return verifiedCount;
    }
}
