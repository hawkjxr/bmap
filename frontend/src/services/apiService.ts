// ═══════════════════════════════════════════════════════════════
// API 服务层（apiService.ts）
// ─────────────────────────────────────────────────────────────
// 数据源切换开关 DATA_SOURCE：
//   'mock'   → 使用本地静态 Mock 数据（当前开发/演示阶段）
//   'remote' → 请求真实后端 REST API
//
// 接入真实后端时：
//   1. 将 DATA_SOURCE 改为 'remote'
//   2. 确保后端接口路径与下方 BASE_URL + 各函数路径一致
//   3. 如需认证，参考 initHeaders() 中的 Authorization 示例
// ═══════════════════════════════════════════════════════════════

import type { WorkOrder } from '../data/types';

// ─── 配置 ───────────────────────────────────────────────────

export const DATA_SOURCE: 'mock' | 'remote' = 'mock';

const BASE_URL = '/api';

// 统一请求头（remote 模式下自动带上）
const initHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  // 如需 Bearer Token 认证，取消下面注释并填入真实 token：
  // const token = localStorage.getItem('auth_token');
  // if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// ─── 统一请求封装 ────────────────────────────────────────────

async function remoteGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: initHeaders(),
  });
  if (!res.ok) throw new Error(`GET ${path} 失败: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function remotePost<T, B = unknown>(path: string, body: B): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: initHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} 失败: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ─── 模拟延迟（仅 mock 模式生效，模拟网络请求）─────────────

const mockDelay = () => new Promise(r => setTimeout(r, 80));

// ─── 接口定义 ───────────────────────────────────────────────

// 行政区宏观指标
export interface AdminMetricData {
  province: string;
  adcode: string;
  metrics: Record<string, number>;
}

// 产业园区指标
export interface ParkMetricData {
  parkId: string;
  parkName: string;
  province: string;
  metrics: Record<string, number>;
}

// 企业档案
export interface CustomerProfile {
  firmId: string;
  name: string;
  industry: string;
  rating: string;
  iot: { date: string; power: number; electricity: number }[];
  ai: { tokenCalls: number; saasActivity: number; patents: number; jobs: number };
  radar: { axis: string; enterprise: number; parkAvg: number; nationalAvg: number }[];
  sunburst: { name: string; value: number; children: { name: string; value: number }[] }[];
  creditScore: number;
  creditLevel: string;
  risks: string[];
}

// 工单列表
export interface WorkOrderItem {
  id: string;
  title: string;
  customer: string;
  owner: string;
  creator: string;
  status: string;
  type: string;
  deadline: string;
  desc: string;
  lbs?: boolean;
}

// 跟进记录
export interface FollowRecord {
  firmId: string;
  user: string;
  type: string;
  content: string;
  date: string;
}

// 数据补录记录
export interface SupplementRecord {
  id: string;
  firmId: string;
  firmName: string;
  type: string;
  summary: string;
  status: string;
  createdAt: string;
}

// ─── API 函数 ───────────────────────────────────────────────

// 行政区热力数据
export async function fetchAdminMetrics(metric: string): Promise<AdminMetricData[]> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    // 由调用方直接 import mock 数据，这里返回空数组由页面自行读取
    return [];
  }
  return remoteGet<AdminMetricData[]>(`/macro/admin?metric=${encodeURIComponent(metric)}`);
}

// 产业园区散点数据
export async function fetchParkMetrics(metric: string): Promise<ParkMetricData[]> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return [];
  }
  return remoteGet<ParkMetricData[]>(`/macro/parks?metric=${encodeURIComponent(metric)}`);
}

// 产业链拓扑数据
export async function fetchChainTopology(industry: string): Promise<unknown> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return null;
  }
  return remoteGet(`/chain/topology?industry=${encodeURIComponent(industry)}`);
}

// 企业全息档案
export async function fetchCustomerProfile(firmId: string): Promise<CustomerProfile | null> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return null;
  }
  return remoteGet<CustomerProfile>(`/customer/${encodeURIComponent(firmId)}`);
}

// 工单列表
export async function fetchWorkOrders(status?: string): Promise<WorkOrderItem[]> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return [];
  }
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return remoteGet<WorkOrderItem[]>(`/tasks${qs}`);
}

// 工单跟进记录
export async function fetchFollowRecords(firmId: string): Promise<FollowRecord[]> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return [];
  }
  return remoteGet<FollowRecord[]>(`/tasks/${encodeURIComponent(firmId)}/follow`);
}

// 新建工单
export async function createWorkOrder(data: Partial<WorkOrder>): Promise<WorkOrder> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    // mock 模式下直接返回原样（由调用方自行写入 store）
    return data as WorkOrder;
  }
  return remotePost<WorkOrder, Partial<WorkOrder>>('/tasks', data);
}

// 提交数据补录
export async function submitSupplement(data: Omit<SupplementRecord, 'id' | 'createdAt'>): Promise<SupplementRecord> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return { ...data, id: `sup_${Date.now()}`, createdAt: new Date().toLocaleString('zh-CN') };
  }
  return remotePost<SupplementRecord, Omit<SupplementRecord, 'id' | 'createdAt'>>('/supplements', data);
}

// 规则列表
export async function fetchRules(): Promise<unknown[]> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return [];
  }
  return remoteGet<unknown[]>('/rules');
}

// 规则回测
export async function backtestRule(ruleId: string, startDate: string, endDate: string): Promise<unknown> {
  if (DATA_SOURCE === 'mock') {
    await mockDelay();
    return null;
  }
  return remoteGet(`/rules/${encodeURIComponent(ruleId)}/backtest?start=${startDate}&end=${endDate}`);
}
