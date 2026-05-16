// ═══════════════════════════════════════════════════════════════
// 数据导入模块（importer.ts）v2.0
// 核心理念：按对象类型统一导入，支持 JSON/CSV，自动重建索引关系
//
// 支持对象类型：
//   基础层：province | city | district | street | industry | sub_industry
//   核心层：chain | chain_node | park | manager | firm
//   关系层：executive | firm_relation | firm_location
//   事件层：visit_record | work_order | opportunity | 投放_plan
//   指标层：admin_data（行政区指标）
// ═══════════════════════════════════════════════════════════════

import type {
  Province, City, District, Street,
  Industry, SubIndustry, IndustryChain, ChainNode,
  ChainNodeRelation, ChainTreeNode,
  Park, Manager, Firm, FirmLocation, FirmIndicator, Executive,
  FirmRelation, VisitRecord, WorkOrder, Opportunity, DeployPlan,
  AdminData, DataIndex, MetricKey,
  FirmInfo, ParkInfo, TeamMember,
} from './types';
import {
  mockProvinces, mockCities, mockDistricts, mockStreets,
  mockIndustries, mockSubIndustries, mockChains, mockChainNodes,
  mockChainNodeRelations, mockChainTreeData, mockChainFirms,
  mockParks, mockManagers, mockFirms, mockExecutives,
  mockFirmRelations, mockVisitRecords, mockWorkOrders,
  mockOpportunities, mockPlans,
} from './mockDataV2';
import { useDataStore } from '../store/data';

// ─────────────────────────────────────────────────────────────
// 内部全局数据存储（模拟数据库表）
// 初始化时加载 mockDataV2 示例数据，导入时覆盖对应类型的全部数据，并触发索引重建
// ─────────────────────────────────────────────────────────────

export const _db: {
  provinces: Province[];
  cities: City[];
  districts: District[];
  streets: Street[];
  industries: Industry[];
  subIndustries: SubIndustry[];
  chains: IndustryChain[];
  chainNodes: ChainNode[];
  chainNodeRelations: ChainNodeRelation[];
  chainTreeData: Record<string, ChainTreeNode>;
  chainFirms: Record<string, Array<{ nodeId: string; firmId: string; role: string; asset: string; manager?: string; managerId?: string }>>;
  parks: Park[];
  managers: Manager[];
  firms: Firm[];
  firmLocations: FirmLocation[];
  executives: Executive[];
  firmRelations: FirmRelation[];
  visitRecords: VisitRecord[];
  workOrders: WorkOrder[];
  opportunities: Opportunity[];
  plans: DeployPlan[];
  adminData: AdminData;
  index: DataIndex;
} = {
  provinces: [...mockProvinces],
  cities: [...mockCities],
  districts: [...mockDistricts],
  streets: [...mockStreets],
  industries: [...mockIndustries],
  subIndustries: [...mockSubIndustries],
  chains: [...mockChains],
  chainNodes: [...mockChainNodes],
  chainNodeRelations: [...mockChainNodeRelations],
  chainTreeData: { ...mockChainTreeData },
  chainFirms: { ...mockChainFirms },
  parks: [...mockParks],
  managers: [...mockManagers],
  firms: [...mockFirms],
  firmLocations: [],
  executives: [...mockExecutives],
  firmRelations: [...mockFirmRelations],
  visitRecords: [...mockVisitRecords],
  workOrders: [...mockWorkOrders],
  opportunities: [...mockOpportunities],
  plans: [...mockPlans],
  adminData: generateMockAdminData(),
  index: {
    provinceIdToName: {}, cityIdToName: {}, districtIdToName: {}, streetIdToName: {},
    industryIdToName: {}, chainIdToName: {}, chainNodeIdToName: {},
    firmIdToParkIds: {}, firmIdToChainNodeIds: {}, firmIdToIndustryIds: {},
    firmIdToManagerId: {}, firmIdToCoManagerIds: {},
    parkIdToFirmIds: {}, parkIdToChainIds: {},
    chainIdToNodeIds: {}, chainNodeIdToFirmIds: {},
    managerIdToFirmIds: {},
    parkIdToNodeIds: {},
    firmIdToChainIds: {}, chainIdToFirmIds: {},
    firmIdToVisitIds: {}, firmIdToWorkOrderIds: {}, firmIdToOpportunityIds: {},
    managerIdToVisitIds: {}, managerIdToWorkOrderIds: {}, managerIdToOpportunityIds: {},
    managerIdToPlanIds: {},
  } as DataIndex,
};

// ─────────────────────────────────────────────────────────────
// mockDataV2 中没有 admin_data，从 firms/parks 汇总生成
// ─────────────────────────────────────────────────────────────
function generateMockAdminData(): AdminData {
  const provinces = ['江苏省', '广东省', '浙江省', '四川省', '安徽省', '山东省', '河南省', '湖北省', '湖南省', '福建省'];
  const metrics = ['投放', '融资租赁', '企业贷款', '全量融资', '活力指数', '开工率', '金租渗透率', '用电增速', '设备投放', '客户数', '不良率', '在园企业数', '当年新注册', '高新技术占比'];
  const bases: Record<string, number> = {
    '投放': 58, '融资租赁': 320, '企业贷款': 820, '全量融资': 1420, '活力指数': 92, '开工率': 87, '金租渗透率': 6.8, '用电增速': 12.6, '设备投放': 48, '客户数': 486, '不良率': 0.32, '在园企业数': 120, '当年新注册': 15, '高新技术占比': 62,
  };
  const seeds: Record<string, number> = {
    '投放': 0.93, '融资租赁': 0.88, '企业贷款': 0.95, '全量融资': 0.91, '活力指数': 0.96, '开工率': 0.98, '金租渗透率': 0.82, '用电增速': 0.85, '设备投放': 0.79, '客户数': 0.87, '不良率': 1.12, '在园企业数': 0.9, '当年新注册': 0.88, '高新技术占比': 0.95,
  };
  const base = {} as AdminData;
  for (const m of metrics) {
    (base as Record<string, Record<string, number>>)[m] = {};
    for (const p of provinces) {
      const idx = provinces.indexOf(p);
      const val = m === '不良率'
        ? parseFloat((bases[m] * Math.pow(seeds[m], idx) * (0.8 + Math.random() * 0.4)).toFixed(2))
        : parseFloat((bases[m] * Math.pow(seeds[m], idx) * (0.8 + Math.random() * 0.4)).toFixed(1));
      (base as Record<string, Record<string, number>>)[m]![p] = val;
    }
  }
  return base;
}

// 初始化索引：模块加载时立即建立所有关联关系
rebuildIndex();

// ─────────────────────────────────────────────────────────────
// 同步 _db → Zustand store（完整版）
// 导入数据时同步更新所有新旧版本 store 字段，确保页面组件感知数据变化
// 策略：直接调用 useDataStore.setState() 批量更新，不逐个匹配 action
// ─────────────────────────────────────────────────────────────
function syncToStore(objectType: DataObjectType, data: unknown, filename: string) {
  const store = useDataStore.getState();
  const count = Array.isArray(data) ? data.length : 1;
  const logEntry = {
    objectType,
    timestamp: Date.now(),
    filename,
    recordCount: count,
    source: 'imported' as const,
  };
  const newLogs = [
    ...store.importLogs.filter(l => l.objectType !== objectType),
    logEntry,
  ];
  const newSource = { ...store.sourceType, [objectType]: 'imported' as const };

  // 批量更新映射：新类型 → 新版 store 字段 + 旧版兼容字段
  switch (objectType) {
    case 'province':
      useDataStore.setState({
        provinces: data as Province[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'city':
      useDataStore.setState({
        cities: data as City[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'district':
      useDataStore.setState({
        districts: data as District[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'street':
      useDataStore.setState({
        streets: data as Street[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'industry':
      useDataStore.setState({
        industries: data as Industry[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'sub_industry':
      useDataStore.setState({
        subIndustries: data as SubIndustry[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'chain':
      useDataStore.setState({
        chains: data as IndustryChain[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'chain_node':
      useDataStore.setState({
        chainNodes: data as ChainNode[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'park':
      useDataStore.setState({
        parks: data as Park[],
        // 兼容旧版 parkData
        parkData: (data as Park[]).map(p => ({
          id: p.id, name: p.name, cityId: p.cityId, districtId: p.districtId,
          streetId: p.streetId, lng: p.lng, lat: p.lat, risk: p.risk,
          scale: p.scale, industries: p.industries, chainIds: p.chainIds,
          data: p.data, firmIds: p.firmIds,
        })) as ParkInfo[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'manager':
      useDataStore.setState({
        managers: data as Manager[],
        // 兼容旧版 teamMembers
        teamMembers: (data as Manager[]).map(m => ({
          id: m.id, name: m.name, surname: m.surname ?? m.name[0] ?? '',
          role: m.role, department: m.department ?? '', area: m.area ?? '',
          phone: m.phone ?? '', email: m.email ?? '',
          leaderId: m.leaderId ?? '', workOrderCount: m.workOrderCount ?? 0,
          opportunityCount: m.opportunityCount ?? 0, visitCount: m.visitCount ?? 0,
          status: m.status ?? 'active', joinedAt: m.joinedAt ?? '',
          avatar: m.avatar ?? '', clients: 0, load: m.workOrderCount ?? 0,
        })) as TeamMember[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'firm':
      useDataStore.setState({
        firms: data as Firm[],
        // 兼容旧版 firmData
        firmData: (data as Firm[]).map(f => ({
          id: f.id, name: f.name, fullName: f.fullName,
          creditCode: f.creditCode, rating: f.rating,
          asset: f.asset, revenue: f.revenue, industry: f.industryIds?.[0] ?? '',
          addresses: f.parkIds?.map(pid => ({ parkId: pid, address: '' })) ?? [],
          managerId: f.primaryManagerId ?? '',
          parkIds: f.parkIds, chainNodeIds: f.chainNodeIds,
          primaryManagerId: f.primaryManagerId, coManagerIds: f.coManagerIds,
          risk: f.risk, scale: f.scale,
          indicators: f.indicators, status: f.status,
          createdAt: f.createdAt, updatedAt: f.updatedAt,
        })) as FirmInfo[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'executive':
      useDataStore.setState({
        executives: data as Executive[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'firm_relation':
      useDataStore.setState({
        firmRelations: data as FirmRelation[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'visit_record':
      useDataStore.setState({
        visitRecords: data as VisitRecord[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'work_order':
      useDataStore.setState({
        workOrders: data as WorkOrder[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'opportunity':
      useDataStore.setState({
        opportunities: data as Opportunity[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'plan':
      useDataStore.setState({
        plans: data as DeployPlan[],
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
    case 'admin_data':
      useDataStore.setState({
        adminData: data as AdminData,
        importLogs: newLogs,
        sourceType: newSource,
      });
      break;
  }
}

// ─────────────────────────────────────────────────────────────
// CSV 解析工具
// ─────────────────────────────────────────────────────────────

function parseCSVRows(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map(line => {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { row.push(current.trim()); current = ''; }
        else { current += ch; }
      }
    }
    row.push(current.trim());
    return row;
  });
}

function csvToObjects(text: string): Record<string, string>[] {
  const rows = parseCSVRows(text);
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).filter(r => r.some(c => c)).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
}

function num(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

// ─────────────────────────────────────────────────────────────
// 对象类型解析器
// ─────────────────────────────────────────────────────────────

const METRIC_KEYS: MetricKey[] = [
  '投放', '融资租赁', '企业贷款', '全量融资', '活力指数', '开工率',
  '金租渗透率', '用电增速', '设备投放', '客户数', '不良率',
  '在园企业数', '当年新注册', '高新技术占比',
];

function parseProvinces(text: string, format: 'json' | 'csv'): Province[] {
  if (format === 'json') return JSON.parse(text) as Province[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || r['省份ID'] || '',
    code: r['code'] || r['行政区划代码'] || '',
    name: r['name'] || r['省份名称'] || r['省份'] || '',
    lng: num(r['lng'] || r['经度'] || '0'),
    lat: num(r['lat'] || r['纬度'] || '0'),
  }));
}

function parseCities(text: string, format: 'json' | 'csv'): City[] {
  if (format === 'json') return JSON.parse(text) as City[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || r['城市ID'] || '',
    code: r['code'] || r['行政区划代码'] || '',
    name: r['name'] || r['城市名称'] || r['城市'] || '',
    provinceId: r['provinceId'] || r['省份ID'] || '',
    lng: num(r['lng'] || r['经度'] || '0'),
    lat: num(r['lat'] || r['纬度'] || '0'),
  }));
}

function parseDistricts(text: string, format: 'json' | 'csv'): District[] {
  if (format === 'json') return JSON.parse(text) as District[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    code: r['code'] || r['行政区划代码'] || '',
    name: r['name'] || r['区县名称'] || r['区县'] || '',
    cityId: r['cityId'] || r['城市ID'] || '',
    provinceId: r['provinceId'] || r['省份ID'] || '',
  }));
}

function parseStreets(text: string, format: 'json' | 'csv'): Street[] {
  if (format === 'json') return JSON.parse(text) as Street[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    name: r['name'] || r['街道名称'] || r['街道'] || '',
    districtId: r['districtId'] || r['区县ID'] || '',
    cityId: r['cityId'] || r['城市ID'] || '',
    provinceId: r['provinceId'] || r['省份ID'] || '',
    lng: num(r['lng'] || r['经度'] || '0'),
    lat: num(r['lat'] || r['纬度'] || '0'),
  }));
}

function parseIndustries(text: string, format: 'json' | 'csv'): Industry[] {
  if (format === 'json') return JSON.parse(text) as Industry[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    name: r['name'] || r['行业名称'] || '',
    color: r['color'] || '#00E676',
    subIndustries: (r['subIndustries'] || r['子行业'] || '').split(',').filter(Boolean),
  }));
}

function parseSubIndustries(text: string, format: 'json' | 'csv'): SubIndustry[] {
  if (format === 'json') return JSON.parse(text) as SubIndustry[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    name: r['name'] || r['子行业名称'] || '',
    industryId: r['industryId'] || r['行业ID'] || '',
    color: r['color'] || '#00E676',
  }));
}

function parseChains(text: string, format: 'json' | 'csv'): IndustryChain[] {
  if (format === 'json') return JSON.parse(text) as IndustryChain[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    name: r['name'] || r['产业链名称'] || '',
    status: (r['status'] || 'active') as IndustryChain['status'],
    description: r['description'] || r['简介'] || '',
    color: r['color'] || '#00E676',
  }));
}

function parseChainNodes(text: string, format: 'json' | 'csv'): ChainNode[] {
  if (format === 'json') return JSON.parse(text) as ChainNode[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    chainId: r['chainId'] || r['产业链ID'] || '',
    name: r['name'] || r['节点名称'] || '',
    stage: (r['stage'] || 'midstream') as ChainNode['stage'],
    scale: num(r['scale'] || r['规模'] || '0'),
    activity: num(r['activity'] || r['活力指数'] || '0'),
    bankRatio: num(r['bankRatio'] || r['银行渗透率'] || '0'),
    leaseRatio: num(r['leaseRatio'] || r['金租渗透率'] || '0'),
    description: r['description'] || r['描述'] || '',
    shortName: r['shortName'] || r['简称'] || '',
    graphX: num(r['graphX'] || r['图谱X'] || '0'),
    graphY: num(r['graphY'] || r['图谱Y'] || '0'),
    graphSize: num(r['graphSize'] || r['图谱大小'] || '0'),
    graphCategory: r['graphCategory'] || r['图谱分类'] || '',
    status: (r['status'] || 'active') as ChainNode['status'],
  }));
}

/** 解析链节点关系 */
function parseChainNodeRelations(text: string, format: 'json' | 'csv'): ChainNodeRelation[] {
  if (format === 'json') return JSON.parse(text) as ChainNodeRelation[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    sourceNodeId: r['sourceNodeId'] || r['源节点ID'] || '',
    targetNodeId: r['targetNodeId'] || r['目标节点ID'] || '',
    chainId: r['chainId'] || r['产业链ID'] || '',
    relationType: (r['relationType'] || r['关系类型'] || 'flow') as ChainNodeRelation['relationType'],
    description: r['description'] || r['关系描述'] || '',
    strength: num(r['strength'] || r['关系强度'] || '50'),
    isPrimary: (r['isPrimary'] || r['是否主要'] || 'false') === 'true',
  }));
}

function parseParks(text: string, format: 'json' | 'csv'): Park[] {
  if (format === 'json') return JSON.parse(text) as Park[];
  return csvToObjects(text).map(r => {
    const data: Record<MetricKey, number> = {} as Record<MetricKey, number>;
    METRIC_KEYS.forEach(k => { data[k] = num(r[k] || r[k.replace(/[A-Z]/g, m => m)] || '0'); });
    return {
      id: r['id'] || r['ID'] || '',
      name: r['name'] || r['园区名称'] || '',
      cityId: r['cityId'] || r['城市ID'] || '',
      districtId: r['districtId'] || r['区县ID'] || '',
      streetId: r['streetId'] || r['街道ID'] || '',
      lng: num(r['lng'] || r['经度'] || '0'),
      lat: num(r['lat'] || r['纬度'] || '0'),
      risk: (r['risk'] || 'low') as Park['risk'],
      scale: r['scale'] || r['规模'] || '',
      industries: (r['industries'] || r['行业IDs'] || '').split(',').filter(Boolean),
      chainIds: (r['chainIds'] || r['产业链IDs'] || '').split(',').filter(Boolean),
      data,
      firmIds: [],
      status: (r['status'] || 'active') as Park['status'],
      establishedYear: r['establishedYear'] || r['成立年份'] || '',
    };
  });
}

function parseManagers(text: string, format: 'json' | 'csv'): Manager[] {
  if (format === 'json') return JSON.parse(text) as Manager[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    name: r['name'] || r['姓名'] || '',
    surname: r['surname'] || r['名'] || (r['name'] || '').slice(-2) || '',
    role: (r['role'] || '客户经理') as Manager['role'],
    department: (r['department'] || '营销拓展部') as Manager['department'],
    area: (r['area'] || '华东') as Manager['area'],
    phone: r['phone'] || r['手机'] || '',
    email: r['email'] || r['邮箱'] || '',
    leaderId: r['leaderId'] || r['上级领导ID'] || '',
    workOrderCount: num(r['workOrderCount'] || r['工单数'] || '0'),
    opportunityCount: num(r['opportunityCount'] || r['商机数'] || '0'),
    visitCount: num(r['visitCount'] || r['拜访数'] || '0'),
    status: (r['status'] || 'active') as Manager['status'],
    joinedAt: r['joinedAt'] || r['入职日期'] || '',
    avatar: r['avatar'] || '',
  }));
}

function parseFirms(text: string, format: 'json' | 'csv'): Firm[] {
  if (format === 'json') return JSON.parse(text) as Firm[];
  return csvToObjects(text).map(r => {
    const indicators: FirmIndicator = {
      bankLoan: num(r['bankLoan'] || r['银行贷款'] || '0'),
      leaseLoan: num(r['leaseLoan'] || r['融资租赁'] || '0'),
      bond: num(r['bond'] || r['债券'] || '0'),
      otherDebt: num(r['otherDebt'] || r['其他负债'] || '0'),
      totalDebt: num(r['totalDebt'] || r['总负债'] || '0'),
      powerUsageKwh: num(r['powerUsageKwh'] || r['用电量'] || '0'),
      powerGrowthRate: num(r['powerGrowthRate'] || r['用电增速'] || '0'),
      operatingRate: num(r['operatingRate'] || r['开工率'] || '0'),
      aiTokenMonthly: num(r['aiTokenMonthly'] || r['月均AI'] || '0'),
      annualRevenue: num(r['annualRevenue'] || r['年营收'] || '0'),
      annualProfit: num(r['annualProfit'] || r['年利润'] || '0'),
      creditBalance: num(r['creditBalance'] || r['授信余额'] || '0'),
      usedCredit: num(r['usedCredit'] || r['已用授信'] || '0'),
    };
    return {
      id: r['id'] || r['ID'] || '',
      name: r['name'] || r['企业简称'] || '',
      fullName: r['fullName'] || r['企业全称'] || r['name'] || '',
      creditCode: r['creditCode'] || r['信用代码'] || '',
      parkIds: (r['parkIds'] || r['园区IDs'] || '').split(',').filter(Boolean),
      locationIds: [],
      industryIds: (r['industryIds'] || r['行业IDs'] || '').split(',').filter(Boolean),
      subIndustryIds: (r['subIndustryIds'] || r['子行业IDs'] || '').split(',').filter(Boolean),
      chainNodeIds: (r['chainNodeIds'] || r['节点IDs'] || '').split(',').filter(Boolean),
      rating: (r['rating'] || 'AA') as Firm['rating'],
      risk: (r['risk'] || 'normal') as Firm['risk'],
      scale: (r['scale'] || '中型') as Firm['scale'],
      asset: r['asset'] || r['资产规模'] || '',
      revenue: r['revenue'] || r['年营收'] || '',
      establishedYear: r['establishedYear'] || r['成立年份'] || '',
      website: r['website'] || '',
      phone: r['phone'] || '',
      primaryManagerId: r['primaryManagerId'] || r['主客户经理ID'] || '',
      coManagerIds: (r['coManagerIds'] || r['协同经理IDs'] || '').split(',').filter(Boolean),
      creatorId: r['creatorId'] || r['创建人ID'] || '',
      status: (r['status'] || 'normal') as Firm['status'],
      createdAt: r['createdAt'] || r['创建时间'] || new Date().toISOString(),
      updatedAt: r['updatedAt'] || new Date().toISOString(),
      indicators,
    };
  });
}

function parseExecutives(text: string, format: 'json' | 'csv'): Executive[] {
  if (format === 'json') return JSON.parse(text) as Executive[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    firmId: r['firmId'] || r['企业ID'] || '',
    name: r['name'] || r['姓名'] || '',
    title: r['title'] || r['职务'] || '',
    phone: r['phone'] || r['手机'] || '',
    email: r['email'] || r['邮箱'] || '',
    isLegalRep: (r['isLegalRep'] || r['是否法人'] || 'false') === 'true',
  }));
}

function parseFirmRelations(text: string, format: 'json' | 'csv'): FirmRelation[] {
  if (format === 'json') return JSON.parse(text) as FirmRelation[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || '',
    sourceFirmId: r['sourceFirmId'] || r['源企业ID'] || '',
    targetFirmId: r['targetFirmId'] || r['目标企业ID'] || '',
    type: (r['type'] || 'same_park') as FirmRelation['type'],
    description: r['description'] || r['关系描述'] || '',
    strength: num(r['strength'] || r['关系强度'] || '50'),
    since: r['since'] || r['建立时间'] || '',
  }));
}

function parseVisitRecords(text: string, format: 'json' | 'csv'): VisitRecord[] {
  if (format === 'json') return JSON.parse(text) as VisitRecord[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || `visit_${Date.now()}`,
    targetType: (r['targetType'] || 'firm') as VisitRecord['targetType'],
    targetId: r['targetId'] || r['目标ID'] || r['企业ID'] || '',
    targetName: r['targetName'] || r['目标名称'] || r['企业名称'] || '',
    managerId: r['managerId'] || r['客户经理ID'] || '',
    managerName: r['managerName'] || r['客户经理'] || '',
    visitType: (r['visitType'] || r['拜访类型'] || '定期回访') as VisitRecord['visitType'],
    visitDate: r['visitDate'] || r['拜访日期'] || '',
    visitTime: r['visitTime'] || r['拜访时间'] || '',
    duration: num(r['duration'] || r['时长'] || '0'),
    location: r['location'] || r['地点'] || '',
    lbsVerified: (r['lbsVerified'] || r['打卡验证'] || 'false') === 'true',
    subject: r['subject'] || r['主题'] || '',
    summary: r['summary'] || r['纪要'] || '',
    nextStep: r['nextStep'] || r['下一步'] || '',
    nextVisitDate: r['nextVisitDate'] || r['下次拜访'] || '',
    tags: (r['tags'] || r['标签'] || '').split(',').filter(Boolean),
    createdAt: r['createdAt'] || new Date().toISOString(),
    updatedAt: r['updatedAt'] || new Date().toISOString(),
  }));
}

function parseWorkOrders(text: string, format: 'json' | 'csv'): WorkOrder[] {
  if (format === 'json') return JSON.parse(text) as WorkOrder[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || `WO_${Date.now()}`,
    type: (r['type'] || r['工单类型'] || '关注') as WorkOrder['type'],
    level: (r['level'] || r['紧急程度'] || 'green') as WorkOrder['level'],
    title: r['title'] || r['标题'] || '',
    desc: r['desc'] || r['描述'] || r['详情'] || '',
    firmId: r['firmId'] || r['企业ID'] || '',
    firmName: r['firmName'] || r['企业名称'] || '',
    parkId: r['parkId'] || r['园区ID'] || '',
    parkName: r['parkName'] || r['园区名称'] || '',
    ownerId: r['ownerId'] || r['执行人ID'] || '',
    ownerName: r['ownerName'] || r['执行人'] || '',
    creatorId: r['creatorId'] || r['创建人ID'] || '',
    creatorName: r['creatorName'] || r['创建人'] || '',
    deadline: r['deadline'] || r['截止日期'] || '',
    status: (r['status'] || '待领取') as WorkOrder['status'],
    lbsRequired: (r['lbsRequired'] || r['需要打卡'] || 'false') === 'true',
    lbsVerified: (r['lbsVerified'] || 'false') === 'true',
    completedAt: r['completedAt'] || '',
    relatedVisitId: r['relatedVisitId'] || r['关联拜访'] || '',
    priority: num(r['priority'] || r['优先级'] || '3'),
    createdAt: r['createdAt'] || new Date().toISOString(),
    updatedAt: r['updatedAt'] || new Date().toISOString(),
  }));
}

function parseOpportunities(text: string, format: 'json' | 'csv'): Opportunity[] {
  if (format === 'json') return JSON.parse(text) as Opportunity[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || `OPP_${Date.now()}`,
    title: r['title'] || r['标题'] || '',
    level: (r['level'] || r['等级'] || 'medium') as Opportunity['level'],
    source: (r['source'] || r['来源'] || '数据补录') as Opportunity['source'],
    desc: r['desc'] || r['描述'] || '',
    firmId: r['firmId'] || r['企业ID'] || '',
    firmName: r['firmName'] || r['企业名称'] || '',
    parkId: r['parkId'] || r['园区ID'] || '',
    product: (r['product'] || r['产品类型'] || '直接租赁') as Opportunity['product'],
    amount: r['amount'] || r['金额'] || '0',
    irr: r['irr'] || r['IRR'] || '-',
    term: r['term'] || r['期限'] || '',
    probability: num(r['probability'] || r['转化概率'] || '50'),
    action: r['action'] || r['下一步行动'] || '',
    nextActionDate: r['nextActionDate'] || r['下次行动日期'] || '',
    ownerId: r['ownerId'] || r['负责人ID'] || '',
    ownerName: r['ownerName'] || r['负责人'] || '',
    status: (r['status'] || '发现') as Opportunity['status'],
    createdAt: r['createdAt'] || new Date().toISOString(),
    updatedAt: r['updatedAt'] || new Date().toISOString(),
    closedAt: r['closedAt'] || '',
    closedReason: r['closedReason'] || '',
  }));
}

function parseDeployPlans(text: string, format: 'json' | 'csv'): DeployPlan[] {
  if (format === 'json') return JSON.parse(text) as DeployPlan[];
  return csvToObjects(text).map(r => ({
    id: r['id'] || r['ID'] || `PLAN_${Date.now()}`,
    title: r['title'] || r['计划名称'] || '',
    product: (r['product'] || r['产品'] || '直接租赁') as DeployPlan['product'],
    firmId: r['firmId'] || r['企业ID'] || '',
    firmName: r['firmName'] || r['企业名称'] || '',
    parkId: r['parkId'] || r['园区ID'] || '',
    targetAmount: num(r['targetAmount'] || r['目标金额'] || '0'),
    targetDate: r['targetDate'] || r['计划日期'] || '',
    actualAmount: num(r['actualAmount'] || r['实际金额'] || '0'),
    actualDate: r['actualDate'] || '',
    status: (r['status'] || '草稿') as DeployPlan['status'],
    progress: num(r['progress'] || r['进度'] || '0'),
    milestones: [],
    opportunityId: r['opportunityId'] || r['商机ID'] || '',
    ownerId: r['ownerId'] || r['负责人ID'] || '',
    ownerName: r['ownerName'] || r['负责人'] || '',
    createdAt: r['createdAt'] || new Date().toISOString(),
    updatedAt: r['updatedAt'] || new Date().toISOString(),
  }));
}

function parseAdminData(text: string, format: 'json' | 'csv'): AdminData {
  if (format === 'json') return JSON.parse(text) as AdminData;
  const rows = csvToObjects(text);
  const result: AdminData = {} as AdminData;
  METRIC_KEYS.forEach(m => { result[m] = {}; });
  rows.forEach(row => {
    const province = row['省份'] || row['省份名称'] || row['province'] || row['provinceName'];
    if (!province) return;
    METRIC_KEYS.forEach(m => {
      const val = row[m] || row[m.toLowerCase()] || '';
      if (val !== '') result[m][province] = num(val);
    });
  });
  return result;
}

// ─────────────────────────────────────────────────────────────
// 索引重建
// ─────────────────────────────────────────────────────────────

export function rebuildIndex(): DataIndex {
  const idx: DataIndex = {
    provinceIdToName: {},
    cityIdToName: {},
    districtIdToName: {},
    streetIdToName: {},
    industryIdToName: {},
    chainIdToName: {},
    chainNodeIdToName: {},
    firmIdToParkIds: {},
    firmIdToChainNodeIds: {},
    firmIdToIndustryIds: {},
    firmIdToManagerId: {},
    firmIdToCoManagerIds: {},
    parkIdToFirmIds: {},
    parkIdToChainIds: {},
    chainIdToNodeIds: {},
    chainNodeIdToFirmIds: {},
    managerIdToFirmIds: {},
    firmIdToVisitIds: {},
    firmIdToWorkOrderIds: {},
    firmIdToOpportunityIds: {},
    managerIdToVisitIds: {},
    managerIdToWorkOrderIds: {},
    managerIdToOpportunityIds: {},
    managerIdToPlanIds: {},
    parkIdToNodeIds: {},
    firmIdToChainIds: {},
    chainIdToFirmIds: {},
  };

  // 行政区划索引
  _db.provinces.forEach(p => { idx.provinceIdToName[p.id] = p.name; });
  _db.cities.forEach(c => { idx.cityIdToName[c.id] = c.name; });
  _db.districts.forEach(d => { idx.districtIdToName[d.id] = d.name; });
  _db.streets.forEach(s => { idx.streetIdToName[s.id] = s.name; });

  // 行业/产业链索引
  _db.industries.forEach(i => { idx.industryIdToName[i.id] = i.name; });
  _db.chains.forEach(c => { idx.chainIdToName[c.id] = c.name; });
  _db.chainNodes.forEach(n => {
    idx.chainNodeIdToName[n.id] = n.name;
    if (!idx.chainIdToNodeIds[n.chainId]) idx.chainIdToNodeIds[n.chainId] = [];
    idx.chainIdToNodeIds[n.chainId].push(n.id);
  });

  // 企业 ↔ 园区
  _db.firms.forEach(f => {
    idx.firmIdToParkIds[f.id] = f.parkIds;
    idx.firmIdToChainNodeIds[f.id] = f.chainNodeIds;
    idx.firmIdToIndustryIds[f.id] = f.industryIds;
    idx.firmIdToManagerId[f.id] = f.primaryManagerId;
    idx.firmIdToCoManagerIds[f.id] = f.coManagerIds;
    f.parkIds.forEach(pid => {
      if (!idx.parkIdToFirmIds[pid]) idx.parkIdToFirmIds[pid] = [];
      idx.parkIdToFirmIds[pid].push(f.id);
      // 园区 ↔ 产业链
      const park = _db.parks.find(p => p.id === pid);
      if (park) {
        park.chainIds.forEach(cid => {
          if (!idx.parkIdToChainIds[pid]) idx.parkIdToChainIds[pid] = [];
          if (!idx.parkIdToChainIds[pid].includes(cid)) idx.parkIdToChainIds[pid].push(cid);
        });
      }
    });
  });

  // 链节点 ↔ 企业
  _db.chainNodes.forEach(n => {
    const firmsInNode = _db.firms.filter(f => f.chainNodeIds.includes(n.id));
    idx.chainNodeIdToFirmIds[n.id] = firmsInNode.map(f => f.id);
  });

  // 经理 ↔ 企业
  _db.managers.forEach(m => {
    idx.managerIdToFirmIds[m.id] = _db.firms
      .filter(f => f.primaryManagerId === m.id || f.coManagerIds.includes(m.id))
      .map(f => f.id);
  });

  // 拜访记录索引
  _db.visitRecords.forEach(v => {
    if (!idx.firmIdToVisitIds[v.targetId]) idx.firmIdToVisitIds[v.targetId] = [];
    idx.firmIdToVisitIds[v.targetId].push(v.id);
    if (!idx.managerIdToVisitIds[v.managerId]) idx.managerIdToVisitIds[v.managerId] = [];
    idx.managerIdToVisitIds[v.managerId].push(v.id);
  });

  // 工单索引
  _db.workOrders.forEach(wo => {
    if (wo.firmId) {
      if (!idx.firmIdToWorkOrderIds[wo.firmId]) idx.firmIdToWorkOrderIds[wo.firmId] = [];
      idx.firmIdToWorkOrderIds[wo.firmId].push(wo.id);
    }
    if (wo.ownerId) {
      if (!idx.managerIdToWorkOrderIds[wo.ownerId]) idx.managerIdToWorkOrderIds[wo.ownerId] = [];
      idx.managerIdToWorkOrderIds[wo.ownerId].push(wo.id);
    }
  });

  // 商机索引
  _db.opportunities.forEach(opp => {
    if (opp.firmId) {
      if (!idx.firmIdToOpportunityIds[opp.firmId]) idx.firmIdToOpportunityIds[opp.firmId] = [];
      idx.firmIdToOpportunityIds[opp.firmId].push(opp.id);
    }
    if (opp.ownerId) {
      if (!idx.managerIdToOpportunityIds[opp.ownerId]) idx.managerIdToOpportunityIds[opp.ownerId] = [];
      idx.managerIdToOpportunityIds[opp.ownerId].push(opp.id);
    }
  });

  // 计划索引
  _db.plans.forEach(p => {
    if (p.ownerId) {
      if (!idx.managerIdToPlanIds[p.ownerId]) idx.managerIdToPlanIds[p.ownerId] = [];
      idx.managerIdToPlanIds[p.ownerId].push(p.id);
    }
  });

  _db.index = idx;
  return idx;
}

// ─────────────────────────────────────────────────────────────
// 对象类型枚举（用于 UI 分类展示）
// ─────────────────────────────────────────────────────────────

export type DataObjectType =
  // 基础层
  | 'province' | 'city' | 'district' | 'street'
  | 'industry' | 'sub_industry'
  // 核心层
  | 'chain' | 'chain_node' | 'park' | 'manager' | 'firm'
  // 关系层
  | 'executive' | 'firm_relation' | 'chain_node_relation'
  // 事件层
  | 'visit_record' | 'work_order' | 'opportunity' | 'plan'
  // 指标层
  | 'admin_data';

export interface ObjectTypeMeta {
  type: DataObjectType;
  label: string;           // UI 显示名称
  group: string;            // 所属分组
  description: string;       // 说明文字
  icon: string;            // 图标名称（lucide）
  csvRequiredHeaders: string[]; // CSV 必需列（简要）
  csvExample: string;       // CSV 示例（一行数据）
}

export const OBJECT_TYPE_META: ObjectTypeMeta[] = [
  { type: 'province', label: '省份', group: '行政区划', description: '省份/直辖市/自治区', icon: 'Globe', csvRequiredHeaders: ['id', 'name', 'code', 'lng', 'lat'], csvExample: 'prov_320000,江苏省,320000,119.5,32.5' },
  { type: 'city', label: '城市', group: '行政区划', description: '地级市', icon: 'MapPin', csvRequiredHeaders: ['id', 'name', 'provinceId', 'lng', 'lat'], csvExample: 'city_320400,常州市,prov_320000,119.9,31.8' },
  { type: 'district', label: '区县', group: '行政区划', description: '市辖区/县级市', icon: 'Map', csvRequiredHeaders: ['id', 'name', 'cityId', 'provinceId'], csvExample: 'dist_320412,武进区,city_320400,prov_320000' },
  { type: 'street', label: '街道/园区', group: '行政区划', description: '街道/园区地址', icon: 'Building', csvRequiredHeaders: ['id', 'name', 'districtId', 'lng', 'lat'], csvExample: 'street_wj,武进经开区,dist_320412,119.9,31.7' },
  { type: 'industry', label: '一级行业', group: '行业与产业', description: '行业大类，如新能源、半导体', icon: 'Layers', csvRequiredHeaders: ['id', 'name', 'color'], csvExample: 'ind_new_energy,新能源,#00E676' },
  { type: 'sub_industry', label: '子行业', group: '行业与产业', description: '细分行业，如锂电设备、光伏组件', icon: 'Box', csvRequiredHeaders: ['id', 'name', 'industryId', 'color'], csvExample: 'sub_li_battery,锂电设备,ind_new_energy,#00E676' },
  { type: 'chain', label: '产业链', group: '行业与产业', description: '完整产业链，如动力电池产业链', icon: 'GitBranch', csvRequiredHeaders: ['id', 'name', 'status', 'color'], csvExample: 'chain_power_battery,动力电池产业链,active,#00E676' },
  { type: 'chain_node', label: '产业链节点', group: '行业与产业', description: '产业链细分环节，如正极材料', icon: 'GitMerge', csvRequiredHeaders: ['id', 'chainId', 'name', 'stage', 'activity', 'scale', 'bankRatio', 'leaseRatio'], csvExample: 'node_lithium,chain_power_battery,锂矿开采,upstream,70,120,90,10' },
  { type: 'chain_node_relation', label: '节点关系', group: '行业与产业', description: '产业链节点间的流向关系，如锂矿→正极材料', icon: 'ArrowRight', csvRequiredHeaders: ['id', 'sourceNodeId', 'targetNodeId', 'chainId', 'relationType', 'description'], csvExample: 'rel_001,node_lithium,node_cathode,chain_power_battery,flow,锂矿供应' },
  { type: 'park', label: '园区', group: '核心实体', description: '经济开发区/产业园区', icon: 'Factory', csvRequiredHeaders: ['id', 'name', 'cityId', 'districtId', 'lng', 'lat', 'risk'], csvExample: 'park_wujin,武进经开区,city_320400,dist_320412,119.9,31.7,low' },
  { type: 'manager', label: '客户经理', group: '核心实体', description: '管户客户经理及协同经理', icon: 'User', csvRequiredHeaders: ['id', 'name', 'role', 'department', 'area', 'email'], csvExample: 'mgr_001,李明,客户经理,营销拓展部,华东,liming@company.com' },
  { type: 'firm', label: '企业', group: '核心实体', description: '客户企业基本信息及经营指标', icon: 'Building2', csvRequiredHeaders: ['id', 'name', 'fullName', 'creditCode', 'parkIds', 'primaryManagerId', 'rating', 'risk', 'asset'], csvExample: 'firm_001,武进锂电,江苏武进锂电设备有限公司,91320412MA1XXXXXX,park_wujin,mgr_001,AA+,normal,50亿' },
  { type: 'executive', label: '企业高管', group: '关系数据', description: '企业高管/法人信息', icon: 'Briefcase', csvRequiredHeaders: ['id', 'firmId', 'name', 'title', 'isLegalRep'], csvExample: 'exec_001,firm_001,张总,董事长,true' },
  { type: 'firm_relation', label: '企业关系', group: '关系数据', description: '上下游/同园/同链关系', icon: 'Link', csvRequiredHeaders: ['id', 'sourceFirmId', 'targetFirmId', 'type', 'description'], csvExample: 'rel_001,firm_001,firm_002,upstream,正极材料供应' },
  { type: 'visit_record', label: '拜访记录', group: '事件记录', description: '客户拜访/沟通纪要', icon: 'ClipboardCheck', csvRequiredHeaders: ['id', 'targetType', 'targetId', 'targetName', 'managerId', 'visitType', 'visitDate', 'summary'], csvExample: 'visit_001,firm,firm_001,武进锂电,mgr_001,定期回访,2026-01-15,客户订单饱满' },
  { type: 'work_order', label: '工单', group: '事件记录', description: '拓客/排雷/关注等工单', icon: 'FileText', csvRequiredHeaders: ['id', 'type', 'level', 'title', 'firmId', 'ownerId', 'deadline', 'status'], csvExample: 'WO-2026-0001,拓客,green,武进锂电回访,firm_001,mgr_001,2026-04-20,待领取' },
  { type: 'opportunity', label: '商机', group: '事件记录', description: '发现的业务机会', icon: 'TrendingUp', csvRequiredHeaders: ['id', 'title', 'level', 'firmId', 'product', 'amount', 'ownerId', 'status'], csvExample: 'OPP-2026-0001,产线扩张融资,high,firm_001,直接租赁,5000万,mgr_001,跟进中' },
  { type: 'plan', label: '投放计划', group: '事件记录', description: '投放计划及里程碑', icon: 'Target', csvRequiredHeaders: ['id', 'title', 'product', 'firmId', 'targetAmount', 'targetDate', 'ownerId', 'status'], csvExample: 'PLAN-2026-0001,武进锂电直租,直接租赁,firm_001,5000,2026-06,李明,执行中' },
  { type: 'admin_data', label: '行政区指标', group: '指标数据', description: '省份/城市的融资/活力指标', icon: 'BarChart2', csvRequiredHeaders: ['省份', '投放', '融资租赁', '活力指数', '开工率', '用电增速'], csvExample: '江苏省,58,320,92,87,12.6' },
];

export const OBJECT_GROUPS = ['行政区划', '行业与产业', '核心实体', '关系数据', '事件记录', '指标数据'];

// ─────────────────────────────────────────────────────────────
// 统一导入入口
// ─────────────────────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  objectType: DataObjectType;
  count: number;
  errors: string[];
  warning?: string;
}

export function importFile(
  objectType: DataObjectType,
  text: string,
  fileType: 'json' | 'csv',
  filename = 'import.json',
): ImportResult {
  const errors: string[] = [];
  let data: unknown = null;

  try {
    switch (objectType) {
      case 'province':
        data = parseProvinces(text, fileType);
        _db.provinces = data as Province[];
        syncToStore(objectType, data, filename);
        break;
      case 'city':
        data = parseCities(text, fileType);
        _db.cities = data as City[];
        syncToStore(objectType, data, filename);
        break;
      case 'district':
        data = parseDistricts(text, fileType);
        _db.districts = data as District[];
        syncToStore(objectType, data, filename);
        break;
      case 'street':
        data = parseStreets(text, fileType);
        _db.streets = data as Street[];
        syncToStore(objectType, data, filename);
        break;
      case 'industry':
        data = parseIndustries(text, fileType);
        _db.industries = data as Industry[];
        syncToStore(objectType, data, filename);
        break;
      case 'sub_industry':
        data = parseSubIndustries(text, fileType);
        _db.subIndustries = data as SubIndustry[];
        syncToStore(objectType, data, filename);
        break;
      case 'chain':
        data = parseChains(text, fileType);
        _db.chains = data as IndustryChain[];
        syncToStore(objectType, data, filename);
        break;
      case 'chain_node':
        data = parseChainNodes(text, fileType);
        _db.chainNodes = data as ChainNode[];
        syncToStore(objectType, data, filename);
        break;
      case 'chain_node_relation':
        data = parseChainNodeRelations(text, fileType);
        _db.chainNodeRelations = data as ChainNodeRelation[];
        syncToStore(objectType, data, filename);
        break;
      case 'park':
        data = parseParks(text, fileType);
        _db.parks = data as Park[];
        syncToStore(objectType, data, filename);
        break;
      case 'manager':
        data = parseManagers(text, fileType);
        _db.managers = data as Manager[];
        syncToStore(objectType, data, filename);
        break;
      case 'firm':
        data = parseFirms(text, fileType);
        _db.firms = data as Firm[];
        syncToStore(objectType, data, filename);
        break;
      case 'executive':
        data = parseExecutives(text, fileType);
        _db.executives = data as Executive[];
        syncToStore(objectType, data, filename);
        break;
      case 'firm_relation':
        data = parseFirmRelations(text, fileType);
        _db.firmRelations = data as FirmRelation[];
        syncToStore(objectType, data, filename);
        break;
      case 'visit_record':
        data = parseVisitRecords(text, fileType);
        _db.visitRecords = data as VisitRecord[];
        syncToStore(objectType, data, filename);
        break;
      case 'work_order':
        data = parseWorkOrders(text, fileType);
        _db.workOrders = data as WorkOrder[];
        syncToStore(objectType, data, filename);
        break;
      case 'opportunity':
        data = parseOpportunities(text, fileType);
        _db.opportunities = data as Opportunity[];
        syncToStore(objectType, data, filename);
        break;
      case 'plan':
        data = parseDeployPlans(text, fileType);
        _db.plans = data as DeployPlan[];
        syncToStore(objectType, data, filename);
        break;
      case 'admin_data':
        data = parseAdminData(text, fileType);
        _db.adminData = data as AdminData;
        syncToStore(objectType, data, filename);
        break;
      default:
        errors.push(`不支持的对象类型: ${objectType}`);
        return { success: false, objectType, count: 0, errors };
    }

    // 触发索引重建
    rebuildIndex();

    const count = Array.isArray(data) ? data.length : 1;
    return { success: true, objectType, count, errors };

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`解析失败: ${msg}`);
    return { success: false, objectType, count: 0, errors };
  }
}

// ─────────────────────────────────────────────────────────────
// 获取数据（供其他模块使用）
// ─────────────────────────────────────────────────────────────

export function getAll<T>(objectType: DataObjectType): T[] {
  switch (objectType) {
    case 'province': return _db.provinces as T[];
    case 'city': return _db.cities as T[];
    case 'district': return _db.districts as T[];
    case 'street': return _db.streets as T[];
    case 'industry': return _db.industries as T[];
    case 'sub_industry': return _db.subIndustries as T[];
    case 'chain': return _db.chains as T[];
    case 'chain_node': return _db.chainNodes as T[];
    case 'chain_node_relation': return _db.chainNodeRelations as T[];
    case 'park': return _db.parks as T[];
    case 'manager': return _db.managers as T[];
    case 'firm': return _db.firms as T[];
    case 'executive': return _db.executives as T[];
    case 'firm_relation': return _db.firmRelations as T[];
    case 'visit_record': return _db.visitRecords as T[];
    case 'work_order': return _db.workOrders as T[];
    case 'opportunity': return _db.opportunities as T[];
    case 'plan': return _db.plans as T[];
    case 'admin_data': return [_db.adminData] as T[];
    default: return [];
  }
}

export function getIndex(): DataIndex { return _db.index; }
