// ═══════════════════════════════════════════════════════════════
// 数据导出模块（exporter.ts）v2.0
// 核心理念：
//   1. 导出当前已导入的任意类型数据（JSON 格式）
//   2. 导出指定类型的空模板（JSON 或 CSV）
//   3. 一键导出全量数据（all 类型，生成单个 JSON 文件）
// ═══════════════════════════════════════════════════════════════

import type { DataObjectType } from './importer';
import { OBJECT_TYPE_META, getAll, _db } from './importer';

// ─────────────────────────────────────────────────────────────
// 通用下载工具
// ─────────────────────────────────────────────────────────────

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function jsonMime(type: 'json' | 'csv'): string {
  return type === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8';
}

// ─────────────────────────────────────────────────────────────
// 生成空模板
// ─────────────────────────────────────────────────────────────

const TEMPLATE_JSON: Record<DataObjectType, unknown> = {
  province: [
    { id: 'prov_320000', code: '320000', name: '江苏省', lng: 119.5, lat: 32.5 },
    { id: 'prov_440000', code: '440000', name: '广东省', lng: 113.5, lat: 23.5 },
  ],
  city: [
    { id: 'city_320400', code: '320400', name: '常州市', provinceId: 'prov_320000', lng: 119.9, lat: 31.8 },
    { id: 'city_440100', code: '440100', name: '广州市', provinceId: 'prov_440000', lng: 113.5, lat: 23.2 },
  ],
  district: [
    { id: 'dist_320412', code: '320412', name: '武进区', cityId: 'city_320400', provinceId: 'prov_320000' },
  ],
  street: [
    { id: 'street_wj', name: '武进经开区', districtId: 'dist_320412', cityId: 'city_320400', provinceId: 'prov_320000', lng: 119.9, lat: 31.7 },
  ],
  industry: [
    { id: 'ind_new_energy', name: '新能源', color: '#00E676', subIndustries: ['sub_li_battery', 'sub_solar'] },
    { id: 'ind_auto', name: '汽车制造', color: '#3B82F6', subIndustries: [] },
  ],
  sub_industry: [
    { id: 'sub_li_battery', name: '锂电设备', industryId: 'ind_new_energy', color: '#00E676' },
    { id: 'sub_solar', name: '光伏组件', industryId: 'ind_new_energy', color: '#A3E635' },
  ],
  chain: [
    { id: 'chain_power_battery', name: '动力电池产业链', status: 'active', description: '涵盖从上游原材料到下游整车应用的完整链条', color: '#00E676' },
    { id: 'chain_ev', name: '新能源汽车产业链', status: 'active', description: '整车及核心零部件', color: '#3B82F6' },
  ],
  chain_node: [
    { id: 'node_lithium', chainId: 'chain_power_battery', name: '锂矿开采', stage: 'upstream', scale: 120, activity: 70, bankRatio: 90, leaseRatio: 10, description: '锂矿资源开采', shortName: '锂矿', graphX: 200, graphY: 50, graphSize: 44, graphCategory: '上游原材料', status: 'active' },
    { id: 'node_cathode', chainId: 'chain_power_battery', name: '正极材料', stage: 'upstream', scale: 80, activity: 85, bankRatio: 78, leaseRatio: 12, description: '磷酸铁锂/三元材料', shortName: '正极', graphX: 400, graphY: 50, graphSize: 52, graphCategory: '上游原材料', status: 'active' },
    { id: 'node_cell', chainId: 'chain_power_battery', name: '电芯制造', stage: 'midstream', scale: 100, activity: 92, bankRatio: 65, leaseRatio: 22, description: '电芯生产与封装', shortName: '电芯', graphX: 500, graphY: 250, graphSize: 72, graphCategory: '中游制造', status: 'active' },
  ],
  chain_node_relation: [
    { id: 'rel_001', sourceNodeId: 'node_lithium', targetNodeId: 'node_cathode', chainId: 'chain_power_battery', relationType: 'flow', description: '锂矿供应', strength: 90, isPrimary: true },
    { id: 'rel_002', sourceNodeId: 'node_cathode', targetNodeId: 'node_cell', chainId: 'chain_power_battery', relationType: 'flow', description: '正极材料供应', strength: 95, isPrimary: true },
  ],
  park: [
    {
      id: 'park_wujin', name: '武进经开区', cityId: 'city_320400', districtId: 'dist_320412', streetId: 'street_wj',
      lng: 119.9, lat: 31.7, risk: 'low', scale: '国家级经开区',
      industries: ['ind_new_energy'], chainIds: ['chain_power_battery'],
      data: { '投放': 12, '融资租赁': 58, '企业贷款': 120, '全量融资': 280, '活力指数': 92, '开工率': 88, '金租渗透率': 8.5, '用电增速': 15.2, '设备投放': 8, '客户数': 24, '不良率': 0.28, '在园企业数': 120, '当年新注册': 15, '高新技术占比': 62 },
      firmIds: [], status: 'active', establishedYear: '2012',
    },
  ],
  manager: [
    { id: 'mgr_001', name: '李明', surname: '明', role: '客户经理', department: '营销拓展部', area: '华东', phone: '138xxxx0001', email: 'liming@company.com', leaderId: 'mgr_lead_001', workOrderCount: 3, opportunityCount: 2, visitCount: 5, status: 'active', joinedAt: '2023-01-15', avatar: '' },
    { id: 'mgr_002', name: '刘洋', surname: '洋', role: '客户经理', department: '营销拓展部', area: '华东', phone: '138xxxx0002', email: 'liuyang@company.com', leaderId: 'mgr_lead_001', workOrderCount: 5, opportunityCount: 3, visitCount: 8, status: 'active', joinedAt: '2022-06-01', avatar: '' },
    { id: 'mgr_003', name: '王芳', surname: '芳', role: '客户经理', department: '营销拓展部', area: '华东', phone: '138xxxx0003', email: 'wangfang@company.com', leaderId: 'mgr_lead_001', workOrderCount: 4, opportunityCount: 1, visitCount: 6, status: 'active', joinedAt: '2023-09-01', avatar: '' },
  ],
  firm: [
    {
      id: 'firm_001', name: '武进锂电', fullName: '江苏武进锂电设备有限公司', creditCode: '91320412MA1XXXXXX',
      parkIds: ['park_wujin'], locationIds: [], industryIds: ['ind_new_energy'], subIndustryIds: ['sub_li_battery'], chainNodeIds: ['node_cell'],
      rating: 'AA+', risk: 'normal', scale: '大型', asset: '50亿', revenue: '20亿', establishedYear: '2015',
      website: '', phone: '', primaryManagerId: 'mgr_001', coManagerIds: [],
      creatorId: 'mgr_001', status: 'normal', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z',
      indicators: { bankLoan: 8000, leaseLoan: 2000, bond: 0, otherDebt: 3000, totalDebt: 13000, powerUsageKwh: 2500, powerGrowthRate: 12.5, operatingRate: 88, aiTokenMonthly: 3420000, annualRevenue: 200000, annualProfit: 18000, creditBalance: 30000, usedCredit: 13000 },
    },
  ],
  executive: [
    { id: 'exec_001', firmId: 'firm_001', name: '张总', title: '董事长', phone: '', email: '', isLegalRep: true },
    { id: 'exec_002', firmId: 'firm_001', name: '李总', title: '总经理', phone: '', email: '', isLegalRep: false },
  ],
  firm_relation: [
    { id: 'rel_001', sourceFirmId: 'firm_001', targetFirmId: 'firm_002', type: 'upstream', description: '正极材料供应', strength: 85, since: '2020-01-01' },
    { id: 'rel_002', sourceFirmId: 'firm_001', targetFirmId: 'firm_003', type: 'downstream', description: '电池包采购', strength: 75, since: '2021-06-01' },
  ],
  visit_record: [
    {
      id: 'visit_001', targetType: 'firm', targetId: 'firm_001', targetName: '武进锂电',
      managerId: 'mgr_001', managerName: '李明', visitType: '定期回访',
      visitDate: '2026-04-08', visitTime: '14:00', duration: 90, location: '武进经开区创新园B座',
      lbsVerified: true, subject: 'Q2季度回访', summary: '客户表示订单饱满，Q2排产已满。当前用电量同比增长15%，AI协作工具活跃度飙升，显示扩张意愿强。近期有产线扩建融资需求。',
      nextStep: '整理融资方案建议，发送客户确认', nextVisitDate: '2026-05-08',
      tags: ['高意向', '融资需求'], createdAt: '2026-04-08T14:00:00Z', updatedAt: '2026-04-08T16:00:00Z',
    },
  ],
  work_order: [
    {
      id: 'WO-2026-0001', type: '拓客', level: 'green', title: '武进锂电设备企业回访',
      desc: '跟进Q2回访意向，制定融资方案', firmId: 'firm_001', firmName: '武进锂电',
      parkId: 'park_wujin', parkName: '武进经开区', ownerId: 'mgr_001', ownerName: '李明',
      creatorId: 'mgr_lead_001', creatorName: '团队负责人', deadline: '2026-04-15',
      status: '待闭环', lbsRequired: true, lbsVerified: true, completedAt: '',
      relatedVisitId: 'visit_001', priority: 4,
      createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-08T16:00:00Z',
    },
  ],
  opportunity: [
    {
      id: 'OPP-2026-0001', title: '武进锂电产线扩张直租', level: 'high', source: '数据补录',
      desc: '企业因订单饱满启动二期产线建设，需采购设备，估算融资需求5000万',
      firmId: 'firm_001', firmName: '武进锂电', parkId: 'park_wujin',
      product: '直接租赁', amount: '5000万', irr: '6.8%', term: '3年', probability: 70,
      action: '发送方案初稿给客户', nextActionDate: '2026-04-20',
      ownerId: 'mgr_001', ownerName: '李明', status: '跟进中',
      createdAt: '2026-04-08T16:00:00Z', updatedAt: '2026-04-08T16:00:00Z', closedAt: '', closedReason: '',
    },
  ],
  plan: [
    {
      id: 'PLAN-2026-0001', title: '武进锂电直租项目推进',
      product: '直接租赁', firmId: 'firm_001', firmName: '武进锂电', parkId: 'park_wujin',
      targetAmount: 5000, targetDate: '2026-06', actualAmount: 0, actualDate: '',
      status: '执行中', progress: 30,
      milestones: [
        { name: '方案发送', plannedDate: '2026-04-20', actualDate: '', status: 'done' },
        { name: '客户确认', plannedDate: '2026-04-30', actualDate: '', status: 'pending' },
        { name: '尽调完成', plannedDate: '2026-05-15', actualDate: '', status: 'pending' },
        { name: '签约', plannedDate: '2026-05-31', actualDate: '', status: 'pending' },
        { name: '起租上账', plannedDate: '2026-06-15', actualDate: '', status: 'pending' },
      ],
      opportunityId: 'OPP-2026-0001', ownerId: 'mgr_001', ownerName: '李明',
      createdAt: '2026-04-08T16:00:00Z', updatedAt: '2026-04-08T16:00:00Z',
    },
  ],
  admin_data: {
    '投放': { '江苏省': 58, '广东省': 48, '浙江省': 42, '四川省': 35, '安徽省': 30 },
    '融资租赁': { '江苏省': 320, '广东省': 285, '浙江省': 220, '四川省': 180, '安徽省': 150 },
    '企业贷款': { '江苏省': 820, '广东省': 780, '浙江省': 650, '四川省': 480, '安徽省': 420 },
    '全量融资': { '江苏省': 1420, '广东省': 1280, '浙江省': 1080, '四川省': 820, '安徽省': 720 },
    '活力指数': { '江苏省': 92, '广东省': 88, '浙江省': 85, '四川省': 78, '安徽省': 72 },
    '开工率': { '江苏省': 87, '广东省': 85, '浙江省': 83, '四川省': 76, '安徽省': 70 },
    '金租渗透率': { '江苏省': 6.8, '广东省': 5.5, '浙江省': 5.2, '四川省': 4.2, '安徽省': 3.8 },
    '用电增速': { '江苏省': 12.6, '广东省': 10.2, '浙江省': 9.5, '四川省': 7.2, '安徽省': 6.5 },
    '设备投放': { '江苏省': 48.2, '广东省': 42.0, '浙江省': 36.5, '四川省': 28.0, '安徽省': 22.0 },
    '客户数': { '江苏省': 486, '广东省': 420, '浙江省': 365, '四川省': 280, '安徽省': 220 },
    '不良率': { '江苏省': 0.32, '广东省': 0.48, '浙江省': 0.38, '四川省': 0.55, '安徽省': 0.62 },
    '在园企业数': { '江苏省': 0, '广东省': 0, '浙江省': 0, '四川省': 0, '安徽省': 0 },
    '当年新注册': { '江苏省': 0, '广东省': 0, '浙江省': 0, '四川省': 0, '安徽省': 0 },
    '高新技术占比': { '江苏省': 0, '广东省': 0, '浙江省': 0, '四川省': 0, '安徽省': 0 },
  },
};

/** 导出空模板（JSON） */
export function exportTemplateJSON(objectType: DataObjectType) {
  const data = TEMPLATE_JSON[objectType];
  const meta = OBJECT_TYPE_META.find(m => m.type === objectType);
  const label = meta?.label || objectType;
  const content = JSON.stringify(data, null, 2);
  const today = new Date().toISOString().slice(0, 10);
  downloadBlob(content, `${objectType}_模板_${label}_${today}.json`, jsonMime('json'));
}

/** 导出空模板（CSV） */
export function exportTemplateCSV(objectType: DataObjectType) {
  const meta = OBJECT_TYPE_META.find(m => m.type === objectType);
  if (!meta) return;
  const label = meta.label;
  const headers = meta.csvRequiredHeaders.join(',');
  const example = meta.csvExample;
  const content = `\ufeff${headers}\n${example}`;
  const today = new Date().toISOString().slice(0, 10);
  downloadBlob(content, `${objectType}_模板_${label}_${today}.csv`, jsonMime('csv'));
}

/** 导出当前已导入的数据（JSON） */
export function exportCurrentData(objectType: DataObjectType) {
  const data = getAll(objectType);
  const meta = OBJECT_TYPE_META.find(m => m.type === objectType);
  const label = meta?.label || objectType;
  const content = JSON.stringify(data, null, 2);
  const today = new Date().toISOString().slice(0, 10);
  downloadBlob(content, `${objectType}_${label}_${today}.json`, jsonMime('json'));
}

/** 导出全量数据（单个 JSON 文件，包含所有已导入类型） */
export function exportAllData() {
  const all: Record<string, unknown> = {};
  for (const meta of OBJECT_TYPE_META) {
    const data = getAll(meta.type);
    if (data.length > 0 || meta.type === 'admin_data') {
      all[meta.type] = data;
    }
  }
  all['_exportedAt'] = new Date().toISOString();
  const content = JSON.stringify(all, null, 2);
  const today = new Date().toISOString().slice(0, 10);
  downloadBlob(content, `全量数据导出_${today}.json`, jsonMime('json'));
}

/** 批量导出所有类型的模板（ZIP 形式，仅 JSON） */
export function exportAllTemplates() {
  // 简单起见，依次下载每个类型的模板
  for (const meta of OBJECT_TYPE_META) {
    if (meta.type !== 'admin_data') {
      exportTemplateJSON(meta.type);
    }
  }
}
