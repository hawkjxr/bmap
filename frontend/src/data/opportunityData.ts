// ═══════════════════════════════════════════════════════════════
// 商机数据（opportunityData.ts）
// 核心理念：商机关联企业ID和客户经理ID
// ═══════════════════════════════════════════════════════════════

import type { Opportunity } from './types';

export const opportunities: Opportunity[] = [
  {
    id: 'opp_001',
    level: 'high',
    title: '企业B · 短贷长投错配',
    source: '数据补录',
    desc: '企业A(链主)近期大额订单流入企业B(设备商)，企业B新增5000万1年期短贷，全市场无金租记录。高度疑似短贷长投。',
    action: '3年期直租置换短贷',
    amount: '5,000万',
    irr: '6.8%',
    managerId: 'member_002',
    firmId: 'firm_002',
    date: '2026-03-22',
    score: 95,
  },
  {
    id: 'opp_002',
    level: 'high',
    title: '企业H · 存量设备回租',
    source: '数据补录',
    desc: '企业H存量设备评估价值2.8亿，设备开工率维持76%以上，运行状态良好。当前纯银行信贷，金租介入空间大。',
    action: '售后回租方案',
    amount: '7,000万',
    irr: '6.2%',
    managerId: 'member_004',
    firmId: 'firm_008',
    date: '2026-03-18',
    score: 88,
  },
  {
    id: 'opp_003',
    level: 'medium',
    title: '企业G · 产线扩张融资',
    source: '数据补录',
    desc: '企业G光伏组件产线扩张计划启动，近期招标采购新设备。SaaS协作活跃度上升23%，AI调用量持续走高。',
    action: '经营性租赁',
    amount: '5,200万',
    irr: '7.1%',
    managerId: 'member_005',
    firmId: 'firm_007',
    date: '2026-03-15',
    score: 82,
  },
  {
    id: 'opp_004',
    level: 'medium',
    title: '苏州工业园区 · 集群扩产',
    source: '数据补录',
    desc: '苏州工业园区近3月用电增速9.8%，多家企业工商变更增资扩股，新能源装备集群扩产信号明确。',
    action: '批量拓展（3-5户）',
    amount: '2-3亿',
    irr: '6.5%',
    managerId: 'member_002',
    firmId: '',
    date: '2026-03-20',
    score: 78,
  },
  {
    id: 'opp_005',
    level: 'low',
    title: '合肥经开区 · 设备更新',
    source: '数据补录',
    desc: '合肥经开区部分企业设备使用年限超过5年，开机率波动增大，存在设备更新置换需求。',
    action: '设备更新直租',
    amount: '预估1.5亿',
    irr: '6.0%',
    managerId: 'member_004',
    firmId: '',
    date: '2026-03-21',
    score: 65,
  },
  {
    id: 'opp_006',
    level: 'low',
    title: '无锡新区 · 半导体封测',
    source: '数据补录',
    desc: '无锡新区半导体封测企业集群招聘岗位数环比增加35%，产能扩张意愿明确。',
    action: '待深度调研',
    amount: '待测算',
    irr: '-',
    managerId: 'member_007',
    firmId: '',
    date: '2026-03-23',
    score: 60,
  },
];

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 根据企业ID查找商机 */
export function getOpportunitiesByFirmId(firmId: string): Opportunity[] {
  return opportunities.filter(o => o.firmId === firmId);
}

/** 根据客户经理ID查找商机 */
export function getOpportunitiesByManagerId(managerId: string): Opportunity[] {
  return opportunities.filter(o => o.managerId === managerId);
}

/** 按等级统计商机 */
export function getOpportunityStats() {
  return {
    total: opportunities.length,
    high: opportunities.filter(o => o.level === 'high').length,
    medium: opportunities.filter(o => o.level === 'medium').length,
    low: opportunities.filter(o => o.level === 'low').length,
  };
}
