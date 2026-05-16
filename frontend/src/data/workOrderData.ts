// ═══════════════════════════════════════════════════════════════
// 工单数据（workOrderData.ts）
// 核心理念：工单关联企业ID，支持多维度查询
// ═══════════════════════════════════════════════════════════════

import type { WorkOrder } from './types';

export const workOrders: WorkOrder[] = [
  {
    id: 'T-2026-0312',
    type: 'red',
    firmId: 'firm_003',
    customer: '企业C · 苏北经开',
    title: '高危排雷核查',
    desc: 'IoT开机率<15%，实控人新增非持牌抵押',
    owner: 'member_001',
    creator: 'system',
    deadline: '24h内',
    status: '待现场',
    lbs: true,
  },
  {
    id: 'T-2026-0311',
    type: 'green',
    firmId: 'firm_002',
    customer: '企业B · 武进锂电设备',
    title: '拓客工单 · 直租方案',
    desc: '短贷长投错配，推荐3年期直租置换',
    owner: 'member_002',
    creator: 'system',
    deadline: '3天内',
    status: '待拜访',
    lbs: false,
  },
  {
    id: 'T-2026-0310',
    type: 'yellow',
    firmId: 'firm_006',
    customer: '企业F · 成都高新',
    title: '关注预警 · 交叉验证',
    desc: '用电量增速放缓，需现场核查产能',
    owner: 'member_003',
    creator: 'member_002',
    deadline: '7天内',
    status: '进行中',
    lbs: false,
  },
  {
    id: 'T-2026-0309',
    type: 'green',
    firmId: 'firm_008',
    customer: '企业H · 合肥经开',
    title: '拓客工单 · 售后回租',
    desc: '存量设备价值评估，推荐售后回租方案',
    owner: 'member_004',
    creator: 'system',
    deadline: '5天内',
    status: '已完成',
    lbs: false,
  },
  {
    id: 'T-2026-0308',
    type: 'green',
    firmId: 'firm_007',
    customer: '企业G · 武汉东湖',
    title: '拓客工单 · 经营性租赁',
    desc: '光伏组件产线扩张需求',
    owner: 'member_005',
    creator: 'member_002',
    deadline: '5天内',
    status: '已完成',
    lbs: false,
  },
  {
    id: 'T-2026-0307',
    type: 'red',
    firmId: 'firm_010',
    customer: '企业J · 西安隔膜材料',
    title: '风险复核 · 担保链排查',
    desc: '互保企业信用评级下调，需排查担保链风险',
    owner: 'member_001',
    creator: 'member_003',
    deadline: '48h内',
    status: '进行中',
    lbs: true,
  },
  {
    id: 'T-2026-0306',
    type: 'green',
    firmId: 'firm_004',
    customer: '企业D · 深圳锂电材料',
    title: '拓客工单 · 供应链融资',
    desc: '正极材料头部供应商，链主信用增信可落地',
    owner: 'member_002',
    creator: 'member_007',
    deadline: '5天内',
    status: '待拜访',
    lbs: false,
  },
  {
    id: 'T-2026-0305',
    type: 'yellow',
    firmId: 'firm_001',
    customer: '企业A · 常州动力电池',
    title: '存续期复查 · 年度回访',
    desc: '授信到期前90天，需完成年度复查报告',
    owner: 'member_002',
    creator: 'system',
    deadline: '15天内',
    status: '进行中',
    lbs: false,
  },
  {
    id: 'T-2026-0304',
    type: 'green',
    firmId: 'firm_009',
    customer: '企业I · 宁德电池巨头',
    title: '拓客工单 · 新增授信',
    desc: '战略客户二期产线投产，追加授信需求',
    owner: 'member_005',
    creator: 'member_002',
    deadline: '10天内',
    status: '待拜访',
    lbs: false,
  },
  {
    id: 'T-2026-0303',
    type: 'green',
    firmId: 'firm_005',
    customer: '企业E · 上海新能源整车',
    title: '尽调任务 · 现场走访',
    desc: '新客户尽职调查，实地走访生产现场',
    owner: 'member_007',
    creator: 'member_002',
    deadline: '7天内',
    status: '已完成',
    lbs: true,
  },
  {
    id: 'T-2026-0302',
    type: 'yellow',
    firmId: 'firm_006',
    customer: '企业F · 成都高新',
    title: '贷后管理 · 资金用途核查',
    desc: '上季度放款资金用途合规核查',
    owner: 'member_003',
    creator: 'member_001',
    deadline: '7天内',
    status: '已完成',
    lbs: false,
  },
  {
    id: 'T-2026-0301',
    type: 'red',
    firmId: 'firm_003',
    customer: '企业C · 苏北经开',
    title: '紧急冻结 · 授信暂停',
    desc: '隐性举债确认，立即暂停授信额度',
    owner: 'member_002',
    creator: 'member_003',
    deadline: '立即',
    status: '已完成',
    lbs: false,
  },
];

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 根据企业ID查找工单 */
export function getWorkOrdersByFirmId(firmId: string): WorkOrder[] {
  return workOrders.filter(w => w.firmId === firmId);
}

/** 根据负责人ID查找工单 */
export function getWorkOrdersByOwner(ownerId: string): WorkOrder[] {
  return workOrders.filter(w => w.owner === ownerId);
}

/** 按状态统计工单 */
export function getWorkOrderStats() {
  return {
    total: workOrders.length,
    pending: workOrders.filter(w => w.status === '待现场' || w.status === '待拜访').length,
    inProgress: workOrders.filter(w => w.status === '进行中').length,
    completed: workOrders.filter(w => w.status === '已完成').length,
    red: workOrders.filter(w => w.type === 'red').length,
    yellow: workOrders.filter(w => w.type === 'yellow').length,
    green: workOrders.filter(w => w.type === 'green').length,
  };
}
