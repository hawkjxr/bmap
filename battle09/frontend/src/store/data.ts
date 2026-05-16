import { create } from 'zustand';
import type {
  Province, City, District, Industry, SubIndustry,
  IndustryChain, ChainNode, Park, Manager, Firm,
  FirmRelation, Executive, VisitRecord, WorkOrder,
  Opportunity, DeployPlan, AdminData, RiskAlert,
  VisitTrail, PenetrationData, DataSourceInfo, DataImportLog,
  DataIndex, DataObjectType
} from '../data/types';
import * as mock from '../data/mockDataV2';

export interface AppState {
  // Data sources
  provinces: Province[];
  cities: City[];
  districts: District[];
  industries: Industry[];
  subIndustries: SubIndustry[];
  chains: IndustryChain[];
  chainNodes: ChainNode[];
  parks: Park[];
  managers: Manager[];
  firms: Firm[];
  firmRelations: FirmRelation[];
  executives: Executive[];
  visitRecords: VisitRecord[];
  workOrders: WorkOrder[];
  opportunities: Opportunity[];
  deployPlans: DeployPlan[];
  adminData: AdminData;
  riskAlerts: RiskAlert[];
  visitTrails: VisitTrail[];
  penetrationData: PenetrationData[];

  // Data source tracking
  sourceInfo: Record<string, DataSourceInfo>;
  importLogs: DataImportLog[];

  // Index
  index: DataIndex;

  // Actions
  importData: (objectType: DataObjectType, data: unknown[], log: DataImportLog) => void;
  addImportLog: (log: DataImportLog) => void;
  rebuildIndex: () => void;

  // Risk
  acknowledgeAlert: (alertId: string) => void;

  // Work Orders
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  addWorkOrder: (order: WorkOrder) => void;

  // Opportunities
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;

  // Reset
  resetToMock: () => void;
}

function buildIndex(state: Pick<AppState, 'provinces' | 'cities' | 'districts' | 'parks' | 'firms' | 'managers' | 'chains' | 'chainNodes' | 'industries'>): DataIndex {
  const index: DataIndex = {
    provinceIdToName: {},
    provinceIdToCode: {},
    provinceCodeToId: {},
    cityIdToName: {},
    cityIdToProvinceId: {},
    districtIdToName: {},
    districtIdToCityId: {},
    parkIdToName: {},
    parkIdToCityId: {},
    firmIdToName: {},
    firmIdToParkIds: {},
    firmIdToManagerId: {},
    managerIdToName: {},
    chainIdToName: {},
    chainNodeIdToName: {},
    chainNodeIdToChainId: {},
    industryIdToName: {},
    parkIdToFirmIds: {},
    chainIdToNodeIds: {},
    firmIdToChainNodeIds: {},
  };

  state.provinces.forEach(p => {
    index.provinceIdToName[p.id] = p.name;
    index.provinceIdToCode[p.id] = p.code;
    index.provinceCodeToId[p.code] = p.id;
  });

  state.cities.forEach(c => {
    index.cityIdToName[c.id] = c.name;
    index.cityIdToProvinceId[c.id] = c.provinceId;
  });

  state.districts.forEach(d => {
    index.districtIdToName[d.id] = d.name;
    index.districtIdToCityId[d.id] = d.cityId;
  });

  state.parks.forEach(p => {
    index.parkIdToName[p.id] = p.name;
    index.parkIdToCityId[p.id] = p.cityId;
    index.parkIdToFirmIds[p.id] = p.firmIds || [];
  });

  state.firms.forEach(f => {
    index.firmIdToName[f.id] = f.name;
    index.firmIdToParkIds[f.id] = f.parkIds || [];
    index.firmIdToManagerId[f.id] = f.primaryManagerId || '';
    index.firmIdToChainNodeIds[f.id] = f.chainNodeIds || [];
  });

  state.managers.forEach(m => {
    index.managerIdToName[m.id] = m.name;
  });

  state.chains.forEach(c => {
    index.chainIdToName[c.id] = c.name;
  });

  state.chainNodes.forEach(n => {
    index.chainNodeIdToName[n.id] = n.name;
    index.chainNodeIdToChainId[n.id] = n.chainId;
    if (!index.chainIdToNodeIds[n.chainId]) {
      index.chainIdToNodeIds[n.chainId] = [];
    }
    index.chainIdToNodeIds[n.chainId].push(n.id);
  });

  state.industries.forEach(i => {
    index.industryIdToName[i.id] = i.name;
  });

  return index;
}

function createInitialState() {
  const state = {
    provinces: mock.provinces,
    cities: mock.cities,
    districts: mock.districts,
    industries: mock.industries,
    subIndustries: mock.subIndustries,
    chains: mock.chains,
    chainNodes: mock.chainNodes,
    parks: mock.parks,
    managers: mock.managers,
    firms: mock.firms,
    firmRelations: mock.firmRelations,
    executives: mock.executives,
    visitRecords: mock.visitRecords,
    workOrders: mock.workOrders,
    opportunities: mock.opportunities,
    deployPlans: mock.deployPlans,
    adminData: mock.adminData,
    riskAlerts: mock.riskAlerts,
    visitTrails: mock.visitTrails,
    penetrationData: mock.penetrationData,
    sourceInfo: {
      province: { type: 'mock' as const, count: mock.provinces.length },
      city: { type: 'mock' as const, count: mock.cities.length },
      district: { type: 'mock' as const, count: mock.districts.length },
      industry: { type: 'mock' as const, count: mock.industries.length },
      sub_industry: { type: 'mock' as const, count: mock.subIndustries.length },
      chain: { type: 'mock' as const, count: mock.chains.length },
      chain_node: { type: 'mock' as const, count: mock.chainNodes.length },
      park: { type: 'mock' as const, count: mock.parks.length },
      manager: { type: 'mock' as const, count: mock.managers.length },
      firm: { type: 'mock' as const, count: mock.firms.length },
      executive: { type: 'mock' as const, count: mock.executives.length },
      firm_relation: { type: 'mock' as const, count: mock.firmRelations.length },
      visit_record: { type: 'mock' as const, count: mock.visitRecords.length },
      work_order: { type: 'mock' as const, count: mock.workOrders.length },
      opportunity: { type: 'mock' as const, count: mock.opportunities.length },
      plan: { type: 'mock' as const, count: mock.deployPlans.length },
      admin_data: { type: 'mock' as const, count: Object.keys(mock.adminData).length },
    } as Record<string, DataSourceInfo>,
    importLogs: [] as DataImportLog[],
  };
  return state;
}

export const useAppStore = create<AppState>((set, get) => {
  const initial = createInitialState();
  return {
    ...initial,
    index: buildIndex(initial),

    importData: (objectType, data, log) => {
      set(state => {
        const sourceInfo = { ...state.sourceInfo };
        sourceInfo[objectType] = {
          type: 'imported',
          filename: log.filename,
          count: data.length,
          lastImportAt: log.importedAt,
        };

        const importLogs = [log, ...state.importLogs].slice(0, 50);

        const updates: Partial<AppState> = { sourceInfo, importLogs };

        switch (objectType) {
          case 'province': updates.provinces = data as Province[]; break;
          case 'city': updates.cities = data as City[]; break;
          case 'district': updates.districts = data as District[]; break;
          case 'industry': updates.industries = data as Industry[]; break;
          case 'sub_industry': updates.subIndustries = data as SubIndustry[]; break;
          case 'chain': updates.chains = data as IndustryChain[]; break;
          case 'chain_node': updates.chainNodes = data as ChainNode[]; break;
          case 'park': updates.parks = data as Park[]; break;
          case 'manager': updates.managers = data as Manager[]; break;
          case 'firm': updates.firms = data as Firm[]; break;
          case 'executive': updates.executives = data as Executive[]; break;
          case 'firm_relation': updates.firmRelations = data as FirmRelation[]; break;
          case 'visit_record': updates.visitRecords = data as VisitRecord[]; break;
          case 'work_order': updates.workOrders = data as WorkOrder[]; break;
          case 'opportunity': updates.opportunities = data as Opportunity[]; break;
          case 'plan': updates.deployPlans = data as DeployPlan[]; break;
          case 'admin_data': updates.adminData = data as unknown as AdminData; break;
        }

        return updates;
      });

      get().rebuildIndex();
    },

    addImportLog: (log) => {
      set(state => ({
        importLogs: [log, ...state.importLogs].slice(0, 50),
      }));
    },

    rebuildIndex: () => {
      const state = get();
      const index = buildIndex(state);
      set({ index });
    },

    acknowledgeAlert: (alertId) => {
      set(state => ({
        riskAlerts: state.riskAlerts.map(a =>
          a.id === alertId ? { ...a, acknowledged: true } : a
        ),
      }));
    },

    updateWorkOrder: (id, updates) => {
      set(state => ({
        workOrders: state.workOrders.map(w =>
          w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
        ),
      }));
    },

    addWorkOrder: (order) => {
      set(state => ({
        workOrders: [order, ...state.workOrders],
      }));
    },

    updateOpportunity: (id, updates) => {
      set(state => ({
        opportunities: state.opportunities.map(o =>
          o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
        ),
      }));
    },

    resetToMock: () => {
      const initial = createInitialState();
      set({
        ...initial,
        index: buildIndex(initial),
        importLogs: [],
      });
    },
  };
});
