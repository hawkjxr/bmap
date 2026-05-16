import { create } from 'zustand';
import type {
  MetricDef, AdminData, ParkInfo, ChainNodeInfo,
  FinancingStructure, FollowRecord, TeamMember,
  WorkOrder, Opportunity, CustomerSearchItem, CustomerProfile,
  DataField, BusinessRule, DataSupplement, DailyPush,
  FirmInfo, ChainInfo,
  // 新版核心类型
  Province, City, District, Street,
  Industry, SubIndustry, IndustryChain, ChainNode,
  ChainNodeRelation, ChainTreeNode,
  Park, Manager, Firm, FirmLocation, Executive,
  FirmRelation, VisitRecord, DeployPlan,
} from '../data/types';
import * as mock from '../data/mockData';
import * as mockV2 from '../data/mockDataV2';

// 数据来源标识
export type DataSourceType = 'mock' | 'imported';

interface ImportLog {
  objectType: string;
  timestamp: number;
  filename: string;
  recordCount: number;
  source: DataSourceType;
}

// ─────────────────────────────────────────────────────────────
// Store 接口
// ─────────────────────────────────────────────────────────────

interface DataState {
  // 数据来源记录
  sourceType: Record<string, DataSourceType>;
  importLogs: ImportLog[];

  // ── 宏观面板 ──────────────────────
  metricDefs: MetricDef[];
  adminData: AdminData;
  parkData: ParkInfo[];          // 兼容旧组件（ParkInfo ≈ Park 的别名）
  provinceCenters: Record<string, [number, number]>;

  // ── 产业链 ──────────────────────
  chainNodeDetails: Record<string, ChainNodeInfo>;
  chainNodeRelations: ChainNodeRelation[];
  chainTreeData: Record<string, ChainTreeNode>;
  setChainTreeData: (data: Record<string, ChainTreeNode>) => void;
  chainFirms: Record<string, Array<{ nodeId: string; firmId: string; role: string; asset: string; manager?: string; managerId?: string }>>;
  chainFinancingData: FinancingStructure[];
  /** 树形图节点位置状态（chainId -> { nodeId -> { x, y } }） */
  treeNodePositions: Record<string, Record<string, { x: number; y: number }>>;
  /** 更新单个节点位置 */
  updateTreeNodePosition: (chainId: string, nodeId: string, x: number, y: number) => void;
  /** 重置指定产业链的节点位置 */
  resetTreeNodePositions: (chainId: string) => void;

  // ── 客户全景 ──────────────────────
  customerProfiles: CustomerProfile[];

  // ── 工作台 ──────────────────────
  followRecords: Record<string, FollowRecord[]>;
  teamMembers: TeamMember[];
  workOrders: WorkOrder[];
  opportunities: Opportunity[];
  customerSearchItems: CustomerSearchItem[];

  // ── 规则配置 ──────────────────────
  dataFields: DataField[];
  businessRules: BusinessRule[];

  // ── 旧版企业数据 ──────────────────────
  firmData: FirmInfo[];
  chainInfoList: ChainInfo[];

  // ── 补录与推送 ──────────────────────
  supplementData: DataSupplement[];
  dailyPushData: DailyPush[];

  // ══════════════════════════════════════
  // 以下为新版全量对象（v2.0 数据模型）
  // ══════════════════════════════════════

  // ── 行政区划 ──────────────────────
  provinces: Province[];
  cities: City[];
  districts: District[];
  streets: Street[];

  // ── 行业与产业链 ──────────────────────
  industries: Industry[];
  subIndustries: SubIndustry[];
  chains: IndustryChain[];
  chainNodes: ChainNode[];

  // ── 核心实体 ──────────────────────
  parks: Park[];             // 替换 parkData（新版）
  managers: Manager[];
  firms: Firm[];             // 替换 firmData（新版）
  firmLocations: FirmLocation[];

  // ── 关系数据 ──────────────────────
  executives: Executive[];
  firmRelations: FirmRelation[];

  // ── 事件记录 ──────────────────────
  visitRecords: VisitRecord[]; // 替换 followRecords（新版，扁平结构）
  plans: DeployPlan[];

  // ── actions ──────────────────────
  // 旧版兼容 action（保留）
  importMetricDefs: (data: MetricDef[], filename: string) => void;
  importAdminData: (data: AdminData, filename: string) => void;
  importParkData: (data: ParkInfo[], filename: string) => void;
  importProvinceCenters: (data: Record<string, [number, number]>, filename: string) => void;
  importChainNodeDetails: (data: Record<string, ChainNodeInfo>, filename: string) => void;
  importChainTreeData: (data: Record<string, ChainTreeNode>, filename: string) => void;
  importChainNodeRelations: (data: ChainNodeRelation[], filename: string) => void;
  importChainFirms: (data: Record<string, Array<{ nodeId: string; firmId: string; role: string; asset: string; manager?: string; managerId?: string }>>, filename: string) => void;
  importChainFinancingData: (data: FinancingStructure[], filename: string) => void;
  importCustomerProfiles: (data: CustomerProfile[], filename: string) => void;
  importFollowRecords: (data: Record<string, FollowRecord[]>, filename: string) => void;
  importTeamMembers: (data: TeamMember[], filename: string) => void;
  importWorkOrders: (data: WorkOrder[], filename: string) => void;
  importOpportunities: (data: Opportunity[], filename: string) => void;
  importCustomerSearchItems: (data: CustomerSearchItem[], filename: string) => void;
  importDataFields: (data: DataField[], filename: string) => void;
  importBusinessRules: (data: BusinessRule[], filename: string) => void;
  importFirmData: (data: FirmInfo[], filename: string) => void;
  importChainInfoList: (data: ChainInfo[], filename: string) => void;
  importSupplementData: (data: DataSupplement[], filename: string) => void;
  importDailyPushData: (data: DailyPush[], filename: string) => void;

  // 新版全量导入 action
  importProvinces: (data: Province[], filename: string) => void;
  importCities: (data: City[], filename: string) => void;
  importDistricts: (data: District[], filename: string) => void;
  importStreets: (data: Street[], filename: string) => void;
  importIndustries: (data: Industry[], filename: string) => void;
  importSubIndustries: (data: SubIndustry[], filename: string) => void;
  importChains: (data: IndustryChain[], filename: string) => void;
  importChainNodes: (data: ChainNode[], filename: string) => void;
  importParks: (data: Park[], filename: string) => void;
  importManagers: (data: Manager[], filename: string) => void;
  importFirms: (data: Firm[], filename: string) => void;
  importFirmLocations: (data: FirmLocation[], filename: string) => void;
  importExecutives: (data: Executive[], filename: string) => void;
  importFirmRelations: (data: FirmRelation[], filename: string) => void;
  importVisitRecords: (data: VisitRecord[], filename: string) => void;
  importPlans: (data: DeployPlan[], filename: string) => void;
  importAdminDataByProvince: (data: AdminData, filename: string) => void;

  // 补录
  addSupplement: (supplement: Omit<DataSupplement, 'id' | 'createdAt'>) => void;

  // 工具
  getObjectCount: (objectType: string) => number;
  getImportLog: (objectType: string) => ImportLog | undefined;
  resetCategory: (category: string) => void;
  resetAll: () => void;
}

// ─────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────

function countRecords(data: unknown): number {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object') return Object.keys(data).length;
  return 1;
}

function makeLog(
  state: Pick<DataState, 'importLogs' | 'sourceType'>,
  objectType: string,
  filename: string,
  data: unknown,
  source: DataSourceType = 'imported',
) {
  return {
    sourceType: { ...state.sourceType, [objectType]: source },
    importLogs: [
      ...state.importLogs.filter(l => l.objectType !== objectType),
      { objectType, timestamp: Date.now(), filename, recordCount: countRecords(data), source },
    ],
  };
}

// 旧版 mock 数据 key 映射（兼容 reset）
const oldCategoryToMockKey: Record<string, string> = {
  metricDefs: 'metricDefs', adminData: 'adminData', parkData: 'parkData',
  provinceCenters: 'provinceCenters', chainNodeDetails: 'chainNodeDetails',
  chainTreeData: 'chainTreeData', chainFinancingData: 'chainFinancingData',
  customerProfiles: 'customerProfiles', followRecords: 'followRecords',
  teamMembers: 'teamMembers', workOrders: 'workOrders',
  opportunities: 'opportunities', customerSearchItems: 'customerSearchItems',
  dataFields: 'dataFields', businessRules: 'businessRules',
  firmData: 'firmData', chainInfoList: 'chainInfoList',
  supplementData: 'supplementData', dailyPushData: 'dailyPushData',
};

// 新版 mock 初始化数据（来自 mockDataV2.ts，若不存在则用空）
// 注意：这些字段在组件中优先读取新版（firms/parks/managers 等）
// 旧版字段（firmData/parkData/teamMembers 等）保留以兼容现有组件

// ─────────────────────────────────────────────────────────────
// 初始化 SourceType 记录
// ─────────────────────────────────────────────────────────────

const initialSourceType: Record<string, DataSourceType> = {
  // 旧版
  metricDefs: 'mock', adminData: 'mock', parkData: 'mock', provinceCenters: 'mock',
  chainNodeDetails: 'mock', chainTreeData: 'mock', chainFinancingData: 'mock',
  customerProfiles: 'mock',
  followRecords: 'mock', teamMembers: 'mock', workOrders: 'mock',
  opportunities: 'mock', customerSearchItems: 'mock',
  dataFields: 'mock', businessRules: 'mock',
  firmData: 'mock', chainInfoList: 'mock',
  supplementData: 'mock', dailyPushData: 'mock',
  // 新版
  provinces: 'mock', cities: 'mock', districts: 'mock', streets: 'mock',
  industries: 'mock', subIndustries: 'mock', chains: 'mock', chainNodes: 'mock',
  chainNodeRelations: 'mock', chainFirms: 'mock',
  parks: 'mock', managers: 'mock', firms: 'mock', firmLocations: 'mock',
  executives: 'mock', firmRelations: 'mock',
  visitRecords: 'mock', plans: 'mock',
};

// ─────────────────────────────────────────────────────────────
// Store 创建
// ─────────────────────────────────────────────────────────────

export const useDataStore = create<DataState>((set, get) => ({
  // ── 初始数据（来自 mock） ──────────────────────
  sourceType: { ...initialSourceType },
  importLogs: [],

  metricDefs: mock.metricDefs,
  adminData: mock.adminData,
  parkData: mock.parkData,
  provinceCenters: mock.provinceCenters,

  chainNodeDetails: mock.chainNodeDetails,
  chainNodeRelations: mockV2.mockChainNodeRelations,
  chainTreeData: mockV2.mockChainTreeData,
  chainFirms: mockV2.mockChainFirms,
  chainFinancingData: mock.chainFinancingData,

  customerProfiles: mock.customerProfiles,

  followRecords: mock.followRecords,
  teamMembers: mock.teamMembers,
  workOrders: mock.workOrders,
  opportunities: mock.opportunities,
  customerSearchItems: mock.customerSearchItems,

  dataFields: mock.dataFields,
  businessRules: mock.businessRules,

  firmData: mock.firmData,
  chainInfoList: mock.chainInfoList,
  supplementData: mock.supplementData,
  dailyPushData: mock.dailyPushData,

  // ── 新版全量对象（初始来自 mockV2 示例数据） ──────────────────────
  provinces: mockV2.mockProvinces,
  cities: mockV2.mockCities,
  districts: mockV2.mockDistricts,
  streets: mockV2.mockStreets,
  industries: mockV2.mockIndustries,
  subIndustries: mockV2.mockSubIndustries,
  chains: mockV2.mockChains,
  chainNodes: mockV2.mockChainNodes,
  parks: mockV2.mockParks,
  managers: mockV2.mockManagers,
  firms: mockV2.mockFirms,
  firmLocations: [],
  executives: mockV2.mockExecutives,
  firmRelations: mockV2.mockFirmRelations,
  visitRecords: mockV2.mockVisitRecords,
  plans: mockV2.mockPlans,

  // ── 旧版兼容 actions ──────────────────────
  importMetricDefs: (data, filename) => set(s => ({ metricDefs: data, ...makeLog(s, 'metricDefs', filename, data) })),
  importAdminData: (data, filename) => set(s => ({ adminData: data, ...makeLog(s, 'adminData', filename, data) })),
  importParkData: (data, filename) => set(s => ({ parkData: data, ...makeLog(s, 'parkData', filename, data) })),
  importProvinceCenters: (data, filename) => set(s => ({ provinceCenters: data, ...makeLog(s, 'provinceCenters', filename, data) })),
  importChainNodeDetails: (data, filename) => set(s => ({ chainNodeDetails: data, ...makeLog(s, 'chainNodeDetails', filename, data) })),
  importChainTreeData: (data, filename) => set(s => ({ chainTreeData: data, ...makeLog(s, 'chainTreeData', filename, data) })),
  setChainTreeData: (data) => set(() => ({ chainTreeData: data })),
  importChainNodeRelations: (data, filename) => set(s => ({ chainNodeRelations: data, ...makeLog(s, 'chainNodeRelations', filename, data) })),
  importChainFirms: (data, filename) => set(s => ({ chainFirms: data, ...makeLog(s, 'chainFirms', filename, data) })),
  importChainFinancingData: (data, filename) => set(s => ({ chainFinancingData: data, ...makeLog(s, 'chainFinancingData', filename, data) })),
  importCustomerProfiles: (data, filename) => set(s => ({ customerProfiles: data, ...makeLog(s, 'customerProfiles', filename, data) })),
  importFollowRecords: (data, filename) => set(s => ({ followRecords: data, ...makeLog(s, 'followRecords', filename, data) })),
  importTeamMembers: (data, filename) => set(s => ({ teamMembers: data, ...makeLog(s, 'teamMembers', filename, data) })),
  importWorkOrders: (data, filename) => set(s => ({ workOrders: data, ...makeLog(s, 'workOrders', filename, data) })),
  importOpportunities: (data, filename) => set(s => ({ opportunities: data, ...makeLog(s, 'opportunities', filename, data) })),
  importCustomerSearchItems: (data, filename) => set(s => ({ customerSearchItems: data, ...makeLog(s, 'customerSearchItems', filename, data) })),
  importDataFields: (data, filename) => set(s => ({ dataFields: data, ...makeLog(s, 'dataFields', filename, data) })),
  importBusinessRules: (data, filename) => set(s => ({ businessRules: data, ...makeLog(s, 'businessRules', filename, data) })),
  importFirmData: (data, filename) => set(s => ({ firmData: data, ...makeLog(s, 'firmData', filename, data) })),
  importChainInfoList: (data, filename) => set(s => ({ chainInfoList: data, ...makeLog(s, 'chainInfoList', filename, data) })),
  importSupplementData: (data, filename) => set(s => ({ supplementData: data, ...makeLog(s, 'supplementData', filename, data) })),
  importDailyPushData: (data, filename) => set(s => ({ dailyPushData: data, ...makeLog(s, 'dailyPushData', filename, data) })),

  // ── 新版全量对象 actions ──────────────────────
  importProvinces: (data, filename) => set(s => ({ provinces: data, ...makeLog(s, 'provinces', filename, data) })),
  importCities: (data, filename) => set(s => ({ cities: data, ...makeLog(s, 'cities', filename, data) })),
  importDistricts: (data, filename) => set(s => ({ districts: data, ...makeLog(s, 'districts', filename, data) })),
  importStreets: (data, filename) => set(s => ({ streets: data, ...makeLog(s, 'streets', filename, data) })),
  importIndustries: (data, filename) => set(s => ({ industries: data, ...makeLog(s, 'industries', filename, data) })),
  importSubIndustries: (data, filename) => set(s => ({ subIndustries: data, ...makeLog(s, 'subIndustries', filename, data) })),
  importChains: (data, filename) => set(s => ({ chains: data, ...makeLog(s, 'chains', filename, data) })),
  importChainNodes: (data, filename) => set(s => ({ chainNodes: data, ...makeLog(s, 'chainNodes', filename, data) })),
  importParks: (data, filename) => set(s => ({ parks: data, ...makeLog(s, 'parks', filename, data) })),
  importManagers: (data, filename) => set(s => ({ managers: data, ...makeLog(s, 'managers', filename, data) })),
  importFirms: (data, filename) => set(s => ({ firms: data, ...makeLog(s, 'firms', filename, data) })),
  importFirmLocations: (data, filename) => set(s => ({ firmLocations: data, ...makeLog(s, 'firmLocations', filename, data) })),
  importExecutives: (data, filename) => set(s => ({ executives: data, ...makeLog(s, 'executives', filename, data) })),
  importFirmRelations: (data, filename) => set(s => ({ firmRelations: data, ...makeLog(s, 'firmRelations', filename, data) })),
  importVisitRecords: (data, filename) => set(s => ({ visitRecords: data, ...makeLog(s, 'visitRecords', filename, data) })),
  importPlans: (data, filename) => set(s => ({ plans: data, ...makeLog(s, 'plans', filename, data) })),
  importAdminDataByProvince: (data, filename) => set(s => ({ adminData: data, ...makeLog(s, 'adminData', filename, data) })),

  // ── 补录 action ──────────────────────
  addSupplement: (supplement) => set(s => {
    const newRecord: DataSupplement = {
      ...supplement,
      id: `sup_${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    };
    return { supplementData: [newRecord, ...s.supplementData] };
  }),

  // ── 工具 ──────────────────────
  getObjectCount: (objectType) => {
    const s = get();
    const map: Record<string, unknown> = s as unknown as Record<string, unknown>;
    const val = map[objectType];
    if (Array.isArray(val)) return val.length;
    if (val && typeof val === 'object') return Object.keys(val).length;
    return 0;
  },

  getImportLog: (objectType) => {
    return get().importLogs.find(l => l.objectType === objectType);
  },

  resetCategory: (objectType) => {
    const s = get();
    // 尝试旧版 mock 重置
    const mockKey = oldCategoryToMockKey[objectType];
    if (mockKey && mock[mockKey as keyof typeof mock]) {
      const setter: Record<string, unknown> = {};
      setter[objectType] = mock[mockKey as keyof typeof mock];
      set({
        ...setter,
        sourceType: { ...s.sourceType, [objectType]: 'mock' },
        importLogs: [
          ...s.importLogs.filter(l => l.objectType !== objectType),
          { objectType, timestamp: Date.now(), filename: 'mock', recordCount: countRecords(mock[mockKey as keyof typeof mock]), source: 'mock' },
        ],
      });
      return;
    }
    // 新版类型：清空数据
    const emptySetter: Record<string, unknown> = {};
    emptySetter[objectType] = [];
    set({
      ...emptySetter,
      sourceType: { ...s.sourceType, [objectType]: 'mock' },
      importLogs: [
        ...s.importLogs.filter(l => l.objectType !== objectType),
        { objectType, timestamp: Date.now(), filename: 'mock (cleared)', recordCount: 0, source: 'mock' },
      ],
    });
  },

  resetAll: () => set({
    sourceType: { ...initialSourceType },
    importLogs: [],
    metricDefs: mock.metricDefs,
    adminData: mock.adminData,
    parkData: mock.parkData,
    provinceCenters: mock.provinceCenters,
    chainNodeDetails: mock.chainNodeDetails,
    chainNodeRelations: mockV2.mockChainNodeRelations,
    chainTreeData: mockV2.mockChainTreeData,
    chainFirms: mockV2.mockChainFirms,
    chainFinancingData: mock.chainFinancingData,
    customerProfiles: mock.customerProfiles,
    followRecords: mock.followRecords,
    teamMembers: mock.teamMembers,
    workOrders: mock.workOrders,
    opportunities: mock.opportunities,
    customerSearchItems: mock.customerSearchItems,
    dataFields: mock.dataFields,
    businessRules: mock.businessRules,
    firmData: mock.firmData,
    chainInfoList: mock.chainInfoList,
    supplementData: mock.supplementData,
    dailyPushData: mock.dailyPushData,
    // 新版恢复示例数据
    provinces: mockV2.mockProvinces,
    cities: mockV2.mockCities,
    districts: mockV2.mockDistricts,
    streets: mockV2.mockStreets,
    industries: mockV2.mockIndustries,
    subIndustries: mockV2.mockSubIndustries,
    chains: mockV2.mockChains,
    chainNodes: mockV2.mockChainNodes,
    parks: mockV2.mockParks,
    managers: mockV2.mockManagers,
    firms: mockV2.mockFirms,
    firmLocations: [],
    executives: mockV2.mockExecutives,
    firmRelations: mockV2.mockFirmRelations,
    visitRecords: mockV2.mockVisitRecords,
    plans: mockV2.mockPlans,
  }),
}));

// ─────────────────────────────────────────────────────────────
// 便捷 Hook：监听特定对象类型的数据变化
// ─────────────────────────────────────────────────────────────

export function useObjectData<T>(objectType: string): {
  data: T[];
  count: number;
  source: DataSourceType;
  lastImport: ImportLog | undefined;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const val = useDataStore(s => (s as any)[objectType]) as T[] | undefined;
  const source = useDataStore(s => s.sourceType[objectType] || 'mock');
  const lastImport = useDataStore(s => s.importLogs.find(l => l.objectType === objectType));
  return {
    data: val ?? [],
    count: Array.isArray(val) ? val.length : 0,
    source,
    lastImport,
  };
}
