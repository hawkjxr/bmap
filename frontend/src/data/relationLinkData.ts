import { GitBranch, Building2, MapPinned, Users2, Award, Link2 } from 'lucide-react';

export type RelationType = 'chain' | 'park' | 'city' | 'executive' | 'association';

/** 关系节点（新版使用 firmId） */
export interface EnterpriseNode {
  firmId: string;
  name: string;
  short: string;
  parkId: string;
  city: string;
  lng: number;
  lat: number;
  industry: string;
  executive: string;
  associations: string[];
  color: string;
}

export interface RelationLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  label: string;
  detail?: string;
}

/** 客户全景默认对应当前档案企业 */
export const CUSTOMER_PANORAMA_ENTERPRISE_ID = 'firm_002';

export const enterpriseNodes: EnterpriseNode[] = [
  { firmId: 'firm_001', name: '企业A · 常州动力电池', short: '企业A', parkId: 'park_001', city: '常州', lng: 119.97, lat: 31.77, industry: '电池制造', executive: '张总', associations: ['中国电池工业协会', '江苏省新能源产业联盟'], color: '#00E676' },
  { firmId: 'firm_002', name: '企业B · 武进锂电设备', short: '企业B', parkId: 'park_001', city: '常州', lng: 120.12, lat: 31.88, industry: '锂电设备', executive: '刘总', associations: ['江苏省新能源产业联盟'], color: '#FAAD14' },
  { firmId: 'firm_003', name: '企业C · 苏北机加工', short: '企业C', parkId: 'park_002', city: '连云港', lng: 119.22, lat: 34.60, industry: '传统制造', executive: '周总', associations: [], color: '#EF4444' },
  { firmId: 'firm_004', name: '企业D · 深圳锂电材料', short: '企业D', parkId: 'park_003', city: '深圳', lng: 114.07, lat: 22.54, industry: '锂电材料', executive: '陈总', associations: ['中国有色金属工业协会', '中国电池工业协会'], color: '#3B82F6' },
  { firmId: 'firm_005', name: '企业E · 上海新能源整车', short: '企业E', parkId: 'park_004', city: '上海', lng: 121.47, lat: 31.23, industry: '新能源整车', executive: '王总', associations: ['中国汽车工业协会', '中国电池工业协会'], color: '#A78BFA' },
  { firmId: 'firm_006', name: '企业F · 成都储能系统', short: '企业F', parkId: 'park_005', city: '成都', lng: 104.07, lat: 30.57, industry: '储能系统', executive: '吴总', associations: ['中国光伏行业协会'], color: '#06B6D4' },
  { firmId: 'firm_007', name: '企业G · 武汉光伏组件', short: '企业G', parkId: 'park_006', city: '武汉', lng: 114.30, lat: 30.59, industry: '光伏组件', executive: '林总', associations: ['中国光伏行业协会'], color: '#8B5CF6' },
  { firmId: 'firm_008', name: '企业H · 合肥电池装备', short: '企业H', parkId: 'park_007', city: '合肥', lng: 117.27, lat: 31.86, industry: '电池装备', executive: '赵总', associations: ['江苏省新能源产业联盟'], color: '#FAAD14' },
  { firmId: 'firm_009', name: '企业I · 宁德电池巨头', short: '企业I', parkId: 'park_008', city: '宁德', lng: 119.53, lat: 26.66, industry: '电池制造', executive: '曾总', associations: ['中国电池工业协会', '中国汽车工业协会'], color: '#00E676' },
  { firmId: 'firm_010', name: '企业J · 西安隔膜材料', short: '企业J', parkId: 'park_009', city: '西安', lng: 108.94, lat: 34.26, industry: '隔膜材料', executive: '孙总', associations: ['中国有色金属工业协会'], color: '#F97316' },
  // ── 新增：汽车产业链企业节点 ──
  { firmId: 'firm_011', name: '武汉福耀玻璃', short: '福耀玻璃', parkId: 'park_001', city: '武汉', lng: 114.31, lat: 30.58, industry: '汽车玻璃', executive: '何总', associations: ['中国汽车工业协会', '汽车玻璃专业委员会'], color: '#3B82F6' },
  { firmId: 'firm_012', name: '广州华德汽配', short: '华德汽配', parkId: 'park_003', city: '广州', lng: 113.26, lat: 23.13, industry: '汽车零部件', executive: '姜总', associations: ['广东省汽车行业协会'], color: '#60A5FA' },
  { firmId: 'firm_013', name: '重庆长安汽车', short: '长安汽车', parkId: 'park_003', city: '重庆', lng: 106.55, lat: 29.56, industry: '汽车整车', executive: '朱总', associations: ['中国汽车工业协会', '中国汽车零部件行业协会'], color: '#2563EB' },
  { firmId: 'firm_014', name: '北京四维图新', short: '四维图新', parkId: 'park_001', city: '北京', lng: 116.40, lat: 39.91, industry: '智能网联', executive: '秦总', associations: ['中国汽车工业协会', '中国卫星导航定位协会'], color: '#818CF8' },
  { firmId: 'firm_015', name: '杭州中策轮胎', short: '中策轮胎', parkId: 'park_001', city: '杭州', lng: 120.19, lat: 30.26, industry: '汽车轮胎', executive: '沈总', associations: ['中国橡胶工业协会', '中国汽车工业协会'], color: '#64748B' },
  { firmId: 'firm_016', name: '宁波均胜电子', short: '均胜电子', parkId: 'park_003', city: '宁波', lng: 121.55, lat: 29.87, industry: '汽车电子', executive: '唐总', associations: ['中国汽车工业协会', '中国汽车零部件行业协会'], color: '#22D3EE' },
];

/** firmId → EnterpriseNode 索引 */
export const firmIdToNode: Record<string, EnterpriseNode> = Object.fromEntries(
  enterpriseNodes.map(n => [n.firmId, n])
);

export const relationLinks: RelationLink[] = [
  { id: 'rl_001', sourceId: 'firm_004', targetId: 'firm_001', type: 'chain', label: '正极材料供应', detail: '年供应量2.5万吨，合同金额8.2亿' },
  { id: 'rl_002', sourceId: 'firm_010', targetId: 'firm_009', type: 'chain', label: '隔膜供应', detail: '独家供应商，年供应1.8亿m²' },
  { id: 'rl_003', sourceId: 'firm_008', targetId: 'firm_001', type: 'chain', label: '产线设备供应', detail: '第三期产线设备，合同7000万' },
  { id: 'rl_004', sourceId: 'firm_002', targetId: 'firm_001', type: 'chain', label: '设备采购意向', detail: '扩产设备采购，预估5000万' },
  { id: 'rl_005', sourceId: 'firm_001', targetId: 'firm_005', type: 'chain', label: '电池包供应', detail: '一级供应商，年供货12亿' },
  { id: 'rl_006', sourceId: 'firm_009', targetId: 'firm_005', type: 'chain', label: '电池包供应', detail: '战略合作，年供货25亿' },
  { id: 'rl_007', sourceId: 'firm_007', targetId: 'firm_006', type: 'chain', label: '光伏组件供应', detail: '储能系统集成用组件' },
  { id: 'rl_008', sourceId: 'firm_001', targetId: 'firm_002', type: 'park', label: '同在常州武进高新区', detail: '距离1.2km，日常技术交流频繁' },
  { id: 'rl_009', sourceId: 'firm_001', targetId: 'firm_002', type: 'city', label: '同在常州市', detail: '共享常州市新能源产业政策扶持' },
  { id: 'rl_010', sourceId: 'firm_001', targetId: 'firm_003', type: 'city', label: '同在江苏省', detail: '省级产业链协同项目' },
  { id: 'rl_011', sourceId: 'firm_005', targetId: 'firm_009', type: 'city', label: '长三角-闽东走廊', detail: '长三角一体化产业合作框架' },
  { id: 'rl_012', sourceId: 'firm_006', targetId: 'firm_007', type: 'city', label: '成渝-武汉走廊', detail: '中西部新能源产业带协同' },
  { id: 'rl_013', sourceId: 'firm_001', targetId: 'firm_005', type: 'executive', label: '张总 ↔ 王总', detail: '清华大学EMBA同期同学，私交甚密' },
  { id: 'rl_014', sourceId: 'firm_001', targetId: 'firm_002', type: 'executive', label: '张总 ↔ 刘总', detail: '曾在宁德时代共事5年，刘总后创业' },
  { id: 'rl_015', sourceId: 'firm_009', targetId: 'firm_004', type: 'executive', label: '曾总 ↔ 陈总', detail: '行业峰会年度对话嘉宾，多次同台' },
  { id: 'rl_016', sourceId: 'firm_008', targetId: 'firm_001', type: 'executive', label: '赵总 ↔ 张总', detail: '中欧商学院MBA同学' },
  { id: 'rl_017', sourceId: 'firm_005', targetId: 'firm_009', type: 'executive', label: '王总 ↔ 曾总', detail: '战略合作签约双方，定期高层互访' },
  { id: 'rl_018', sourceId: 'firm_006', targetId: 'firm_007', type: 'executive', label: '吴总 ↔ 林总', detail: '华科大本科室友，一同创业' },
  { id: 'rl_019', sourceId: 'firm_001', targetId: 'firm_009', type: 'association', label: '中国电池工业协会', detail: '协会副会长单位，参与标准制定' },
  { id: 'rl_020', sourceId: 'firm_001', targetId: 'firm_005', type: 'association', label: '中国电池工业协会', detail: '协会会员企业，年度技术交流' },
  { id: 'rl_021', sourceId: 'firm_009', targetId: 'firm_005', type: 'association', label: '中国汽车工业协会', detail: '汽车-电池产业对接平台' },
  { id: 'rl_022', sourceId: 'firm_004', targetId: 'firm_010', type: 'association', label: '中国有色金属工业协会', detail: '材料行业技术共享' },
  { id: 'rl_023', sourceId: 'firm_001', targetId: 'firm_002', type: 'association', label: '江苏省新能源产业联盟', detail: '省级产业联盟，政企对接' },
  { id: 'rl_024', sourceId: 'firm_001', targetId: 'firm_008', type: 'association', label: '江苏省新能源产业联盟', detail: '长三角跨省协作成员' },
  { id: 'rl_025', sourceId: 'firm_006', targetId: 'firm_007', type: 'association', label: '中国光伏行业协会', detail: '储能+光伏技术融合工作组' },
  // ── 新增：汽车产业链关系 ──
  { id: 'rl_026', sourceId: 'firm_011', targetId: 'firm_013', type: 'chain', label: '汽车玻璃配套', detail: '长安汽车核心玻璃供应商，年供货5亿' },
  { id: 'rl_027', sourceId: 'firm_015', targetId: 'firm_013', type: 'chain', label: '轮胎供应', detail: '原厂配套轮胎，年供货8亿' },
  { id: 'rl_028', sourceId: 'firm_016', targetId: 'firm_013', type: 'chain', label: '智能驾驶系统配套', detail: 'ADAS系统独家供应商，年供货12亿' },
  { id: 'rl_029', sourceId: 'firm_012', targetId: 'firm_013', type: 'chain', label: '汽车零部件供应', detail: '内饰件/底盘件配套，年供货3亿' },
  { id: 'rl_030', sourceId: 'firm_014', targetId: 'firm_013', type: 'chain', label: '车联网服务', detail: '智能座舱系统供应商，年供货6亿' },
  { id: 'rl_031', sourceId: 'firm_016', targetId: 'firm_014', type: 'chain', label: '智能座舱合作', detail: '联合开发智能座舱系统' },
  { id: 'rl_032', sourceId: 'firm_011', targetId: 'firm_005', type: 'chain', label: '汽车玻璃配套', detail: '新能源整车玻璃供应商' },
  { id: 'rl_033', sourceId: 'firm_016', targetId: 'firm_005', type: 'chain', label: '汽车电子配套', detail: '智能驾驶系统配套，年供货4亿' },
  { id: 'rl_034', sourceId: 'firm_014', targetId: 'firm_005', type: 'chain', label: '车联网服务', detail: '新能源整车车联网服务' },
  { id: 'rl_035', sourceId: 'firm_011', targetId: 'firm_016', type: 'executive', label: '何总 ↔ 唐总', detail: '汽车行业年会多次同台' },
  { id: 'rl_036', sourceId: 'firm_013', targetId: 'firm_005', type: 'executive', label: '朱总 ↔ 王总', detail: '中国汽车工业协会同期副会长' },
  { id: 'rl_037', sourceId: 'firm_013', targetId: 'firm_014', type: 'executive', label: '朱总 ↔ 秦总', detail: '智能网联汽车创新联盟成员' },
  { id: 'rl_038', sourceId: 'firm_015', targetId: 'firm_011', type: 'executive', label: '沈总 ↔ 何总', detail: '浙商会成员，产业协同合作' },
  { id: 'rl_039', sourceId: 'firm_011', targetId: 'firm_013', type: 'association', label: '中国汽车工业协会', detail: '整车-零部件产业链对接平台' },
  { id: 'rl_040', sourceId: 'firm_016', targetId: 'firm_013', type: 'association', label: '中国汽车零部件行业协会', detail: '核心零部件供应商会员' },
  { id: 'rl_041', sourceId: 'firm_015', targetId: 'firm_013', type: 'association', label: '中国橡胶工业协会', detail: '轮胎行业标准制定参与单位' },
  { id: 'rl_042', sourceId: 'firm_014', targetId: 'firm_005', type: 'association', label: '中国汽车工业协会', detail: '智能网联汽车工作组' },
];

export const relationTypeConfig: Record<RelationType, { label: string; color: string; icon: typeof Link2 }> = {
  chain: { label: '产业链', color: '#00E676', icon: GitBranch },
  park: { label: '园区', color: '#3B82F6', icon: Building2 },
  city: { label: '城市', color: '#06B6D4', icon: MapPinned },
  executive: { label: '高管朋友圈', color: '#F97316', icon: Users2 },
  association: { label: '协会', color: '#A78BFA', icon: Award },
};

export interface RelationTreeNode {
  firmId: string;
  name: string;
  fullName: string;
  shortName: string;
  edgeToParent?: string;
  relType?: RelationType;
  industry?: string;
  color?: string;
  isRoot?: boolean;
  children?: RelationTreeNode[];
}

/** 以本户为根、按 BFS 生成联系链路树（每节点仅保留首次到达边，避免环） */
export function buildRelationSpanningTree(
  rootFirmId: string,
  links: RelationLink[],
  nodesList: EnterpriseNode[],
  maxDepth: number,
): RelationTreeNode | null {
  const entMap = new Map(nodesList.map(n => [n.firmId, n]));
  if (!entMap.has(rootFirmId)) return null;

  const adj = new Map<string, { firmId: string; label: string; type: RelationType }[]>();
  for (const l of links) {
    const add = (a: string, b: string) => {
      if (!adj.has(a)) adj.set(a, []);
      adj.get(a)!.push({ firmId: b, label: l.label, type: l.type });
    };
    add(l.sourceId, l.targetId);
    add(l.targetId, l.sourceId);
  }

  const visited = new Set<string>();

  function build(firmId: string, depth: number, edgeToParent?: string, relType?: RelationType): RelationTreeNode {
    const e = entMap.get(firmId);
    const isRoot = firmId === rootFirmId;
    const shortName = e?.short ?? e?.name ?? firmId;
    const fullName = e?.name ?? firmId;
    const node: RelationTreeNode = {
      firmId,
      name: isRoot ? `${shortName}（本户）` : shortName,
      fullName,
      shortName,
      industry: e?.industry,
      color: e?.color,
      isRoot,
      edgeToParent,
      relType,
    };

    if (depth >= maxDepth) return node;

    const children: RelationTreeNode[] = [];
    for (const edge of adj.get(firmId) || []) {
      if (visited.has(edge.firmId)) continue;
      visited.add(edge.firmId);
      const cfg = relationTypeConfig[edge.type];
      const edgeLine = `${cfg.label} · ${edge.label}`;
      children.push(build(edge.firmId, depth + 1, edgeLine, edge.type));
    }
    if (children.length) node.children = children;
    return node;
  }

  visited.add(rootFirmId);
  return build(rootFirmId, 0);
}
