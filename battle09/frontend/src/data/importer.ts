import type { DataObjectType, DataImportLog } from './types';

interface ImportResult {
  success: boolean;
  count: number;
  message: string;
}

function parseCsvRows(text: string): string[][] {
  return text.trim().split('\n').map(line => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    return cells;
  });
}

const headerAliasMap: Record<string, string[]> = {
  id: ['id', 'ID', 'Uuid', 'uuid', '编号', '工单号', '企业ID', '园区ID', '经理ID'],
  code: ['code', 'Code', 'CODE', '编码', '行政编码'],
  name: ['name', 'Name', 'NAME', '名称', '企业名称', '园区名称', '省份名称', '城市名称'],
  fullName: ['fullName', 'full_name', 'fullname', '全称', '企业全称'],
  creditCode: ['creditCode', 'credit_code', 'creditcode', '统一社会信用代码', '信用代码'],
  lng: ['lng', 'Lng', 'LNG', 'lon', 'longitude', '经度'],
  lat: ['lat', 'Lat', 'LAT', 'latitude', '纬度'],
  provinceId: ['provinceId', 'province_id', 'provinceid', '省份ID', '省份编号'],
  cityId: ['cityId', 'city_id', 'cityid', '城市ID', '城市编号'],
  districtId: ['districtId', 'district_id', 'districtid', '区县ID', '区县编号'],
  chainId: ['chainId', 'chain_id', 'chainid', '产业链ID'],
  risk: ['risk', 'Risk', 'RISK', '风险等级', '风险'],
  scale: ['scale', 'Scale', 'SCALE', '规模', '园区级别'],
  stage: ['stage', 'Stage', 'STAGE', '环节', '阶段'],
  activity: ['activity', 'Activity', 'ACTIVITY', '活跃度', '活力指数'],
  bankRatio: ['bankRatio', 'bank_ratio', 'bankratio', '银行贷款比例'],
  leaseRatio: ['leaseRatio', 'lease_ratio', 'leaseratio', '租赁比例'],
  rating: ['rating', 'Rating', 'RATING', '信用评级', '评级'],
  asset: ['asset', 'Asset', 'ASSET', '资产'],
  revenue: ['revenue', 'Revenue', 'REVENUE', '营收', '收入'],
  level: ['level', 'Level', 'LEVEL', '等级', '优先级'],
  type: ['type', 'Type', 'TYPE', '类型', '工单类型', '拜访类型'],
  title: ['title', 'Title', 'TITLE', '标题', '工单标题'],
  desc: ['desc', 'Desc', 'DESC', 'description', '描述', '说明'],
  firmId: ['firmId', 'firm_id', 'firmid', '企业ID', '客户ID'],
  firmName: ['firmName', 'firm_name', 'firmname', '企业名称', '客户名称'],
  parkId: ['parkId', 'park_id', 'parkid', '园区ID'],
  parkName: ['parkName', 'park_name', 'parkname', '园区名称'],
  ownerId: ['ownerId', 'owner_id', 'ownerid', '执行人ID', '负责人ID'],
  ownerName: ['ownerName', 'owner_name', 'ownername', '执行人', '负责人'],
  creatorId: ['creatorId', 'creator_id', 'creatorid', '创建人ID'],
  creatorName: ['creatorName', 'creator_name', 'creatorname', '创建人'],
  deadline: ['deadline', 'Deadline', 'DEADLINE', '期限', '截止日期'],
  status: ['status', 'Status', 'STATUS', '状态'],
  product: ['product', 'Product', 'PRODUCT', '产品', '产品类型'],
  amount: ['amount', 'Amount', 'AMOUNT', '金额', '规模'],
  irr: ['irr', 'IRR', 'irr'],
  term: ['term', 'Term', 'TERM', '期限', '租期'],
  probability: ['probability', 'Probability', 'PROBABILITY', '概率', '成交概率'],
  action: ['action', 'Action', 'ACTION', '行动', '建议'],
  source: ['source', 'Source', 'SOURCE', '来源'],
  color: ['color', 'Color', 'COLOR', '颜色'],
  industryId: ['industryId', 'industry_id', 'industryid', '行业ID'],
  phone: ['phone', 'Phone', 'PHONE', '电话', '手机'],
  email: ['email', 'Email', 'EMAIL', '邮箱'],
  isLegalRep: ['isLegalRep', 'is_legal_rep', 'islegalrep', '是否法人代表', '是否法人'],
  targetFirmId: ['targetFirmId', 'target_firm_id', 'targetfirmid', '目标企业ID'],
  sourceFirmId: ['sourceFirmId', 'source_firm_id', 'sourcefirmid', '源企业ID'],
  targetType: ['targetType', 'target_type', 'targettype', '目标类型'],
  targetId: ['targetId', 'target_id', 'targetid', '目标ID'],
  managerId: ['managerId', 'manager_id', 'managerid', '经理ID', '客户经理ID'],
  visitType: ['visitType', 'visit_type', 'visittype', '拜访类型'],
  visitDate: ['visitDate', 'visit_date', 'visitdate', '拜访日期', '拜访时间'],
  location: ['location', 'Location', 'LOCATION', '地点', '拜访地点'],
  summary: ['summary', 'Summary', 'SUMMARY', '摘要', '总结'],
  nextStep: ['nextStep', 'next_step', 'nextstep', '下一步', '后续计划'],
  subject: ['subject', 'Subject', 'SUBJECT', '主题', '拜访主题'],
  lbsVerified: ['lbsVerified', 'lbs_verified', 'lbsverified', '打卡验证', 'LBS验证'],
};

function normalizeHeader(header: string): string | null {
  const lower = header.toLowerCase().trim();
  for (const [normalized, aliases] of Object.entries(headerAliasMap)) {
    if (aliases.includes(lower) || lower === normalized) {
      return normalized;
    }
  }
  return header;
}

function parseRowToObject(headers: string[], row: string[], objectType: DataObjectType): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  headers.forEach((h, i) => {
    const normalized = normalizeHeader(h);
    if (normalized && row[i] !== undefined && row[i] !== '') {
      if (normalized === 'isLegalRep' || normalized === 'lbsVerified') {
        obj[normalized] = ['true', '1', '是', 'yes'].includes(row[i].toLowerCase());
      } else if (normalized === 'activity' || normalized === 'bankRatio' || normalized === 'leaseRatio' ||
                 normalized === 'probability' || normalized === 'nplRatio' || normalized === 'creditScore') {
        obj[normalized] = parseFloat(row[i]) || 0;
      } else {
        obj[normalized] = row[i];
      }
    }
  });
  return obj;
}

export function parseAdminDataCsv(text: string): Record<string, Record<string, number>> {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return {};
  const headerMap: Record<string, number> = {};
  rows[0].forEach((h, i) => { headerMap[h.toLowerCase().trim()] = i; });
  const result: Record<string, Record<string, number>> = {};
  const metricIdx = headerMap['metric'] ?? headerMap['指标'];
  const provinceIdx = headerMap['province'] ?? headerMap['省份'];
  const valueIdx = headerMap['value'] ?? headerMap['数值'];
  if (metricIdx === undefined || provinceIdx === undefined || valueIdx === undefined) return {};
  for (let i = 1; i < rows.length; i++) {
    const metric = rows[i][metricIdx];
    const province = rows[i][provinceIdx];
    const value = parseFloat(rows[i][valueIdx]) || 0;
    if (!result[metric]) result[metric] = {};
    result[metric][province] = value;
  }
  return result;
}

export function parseJsonData<T>(text: string): T[] {
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}

export function parseCsvData<T extends Record<string, unknown>>(text: string, objectType: DataObjectType): T[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return [];
  const headers = rows[0];
  const result: T[] = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length === 0 || rows[i].every(c => c.trim() === '')) continue;
    const obj = parseRowToObject(headers, rows[i], objectType) as T;
    if (obj.id || obj.name || objectType === 'admin_data') {
      result.push(obj);
    }
  }
  return result;
}

export function generateImportId(): string {
  return `imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export function importData(
  objectType: DataObjectType,
  text: string,
  fileType: 'json' | 'csv',
  filename: string,
  callback: (data: unknown, log: DataImportLog) => void
): ImportResult {
  try {
    let data: unknown[];
    if (fileType === 'json') {
      data = parseJsonData(text);
    } else if (fileType === 'csv') {
      if (objectType === 'admin_data') {
        const parsed = parseAdminDataCsv(text);
        data = Object.entries(parsed).flatMap(([metric, provinces]) =>
          Object.entries(provinces).map(([province, value]) => ({
            metric,
            province,
            value,
          }))
        );
      } else {
        data = parseCsvData(text, objectType);
      }
    } else {
      return { success: false, count: 0, message: '不支持的文件格式' };
    }
    if (!data || data.length === 0) {
      return { success: false, count: 0, message: '未能解析到有效数据' };
    }
    const log: DataImportLog = {
      id: generateImportId(),
      objectType,
      filename,
      count: data.length,
      importedAt: new Date().toISOString(),
    };
    callback(data, log);
    return { success: true, count: data.length, message: `成功导入 ${data.length} 条数据` };
  } catch (err) {
    return { success: false, count: 0, message: `导入失败: ${err instanceof Error ? err.message : '未知错误'}` };
  }
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
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

export function exportToJson(data: unknown, filename: string): void {
  downloadBlob(JSON.stringify(data, null, 2), filename, 'application/json');
}

export function exportToCsv(headers: string[], rows: (string | number)[][], filename: string): void {
  const lines = [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
  ];
  downloadBlob(lines.join('\n'), filename, 'text/csv;charset=utf-8');
}
