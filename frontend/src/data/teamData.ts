// ═══════════════════════════════════════════════════════════════
// 团队成员数据（teamData.ts）
// 核心理念：客户经理（TeamMember）带完整 ID、领导关系
// ═══════════════════════════════════════════════════════════════

import type { TeamMember } from './types';

// ─── 团队成员（由旧数据迁移并补全 ID 和领导关系）──────────────

export const teamMembers: TeamMember[] = [
  {
    id: 'member_001',
    name: '张强',
    role: '资产保全专员',
    department: '资产运营部',
    area: '苏北片区',
    load: 3,
    leaderId: 'member_leader_002',
    email: 'zhangqiang@company.com',
  },
  {
    id: 'member_002',
    name: '李明',
    role: '属地客户经理',
    department: '营销拓展部',
    area: '常州片区',
    load: 5,
    leaderId: 'member_leader_001',
    email: 'liming@company.com',
  },
  {
    id: 'member_003',
    name: '王芳',
    role: '风控分析师',
    department: '风险管理部',
    area: '全国',
    load: 2,
    leaderId: 'member_leader_003',
    email: 'wangfang@company.com',
  },
  {
    id: 'member_004',
    name: '刘洋',
    role: '属地客户经理',
    department: '营销拓展部',
    area: '合肥片区',
    load: 4,
    leaderId: 'member_leader_001',
    email: 'liuyang@company.com',
  },
  {
    id: 'member_005',
    name: '陈磊',
    role: '属地客户经理',
    department: '营销拓展部',
    area: '武汉片区',
    load: 3,
    leaderId: 'member_leader_001',
    email: 'chenlei@company.com',
  },
  {
    id: 'member_006',
    name: '赵敏',
    role: '属地客户经理',
    department: '营销拓展部',
    area: '深圳片区',
    load: 2,
    leaderId: 'member_leader_001',
    email: 'zhaomin@company.com',
  },
  {
    id: 'member_007',
    name: '孙浩',
    role: '资产保全专员',
    department: '资产运营部',
    area: '长三角',
    load: 4,
    leaderId: 'member_leader_002',
    email: 'sunhao@company.com',
  },
];

// ─── 领导层（用于推送）────────────────────────────────────────

export const leaders: TeamMember[] = [
  {
    id: 'member_leader_001',
    name: '孙浩（领导）',
    role: '营销总监',
    department: '营销拓展部',
    area: '全国',
    load: 0,
    leaderId: '',
    email: 'sunhao_leader@company.com',
  },
  {
    id: 'member_leader_002',
    name: '王芳（领导）',
    role: '资产运营总监',
    department: '资产运营部',
    area: '全国',
    load: 0,
    leaderId: '',
    email: 'wangfang_leader@company.com',
  },
  {
    id: 'member_leader_003',
    name: '李总（领导）',
    role: '风控总监',
    department: '风险管理部',
    area: '全国',
    load: 0,
    leaderId: '',
    email: 'lizong@company.com',
  },
];

// ─── 产品经理（固定推送对象）──────────────────────────────────

export const productManagers: TeamMember[] = [
  {
    id: 'member_pm_001',
    name: '产品经理',
    role: '产品经理',
    department: '产品部',
    area: '全国',
    load: 0,
    leaderId: '',
    email: 'product_manager@company.com',
  },
];

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 根据成员ID查找成员 */
export function getMemberById(id: string): TeamMember | undefined {
  return teamMembers.find(m => m.id === id) ||
    leaders.find(m => m.id === id) ||
    productManagers.find(m => m.id === id);
}

/** 根据领导ID查找团队成员 */
export function getTeamMembersByLeaderId(leaderId: string): TeamMember[] {
  return teamMembers.filter(m => m.leaderId === leaderId);
}

/** 成员ID → 成员名称 索引 */
export const memberIdToName: Record<string, string> = Object.fromEntries([
  ...teamMembers.map(m => [m.id, m.name]),
  ...leaders.map(m => [m.id, m.name]),
  ...productManagers.map(m => [m.id, m.name]),
]);

/** 成员ID → 成员完整信息 索引 */
export const memberIdToInfo: Record<string, TeamMember> = Object.fromEntries([
  ...teamMembers.map(m => [m.id, m]),
  ...leaders.map(m => [m.id, m]),
  ...productManagers.map(m => [m.id, m]),
]);
