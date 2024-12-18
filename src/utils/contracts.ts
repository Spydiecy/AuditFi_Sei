// constants/contracts.ts
export const CONTRACT_ADDRESSES = {
    lineaSepolia: '0x92B1C0072D6DFccb86766b0Bf3cE62b44095FF13',
    neoX: '0x16f16b1742ECA434faf9442a9f9d933A766acfCA',
    kaiaTestnet: '0xC2eEc239F617F15b0D289024fB22183a5185C86e'
  } as const;
  
  export const AUDIT_REGISTRY_ABI = [
    "function registerAudit(bytes32 contractHash, uint8 stars, string calldata summary) external",
    "function getContractAudits(bytes32 contractHash) external view returns (tuple(uint8 stars, string summary, address auditor, uint256 timestamp)[])",
    "function getAuditorHistory(address auditor) external view returns (bytes32[])",
    "function getLatestAudit(bytes32 contractHash) external view returns (tuple(uint8 stars, string summary, address auditor, uint256 timestamp))",
    "event AuditRegistered(bytes32 indexed contractHash, uint8 stars, string summary, address indexed auditor, uint256 timestamp)"
  ] as const;