// ═══════════════════════════════════════════════════════════════
// 手工数据补录记录（supplementData.ts）
// 核心理念：客户经理补录 → 直接生效 → 触发每日推送
// ═══════════════════════════════════════════════════════════════

import type { DataSupplement } from './types';

// ─── 补录记录（模拟历史补录数据）──────────────────────────────

export const supplementData: DataSupplement[] = [
  {
    id: 'sup_001',
    firmId: 'firm_002',
    firmName: '企业B · 武进锂电设备',
    creatorId: 'member_002',
    creatorName: '李明',
    type: 'create',
    action: 'create',
    targetType: 'firm',
    targetId: 'firm_002',
    targetLabel: '企业B · 武进锂电设备',
    changes: [
      { field: 'rating', oldValue: null, newValue: 'AA+' },
      { field: 'industry', oldValue: null, newValue: '锂电设备' },
      { field: 'status', oldValue: null, newValue: 'normal' },
    ],
    summary: '新增企业：企业B（武进锂电设备），评级AA+',
    status: 'approved',
    createdAt: '2026-03-22 14:30',
  },
  {
    id: 'sup_002',
    firmId: 'firm_002',
    firmName: '企业B · 武进锂电设备',
    creatorId: 'member_002',
    creatorName: '李明',
    type: 'update',
    action: 'update',
    targetType: 'firm',
    targetId: 'firm_002',
    targetLabel: '企业B · 武进锂电设备',
    changes: [
      { field: 'rating', oldValue: 'AA', newValue: 'AA+' },
      { field: 'asset', oldValue: '—', newValue: '预估5亿' },
    ],
    summary: '更新企业评级：AA → AA+，资产补录',
    status: 'approved',
    createdAt: '2026-03-22 15:45',
  },
  {
    id: 'sup_003',
    firmId: 'firm_003',
    firmName: '企业C · 苏北机加工',
    creatorId: 'member_001',
    creatorName: '张强',
    type: 'update',
    action: 'update',
    targetType: 'firm',
    targetId: 'firm_003',
    targetLabel: '企业C · 苏北机加工',
    changes: [
      { field: 'status', oldValue: 'warning', newValue: 'danger' },
      { field: 'rating', oldValue: 'BBB', newValue: 'BB+' },
    ],
    summary: '风险升级：企业C状态变更为高危，评级下调',
    status: 'approved',
    createdAt: '2026-03-24 09:15',
  },
  {
    id: 'sup_004',
    firmId: 'firm_008',
    firmName: '企业H · 合肥电池装备',
    creatorId: 'member_004',
    creatorName: '刘洋',
    type: 'update',
    action: 'update',
    targetType: 'firm',
    targetId: 'firm_008',
    targetLabel: '企业H · 合肥电池装备',
    changes: [
      { field: 'asset', oldValue: '6亿', newValue: '7亿' },
      { field: 'rating', oldValue: 'AA', newValue: 'AA+' },
    ],
    summary: '更新资产规模：6亿 → 7亿，评级上调至AA+',
    status: 'approved',
    createdAt: '2026-03-18 16:00',
  },
  {
    id: 'sup_005',
    firmId: 'firm_006',
    firmName: '企业F · 成都储能系统',
    creatorId: 'member_003',
    creatorName: '王芳',
    type: 'update',
    action: 'update',
    targetType: 'firm',
    targetId: 'firm_006',
    targetLabel: '企业F · 成都储能系统',
    changes: [
      { field: 'status', oldValue: 'normal', newValue: 'warning' },
      { field: 'note', oldValue: null, newValue: '关注预警：用电量增速放缓' },
    ],
    summary: '状态变更：正常 → 关注预警（用电量增速放缓）',
    status: 'approved',
    createdAt: '2026-03-21 10:00',
  },
];

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 获取所有补录记录（按时间倒序） */
export function getAllSupplements(): DataSupplement[] {
  return [...supplementData].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** 根据补录人ID获取补录记录 */
export function getSupplementsByCreatorId(creatorId: string): DataSupplement[] {
  return supplementData
    .filter(s => s.creatorId === creatorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** 根据企业ID获取补录记录 */
export function getSupplementsByFirmId(firmId: string): DataSupplement[] {
  return supplementData
    .filter(s => s.firmId === firmId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** 获取某日的补录记录 */
export function getSupplementsByDate(date: string): DataSupplement[] {
  return supplementData
    .filter(s => s.createdAt.startsWith(date))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** 获取某补录人的某日补录数量 */
export function getSupplementCountByCreatorAndDate(creatorId: string, date: string): number {
  return supplementData.filter(
    s => s.creatorId === creatorId && s.createdAt.startsWith(date)
  ).length;
}

/** 获取某日的全系统补录总数 */
export function getSystemSupplementCountByDate(date: string): number {
  return supplementData.filter(s => s.createdAt.startsWith(date)).length;
}

/** 获取团队某日补录总数（同一上级领导的成员） */
export function getTeamSupplementCountByDate(leaderId: string, date: string, members: { id: string; leaderId: string }[]): number {
  const teamMemberIds = members.filter(m => m.leaderId === leaderId).map(m => m.id);
  return supplementData.filter(
    s => teamMemberIds.includes(s.creatorId) && s.createdAt.startsWith(date)
  ).length;
}

/** 添加新补录记录（补录时调用） */
export function addSupplement(supplement: Omit<DataSupplement, 'id' | 'createdAt'>): DataSupplement {
  const newSupplement: DataSupplement = {
    ...supplement,
    id: `sup_${String(supplementData.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  };
  supplementData.unshift(newSupplement);
  return newSupplement;
}
