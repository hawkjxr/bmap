import type {
  Metric, AdminData, ParkInfo, ParkManager,
  FinancingStructure,
  TeamMember, WorkOrder,
  CustomerSearchItem, DataField,
} from './types';

// ─── 通用工具 ───

export function parseJSON<T>(text: string): T {
  return JSON.parse(text) as T;
}

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

// ─── 数据类别解析器 ───

const METRICS: Metric[] = ['投放', '融资租赁', '企业贷款', '全量融资', '活力指数', '开工率', '金租渗透率', '用电增速', '设备投放', '客户数', '不良率'];

/**
 * 行政区指标 CSV 格式:
 * 省份,投放,融资租赁,企业贷款,全量融资,活力指数,开工率,金租渗透率,用电增速,设备投放,客户数,不良率
 */
export function parseAdminDataCSV(text: string): AdminData {
  const rows = csvToObjects(text);
  const result: AdminData = {} as AdminData;
  METRICS.forEach(m => { result[m] = {}; });
  rows.forEach(row => {
    const province = row['省份'] || row['province'];
    if (!province) return;
    METRICS.forEach(m => {
      const val = row[m] || row[m.toLowerCase()];
      if (val !== undefined) result[m][province] = num(val);
    });
  });
  return result;
}

/**
 * 园区数据 CSV 格式（新版）:
 * id,名称,经度,纬度,风险,标签,产业链IDs(逗号分隔),企业IDs(逗号分隔),客户经理(JSON)
 */
export function parseParkDataCSV(text: string): ParkInfo[] {
  const rows = csvToObjects(text);
  return rows.map(row => {
    const data: Record<Metric, number> = {} as Record<Metric, number>;
    METRICS.forEach(m => { data[m] = num(row[m] || '0'); });
    let managers: ParkManager[] = [];
    try { managers = JSON.parse(row['客户经理'] || row['managers'] || '[]'); } catch { /* empty */ }
    const chainIds = (row['产业链IDs'] || row['chainIds'] || '').split(',').filter(Boolean);
    const firmIds = (row['企业IDs'] || row['firmIds'] || '').split(',').filter(Boolean);
    return {
      id: row['id'] || row['ID'] || row['名称'] || '',
      name: row['名称'] || row['name'] || '',
      lng: num(row['经度'] || row['lng'] || '0'),
      lat: num(row['纬度'] || row['lat'] || '0'),
      risk: (row['风险'] || row['risk'] || 'low') as ParkInfo['risk'],
      label: row['标签'] || row['label'] || '',
      chainIds,
      firmIds,
      data,
      managers,
    };
  });
}

/**
 * 团队成员 CSV（新版）:
 * id,姓名,角色,部门,区域,在手任务数,上级领导ID,邮箱
 */
export function parseTeamMembersCSV(text: string): TeamMember[] {
  return csvToObjects(text).map(row => ({
    id: row['id'] || row['ID'] || row['姓名'] || '',
    name: row['姓名'] || row['name'] || '',
    role: row['角色'] || row['role'] || '',
    department: row['部门'] || row['department'] || '',
    area: row['区域'] || row['area'] || '',
    load: num(row['在手任务数'] || row['load'] || '0'),
    leaderId: row['上级领导ID'] || row['leaderId'] || '',
    email: row['邮箱'] || row['email'] || '',
  }));
}

/**
 * 工单 CSV（新版）:
 * 编号,类型(red/yellow/green),企业ID,客户,标题,描述,执行人ID,创建人,期限,状态,LBS(true/false)
 */
export function parseWorkOrdersCSV(text: string): WorkOrder[] {
  return csvToObjects(text).map(row => ({
    id: row['编号'] || row['id'] || '',
    type: (row['类型'] || row['type'] || 'green') as WorkOrder['type'],
    firmId: row['企业ID'] || row['firmId'] || '',
    customer: row['客户'] || row['customer'] || '',
    title: row['标题'] || row['title'] || '',
    desc: row['描述'] || row['desc'] || '',
    owner: row['执行人'] || row['owner'] || row['执行人ID'] || '',
    creator: row['创建人'] || row['creator'] || '',
    deadline: row['期限'] || row['deadline'] || '',
    status: row['状态'] || row['status'] || '',
    lbs: (row['LBS'] || row['lbs'] || 'false') === 'true',
  }));
}

/**
 * 商机 CSV（新版）:
 * 编号,等级(high/medium/low),标题,来源,描述,行动,金额,IRR,客户经理ID,企业ID,日期,评分
 */
export function parseOpportunitiesCSV(text: string): import('../data/types').Opportunity[] {
  return csvToObjects(text).map(row => ({
    id: row['编号'] || row['id'] || `opp_${Date.now()}`,
    level: (row['等级'] || row['level'] || 'medium') as import('../data/types').Opportunity['level'],
    title: row['标题'] || row['title'] || '',
    source: (row['来源'] || row['source'] || '数据补录') as import('../data/types').OpportunitySource,
    desc: row['描述'] || row['desc'] || '',
    action: row['行动'] || row['action'] || '',
    amount: row['金额'] || row['amount'] || '',
    irr: row['IRR'] || '-',
    managerId: row['客户经理ID'] || row['managerId'] || '',
    firmId: row['企业ID'] || row['firmId'] || '',
    date: row['日期'] || row['date'] || '',
    score: num(row['评分'] || row['score'] || '0'),
  }));
}

/**
 * 客户检索 CSV:
 * 名称,所属园区,行业,信用评级,评级颜色,我司投放,全量融资,活力指数,风险状态,风险颜色,管户经理
 */
export function parseCustomerSearchCSV(text: string): CustomerSearchItem[] {
  return csvToObjects(text).map(row => ({
    id: row['编号'] || row['id'] || `cust_${Date.now()}`,
    name: row['名称'] || row['name'] || '',
    park: row['所属园区'] || row['park'] || '',
    industry: row['行业'] || row['industry'] || '',
    rating: row['信用评级'] || row['rating'] || '',
    ratingColor: row['评级颜色'] || row['ratingColor'] || '#00E676',
    invest: row['我司投放'] || row['invest'] || '',
    total: row['全量融资'] || row['total'] || '',
    vi: num(row['活力指数'] || row['vi'] || '0'),
    risk: row['风险状态'] || row['risk'] || '',
    riskColor: row['风险颜色'] || row['riskColor'] || '#00E676',
    manager: row['管户经理'] || row['manager'] || '',
  }));
}

/**
 * 数据字段 CSV:
 * 字段KEY,业务名称,格式,数据来源
 */
export function parseDataFieldsCSV(text: string): DataField[] {
  return csvToObjects(text).map(row => ({
    key: row['字段KEY'] || row['key'] || '',
    name: row['业务名称'] || row['name'] || '',
    type: (row['格式'] || row['type'] || 'string') as 'string' | 'number' | 'boolean' | 'date' | 'select',
    source: row['数据来源'] || row['source'] || '',
  }));
}

/**
 * 融资结构 CSV:
 * 环节,银行占比,金租占比
 */
export function parseFinancingStructureCSV(text: string): FinancingStructure[] {
  return csvToObjects(text).map(row => ({
    env: row['环节'] || row['env'] || '',
    bank: num(row['银行占比'] || row['bank'] || '0'),
    lease: num(row['金租占比'] || row['lease'] || '0'),
  }));
}

// ─── 统一文件解析入口 ───

export type DataCategory =
  | 'metricDefs' | 'adminData' | 'parkData' | 'provinceCenters'
  | 'chainNodeDetails' | 'chainTreeData' | 'chainFinancingData'
  | 'customerProfiles'
  | 'followRecords' | 'teamMembers' | 'workOrders' | 'opportunities'
  | 'customerSearchItems'
  | 'dataFields' | 'businessRules'
  | 'firmData' | 'chainInfoList'
  | 'supplementData' | 'dailyPushData';

export interface ParseResult {
  data: unknown;
  recordCount: number;
}

export function parseFile(category: DataCategory, text: string, fileType: 'json' | 'csv'): ParseResult {
  if (fileType === 'json') {
    const data = parseJSON(text);
    const count = Array.isArray(data) ? data.length : (typeof data === 'object' && data ? Object.keys(data).length : 1);
    return { data, recordCount: count };
  }

  switch (category) {
    case 'adminData': { const d = parseAdminDataCSV(text); return { data: d, recordCount: Object.keys(d['投放'] || {}).length }; }
    case 'parkData': { const d = parseParkDataCSV(text); return { data: d, recordCount: d.length }; }
    case 'teamMembers': { const d = parseTeamMembersCSV(text); return { data: d, recordCount: d.length }; }
    case 'workOrders': { const d = parseWorkOrdersCSV(text); return { data: d, recordCount: d.length }; }
    case 'opportunities': { const d = parseOpportunitiesCSV(text); return { data: d, recordCount: d.length }; }
    case 'customerSearchItems': { const d = parseCustomerSearchCSV(text); return { data: d, recordCount: d.length }; }
    case 'dataFields': { const d = parseDataFieldsCSV(text); return { data: d, recordCount: d.length }; }
    case 'chainFinancingData': { const d = parseFinancingStructureCSV(text); return { data: d, recordCount: d.length }; }
    default:
      throw new Error(`CSV 解析暂不支持「${category}」类别，请使用 JSON 格式导入`);
  }
}

// ─── 模板生成（下载示例 CSV/JSON） ───

export function generateTemplate(category: DataCategory, format: 'json' | 'csv'): string {
  if (format === 'json') {
    const templates: Partial<Record<DataCategory, unknown>> = {
      adminData: { '投放': { '江苏省': 58, '广东省': 48 }, '融资租赁': { '江苏省': 320, '广东省': 285 } },
      parkData: [{ id: 'park_new_001', name: '示例园区', lng: 120.0, lat: 31.0, risk: 'low', label: '示例标签', chainIds: ['chain_001'], firmIds: [], data: { '投放': 10, '融资租赁': 50, '企业贷款': 100, '全量融资': 200, '活力指数': 80, '开工率': 75, '金租渗透率': 10, '用电增速': 8, '设备投放': 5, '客户数': 20, '不良率': 0.3 }, managers: [{ id: 'mgr_new_001', name: '张三', role: '客户经理', department: '营销拓展部', clients: 5, status: '跟进中' }] }],
      teamMembers: [{ id: 'member_new_001', name: '张三', role: '客户经理', department: '营销拓展部', area: '华东', load: 3, leaderId: 'member_leader_001', email: 'zhangsan@company.com' }],
      workOrders: [{ id: 'T-NEW-0001', type: 'green', firmId: 'firm_new_001', customer: '示例企业', title: '拓客工单', desc: '描述', owner: 'member_002', creator: 'system', deadline: '3天内', status: '待拜访', lbs: false }],
      customerSearchItems: [{ id: 'firm_new_001', name: '示例企业', park: '示例园区', industry: '新能源', rating: 'AA', ratingColor: '#00E676', invest: '10亿', total: '100亿', vi: 80, risk: '正常', riskColor: '#00E676', manager: '张三' }],
      dataFields: [{ key: 'sample_field', name: '示例字段', type: '数值', source: '示例API' }],
      businessRules: [{ id: 'R999', name: '示例规则', status: '测试中', trigger: 0, precision: '-', conditions: ['field > 100', 'AND', 'flag = true'], action: '生成工单' }],
      chainFinancingData: [{ env: '示例环节', bank: 80, lease: 20 }],
      metricDefs: [{ key: '投放', label: '我司投放', unit: '亿', color: '#22D3EE', kpi: '386.5 亿' }],
      customerProfiles: [{ id: 'firm_new_001', name: '示例企业', fullName: '示例企业全称', creditCode: '91XXXXXX', rating: 'AA+', creditBalance: '0 万' }],
      followRecords: { 'firm_new_001': [{ date: '2026-01-01 09:00', user: '张三', type: '电话跟进', content: '示例记录' }] },
      opportunities: [{ id: 'opp_new_001', level: 'high', title: '示例商机', source: '示例来源', desc: '描述', action: '方案', amount: '1000万', irr: '6%', managerId: 'member_002', firmId: 'firm_new_001', date: '2026-01-01', score: 90 }],
      chainNodeDetails: { 'node_new_001': { id: 'node_new_001', chainId: 'chain_001', name: '示例节点', scale: 100, activity: 80, bankRatio: 85, leaseRatio: 15, firms: [] } },
      chainTreeData: { name: '根节点', value: 0, activity: 0, cat: '核心', children: [{ name: '子节点', value: 100, activity: 80, cat: '上游' }] },
      provinceCenters: { '江苏省': [119.5, 32.5], '广东省': [113.5, 23.5] },
      firmData: [{ id: 'firm_new_001', name: '示例企业', fullName: '示例企业全称', creditCode: '91XXXXXX', parkIds: ['park_new_001'], addresses: [{ parkId: 'park_new_001', address: '示例地址' }], industry: '新能源', rating: 'AA', asset: '10亿', managerId: 'member_002', creatorId: 'member_002', status: 'normal', createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
      chainInfoList: [{ id: 'chain_new_001', name: '示例产业链', status: 'active' }],
      supplementData: [{ id: 'sup_new_001', firmId: 'firm_new_001', firmName: '示例企业', creatorId: 'member_002', creatorName: '李明', type: 'create', changes: [], summary: '新增示例企业', status: 'approved', createdAt: '2026-01-01' }],
      dailyPushData: [{ id: 'push_new_001', date: '2026-01-01', recipientType: 'creator', recipientId: 'member_002', pushTo: '李明', summary: { firmCount: 1, creatorName: '李明', teamTotal: 1, systemTotal: 1, changes: ['新增示例企业'] }, status: 'sent', sentAt: '2026-01-02 09:00' }],
    };
    return JSON.stringify(templates[category] || {}, null, 2);
  }

  const csvTemplates = {
    adminData: '省份,投放,融资租赁,企业贷款,全量融资,活力指数,开工率,金租渗透率,用电增速,设备投放,客户数,不良率\n江苏省,58,320,820,1420,92,87,6,12.6,48.2,486,0.32',
    parkData: 'id,名称,经度,纬度,风险,标签,产业链IDs(逗号分隔),企业IDs(逗号分隔),投放,融资租赁,企业贷款,全量融资,活力指数,开工率,金租渗透率,用电增速,设备投放,客户数,不良率,客户经理\npark_new_001,示例园区,120.0,31.0,low,示例标签,chain_001,,10,50,100,200,80,75,10,8,5,20,0.3,"[{""id"":""mgr_new_001"",""name"":""张三"",""role"":""客户经理"",""department"":""营销拓展部"",""clients"":5,""status"":""跟进中""}]"',
    teamMembers: 'id,姓名,角色,部门,区域,在手任务数,上级领导ID,邮箱\nmember_new_001,张三,客户经理,营销拓展部,华东,3,member_leader_001,zhangsan@company.com',
    workOrders: '编号,类型,企业ID,客户,标题,描述,执行人,创建人,期限,状态,LBS\nT-NEW-0001,green,firm_new_001,示例企业,拓客工单,描述,system,member_002,3天内,待拜访,false',
    customerSearchItems: 'id,名称,所属园区,行业,信用评级,评级颜色,我司投放,全量融资,活力指数,风险状态,风险颜色,管户经理\nfirm_new_001,示例企业,示例园区,新能源,AA,#00E676,10亿,100亿,80,正常,#00E676,张三',
    dataFields: '字段KEY,业务名称,格式,数据来源\nsample_field,示例字段,string,示例API',
    chainFinancingData: '环节,银行占比,金租占比\n示例环节,80,20',
    // 新版数据
    firmData: 'id,企业简称,企业全称,信用代码,归属园区IDs(逗号分隔),行业,信用评级,资产规模,管户客户经理ID,创建人ID,状态\nfirm_new_001,示例企业,示例企业全称,91XXXXXX,park_new_001,新能源,AA,10亿,member_002,member_002,normal',
    chainInfoList: 'id,产业链名称,状态\nchain_new_001,示例产业链,active',
    supplementData: 'id,企业ID,企业名称,补录人ID,补录人姓名,类型(create/update/delete),变更摘要,状态,创建时间\nsup_new_001,firm_new_001,示例企业,member_002,李明,create,新增示例企业,approved,2026-01-01',
    dailyPushData: 'id,日期,推送对象类型,推送对象ID,推送对象名称,企业数,团队总数,全系统总数,变更摘要,状态,发送时间\npush_new_001,2026-01-01,creator,member_002,李明,1,1,1,新增示例企业,sent,2026-01-02 09:00',
  };
  return (csvTemplates as Record<string, string>)[category] || '该类别仅支持 JSON 格式导入';
}

export function downloadTemplate(category: DataCategory, format: 'json' | 'csv') {
  const content = generateTemplate(category, format);
  const blob = new Blob(['\ufeff' + content], { type: format === 'json' ? 'application/json' : 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${category}_template.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── 导出当前数据 ───

export function exportCurrentData(category: DataCategory, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${category}_export_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
