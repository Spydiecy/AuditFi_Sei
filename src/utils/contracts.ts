// constants/contracts.ts
export const CONTRACT_ADDRESSES = {
    lineaSepolia: '0x03c4fb7563e593ca0625C1c64959AC56081785cE',
    neoX: '0x57fe5FC224a4609b0672bAd2563E5F2BF7c40E7B',
    kaiaTestnet: '0xAC89706b3D307D5d2aC740Afad7eF95F5bA7224c'
  } as const;

  export const AUDIT_REGISTRY_ABI = [
    "function registerAudit(bytes32 contractHash, uint8 stars, string calldata summary) external",
    "function getContractAudits(bytes32 contractHash) external view returns (tuple(uint8 stars, string summary, address auditor, uint256 timestamp)[])",
    "function getAuditorHistory(address auditor) external view returns (bytes32[])",
    "function getLatestAudit(bytes32 contractHash) external view returns (tuple(uint8 stars, string summary, address auditor, uint256 timestamp))",
    "function getAllAudits(uint256 startIndex, uint256 limit) external view returns (bytes32[] contractHashes, uint8[] stars, string[] summaries, address[] auditors, uint256[] timestamps)",
    "function getTotalContracts() external view returns (uint256)",
    "event AuditRegistered(bytes32 indexed contractHash, uint8 stars, string summary, address indexed auditor, uint256 timestamp)"
] as const;

export type ChainKey = keyof typeof CONTRACT_ADDRESSES;