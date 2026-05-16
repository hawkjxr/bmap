export type MetricKey =
  | '投放'
  | '融资租赁'
  | '企业贷款'
  | '全量融资'
  | '活力指数'
  | '开工率'
  | '金租渗透率'
  | '用电增速'
  | '设备投放'
  | '客户数'
  | '不良率'
  | '在园企业数'
  | '当年新注册'
  | '高新技术占比';

export const METRIC_LABELS: Record<MetricKey, string> = {
  '投放': '设备投放规模（亿元）',
  '融资租赁': '融资租赁余额（亿元）',
  '企业贷款': '企业贷款余额（亿元）',
  '全量融资': '全量融资规模（亿元）',
  '活力指数': '园区活力指数（0-100）',
  '开工率': '产能利用率（%）',
  '金租渗透率': '融资租赁渗透率（%）',
  '用电增速': '用电量同比增速（%）',
  '设备投放': '新增设备投放（台套）',
  '客户数': '管户客户数',
  '不良率': '不良贷款率（%）',
  '在园企业数': '园区内注册企业数',
  '当年新注册': '当年新注册企业数',
  '高新技术占比': '高新技术企业占比（%）',
};

export const METRIC_COLORS: Record<MetricKey, string> = {
  '投放': '#3B82F6',
  '融资租赁': '#8B5CF6',
  '企业贷款': '#06B6D4',
  '全量融资': '#F97316',
  '活力指数': '#10B981',
  '开工率': '#22C55E',
  '金租渗透率': '#A855F7',
  '用电增速': '#EAB308',
  '设备投放': '#EC4899',
  '客户数': '#3B82F6',
  '不良率': '#EF4444',
  '在园企业数': '#14B8A6',
  '当年新注册': '#F59E0B',
  '高新技术占比': '#6366F1',
};

export type FirmStatus = 'normal' | 'warning' | 'danger';
export type FirmScale = '大型' | '中型' | '小型';
export type CreditRating = 'AAA' | 'AA+' | 'AA' | 'A+' | 'A' | 'BBB' | 'BB' | 'B';

export type ProvinceCode = string;
export type CityCode = string;
export type DistrictCode = string;
export type StreetId = string;
export type ParkId = string;
export type FirmId = string;
export type ManagerId = string;
export type ChainId = string;
export type ChainNodeId = string;
export type IndustryId = string;
export type SubIndustryId = string;

export interface Province {
  id: ProvinceCode;
  code: ProvinceCode;
  name: string;
  lng: number;
  lat: number;
}

export interface City {
  id: CityCode;
  code: CityCode;
  name: string;
  provinceId: ProvinceCode;
  lng: number;
  lat: number;
}

export interface District {
  id: DistrictCode;
  code: DistrictCode;
  name: string;
  cityId: CityCode;
  provinceId: ProvinceCode;
}

export interface Street {
  id: StreetId;
  name: string;
  districtId: DistrictCode;
  cityId: CityCode;
  provinceId: ProvinceCode;
  lng: number;
  lat: number;
}

export interface Industry {
  id: IndustryId;
  name: string;
  color: string;
  subIndustries: SubIndustryId[];
}

export interface SubIndustry {
  id: SubIndustryId;
  name: string;
  industryId: IndustryId;
  color: string;
}

export type ChainStage = 'upstream' | 'midstream' | 'downstream' | 'terminal';

export interface IndustryChain {
  id: ChainId;
  name: string;
  status: 'active' | 'inactive';
  description: string;
  color: string;
}

export interface ChainNode {
  id: ChainNodeId;
  chainId: ChainId;
  name: string;
  stage: ChainStage;
  scale: string;
  activity: number;
  bankRatio: number;
  leaseRatio: number;
  parkIds: ParkId[];
  firmIds: FirmId[];
}

export type ParkRisk = 'low' | 'medium' | 'high';

export interface Park {
  id: ParkId;
  name: string;
  cityId: CityCode;
  districtId: DistrictCode;
  streetId?: StreetId;
  lng: number;
  lat: number;
  risk: ParkRisk;
  scale: string;
  industries: IndustryId[];
  chainIds: ChainId[];
  data: Partial<Record<MetricKey, number>>;
  firmIds: FirmId[];
  status: 'active' | 'inactive';
  establishedYear: string;
}

export type ManagerRole = '高管' | '团队长' | '客户经理' | '风控';

export interface Manager {
  id: ManagerId;
  name: string;
  surname: string;
  role: ManagerRole;
  department: string;
  area: string;
  phone: string;
  email: string;
  leaderId?: ManagerId;
  workOrderCount: number;
  opportunityCount: number;
  visitCount: number;
  status: 'active' | 'inactive';
  avatar?: string;
}

export type WorkOrderType = '排雷' | '关注' | '拓客';
export type WorkOrderLevel = 'red' | 'yellow' | 'green';
export type WorkOrderStatus = '待闭环' | '进行中' | '已完成';

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  level?: WorkOrderLevel;
  title: string;
  desc?: string;
  firmId?: FirmId;
  firmName?: string;
  parkId?: ParkId;
  parkName?: string;
  ownerId: ManagerId;
  ownerName?: string;
  creatorId: ManagerId;
  creatorName?: string;
  deadline: string;
  status: WorkOrderStatus;
  lbsRequired?: boolean;
  lbsVerified?: boolean;
  completedAt?: string;
  priority?: number;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityLevel = 'high' | 'medium' | 'low';
export type OpportunityStatus = '待跟进' | '跟进中' | '已成交' | '已放弃';
export type ProductType = '直接租赁' | '售后回租' | '经营租赁';

export interface Opportunity {
  id: string;
  title: string;
  level: OpportunityLevel;
  source: string;
  desc: string;
  firmId: FirmId;
  firmName: string;
  parkId: ParkId;
  product: ProductType;
  amount: string;
  irr?: string;
  term?: string;
  probability: number;
  action: string;
  nextActionDate: string;
  ownerId: ManagerId;
  ownerName: string;
  status: OpportunityStatus;
  vendorTags?: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedReason?: string;
}

export interface FirmIndicator {
  asset?: number;
  revenue?: number;
  yoyGrowth?: number;
  profitMargin?: number;
  debtRatio?: number;
  currentRatio?: number;
  creditScore?: number;
  nplRatio?: number;
  creditLimit?: number;
  usedLimit?: number;
  electricityUsage?: number;
  operatingRate?: number;
  vitalityIndex?: number;
}

export interface Firm {
  id: FirmId;
  name: string;
  fullName: string;
  creditCode: string;
  parkIds: ParkId[];
  locationIds: string[];
  industryIds: IndustryId[];
  subIndustryIds: SubIndustryId[];
  chainNodeIds: ChainNodeId[];
  rating: CreditRating;
  risk: FirmStatus;
  scale: FirmScale;
  asset: string;
  revenue: string;
  establishedYear: string;
  website?: string;
  phone?: string;
  primaryManagerId?: ManagerId;
  coManagerIds?: ManagerId[];
  indicators: FirmIndicator;
  creatorId?: ManagerId;
  status: 'normal' | 'abnormal';
  createdAt: string;
  updatedAt: string;
}

export type FirmRelationType =
  | 'upstream'
  | 'downstream'
  | 'same_park'
  | 'same_chain'
  | 'equity'
  | 'guarantee'
  | 'association'
  | 'other';

export interface FirmRelation {
  id: string;
  sourceFirmId: FirmId;
  targetFirmId: FirmId;
  type: FirmRelationType;
  description: string;
  strength: number;
}

export interface Executive {
  id: string;
  firmId: FirmId;
  name: string;
  title: string;
  phone?: string;
  email?: string;
  isLegalRep: boolean;
}

export type VisitType = '首次拜访' | '常规拜访' | '高层拜访' | '现场尽调' | '签约洽谈';

export interface VisitRecord {
  id: string;
  targetType: 'firm' | 'park';
  targetId: string;
  managerId: ManagerId;
  visitType: VisitType;
  visitDate: string;
  location: string;
  lng?: number;
  lat?: number;
  lbsVerified: boolean;
  subject: string;
  summary: string;
  nextStep: string;
  nextVisitDate?: string;
  photos?: string[];
  createdAt: string;
}

export interface DeployPlan {
  id: string;
  title: string;
  product: ProductType;
  firmId: FirmId;
  targetAmount: string;
  milestones: { name: string; date: string; status: 'pending' | 'done' }[];
  ownerId: ManagerId;
  status: 'draft' | 'approved' | 'rejected' | 'signed';
  createdAt: string;
  updatedAt: string;
}

export type AdminData = Partial<Record<MetricKey, Partial<Record<string, number>>>>;

export type DataObjectType =
  | 'province'
  | 'city'
  | 'district'
  | 'street'
  | 'industry'
  | 'sub_industry'
  | 'chain'
  | 'chain_node'
  | 'park'
  | 'manager'
  | 'firm'
  | 'executive'
  | 'firm_relation'
  | 'visit_record'
  | 'work_order'
  | 'opportunity'
  | 'plan'
  | 'admin_data'
  | 'supplement_record';

export interface ObjectTypeMeta {
  type: DataObjectType;
  label: string;
  group: string;
  description: string;
  csvRequiredHeaders: string[];
  csvExample: string;
  icon?: string;
}

export const OBJECT_TYPE_META: ObjectTypeMeta[] = [
  {
    type: 'province',
    label: '省份',
    group: '行政区划',
    description: '全国省份行政区划数据',
    csvRequiredHeaders: ['id', 'code', 'name', 'lng', 'lat'],
    csvExample: 'id,code,name,lng,lat',
  },
  {
    type: 'city',
    label: '城市',
    group: '行政区划',
    description: '城市行政区划数据',
    csvRequiredHeaders: ['id', 'code', 'name', 'provinceId', 'lng', 'lat'],
    csvExample: 'id,code,name,provinceId,lng,lat',
  },
  {
    type: 'district',
    label: '区县',
    group: '行政区划',
    description: '区县行政区划数据',
    csvRequiredHeaders: ['id', 'code', 'name', 'cityId', 'provinceId'],
    csvExample: 'id,code,name,cityId,provinceId',
  },
  {
    type: 'street',
    label: '街道/园区',
    group: '行政区划',
    description: '街道和园区数据',
    csvRequiredHeaders: ['id', 'name', 'districtId', 'lng', 'lat'],
    csvExample: 'id,name,districtId,lng,lat',
  },
  {
    type: 'industry',
    label: '一级行业',
    group: '行业与产业',
    description: '产业分类的一级行业',
    csvRequiredHeaders: ['id', 'name', 'color'],
    csvExample: 'id,name,color',
  },
  {
    type: 'sub_industry',
    label: '子行业',
    group: '行业与产业',
    description: '产业分类的子行业',
    csvRequiredHeaders: ['id', 'name', 'industryId', 'color'],
    csvExample: 'id,name,industryId,color',
  },
  {
    type: 'chain',
    label: '产业链',
    group: '行业与产业',
    description: '产业链定义',
    csvRequiredHeaders: ['id', 'name', 'status', 'description', 'color'],
    csvExample: 'id,name,status,description,color',
  },
  {
    type: 'chain_node',
    label: '产业链节点',
    group: '行业与产业',
    description: '产业链的上下游节点',
    csvRequiredHeaders: ['id', 'chainId', 'name', 'stage', 'scale', 'activity'],
    csvExample: 'id,chainId,name,stage,scale,activity',
  },
  {
    type: 'park',
    label: '园区',
    group: '核心实体',
    description: '产业园区数据',
    csvRequiredHeaders: ['id', 'name', 'cityId', 'lng', 'lat', 'risk', 'scale'],
    csvExample: 'id,name,cityId,lng,lat,risk,scale',
  },
  {
    type: 'manager',
    label: '客户经理',
    group: '核心实体',
    description: '客户经理和团队成员',
    csvRequiredHeaders: ['id', 'name', 'role', 'department', 'area'],
    csvExample: 'id,name,role,department,area',
  },
  {
    type: 'firm',
    label: '企业',
    group: '核心实体',
    description: '企业客户基本信息',
    csvRequiredHeaders: ['id', 'name', 'fullName', 'creditCode', 'rating', 'risk', 'scale'],
    csvExample: 'id,name,fullName,creditCode,rating,risk,scale',
  },
  {
    type: 'executive',
    label: '企业高管',
    group: '关系数据',
    description: '企业高管信息',
    csvRequiredHeaders: ['id', 'firmId', 'name', 'title', 'isLegalRep'],
    csvExample: 'id,firmId,name,title,isLegalRep',
  },
  {
    type: 'firm_relation',
    label: '企业关系',
    group: '关系数据',
    description: '企业之间的关系（上下游、同园等）',
    csvRequiredHeaders: ['id', 'sourceFirmId', 'targetFirmId', 'type', 'description'],
    csvExample: 'id,sourceFirmId,targetFirmId,type,description',
  },
  {
    type: 'visit_record',
    label: '拜访记录',
    group: '事件记录',
    description: '客户拜访记录',
    csvRequiredHeaders: ['id', 'targetType', 'targetId', 'managerId', 'visitType', 'visitDate'],
    csvExample: 'id,targetType,targetId,managerId,visitType,visitDate',
  },
  {
    type: 'work_order',
    label: '工单',
    group: '事件记录',
    description: '工单任务',
    csvRequiredHeaders: ['id', 'type', 'title', 'ownerId', 'creatorId', 'deadline', 'status'],
    csvExample: 'id,type,title,ownerId,creatorId,deadline,status',
  },
  {
    type: 'opportunity',
    label: '商机',
    group: '事件记录',
    description: '业务商机信息',
    csvRequiredHeaders: ['id', 'title', 'level', 'firmId', 'amount', 'probability'],
    csvExample: 'id,title,level,firmId,amount,probability',
  },
  {
    type: 'plan',
    label: '投放计划',
    group: '事件记录',
    description: '设备投放计划',
    csvRequiredHeaders: ['id', 'title', 'product', 'firmId', 'targetAmount', 'ownerId', 'status'],
    csvExample: 'id,title,product,firmId,targetAmount,ownerId,status',
  },
  {
    type: 'admin_data',
    label: '行政区指标',
    group: '指标数据',
    description: '各省份宏观经济指标',
    csvRequiredHeaders: ['metric', 'province', 'value'],
    csvExample: 'metric,province,value',
  },
  {
    type: 'supplement_record',
    label: '补录记录',
    group: '事件记录',
    description: '数据补录变更记录',
    csvRequiredHeaders: ['id', 'type', 'targetId', 'fieldName', 'oldValue', 'newValue', 'managerId'],
    csvExample: 'id,type,targetId,fieldName,oldValue,newValue,managerId',
  },
];

export type SupplementType = '新增' | '更新' | '删除';

export interface SupplementRecord {
  id: string;
  type: SupplementType;
  objectType: DataObjectType;
  targetId: string;
  targetName: string;
  changes: { field: string; oldValue: string; newValue: string }[];
  managerId: ManagerId;
  managerName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  approverId?: ManagerId;
}

export interface DataSourceInfo {
  type: 'mock' | 'imported';
  filename?: string;
  count: number;
  lastImportAt?: string;
}

export interface DataImportLog {
  id: string;
  objectType: DataObjectType;
  filename: string;
  count: number;
  importedAt: string;
  managerId?: ManagerId;
}

export interface DataIndex {
  provinceIdToName: Record<string, string>;
  provinceIdToCode: Record<string, string>;
  provinceCodeToId: Record<string, string>;
  cityIdToName: Record<string, string>;
  cityIdToProvinceId: Record<string, string>;
  districtIdToName: Record<string, string>;
  districtIdToCityId: Record<string, string>;
  parkIdToName: Record<string, string>;
  parkIdToCityId: Record<string, string>;
  firmIdToName: Record<string, string>;
  firmIdToParkIds: Record<string, string[]>;
  firmIdToManagerId: Record<string, string>;
  managerIdToName: Record<string, string>;
  chainIdToName: Record<string, string>;
  chainNodeIdToName: Record<string, string>;
  chainNodeIdToChainId: Record<string, string>;
  industryIdToName: Record<string, string>;
  parkIdToFirmIds: Record<string, string[]>;
  chainIdToNodeIds: Record<string, string[]>;
  firmIdToChainNodeIds: Record<string, string[]>;
}

export type RiskAlertType = 'overdue' | 'iot_offline' | 'mortgage_warning' | 'credit_drop';
export type RiskAlertLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAlert {
  id: string;
  firmId: FirmId;
  firmName: string;
  parkId: ParkId;
  type: RiskAlertType;
  level: RiskAlertLevel;
  title: string;
  desc: string;
  overdueDays?: number;
  iotStatus?: 'online' | 'offline';
  mortgageCount?: number;
  creditScore?: number;
  creditScoreChange?: number;
  createdAt: string;
  acknowledged: boolean;
}

export type TrailPoint = {
  lng: number;
  lat: number;
  timestamp: string;
  location: string;
  verified: boolean;
};

export interface VisitTrail {
  managerId: ManagerId;
  date: string;
  points: TrailPoint[];
  totalDistance?: number;
  firmsVisited: FirmId[];
}

export type PenetrationDimension = 'park' | 'chain' | 'industry';

export interface PenetrationData {
  dimension: PenetrationDimension;
  targetId: string;
  targetName: string;
  totalFirms: number;
  signedFirms: number;
  penetrationRate: number;
  targetRate: number;
  status: 'below' | 'meeting' | 'exceeding';
}

export type BusinessViewMode = 'industry' | 'region';

export interface IRRCalculation {
  principal: number;
  term: number;
  rate: number;
  depositRate: number;
  deposit: number;
  paymentType: 'equal_principal' | 'equal_payment';
  schedule: {
    period: number;
    payment: number;
    principal: number;
    interest: number;
    deposit: number;
    balance: number;
  }[];
  irr: number;
  npv: number;
}
