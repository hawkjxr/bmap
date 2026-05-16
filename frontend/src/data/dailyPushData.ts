// ═══════════════════════════════════════════════════════════════
// 每日推送记录（dailyPushData.ts）
// 核心理念：每日定时推送给 补录人 / 领导 / 产品经理
// 推送内容：个人行为 + 团队行为 + 全系统行为
// ═══════════════════════════════════════════════════════════════

import type { DailyPush, PushRecipientType, PushSummary } from './types';
import { getSupplementCountByCreatorAndDate, getSystemSupplementCountByDate } from './supplementData';

// ─── 产品经理固定ID（可配置）────────────────────────────────
export const PRODUCT_MANAGER_ID = 'member_pm_001';

// ─── 每日推送记录 ─────────────────────────────────────────────

export const dailyPushData: DailyPush[] = [
  // 2026-03-22 推送（李明新增企业B）
  {
    id: 'push_001',
    date: '2026-03-22',
    recipientType: 'creator',
    recipientId: 'member_002',
    pushTo: '李明',
    summary: {
      firmCount: 1,
      creatorName: '李明',
      teamTotal: 1,
      systemTotal: 1,
      changes: ['新增企业：企业B（武进锂电设备），评级AA+'],
    },
    status: 'sent',
    sentAt: '2026-03-23 09:00',
  },
  {
    id: 'push_002',
    date: '2026-03-22',
    recipientType: 'leader',
    recipientId: 'member_leader_001',
    pushTo: '孙浩（李明领导）',
    summary: {
      firmCount: 1,
      creatorName: '李明',
      teamTotal: 1,
      systemTotal: 1,
      changes: ['李明 新增企业：企业B（武进锂电设备）'],
    },
    status: 'sent',
    sentAt: '2026-03-23 09:00',
  },
  {
    id: 'push_003',
    date: '2026-03-22',
    recipientType: 'product_manager',
    recipientId: PRODUCT_MANAGER_ID,
    pushTo: '产品经理',
    summary: {
      firmCount: 1,
      creatorName: '李明',
      teamTotal: 1,
      systemTotal: 1,
      changes: ['常州片区 李明 新增企业1家'],
    },
    status: 'sent',
    sentAt: '2026-03-23 09:00',
  },
  // 2026-03-24 推送（张强更新企业C）
  {
    id: 'push_004',
    date: '2026-03-24',
    recipientType: 'creator',
    recipientId: 'member_001',
    pushTo: '张强',
    summary: {
      firmCount: 1,
      creatorName: '张强',
      teamTotal: 1,
      systemTotal: 1,
      changes: ['更新企业C：风险升级为高危'],
    },
    status: 'sent',
    sentAt: '2026-03-25 09:00',
  },
  {
    id: 'push_005',
    date: '2026-03-24',
    recipientType: 'leader',
    recipientId: 'member_leader_002',
    pushTo: '孙浩（张强领导）',
    summary: {
      firmCount: 1,
      creatorName: '张强',
      teamTotal: 1,
      systemTotal: 1,
      changes: ['苏北片区 张强 更新企业1家（高危预警）'],
    },
    status: 'sent',
    sentAt: '2026-03-25 09:00',
  },
  {
    id: 'push_006',
    date: '2026-03-24',
    recipientType: 'product_manager',
    recipientId: PRODUCT_MANAGER_ID,
    pushTo: '产品经理',
    summary: {
      firmCount: 1,
      creatorName: '张强',
      teamTotal: 1,
      systemTotal: 1,
      changes: ['苏北片区 张强 更新企业1家（高危预警）'],
    },
    status: 'sent',
    sentAt: '2026-03-25 09:00',
  },
];

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 根据日期获取所有推送记录 */
export function getPushByDate(date: string): DailyPush[] {
  return dailyPushData.filter(p => p.date === date);
}

/** 根据推送对象获取推送记录 */
export function getPushByRecipient(recipientId: string): DailyPush[] {
  return dailyPushData.filter(p => p.recipientId === recipientId);
}

/** 生成并保存每日推送（定时任务调用） */
export function generateDailyPush(
  date: string,
  recipients: { id: string; name: string; type: PushRecipientType; leaderId?: string }[],
  members: { id: string; name: string; leaderId: string }[]
): DailyPush[] {
  const newPushes: DailyPush[] = [];

  recipients.forEach(r => {
    let summary: PushSummary;

    if (r.type === 'creator') {
      // 推送给补录人本人
      const firmCount = getSupplementCountByCreatorAndDate(r.id, date);
      const systemTotal = getSystemSupplementCountByDate(date);
      const teamTotal = getTeamTotal(date, r.id, members);
      const changes = getChangesByCreator(date, r.id);

      summary = { firmCount, creatorName: r.name, teamTotal, systemTotal, changes };
    } else if (r.type === 'leader') {
      // 推送给领导：汇总团队所有成员补录
      const teamChanges = getChangesByLeader(date, r.id, members);
      summary = {
        firmCount: teamChanges.length,
        creatorName: r.name,
        teamTotal: teamChanges.length,
        systemTotal: getSystemSupplementCountByDate(date),
        changes: teamChanges,
      };
    } else {
      // 推送给产品经理：汇总全系统
      summary = {
        firmCount: getSystemSupplementCountByDate(date),
        creatorName: '系统',
        teamTotal: getSystemSupplementCountByDate(date),
        systemTotal: getSystemSupplementCountByDate(date),
        changes: getAllChangesByDate(date),
      };
    }

    const push: DailyPush = {
      id: `push_${String(dailyPushData.length + newPushes.length + 1).padStart(3, '0')}`,
      date,
      recipientType: r.type,
      recipientId: r.id,
      pushTo: r.name,
      summary,
      status: 'sent',
      sentAt: getNextDay(date) + ' 09:00',
    };

    newPushes.push(push);
    dailyPushData.push(push);
  });

  return newPushes;
}

/** 获取团队总补录数（领导视角） */
function getTeamTotal(date: string, leaderId: string, members: { id: string; name: string; leaderId: string }[]): number {
  const teamMemberIds = members.filter(m => m.leaderId === leaderId).map(m => m.id);
  return dailyPushData.filter(
    p => p.date === date && teamMemberIds.includes(p.recipientId) && p.recipientType === 'creator'
  ).length;
}

/** 获取某补录人的变更摘要列表 */
function getChangesByCreator(date: string, creatorId: string): string[] {
  return dailyPushData
    .filter(p => p.date === date && p.recipientId === creatorId)
    .flatMap(p => p.summary.changes ?? []);
}

/** 获取某领导的团队变更摘要列表 */
function getChangesByLeader(date: string, leaderId: string, members: { id: string; name: string; leaderId: string }[]): string[] {
  const teamMemberIds = members.filter(m => m.leaderId === leaderId).map(m => m.id);
  return dailyPushData
    .filter(p => p.date === date && teamMemberIds.includes(p.recipientId))
    .flatMap(p => p.summary.changes ?? []);
}

/** 获取某日全系统变更列表 */
function getAllChangesByDate(date: string): string[] {
  return dailyPushData
    .filter(p => p.date === date)
    .flatMap(p => p.summary.changes ?? []);
}

/** 获取次日日期（用于推送时间） */
function getNextDay(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}
