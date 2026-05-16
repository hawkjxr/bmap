// ═══════════════════════════════════════════════════════════════
// 规则配置数据（ruleData.ts）
// ═══════════════════════════════════════════════════════════════

import type { DataField, BusinessRule } from './types';

export const dataFields: DataField[] = [
  { key: 'qcc_pledge_record_cnt', name: '近期动产抵押次数', type: 'number', source: '企查查API' },
  { key: 'iot_active_hours_avg', name: '设备日均开工时长', type: 'number', source: 'IoT网关' },
  { key: 'power_usage_growth', name: '用电量月增速(%)', type: 'number', source: '电力局接口' },
  { key: 'ai_token_monthly', name: 'AI大模型月调用量', type: 'number', source: '第三方API' },
  { key: 'saas_activity_index', name: 'SaaS活跃度指数', type: 'number', source: '第三方API' },
  { key: 'bank_short_loan_new', name: '新增短期流贷(万)', type: 'number', source: '人行征信' },
  { key: 'lease_record_exist', name: '金租融资记录存在', type: 'boolean', source: '中登网' },
  { key: 'controller_pledge_new', name: '实控人新增抵押', type: 'boolean', source: '工商接口' },
];

export const businessRules: BusinessRule[] = [
  {
    id: 'R001',
    name: '事实停工+隐性举债',
    status: '已上线',
    trigger: 42,
    precision: '87%',
    conditions: ['iot_active_hours_avg < 4', 'AND', 'controller_pledge_new = true'],
    action: '生成红色排雷工单 → 归属地风控专员',
  },
  {
    id: 'R002',
    name: '短贷长投识别',
    status: '已上线',
    trigger: 18,
    precision: '91%',
    conditions: ['bank_short_loan_new > 3000', 'AND', 'lease_record_exist = false'],
    action: '生成绿色拓客工单 → 属地客户经理',
  },
  {
    id: 'R003',
    name: '扩张意愿强信号',
    status: 'testing',
    trigger: 0,
    precision: '-',
    conditions: ['ai_token_monthly > 200万', 'AND', 'saas_activity_index > 80'],
    action: '标记为营销潜客 → 进入线索池',
  },
];
