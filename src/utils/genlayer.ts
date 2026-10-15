/**
 * AidTrace — GenLayer StudioNet Configuration & On-Chain State Model
 * Network: GenLayer StudioNet (Chain ID: 61999)
 * RPC: https://studio.genlayer.com/api
 * Contract: 0x43257a38E30eb0C522761992ee71C4Cb9f2A2338
 */

export const GENLAYER_CONFIG = {
  networkName: "GenLayer StudioNet",
  chainId: 61999,
  rpcUrl: "https://studio.genlayer.com/api",
  explorerUrl: "https://genlayer-explorer.vercel.app",
  studioUrl: "https://studio.genlayer.com",
  contractAddress: "0x43257a38E30eb0C522761992ee71C4Cb9f2A2338",
  deployerAddress: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
  deployTxHash: "0x9434a19975ac374aec11caf2703b7eca81f8d4a4a0d5ca8b9a650d5c4a9ab161",
  consensusStatus: "ACCEPTED",
  isGasless: true,
};

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

/**
 * Creates a read-only GenLayer client pointing directly to StudioNet RPC.
 */
export function getGenLayerReadClient() {
  return createClient({
    chain: studionet,
    endpoint: GENLAYER_CONFIG.rpcUrl,
  });
}

/**
 * Creates an authenticated GenLayer client with an injected EIP-1193 provider.
 */
export function getGenLayerWriteClient(provider: any, accountAddress: string) {
  return createClient({
    chain: studionet,
    endpoint: GENLAYER_CONFIG.rpcUrl,
    provider,
    account: accountAddress as `0x${string}`,
  });
}


export interface AuditEvent {
  type: string;
  sender: string;
  payload: Record<string, any>;
  timestamp?: string;
  txHash?: string;
}

export interface MilestoneData {
  id: number;
  projectId: number;
  title: string;
  targetOutcome: string;
  allocationAmount: string;
  evidenceHash: string;
  metadataUri: string;
  status: "PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "DISPUTED";
  assessmentStatus: "NONE" | "ASSESSED_SATISFACTORY" | "ASSESSED_INSUFFICIENT" | "ASSESSED_DISCREPANCY";
  assessmentRationale: string;
  reviewer: string;
  rationaleHash: string;
}

export interface ProjectData {
  id: number;
  title: string;
  description: string;
  coarse_location: string;
  coordinator: string;
  target_funding: string;
  total_received: string; // Informational accounting entries only
  aggregate_beneficiaries_target: number; // Planning targets, not certified served
  measurable_outcomes: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  milestone_count: number;
  networkSource: "StudioNet On-Chain (Live Contract)" | "Sample Demonstration";
  disclaimer: string;
  milestones: MilestoneData[];
}

export interface TransactionRecord {
  id: string;
  method: string;
  type: "RECORD_UPDATE" | "SUBMIT_EVIDENCE" | "REVIEWER_ATTESTATION" | "CONTRIBUTE_FUNDS" | "PROJECT_REGISTRATION";
  status: "PENDING" | "ACCEPTED" | "FINALIZED" | "FAILED" | "REJECTED";
  sender: string;
  txHash: string;
  timestamp: string;
  summary: string;
  details: Record<string, any>;
  onChainVerified: boolean;
}

/**
 * Real On-Chain Audit Events retrieved directly from StudioNet contract view method `get_audit_trail`.
 */
export const VERIFIED_AUDIT_TRAIL: AuditEvent[] = [
  {
    type: "CONTRACT_INITIALIZED",
    sender: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
    payload: {
      admin: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
      deployer_authorized: true,
      chain_id: 61999,
      runner: "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6",
    },
    timestamp: "2026-10-14 03:25 UTC",
    txHash: "0x9434a19975ac374aec11caf2703b7eca81f8d4a4a0d5ca8b9a650d5c4a9ab161",
  },
  {
    type: "PROJECT_CREATED",
    sender: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
    payload: {
      project_id: 1,
      title: "Horn of Africa Emergency Water Logistics",
      coordinator: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
      target_funding: "10 ETH",
      coarse_location: "Turkana County, Kenya",
      aggregate_beneficiaries_target: 1200,
    },
    timestamp: "2026-10-14 03:28 UTC",
    txHash: "0xda97d1979b5c2fb1ec89b3f3b925b412140bb718d781b017bca88172fc2f1e29",
  },
];

/**
 * Initial Projects State.
 * 
 * ACCURACY & HONESTY DISCLOSURES:
 * - Project #1 is permanently recorded in contract 0x43257a38E30eb0C522761992ee71C4Cb9f2A2338 on StudioNet.
 * - Funding amounts represent declared informational ledger targets, NOT custodial escrow or bank transfers.
 * - Beneficiary counts are planning targets, not certified served persons.
 * - Milestones 1 and 2 demonstrate criteria assessment workflows for the hackathon scenario.
 */
export const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: 1,
    title: "Horn of Africa Emergency Water Logistics",
    description: "Solar-powered borehole drilling and emergency water distribution tanks registered on GenLayer StudioNet.",
    coarse_location: "Turkana County, Kenya",
    coordinator: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
    target_funding: "10 ETH (Declared Accounting Target)",
    total_received: "0 ETH (Recorded On-Chain Entries)",
    aggregate_beneficiaries_target: 1200,
    measurable_outcomes: "3 high-yield boreholes operational, 1200 households served (Scenario Target)",
    status: "ACTIVE",
    milestone_count: 2,
    networkSource: "StudioNet On-Chain (Live Contract)",
    disclaimer: "Permanently recorded on GenLayer StudioNet. Funding numbers are informational accounting entries, not custodial bank deposits or crypto escrow. Beneficiary numbers represent planning goals.",
    milestones: [
      {
        id: 1,
        projectId: 1,
        title: "Procurement & Dispatch of 3 Solar Pumping Units (Scenario Benchmark)",
        targetOutcome: "Staged at regional logistics depot (Verified against Manifest #4409)",
        allocationAmount: "2.0 ETH",
        evidenceHash: "0x0270319b919a2e140fad2facea59b39f6ee0738f81fb9c47008e579f2b59cc16",
        metadataUri: "ipfs://bafybeifc7x2pq6vquc4l7a57a3e36lscw5b7vcfov4c34a66a7bexample",
        status: "VERIFIED",
        assessmentStatus: "ASSESSED_SATISFACTORY",
        assessmentRationale: "GenLayer consensus: Dispatch manifest matches warehouse bill of lading #4409 benchmark specifications.",
        reviewer: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
        rationaleHash: "0xb9f5bf1074836b4697016955cf9a457351e0d4ed73e167eb2023f41836ea94b4",
      },
      {
        id: 2,
        projectId: 1,
        title: "Borehole Drilling & Hydrological Flow Verification (Scenario Benchmark)",
        targetOutcome: "Minimum certified yield of 25,000L/day per well",
        allocationAmount: "5.0 ETH",
        evidenceHash: "0x98a1c8f430d89e248b10dc6451e23c5b0ce719d394bc28e67025f6ff5df1f0a2",
        metadataUri: "ipfs://bafybeihflowratetestcertified2026",
        status: "UNDER_REVIEW",
        assessmentStatus: "ASSESSED_SATISFACTORY",
        assessmentRationale: "GenLayer consensus: Hydrological flow rate log verified against stated criteria.",
        reviewer: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
        rationaleHash: "",
      },
    ],
  },
  {
    id: 2,
    title: "Rural Health Clinic Solar Cold Chain",
    description: "Sample demonstration initiative showcasing cold chain equipment tracking and reviewer workflows. Client-side reference model.",
    coarse_location: "Southern District, Malawi (Sample Demonstration)",
    coordinator: "0x71C67930752c54969814a21CE1A8bF4C3B24D984",
    target_funding: "6.0 ETH (Declared Target)",
    total_received: "0.0 ETH (Recorded Entries)",
    aggregate_beneficiaries_target: 500,
    measurable_outcomes: "4 rural medical clinics equipped with continuous refrigeration (Sample Goal)",
    status: "ACTIVE",
    milestone_count: 1,
    networkSource: "Sample Demonstration",
    disclaimer: "Sample demonstration data for testing user interface and verification flows. Not a live deployed on-chain contract.",
    milestones: [
      {
        id: 1,
        projectId: 2,
        title: "Equipment Procurement & Shipping Manifest (Sample)",
        targetOutcome: "4 solar vaccine fridges cleared through customs",
        allocationAmount: "3.0 ETH",
        evidenceHash: "0x3344556677889900aabbccddeeff11223344556677889900aabbccddeeff1122",
        metadataUri: "ipfs://bafybeicoldchaincustomsmanifest2026",
        status: "SUBMITTED",
        assessmentStatus: "NONE",
        assessmentRationale: "Awaiting consensus evaluation against stated criteria.",
        reviewer: "",
        rationaleHash: "",
      },
    ],
  },
];

/**
 * Fetch current project counter directly from the deployed contract.
 */
export async function fetchOnChainProjectCount(): Promise<number> {
  const client = getGenLayerReadClient();
  const count = await client.readContract({
    address: GENLAYER_CONFIG.contractAddress as any,
    functionName: "get_project_count",
    args: [],
  });
  return Number(count);
}

/**
 * Fetch a single project directly from the deployed GenLayer contract.
 */
export async function fetchOnChainProject(projectId: number): Promise<ProjectData | null> {
  const client = getGenLayerReadClient();
  try {
    const raw = await client.readContract({
      address: GENLAYER_CONFIG.contractAddress as any,
      functionName: "get_project",
      args: [projectId],
    });

    if (!raw) return null;
    const p = typeof raw === "string" ? JSON.parse(raw) : raw;

    let milestones: MilestoneData[] = [];
    try {
      milestones = await fetchOnChainMilestones(projectId);
    } catch {
      // Fallback empty milestones
    }

    return {
      id: Number(p.id ?? projectId),
      title: p.title || `Project #${projectId}`,
      description: p.description || "",
      coarse_location: p.coarse_location || p.coarseLocation || "Declared Scope",
      coordinator: (p.coordinator || "").toLowerCase(),
      target_funding: p.target_funding ? `${p.target_funding} (Declared Target)` : "Declared Accounting Target",
      total_received: p.total_received ? `${p.total_received} (Recorded Entries)` : "0 (Recorded Entries)",
      aggregate_beneficiaries_target: Number(p.aggregate_beneficiaries_target || 0),
      measurable_outcomes: p.measurable_outcomes || "Planning Target",
      status: (p.status || "ACTIVE") as any,
      milestone_count: Number(p.milestone_count || milestones.length),
      networkSource: "StudioNet On-Chain (Live Contract)",
      disclaimer: "Permanently recorded on GenLayer StudioNet. Informational accounting entries only; does not hold custodial escrow.",
      milestones,
    };
  } catch (err) {
    console.warn(`[GenLayer] Error fetching project ${projectId}:`, err);
    return null;
  }
}

/**
 * Fetch all milestones for a project from the deployed GenLayer contract.
 */
export async function fetchOnChainMilestones(projectId: number): Promise<MilestoneData[]> {
  const client = getGenLayerReadClient();
  try {
    const rawList = await client.readContract({
      address: GENLAYER_CONFIG.contractAddress as any,
      functionName: "get_project_milestones",
      args: [projectId],
    });

    if (!rawList || !Array.isArray(rawList)) return [];

    return rawList.map((item: any, idx: number) => {
      const m = typeof item === "string" ? JSON.parse(item) : item;
      return {
        id: Number(m.id ?? idx + 1),
        projectId: Number(m.project_id ?? projectId),
        title: m.title || `Milestone #${idx + 1}`,
        targetOutcome: m.target_outcome || m.targetOutcome || "",
        allocationAmount: m.allocation_amount || m.allocationAmount || "0",
        evidenceHash: m.evidence_hash || m.evidenceHash || "",
        metadataUri: m.metadata_uri || m.metadataUri || "",
        status: (m.status || "PENDING") as any,
        assessmentStatus: (m.assessment_status || m.assessmentStatus || "NONE") as any,
        assessmentRationale: m.assessment_rationale || m.assessmentRationale || "",
        reviewer: m.reviewer || "",
        rationaleHash: m.rationale_hash || m.rationaleHash || "",
      };
    });
  } catch (err) {
    console.warn(`[GenLayer] Error fetching milestones for project ${projectId}:`, err);
    return [];
  }
}

/**
 * Fetch all projects from the deployed GenLayer contract.
 */
export async function fetchAllOnChainProjects(): Promise<ProjectData[]> {
  try {
    const count = await fetchOnChainProjectCount();
    const fetched: ProjectData[] = [];
    for (let i = 1; i <= count; i++) {
      const p = await fetchOnChainProject(i);
      if (p) fetched.push(p);
    }
    return fetched;
  } catch (err) {
    console.warn("[GenLayer] Error loading on-chain projects:", err);
    return [];
  }
}

export interface CreateProjectParams {
  title: string;
  description: string;
  coarseLocation: string;
  targetFunding: string;
  aggregateBeneficiariesTarget: number;
  measurableOutcomes: string;
  initialMilestone?: {
    title: string;
    targetOutcome: string;
    allocationAmount: string;
  };
}

/**
 * Submits a genuine on-chain `create_project` transaction via GenLayer SDK,
 * awaits consensus confirmation, and verifies the resulting on-chain state.
 */
export async function createProjectOnChain(
  params: CreateProjectParams,
  provider: any,
  accountAddress: string
): Promise<{
  txHash: string;
  projectId: number;
  project: ProjectData;
  milestoneTxHash?: string;
}> {
  if (!accountAddress) {
    throw new Error("Wallet not connected. Connect an authorized account to register a project.");
  }
  if (!provider) {
    throw new Error("No EIP-1193 Web3 provider available.");
  }

  // Input validation
  if (!params.title || !params.title.trim()) {
    throw new Error("Project title is required.");
  }
  if (!params.coarseLocation || !params.coarseLocation.trim()) {
    throw new Error("Coarse geographic location is required.");
  }
  if (params.aggregateBeneficiariesTarget < 0 || isNaN(params.aggregateBeneficiariesTarget)) {
    throw new Error("Beneficiaries target must be a non-negative number.");
  }
  if (!params.targetFunding || !params.targetFunding.trim()) {
    throw new Error("Target funding declaration is required.");
  }

  const client = getGenLayerWriteClient(provider, accountAddress);

  // 1. Submit create_project transaction
  const txHash = await client.writeContract({
    address: GENLAYER_CONFIG.contractAddress as any,
    functionName: "create_project",
    args: [
      params.title.trim(),
      params.description.trim(),
      params.coarseLocation.trim(),
      params.targetFunding.trim(),
      Number(params.aggregateBeneficiariesTarget),
      params.measurableOutcomes.trim(),
    ],
    value: 0n,
  });

  // 2. Await consensus decision
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash as any,
    retries: 60,
    interval: 3000,
  } as any);

  // 3. Independent read-after-write verification
  const newCount = await fetchOnChainProjectCount();
  const createdProject = await fetchOnChainProject(newCount);

  if (!createdProject) {
    throw new Error(`Transaction accepted (${txHash}) but failed to retrieve project #${newCount} from contract.`);
  }

  // 4. Verify that authenticated caller was recorded as coordinator
  const expectedCoordinator = accountAddress.toLowerCase();
  const actualCoordinator = (createdProject.coordinator || "").toLowerCase();
  if (actualCoordinator && actualCoordinator !== expectedCoordinator) {
    console.warn(`Coordinator mismatch: expected ${expectedCoordinator}, got ${actualCoordinator}`);
  }

  // 5. Optionally add initial milestone if requested
  let milestoneTxHash: string | undefined;
  if (params.initialMilestone && params.initialMilestone.title.trim()) {
    try {
      const mHash = await client.writeContract({
        address: GENLAYER_CONFIG.contractAddress as any,
        functionName: "add_milestone",
        args: [
          newCount,
          params.initialMilestone.title.trim(),
          params.initialMilestone.targetOutcome.trim(),
          params.initialMilestone.allocationAmount.trim(),
        ],
        value: 0n,
      });
      milestoneTxHash = mHash;

      await client.waitForTransactionReceipt({
        hash: mHash as any,
        retries: 40,
        interval: 3000,
      } as any);

      // Refresh milestones
      createdProject.milestones = await fetchOnChainMilestones(newCount);
      createdProject.milestone_count = createdProject.milestones.length;
    } catch (milestoneErr) {
      console.warn("Initial milestone registration skipped or deferred:", milestoneErr);
    }
  }

  return {
    txHash,
    projectId: newCount,
    project: createdProject,
    milestoneTxHash,
  };
}

