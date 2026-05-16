// ═══════════════════════════════════════════════════════════════
// 数据入口（mockData.ts）
// 兼容旧接口，内部代理到新模块
// 新代码请直接 import 新模块
// ═══════════════════════════════════════════════════════════════

// ─── 从新版模块代理 ──────────────────────────────────────────

export {
  // 类型
} from './types';

export {
  // 统一企业表
  firmData,
  getFirmById,
  getFirmsByManagerId,
  getFirmsByParkId,
  searchFirms,
  firmIdToName,
  firmIdToParkIds,
} from './firmData';

export {
  // 园区数据
  parkData,
  provinceCenters,
  getParkById,
  getParkByName,
  parkIdToName,
} from './parkData';

export {
  // 产业链
  chainInfoList,
  chainNodeDetails,
  chainTreeData,
  chainFinancingData,
  getNodesByChainId,
  getNodesByFirmId,
  getChainIdsByFirmId,
  nodeIdToName,
  chainIdToName,
  nodeIdToChainId,
} from './chainData';

export {
  // 团队
  teamMembers,
  leaders,
  productManagers,
  getMemberById,
  getTeamMembersByLeaderId,
  memberIdToName,
  memberIdToInfo,
} from './teamData';

export {
  // 工单
  workOrders,
  getWorkOrdersByFirmId,
  getWorkOrdersByOwner,
  getWorkOrderStats,
} from './workOrderData';

export {
  // 商机
  opportunities,
  getOpportunitiesByFirmId,
  getOpportunitiesByManagerId,
  getOpportunityStats,
} from './opportunityData';

export {
  // 客户
  customerProfiles,
  customerSearchItems,
  getCustomerProfileById,
  searchCustomers,
} from './customerData';

export {
  // 宏观指标
  metricDefs,
  adminData,
} from './metricData';

export {
  // 规则配置
  dataFields,
  businessRules,
} from './ruleData';

export {
  // 跟进记录
  followRecords,
  getFollowRecordsByFirmId,
  getLatestFollowDates,
} from './followData';

export {
  // 补录记录
  supplementData,
  getAllSupplements,
  getSupplementsByCreatorId,
  getSupplementsByFirmId,
  getSupplementsByDate,
  addSupplement,
} from './supplementData';

export {
  // 推送记录
  dailyPushData,
  PRODUCT_MANAGER_ID,
  getPushByDate,
  getPushByRecipient,
  generateDailyPush,
} from './dailyPushData';

export {
  // 数据索引
  dataIndex,
  getFirmParks,
  getParkChains,
  getRelatedFirms,
  getFirmManager,
  getFirmStats,
} from './dataIndex';
