import type { DataObjectType, DataImportLog } from './types';
import { exportToJson, exportToCsv } from './importer';

export function exportData(
  data: unknown,
  objectType: DataObjectType,
  format: 'json' | 'csv'
): void {
  if (format === 'json') {
    const filename = `${objectType}_export_${Date.now()}.json`;
    exportToJson(data, filename);
  } else {
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0] as Record<string, unknown>;
      const headers = Object.keys(first);
      const rows = (data as Record<string, unknown>[]).map(item =>
        headers.map(h => {
          const v = item[h];
          if (v === null || v === undefined) return '';
          if (typeof v === 'object') return JSON.stringify(v);
          return String(v);
        })
      );
      const filename = `${objectType}_export_${Date.now()}.csv`;
      exportToCsv(headers, rows, filename);
    }
  }
}

export function exportTemplate(
  objectType: DataObjectType,
  format: 'json' | 'csv'
): void {
  if (format === 'json') {
    const templateMap: Record<DataObjectType, unknown> = {
      province: [{ id: 'example_prov', code: '999999', name: '示例省份', lng: 120.0, lat: 30.0 }],
      city: [{ id: 'example_city', code: '999999', name: '示例城市', provinceId: 'example_prov', lng: 120.0, lat: 30.0 }],
      district: [{ id: 'example_dist', code: '999999', name: '示例区县', cityId: 'example_city', provinceId: 'example_prov' }],
      street: [{ id: 'example_street', name: '示例街道', districtId: 'example_dist', lng: 120.0, lat: 30.0 }],
      industry: [{ id: 'ind_example', name: '示例行业', color: '#3B82F6' }],
      sub_industry: [{ id: 'sub_example', name: '示例子行业', industryId: 'ind_example', color: '#3B82F6' }],
      chain: [{ id: 'chain_example', name: '示例产业链', status: 'active', description: '示例描述', color: '#10B981' }],
      chain_node: [{ id: 'node_example', chainId: 'chain_example', name: '示例节点', stage: 'upstream', scale: '亿级', activity: 80 }],
      park: [{ id: 'park_example', name: '示例园区', cityId: 'example_city', lng: 120.0, lat: 30.0, risk: 'low', scale: '省级园区' }],
      manager: [{ id: 'mgr_example', name: '示例经理', role: '客户经理', department: '示例部门', area: '华东' }],
      firm: [{ id: 'firm_example', name: '示例企业', fullName: '示例企业有限公司', creditCode: '91110000000000000X', rating: 'AA', risk: 'normal', scale: '中型' }],
      executive: [{ id: 'exec_example', firmId: 'firm_example', name: '张三', title: '总经理', isLegalRep: true }],
      firm_relation: [{ id: 'rel_example', sourceFirmId: 'firm01', targetFirmId: 'firm02', type: 'upstream', description: '上下游关系' }],
      visit_record: [{ id: 'visit_example', targetType: 'firm', targetId: 'firm01', managerId: 'mgr001', visitType: '常规拜访', visitDate: '2026-04-01', location: '示例地点' }],
      work_order: [{ id: 'WO-2026-9999', type: '拓客', title: '示例工单', ownerId: 'mgr001', creatorId: 'mgr001', deadline: '2026-12-31', status: '待闭环' }],
      opportunity: [{ id: 'OPP-2026-9999', title: '示例商机', level: 'medium', firmId: 'firm01', amount: '1000万', probability: 50 }],
      plan: [{ id: 'plan_example', title: '示例计划', product: '直接租赁', firmId: 'firm01', targetAmount: '5000万', ownerId: 'mgr001', status: 'draft' }],
      admin_data: [{ metric: '示例指标', province: '江苏省', value: 100 }],
      supplement_record: [{ id: 'supp_example', type: '更新', objectType: 'firm', targetId: 'firm01', fieldName: 'risk', oldValue: 'normal', newValue: 'warning' }],
    };
    const data = templateMap[objectType] || [];
    const filename = `${objectType}_template.json`;
    exportToJson(data, filename);
  } else {
    const headerMap: Record<DataObjectType, string[]> = {
      province: ['id', 'code', 'name', 'lng', 'lat'],
      city: ['id', 'code', 'name', 'provinceId', 'lng', 'lat'],
      district: ['id', 'code', 'name', 'cityId', 'provinceId'],
      street: ['id', 'name', 'districtId', 'lng', 'lat'],
      industry: ['id', 'name', 'color'],
      sub_industry: ['id', 'name', 'industryId', 'color'],
      chain: ['id', 'name', 'status', 'description', 'color'],
      chain_node: ['id', 'chainId', 'name', 'stage', 'scale', 'activity'],
      park: ['id', 'name', 'cityId', 'lng', 'lat', 'risk', 'scale'],
      manager: ['id', 'name', 'role', 'department', 'area', 'phone', 'email'],
      firm: ['id', 'name', 'fullName', 'creditCode', 'rating', 'risk', 'scale'],
      executive: ['id', 'firmId', 'name', 'title', 'isLegalRep'],
      firm_relation: ['id', 'sourceFirmId', 'targetFirmId', 'type', 'description'],
      visit_record: ['id', 'targetType', 'targetId', 'managerId', 'visitType', 'visitDate', 'location'],
      work_order: ['id', 'type', 'title', 'ownerId', 'creatorId', 'deadline', 'status'],
      opportunity: ['id', 'title', 'level', 'source', 'firmId', 'amount', 'probability', 'status'],
      plan: ['id', 'title', 'product', 'firmId', 'targetAmount', 'ownerId', 'status'],
      admin_data: ['metric', 'province', 'value'],
      supplement_record: ['id', 'type', 'objectType', 'targetId', 'fieldName', 'oldValue', 'newValue', 'managerId'],
    };
    const headers = headerMap[objectType] || ['id', 'name'];
    const filename = `${objectType}_template.csv`;
    exportToCsv(headers, [], filename);
  }
}

export function exportAllData(allData: Record<DataObjectType, unknown>): void {
  exportToJson(allData, `battlemap_all_data_${Date.now()}.json`);
}
