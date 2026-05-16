// ═══════════════════════════════════════════════════════════════
// 跟进记录数据（followData.ts）
// 核心理念：跟进记录关联企业ID
// ═══════════════════════════════════════════════════════════════

import type { FollowRecord } from './types';

export const followRecords: Record<string, FollowRecord[]> = {
  'firm_003': [
    { date: '2026-03-24 09:15', user: '张强', type: '系统预警', content: '风控引擎触发：IoT开机率连续7天低于15%，实控人新增非持牌机构抵押登记。' },
    { date: '2026-03-24 10:30', user: '系统', type: '自动操作', content: '已调用核心信贷API冻结企业C新增授信额度。' },
    { date: '2026-03-24 14:20', user: '张强', type: '电话跟进', content: '联系企业财务总监，对方称设备检修停产，预计下周恢复。需现场核实。' },
  ],
  'firm_002': [
    { date: '2026-03-22 08:00', user: '系统', type: '商机发现', content: '产业链图谱识别：企业A订单流入企业B 1.5亿，企业B新增5000万短期流贷（疑似短贷长投）。' },
    { date: '2026-03-22 11:00', user: '李明', type: '电话跟进', content: '初步电话沟通，企业B财务表示有新产线采购计划，对直租方案感兴趣。' },
    { date: '2026-03-23 15:30', user: '李明', type: '方案发送', content: '已发送3年期直租测算方案（IRR 6.8%，金额5000万），等待对方反馈。' },
  ],
  'firm_006': [
    { date: '2026-03-20 09:00', user: '系统', type: '关注预警', content: '企业F用电量增速连续2月放缓（+7.2%→+3.1%），需交叉验证产能。' },
    { date: '2026-03-21 10:00', user: '王芳', type: '数据核查', content: '调取IoT数据，设备开工率仍在70%，用电下降可能与季节性因素有关。' },
  ],
  'firm_008': [
    { date: '2026-03-18 08:30', user: '系统', type: '商机发现', content: '企业H存量设备评估价值2.8亿，符合售后回租条件。' },
    { date: '2026-03-19 14:00', user: '刘洋', type: '现场拜访', content: '完成现场尽调，设备状态良好，企业同意回租方案。' },
    { date: '2026-03-20 16:00', user: '刘洋', type: '方案提交', content: '已提交审批，预计3个工作日内批复。' },
    { date: '2026-03-22 11:00', user: '系统', type: '审批通过', content: '风控审批通过，合同金额7000万，期限36个月。' },
  ],
  'firm_007': [
    { date: '2026-03-15 09:00', user: '系统', type: '商机发现', content: '企业G光伏组件产线扩张，融资需求约5000万。' },
    { date: '2026-03-17 15:00', user: '陈磊', type: '现场拜访', content: '现场核查产线，确认扩产计划属实。已签署意向书。' },
    { date: '2026-03-20 10:00', user: '系统', type: '已放款', content: '经营性租赁放款完成，金额5200万。' },
  ],
};

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 根据企业ID获取跟进记录 */
export function getFollowRecordsByFirmId(firmId: string): FollowRecord[] {
  return followRecords[firmId] || [];
}

/** 获取所有企业最新跟进时间 */
export function getLatestFollowDates(): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(followRecords).forEach(([firmId, records]) => {
    if (records.length > 0) {
      result[firmId] = records[records.length - 1].date;
    }
  });
  return result;
}
