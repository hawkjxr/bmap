import os
path = r'c:\Users\workh\Documents\battlemap03\frontend\src\data\types.ts'
content = '''// 统一数据类型定义（v2.0 - 全量对象数据模型）
// 核心理念：按对象类型统一导入导出，通过 ID 关联实现全系统数据联动

// 一、基础行政区划

export interface Province {
  id: string;
  code: string;
  name: string;
  lng: number;
  lat: number;
}

export interface City {
  id: string;
  code: string;
  name: string;
  provinceId: string;
  lng: number;
  lat: number;
}

export interface District {
  id: string;
  code: string;
  name: string;
  cityId: string;
  provinceId: string;
}

export interface Street {
  id: string;
  name: string;
  districtId: string;
  cityId: string;
  provinceId: string;
  lng: number;
  lat: number;
}

// 二、行业与产业链

export interface Industry {
  id: string;
  name: string;
  color: string;
  subIndustries: string[];
}

export interface SubIndustry {
  id: string;
  name: string;
  industryId: string;
  color: string;
}

export interface IndustryChain {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'dormant';
  description: string;
  color: string;
}

export interface ChainNode {
  id: string;
  chainId: string;
  name: string;
  stage: 'upstream' | 'midstream' | 'downstream' | 'terminal';
  scale: number;
  activity: number;
  bankRatio: number;
  leaseRatio: number;
  description: string;
}

// 三、园区

export type ParkRisk = 'low' | 'medium' | 'high';

export interface Park {
  id: string;
  name: string;
  cityId: string;
  districtId: string;
  streetId: string;
  lng: number;
  lat: number;
  risk: ParkRisk;
  scale: string;
  industries: string[];
  chainIds: string[];
  data: Record<MetricKey, number>;
  firmIds: string[];
  status: 'active' | 'inactive';
  establishedYear: string;
  label?: string;
  managers?: ParkManager[];
}

// 园区指标 Key
export type MetricKey =
  | '投放' | '融资租赁' | '企业贷款' | '全量融资'
  | '活力指数' | '开工率' | '金租渗透率' | '用电增速'
  | '设备投放' | '客户数' | '不良率'
  | '在园企业数' | '当年新注册' | '高新技术占比';

// 行政区指标数据
export type AdminData = Record<MetricKey, Record<string, number>>;

// 四、客户经理

export type ManagerRole = '客户经理' | '团队负责人' | '部门负责人' | '协同经理' | '实习生';
export type ManagerDepartment = '营销拓展部' | '风险管理部' | '资产管理部' | '综合管理部' | '公司管理层';
export type ManagerArea = '华东' | '华南' | '华北' | '华中' | '西南' | '西北' | '东北';

export interface Manager {
  id: string;
  name: string;
  surname: string;
  role: ManagerRole;
  department: ManagerDepartment;
  area: ManagerArea;
  phone: string;
  email: string;
  leaderId: string;
  workOrderCount: number;
  opportunityCount: number;
  visitCount: number;
  status: 'active' | 'leave' | 'onboarding';
  joinedAt: string;
  avatar?: string;
}

// 五、企业

export type FirmStatus = 'normal' | 'warning' | 'danger' | 'inactive';
export type FirmScale = '微型' | '小型' | '中型' | '大型' | '龙头';
export type CreditRating =
  | 'AAA' | 'AA+' | 'AA' | 'AA-' | 'A+' | 'A' | 'A-'
  | 'BBB+' | 'BBB' | 'BBB-' | 'BB+' | 'BB' | 'BB-' | 'B+' | 'B' | 'B-'
  | 'CCC' | 'CC' | 'C' | 'D';

export interface FirmLocation {
  parkId: string;
  streetId?: string;
  districtId?: string;
  cityId?: string;
  address: string;
  isPrimary: boolean;
}

export interface Firm {
  id: string;
  name: string;
  fullName: string;
  creditCode: string;
  parkIds: string[];
  locationIds: string[];
  industryIds: string[];
  subIndustryIds: string[];
  chainNodeIds: string[];
  rating: CreditRating;
  risk: FirmStatus;
  scale: FirmScale;
  asset: string;
  revenue: string;
  establishedYear: string;
  website?: string;
  phone?: string;
  primaryManagerId: string;
  coManagerIds: string[];
  managerId?: string;
  industry?: string;
  addresses?: Array<{ parkId: string; address: string }>;
  creatorId: string;
  status: FirmStatus;
  createdAt: string;
  updatedAt: string;
  indicators: FirmIndicator;
}

export interface FirmIndicator {
  bankLoan: number;
  leaseLoan: number;
  bond: number;
  otherDebt: number;
  totalDebt: number;
  powerUsageKwh: number;
  powerGrowthRate: number;
  operatingRate: number;
  aiTokenMonthly: number;
  annualRevenue: number;
  annualProfit: number;
  creditBalance: number;
  usedCredit: number;
}

export interface FirmProfile {
  id?: string;
  name?: string;
  fullName?: string;
  creditCode?: string;
  rating?: string;
  creditBalance?: string;
  manager?: { name: string; surname: string; role: string; phone: string; email: string };
  recommendation?: string;
  firm?: Firm;
  parks?: Park[];
  industries?: Industry[];
  chainNodes?: ChainNode[];
  primaryManager?: Manager;
  coManagers?: Manager[];
  executives?: Executive[];
  radarIndicators?: string[];
  radarData?: { enterprise: number[]; parkAvg: number[]; cityAvg?: number[]; nationalAvg: number[] };
  digitalMetrics?: DigitalMetric[];
  digitalInsight?: string;
  debtSunburst?: DebtNode[];
  debtTable?: [string, string, string, string?][];
  riskNotes?: RiskNote[];
  plan?: RecommendedPlan;
  visitRecords?: VisitRecord[];
  upstreamFirms?: FirmRelation[];
  downstreamFirms?: FirmRelation[];
}

export interface DigitalMetric {
  label: string;
  value: string;
  trend?: string;
  trendValue?: string;
  color: string;
  bar: number;
  benchmark?: string;
}

export interface RiskNote {
  title: string;
  content: string;
  severity?: 'danger' | 'warning' | 'info';
  type?: 'danger' | 'info';
}

export interface RecommendedPlan {
  name: string;
  amount: string;
  term: string;
  subject: string;
  irr: string;
  product?: string;
  reason?: string;
}

export interface DebtNode {
  name: string;
  value: number;
  itemStyle?: { color?: string };
  children?: DebtNode[];
  label?: { color?: string };
}

// 六、关系数据

export interface Executive {
  id: string;
  firmId: string;
  name: string;
  title: string;
  phone?: string;
  email?: string;
  isLegalRep: boolean;
}

export type RelationType =
  | 'upstream' | 'downstream' | 'same_park' | 'same_city'
  | 'same_chain' | 'association' | 'investment' | 'guarantee';

export interface FirmRelation {
  id: string;
  sourceFirmId: string;
  targetFirmId: string;
  type: RelationType;
  description: string;
  strength: number;
  since?: string;
}

// 七、拜访记录

export type VisitType = '首次拜访' | '定期回访' | '风险核查' | '商机跟进' | '贷后检查' | '拓客' | '电话沟通' | '线上沟通';

export interface VisitRecord {
  id: string;
  targetType: 'firm' | 'park';
  targetId: string;
  targetName: string;
  managerId: string;
  managerName: string;
  visitType: VisitType;
  visitDate: string;
  visitTime?: string;
  duration?: number;
  location?: string;
  lbsVerified: boolean;
  subject: string;
  summary: string;
  nextStep?: string;
  nextVisitDate?: string;
  tags: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ManagerVisitStats {
  managerId: string;
  totalVisits: number;
  thisMonth: number;
  thisWeek: number;
  firmCoverage: number;
  avgDuration: number;
  lastVisitDate: string;
}

// 八、工单

export type WorkOrderLevel = 'red' | 'yellow' | 'green';
export type WorkOrderStatus = '待领取' | '待现场' | '进行中' | '待拜访' | '待闭环' | '已完成' | '已取消' | string;
export type WorkOrderType = '拓客' | '排雷' | '关注' | '核查' | '贷后' | '商机跟进' | 'red' | 'yellow' | 'green';

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  level?: WorkOrderLevel;
  title?: string;
  desc?: string;
  firmId?: string;
  firmName?: string;
  parkId?: string;
  parkName?: string;
  customer?: string;
  ownerId?: string;
  ownerName?: string;
  creatorId?: string;
  creatorName?: string;
  creator?: string;
  owner?: string;
  deadline?: string;
  status: WorkOrderStatus;
  lbsRequired?: boolean;
  lbsVerified?: boolean;
  lbs?: boolean;
  completedAt?: string;
  relatedVisitId?: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 九、商机

export type OpportunityLevel = 'high' | 'medium' | 'low';
export type OpportunityStatus = '发现' | '跟进中' | '方案沟通' | '尽调中' | '审批中' | '已签约' | '已失效';
export type OpportunitySource = 'IOT监测' | '工商变更' | '拓客' | '转介绍' | '园区推送' | '主动营销' | '数据补录';
export type OpportunityProduct = '直接租赁' | '售后回租' | '经营租赁' | '保理' | '项目贷' | '流贷' | '组合方案';

export interface Opportunity {
  id: string;
  title?: string;
  level?: OpportunityLevel;
  source?: OpportunitySource;
  desc?: string;
  firmId?: string;
  firmName?: string;
  parkId?: string;
  product?: OpportunityProduct;
  amount?: string;
  irr?: string;
  term?: string;
  probability?: number;
  action?: string;
  nextActionDate?: string;
  ownerId?: string;
  ownerName?: string;
  managerId?: string;
  status?: OpportunityStatus;
  date?: string;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  closedReason?: string;
}

// 十、投放计划

export type PlanStatus = '草稿' | '待审批' | '执行中' | '已暂停' | '已完成' | '已终止';
export type PlanProduct = '直接租赁' | '售后回租' | '经营租赁' | '保理' | '流贷' | '项目贷';

export interface DeployPlan {
  id: string;
  title: string;
  product: PlanProduct;
  firmId: string;
  firmName: string;
  parkId?: string;
  targetAmount: number;
  targetDate: string;
  actualAmount: number;
  actualDate?: string;
  status: PlanStatus;
  progress: number;
  milestones: PlanMilestone[];
  opportunityId?: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanMilestone {
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'done' | 'overdue';
  note?: string;
}

export interface ManagerDeploySummary {
  managerId: string;
  managerName: string;
  activePlanCount: number;
  completedPlanCount: number;
  totalTargetAmount: number;
  totalActualAmount: number;
  avgProgress: number;
  overdueCount: number;
}

// 十一、数据补录

export type SupplementTargetType =
  | 'firm' | 'park' | 'manager' | 'chain' | 'chain_node'
  | 'visit_record' | 'work_order' | 'opportunity' | 'plan'
  | 'executive' | 'relation' | 'location';
export type SupplementAction = 'create' | 'update' | 'delete';
export type SupplementType = SupplementAction;

export interface SupplementFieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
export type FieldChange = SupplementFieldChange;

export interface DataSupplement {
  id: string;
  type?: SupplementAction;
  firmId?: string;
  firmName?: string;
  action: SupplementAction;
  targetType: SupplementTargetType;
  targetId: string;
  targetLabel: string;
  changes: FieldChange[];
  summary: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  note?: string;
}

// 十二、每日推送

export type PushRecipientType = 'creator' | 'leader' | 'product_manager';
export type PushStatus = 'pending' | 'sent' | 'read';

export interface PushSummary {
  firmCount: number;
  teamTotal: number;
  systemTotal: number;
  creatorName?: string;
  changes?: string[];
  supplementCount?: number;
  highlights?: string[];
}

export interface DailyPush {
  id: string;
  date: string;
  recipientType: PushRecipientType;
  recipientId: string;
  recipientName?: string;
  summary: PushSummary;
  supplements?: string[];
  status: PushStatus;
  sentAt?: string;
  readAt?: string;
  pushTo?: string;
}

// 十三、规则配置

export interface DataField {
  key: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'select' | 'boolean';
  source: string;
  description?: string;
  required?: boolean;
}

export interface BusinessRule {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'testing' | '已上线';
  trigger: number;
  precision: string;
  conditions: string[];
  action: string;
  description?: string;
}

// 十四、数据索引

export interface DataIndex {
  provinceIdToName: Record<string, string>;
  cityIdToName: Record<string, string>;
  districtIdToName: Record<string, string>;
  streetIdToName: Record<string, string>;
  industryIdToName: Record<string, string>;
  chainIdToName: Record<string, string>;
  chainNodeIdToName: Record<string, string>;
  firmIdToParkIds: Record<string, string[]>;
  firmIdToChainNodeIds: Record<string, string[]>;
  firmIdToIndustryIds: Record<string, string[]>;
  firmIdToManagerId: Record<string, string>;
  firmIdToCoManagerIds: Record<string, string[]>;
  parkIdToFirmIds: Record<string, string[]>;
  parkIdToChainIds: Record<string, string[]>;
  chainIdToNodeIds: Record<string, string[]>;
  chainNodeIdToFirmIds: Record<string, string[]>;
  managerIdToFirmIds: Record<string, string[]>;
  parkIdToNodeIds: Record<string, string[]>;
  firmIdToChainIds: Record<string, string[]>;
  chainIdToFirmIds: Record<string, string[]>;
  firmIdToVisitIds: Record<string, string[]>;
  firmIdToWorkOrderIds: Record<string, string[]>;
  firmIdToOpportunityIds: Record<string, string[]>;
  managerIdToVisitIds: Record<string, string[]>;
  managerIdToWorkOrderIds: Record<string, string[]>;
  managerIdToOpportunityIds: Record<string, string[]>;
  managerIdToPlanIds: Record<string, string[]>;
}

// 十五、AI 机器人

export interface PresetQa {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface RobotConfig {
  id: string;
  name: string;
  avatar: string;
  greeting: string;
  presetQas: PresetQa[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

// 十六、兼容类型（旧版代码依赖）

export type Metric = MetricKey;

export interface MetricDef {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  kpi?: string;
}

export interface ParkManager {
  id: string;
  name: string;
  role: string;
  department: string;
  clients: number;
  status: string;
}

export interface FollowRecord {
  date: string;
  user: string;
  type: string;
  content: string;
  [key: string]: unknown;
}

export interface CustomerSearchItem {
  id: string;
  name: string;
  park: string;
  industry: string;
  rating: string;
  ratingColor: string;
  invest: string;
  total: string;
  vi: number;
  risk: string;
  riskColor: string;
  manager: string;
}

export type CustomerProfile = FirmProfile;

export interface DataCategory {
  key: string;
  label: string;
  description: string;
  count?: number;
}

export interface ChainInfo {
  id: string;
  name: string;
  status: 'active' | 'warning' | 'dormant';
  description?: string;
  color?: string;
}

export interface ChainNodeInfo {
  id: string;
  chainId: string;
  name: string;
  scale: number;
  activity: number;
  bankRatio: number;
  leaseRatio: number;
  firms?: Array<{ firmId: string; role: string; asset: string; manager?: string; name?: string }>;
}

export interface ChainTreeNode {
  name: string;
  value: number;
  activity: number;
  cat: string;
  children?: ChainTreeNode[];
}

export interface FinancingStructure {
  env: string;
  bank: number;
  lease: number;
}

export interface FirmInfo {
  id: string;
  name: string;
  fullName?: string;
  creditCode?: string;
  rating?: string;
  asset?: string;
  revenue?: string;
  industry?: string;
  addresses?: Array<{ parkId: string; address: string }>;
  managerId?: string;
  parkIds?: string[];
  chainNodeIds?: string[];
  primaryManagerId?: string;
  coManagerIds?: string[];
  risk?: string;
  scale?: string;
  indicators?: FirmIndicator;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParkInfo {
  id: string;
  name: string;
  cityId?: string;
  districtId?: string;
  streetId?: string;
  lng: number;
  lat: number;
  risk: ParkRisk;
  scale?: string;
  industries?: string[];
  chainIds: string[];
  data?: Record<MetricKey, number>;
  firmIds: string[];
  managers?: ParkManager[];
  label?: string;
  status?: string;
  establishedYear?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  area?: string;
  load?: number;
  leaderId?: string;
  email?: string;
  phone?: string;
  workOrderCount?: number;
  opportunityCount?: number;
  visitCount?: number;
  status?: string;
  joinedAt?: string;
  avatar?: string;
}
'''
with open(path, 'w', encoding='utf-8-sig') as f:
    f.write(content)
print(f'Written {len(content)} chars to {path}')
