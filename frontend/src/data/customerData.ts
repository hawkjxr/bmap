// ═══════════════════════════════════════════════════════════════
// 客户全景视图数据（customerData.ts）
// 核心理念：企业ID为唯一标识，关联补录人信息
// ═══════════════════════════════════════════════════════════════

import type { CustomerProfile, CustomerSearchItem } from './types';

export const customerProfiles: CustomerProfile[] = [
  {
    id: 'firm_002',
    name: '企业B',
    fullName: '武进某锂电设备制造企业',
    creditCode: '91320412MA********',
    rating: 'AA+',
    creditBalance: '0 万',
    manager: { name: '李明', surname: '李', role: '管户客户经理', phone: '138****5678', email: 'liming@company.com' },
    recommendation: '3年期直租 · 置换短贷',
    radarIndicators: ['开工率', '能耗增速', 'AI活跃度', '金租依赖度', '营收增速', '信用评级'],
    radarData: {
      enterprise: [92, 78, 85, 15, 88, 80],
      parkAvg: [75, 60, 55, 40, 65, 70],
      nationalAvg: [68, 50, 45, 35, 55, 65],
    },
    digitalMetrics: [
      { label: 'AI大模型Token调用量', value: '342万/月', trend: '+156%', color: 'text-purple-400', bar: 85 },
      { label: 'SaaS办公活跃度', value: '92.3分', trend: '+23%', color: 'text-blue-400', bar: 92 },
      { label: '专利申请(近6月)', value: '12件', trend: '+4件', color: 'text-cyan-300', bar: 60 },
      { label: '招聘岗位数', value: '47个', trend: '+18个', color: 'text-green-400', bar: 70 },
    ],
    digitalInsight: 'AI调用量峰值出现在近3个月，SaaS协作活跃度同步飙升，交叉验证<b class="text-purple-400">扩张意愿极强</b>。',
    debtSunburst: [
      { name: '银行信贷', value: 18000, itemStyle: { color: '#3B82F6' }, children: [
        { name: '工商银行', value: 8000, itemStyle: { color: '#2563EB' } },
        { name: '建设银行', value: 5000, itemStyle: { color: '#1D4ED8' } },
        { name: '短期流贷', value: 5000, itemStyle: { color: '#EF4444' }, label: { color: '#EF4444' } },
      ]},
      { name: '金租同业', value: 0, children: [
        { name: '暂无记录', value: 100 },
      ]},
      { name: '其他融资', value: 3000, children: [
        { name: '商业承兑', value: 2000, itemStyle: { color: '#4B5563' } },
        { name: '担保融资', value: 1000, itemStyle: { color: '#374151' } },
      ]},
    ],
    debtTable: [
      ['工商银行', '8,000万', '2027-03'],
      ['建设银行', '5,000万', '2027-06'],
      ['短期流贷', '5,000万', '2026-11'],
    ],
    riskNotes: [
      { title: '短贷长投风险', content: '新增5000万 1年期银行短贷，但无匹配短期经营用途。高度疑似用于采购长期产线设备，存在期限错配。', type: 'danger' },
      { title: '同业空白', content: '全市场无金租/商租融资记录。中登网无动产抵押登记。属于纯银行信贷客户，金租介入空间极大。', type: 'info' },
    ],
    plan: { name: '3年期直租', amount: '5,000 万', term: '36 个月', subject: '新建产线设备', irr: '6.8%' },
  },
];

// ─── 客户搜索结果项（由旧数据迁移并补全企业ID）───────────────

export const customerSearchItems: CustomerSearchItem[] = [
  { id: 'firm_001', name: '企业A · 常州动力电池', park: '常州武进高新区', industry: '动力电池', rating: 'AAA', ratingColor: '#00E676', invest: '10亿', total: '312.4亿', vi: 92, risk: '正常', riskColor: '#00E676', manager: '李明' },
  { id: 'firm_002', name: '企业B · 武进锂电设备', park: '常州武进高新区', industry: '锂电设备', rating: 'AA+', ratingColor: '#00E676', invest: '—', total: '—', vi: 88, risk: '潜客', riskColor: '#3B82F6', manager: '李明' },
  { id: 'firm_003', name: '企业C · 苏北机加工', park: '苏北某重工经开区', industry: '传统机加工', rating: 'BBB', ratingColor: '#FAAD14', invest: '2亿', total: '126.8亿', vi: 45, risk: '高危', riskColor: '#FF4D4F', manager: '张强' },
  { id: 'firm_004', name: '企业D · 深圳锂电材料', park: '深圳南山科技园', industry: '锂电材料', rating: 'AA', ratingColor: '#00E676', invest: '8亿', total: '248.5亿', vi: 88, risk: '正常', riskColor: '#00E676', manager: '赵敏' },
  { id: 'firm_005', name: '企业E · 上海新能源整车', park: '上海浦东新区', industry: '新能源整车', rating: 'AAA', ratingColor: '#00E676', invest: '15亿', total: '380亿', vi: 85, risk: '正常', riskColor: '#00E676', manager: '孙浩' },
  { id: 'firm_006', name: '企业F · 成都储能系统', park: '成都高新区', industry: '储能系统', rating: 'A+', ratingColor: '#FAAD14', invest: '5亿', total: '108亿', vi: 72, risk: '关注', riskColor: '#FAAD14', manager: '王芳' },
  { id: 'firm_007', name: '企业G · 武汉光伏组件', park: '武汉东湖高新', industry: '光伏组件', rating: 'AA', ratingColor: '#00E676', invest: '6亿', total: '120亿', vi: 75, risk: '正常', riskColor: '#00E676', manager: '陈磊' },
  { id: 'firm_008', name: '企业H · 合肥电池装备', park: '合肥经开区', industry: '电池装备', rating: 'AA+', ratingColor: '#00E676', invest: '7亿', total: '152亿', vi: 78, risk: '正常', riskColor: '#00E676', manager: '刘洋' },
  { id: 'firm_009', name: '企业I · 宁德电池巨头', park: '宁德蕉城', industry: '动力电池', rating: 'AAA', ratingColor: '#00E676', invest: '12亿', total: '285亿', vi: 90, risk: '正常', riskColor: '#00E676', manager: '陈磊' },
  { id: 'firm_010', name: '企业J · 西安隔膜材料', park: '西安高新区', industry: '隔膜材料', rating: 'A', ratingColor: '#FAAD14', invest: '3亿', total: '78亿', vi: 58, risk: '关注', riskColor: '#FAAD14', manager: '张强' },
];

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 根据企业ID查找客户全景视图 */
export function getCustomerProfileById(id: string): CustomerProfile | undefined {
  return customerProfiles.find(c => c.id === id);
}

/** 客户搜索 */
export function searchCustomers(keyword: string): CustomerSearchItem[] {
  const kw = keyword.toLowerCase();
  return customerSearchItems.filter(c =>
    c.name.toLowerCase().includes(kw) ||
    c.park.toLowerCase().includes(kw) ||
    c.industry.toLowerCase().includes(kw) ||
    c.manager.toLowerCase().includes(kw)
  );
}
