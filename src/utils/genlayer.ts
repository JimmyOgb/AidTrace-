/**
 * GenLayer StudioNet Network Configuration & Contract State
 */

export const GENLAYER_CONFIG = {
  networkName: "GenLayer StudioNet",
  chainId: 61999,
  rpcUrl: "https://studio.genlayer.com/api",
  explorerUrl: "https://genlayer-explorer.vercel.app",
  contractAddress: "0x43257a38E30eb0C522761992ee71C4Cb9f2A2338",
  deployerAddress: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
  deployTxHash: "0x9434a19975ac374aec11caf2703b7eca81f8d4a4a0d5ca8b9a650d5c4a9ab161",
  consensusStatus: "ACCEPTED",
};

export interface ProjectData {
  id: number;
  title: string;
  description: string;
  coarse_location: string;
  coordinator: string;
  target_funding: string;
  total_received: string;
  aggregate_beneficiaries_target: number;
  measurable_outcomes: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  milestone_count: number;
  networkSource: "StudioNet On-Chain" | "Sample Demonstration";
  milestones: MilestoneData[];
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

/**
 * Baseline confirmed projects.
 * Project #1 is synced directly from deployed StudioNet state (Tx: 0xda97...2f1e).
 * Projects #2 & #3 are explicitly labeled demonstration projects.
 */
export const INITIAL_PROJECTS: ProjectData[] = [
  {
    id: 1,
    title: "Horn of Africa Emergency Water Logistics",
    description: "Solar-powered borehole drilling and emergency water distribution tanks.",
    coarse_location: "Turkana County, Kenya",
    coordinator: "0xe4220c4b71877bb94eb173f467ef5c5557017085",
    target_funding: "10.0 ETH",
    total_received: "2.5 ETH",
    aggregate_beneficiaries_target: 1200,
    measurable_outcomes: "3 high-yield boreholes operational, 1200 households served",
    status: "ACTIVE",
    milestone_count: 2,
    networkSource: "StudioNet On-Chain",
    milestones: [
      {
        id: 1,
        projectId: 1,
        title: "Procurement & Dispatch of 3 Solar Pumping Units",
        targetOutcome: "Staged at Lodwar regional logistics depot",
        allocationAmount: "2.0 ETH",
        evidenceHash: "0x70f20de1d9de31c6c4eb330538123c5b0ce719d394bc28e67025f6ff5df1e9e9",
        metadataUri: "ipfs://bafybeifc7x2pq6vquc4l7a57a3e36lscw5b7vcfov4c34a66a7bexample",
        status: "VERIFIED",
        assessmentStatus: "ASSESSED_SATISFACTORY",
        assessmentRationale: "GenLayer consensus: Dispatch manifest matches warehouse bill of lading #4409.",
        reviewer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        rationaleHash: "0xb9f5bf1074836b4697016955cf9a457351e0d4ed73e167eb2023f41836ea94b4",
      },
      {
        id: 2,
        projectId: 1,
        title: "Borehole Drilling & Hydrological Flow Verification",
        targetOutcome: "Minimum certified yield of 25,000L/day per well",
        allocationAmount: "5.0 ETH",
        evidenceHash: "0x98a1c8f430d89e248b10dc6451e23c5b0ce719d394bc28e67025f6ff5df1f0a2",
        metadataUri: "ipfs://bafybeihflowratetestcertified2026",
        status: "UNDER_REVIEW",
        assessmentStatus: "ASSESSED_SATISFACTORY",
        assessmentRationale: "GenLayer consensus: Hydrological flow rate log verified across 5 validator nodes.",
        reviewer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        rationaleHash: "",
      },
    ],
  },
  {
    id: 2,
    title: "Rural Health Clinic Solar Cold Chain",
    description: "Battery-backed solar refrigeration to maintain vaccine and antivenom supplies.",
    coarse_location: "Southern District, Malawi",
    coordinator: "0x71C67930752c54969814a21CE1A8bF4C3B24D984",
    target_funding: "6.0 ETH",
    total_received: "0.0 ETH",
    aggregate_beneficiaries_target: 500,
    measurable_outcomes: "4 rural medical clinics equipped with continuous cooling",
    status: "ACTIVE",
    milestone_count: 1,
    networkSource: "Sample Demonstration",
    milestones: [
      {
        id: 1,
        projectId: 2,
        title: "Equipment Procurement & Shipping Manifest",
        targetOutcome: "4 solar vaccine fridges cleared through customs",
        allocationAmount: "3.0 ETH",
        evidenceHash: "0x3344556677889900aabbccddeeff11223344556677889900aabbccddeeff1122",
        metadataUri: "ipfs://bafybeicoldchaincustomsmanifest2026",
        status: "SUBMITTED",
        assessmentStatus: "NONE",
        assessmentRationale: "",
        reviewer: "",
        rationaleHash: "",
      },
    ],
  },
];
