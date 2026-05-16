// ═══════════════════════════════════════════════════════════════
// 产业链数据（chainData.ts）
// 核心理念：产业链 → 节点 → 企业 三层结构，通过 ID 关联
// ═══════════════════════════════════════════════════════════════

import type { ChainInfo, ChainNodeInfo, ChainTreeNode, FinancingStructure } from './types';

// ─── 产业链元数据 ─────────────────────────────────────────────

export const chainInfoList: ChainInfo[] = [
  {
    id: 'chain_001',
    name: '动力电池产业链',
    status: 'active',
    description: '涵盖从上游锂矿到下游整车应用的完整链条',
    color: '#00E676',
  },
  {
    id: 'chain_002',
    name: '光伏产业链',
    status: 'active',
    description: '硅料-组件-电站完整链条',
    color: '#F59E0B',
  },
  {
    id: 'chain_003',
    name: '半导体产业链',
    status: 'warning',
    description: '芯片设计-制造-封测完整链条',
    color: '#A78BFA',
  },
  {
    id: 'chain_004',
    name: '汽车产业链',
    status: 'active',
    description: '从零部件到整车制造，再到销售与后市场的完整链条',
    color: '#3B82F6',
  },
];

// ─── 产业链节点（含企业关联）──────────────────────────────────

export const chainNodeDetails: Record<string, ChainNodeInfo> = {
  // ── 动力电池产业链 ──
  'node_001': {
    id: 'node_001',
    chainId: 'chain_001',
    name: '锂矿开采',
    scale: 120,
    activity: 70,
    bankRatio: 90,
    leaseRatio: 10,
    firms: [],
  },
  'node_002': {
    id: 'node_002',
    chainId: 'chain_001',
    name: '正极材料',
    scale: 200,
    activity: 78,
    bankRatio: 85,
    leaseRatio: 15,
    firms: [
      { firmId: 'firm_004', role: '头部供应商', asset: '—' },
    ],
  },
  'node_003': {
    id: 'node_003',
    chainId: 'chain_001',
    name: '负极材料',
    scale: 160,
    activity: 72,
    bankRatio: 88,
    leaseRatio: 12,
    firms: [],
  },
  'node_004': {
    id: 'node_004',
    chainId: 'chain_001',
    name: '电解液',
    scale: 90,
    activity: 75,
    bankRatio: 82,
    leaseRatio: 18,
    firms: [],
  },
  'node_005': {
    id: 'node_005',
    chainId: 'chain_001',
    name: '隔膜',
    scale: 110,
    activity: 74,
    bankRatio: 86,
    leaseRatio: 14,
    firms: [
      { firmId: 'firm_010', role: '关注预警', asset: '3亿' },
    ],
  },
  'node_006': {
    id: 'node_006',
    chainId: 'chain_001',
    name: '锂电设备',
    scale: 300,
    activity: 88,
    bankRatio: 78,
    leaseRatio: 22,
    firms: [
      { firmId: 'firm_002', role: '扩产中（潜客）', asset: '—' },
      { firmId: 'firm_008', role: '存量客户', asset: '7亿' },
    ],
  },
  'node_007': {
    id: 'node_007',
    chainId: 'chain_001',
    name: '电池制造',
    scale: 500,
    activity: 92,
    bankRatio: 92,
    leaseRatio: 8,
    firms: [
      { firmId: 'firm_001', role: '链主（满产）', asset: '10亿' },
      { firmId: 'firm_009', role: '行业龙头', asset: '12亿' },
    ],
  },
  'node_008': {
    id: 'node_008',
    chainId: 'chain_001',
    name: 'BMS系统',
    scale: 140,
    activity: 82,
    bankRatio: 80,
    leaseRatio: 20,
    firms: [],
  },
  'node_009': {
    id: 'node_009',
    chainId: 'chain_001',
    name: 'Pack集成',
    scale: 400,
    activity: 85,
    bankRatio: 88,
    leaseRatio: 12,
    firms: [
      { firmId: 'firm_005', role: '下游大客户', asset: '15亿' },
    ],
  },
  'node_010': {
    id: 'node_010',
    chainId: 'chain_001',
    name: '储能系统',
    scale: 250,
    activity: 80,
    bankRatio: 70,
    leaseRatio: 30,
    firms: [
      { firmId: 'firm_006', role: '关注预警', asset: '5亿' },
    ],
  },
  'node_011': {
    id: 'node_011',
    chainId: 'chain_001',
    name: '新能源整车',
    scale: 450,
    activity: 90,
    bankRatio: 75,
    leaseRatio: 25,
    firms: [],
  },
  // ── 光伏产业链 ──
  'node_101': {
    id: 'node_101',
    chainId: 'chain_002',
    name: '硅料',
    scale: 200,
    activity: 75,
    bankRatio: 85,
    leaseRatio: 15,
    firms: [],
  },
  'node_102': {
    id: 'node_102',
    chainId: 'chain_002',
    name: '硅片',
    scale: 180,
    activity: 78,
    bankRatio: 82,
    leaseRatio: 18,
    firms: [],
  },
  'node_103': {
    id: 'node_103',
    chainId: 'chain_002',
    name: '光伏组件',
    scale: 300,
    activity: 75,
    bankRatio: 80,
    leaseRatio: 20,
    firms: [
      { firmId: 'firm_007', role: '存量客户', asset: '6亿' },
    ],
  },
  'node_104': {
    id: 'node_104',
    chainId: 'chain_002',
    name: '光伏应用',
    scale: 250,
    activity: 72,
    bankRatio: 75,
    leaseRatio: 25,
    firms: [],
  },
  // ── 半导体产业链 ──
  'node_201': {
    id: 'node_201',
    chainId: 'chain_003',
    name: 'IC设计',
    scale: 400,
    activity: 80,
    bankRatio: 70,
    leaseRatio: 30,
    firms: [],
  },
  'node_202': {
    id: 'node_202',
    chainId: 'chain_003',
    name: '晶圆制造',
    scale: 500,
    activity: 75,
    bankRatio: 80,
    leaseRatio: 20,
    firms: [],
  },
  'node_203': {
    id: 'node_203',
    chainId: 'chain_003',
    name: '封装测试',
    scale: 200,
    activity: 78,
    bankRatio: 85,
    leaseRatio: 15,
    firms: [],
  },
  // ── 汽车产业链（上游：零部件与原材料） ──
  'node_401': {
    id: 'node_401',
    chainId: 'chain_004',
    name: '钢铁与铝合金',
    scale: 180,
    activity: 72,
    bankRatio: 88,
    leaseRatio: 12,
    firms: [],
  },
  'node_402': {
    id: 'node_402',
    chainId: 'chain_004',
    name: '汽车轮胎',
    scale: 120,
    activity: 75,
    bankRatio: 82,
    leaseRatio: 18,
    firms: [],
  },
  'node_403': {
    id: 'node_403',
    chainId: 'chain_004',
    name: '汽车玻璃',
    scale: 100,
    activity: 70,
    bankRatio: 85,
    leaseRatio: 15,
    firms: [],
  },
  'node_404': {
    id: 'node_404',
    chainId: 'chain_004',
    name: '汽车电子元器件',
    scale: 220,
    activity: 82,
    bankRatio: 75,
    leaseRatio: 25,
    firms: [],
  },
  'node_405': {
    id: 'node_405',
    chainId: 'chain_004',
    name: '发动机与变速箱',
    scale: 350,
    activity: 78,
    bankRatio: 80,
    leaseRatio: 20,
    firms: [],
  },
  'node_406': {
    id: 'node_406',
    chainId: 'chain_004',
    name: '汽车零部件总成',
    scale: 400,
    activity: 85,
    bankRatio: 78,
    leaseRatio: 22,
    firms: [],
  },
  // ── 汽车产业链（中游：整车制造） ──
  'node_407': {
    id: 'node_407',
    chainId: 'chain_004',
    name: '传统燃油车制造',
    scale: 500,
    activity: 65,
    bankRatio: 85,
    leaseRatio: 15,
    firms: [],
  },
  'node_408': {
    id: 'node_408',
    chainId: 'chain_004',
    name: '新能源汽车制造',
    scale: 550,
    activity: 92,
    bankRatio: 70,
    leaseRatio: 30,
    firms: [
      { firmId: 'firm_006', role: '龙头客户', asset: '200亿' },
    ],
  },
  'node_409': {
    id: 'node_409',
    chainId: 'chain_004',
    name: '智能驾驶系统',
    scale: 300,
    activity: 88,
    bankRatio: 72,
    leaseRatio: 28,
    firms: [],
  },
  'node_410': {
    id: 'node_410',
    chainId: 'chain_004',
    name: '车联网与座舱',
    scale: 250,
    activity: 85,
    bankRatio: 70,
    leaseRatio: 30,
    firms: [],
  },
  // ── 汽车产业链（下游：销售与服务） ──
  'node_411': {
    id: 'node_411',
    chainId: 'chain_004',
    name: '整车销售4S店',
    scale: 350,
    activity: 75,
    bankRatio: 80,
    leaseRatio: 20,
    firms: [],
  },
  'node_412': {
    id: 'node_412',
    chainId: 'chain_004',
    name: '汽车后市场',
    scale: 280,
    activity: 80,
    bankRatio: 75,
    leaseRatio: 25,
    firms: [],
  },
  'node_413': {
    id: 'node_413',
    chainId: 'chain_004',
    name: '汽车金融与保险',
    scale: 200,
    activity: 78,
    bankRatio: 90,
    leaseRatio: 10,
    firms: [],
  },
};

// ─── 动力电池产业链树形结构（用于可视化）───────────────────────

export const chainTreeData: ChainTreeNode = {
  nodeId: 'chain_power_battery',
  name: '动力电池产业链',
  value: 0,
  activity: 0,
  cat: '核心',
  children: [
    {
      nodeId: 'node_lithium',
      name: '锂矿开采',
      value: 120,
      activity: 70,
      cat: '上游',
      children: [
        { nodeId: 'node_cathode', name: '正极材料', value: 200, activity: 78, cat: '上游' },
        { nodeId: 'node_anode', name: '负极材料', value: 160, activity: 72, cat: '上游' },
      ],
    },
    { nodeId: 'node_electrolyte', name: '电解液', value: 90, activity: 75, cat: '上游' },
    { nodeId: 'node_separator', name: '隔膜', value: 110, activity: 74, cat: '上游' },
    { nodeId: 'node_equipment', name: '锂电设备', value: 300, activity: 88, cat: '装备' },
    {
      nodeId: 'node_cell',
      name: '电池制造',
      value: 500,
      activity: 92,
      cat: '核心',
      children: [
        { nodeId: 'node_bms', name: 'BMS系统', value: 140, activity: 82, cat: '中游' },
        {
          nodeId: 'node_pack',
          name: 'Pack集成',
          value: 400,
          activity: 85,
          cat: '中游',
          children: [
            { nodeId: 'node_storage', name: '储能系统', value: 250, activity: 80, cat: '下游' },
            { nodeId: 'node_vehicle', name: '新能源整车', value: 450, activity: 90, cat: '下游' },
          ],
        },
      ],
    },
  ],
};

// ─── 汽车产业链树形结构（用于可视化）────────────────────────

export const autoChainTreeData: ChainTreeNode = {
  nodeId: 'chain_auto',
  name: '汽车产业链',
  value: 0,
  activity: 0,
  cat: '核心',
  children: [
    {
      nodeId: 'auto_raw',
      name: '上游原材料',
      value: 180,
      activity: 72,
      cat: '上游',
      children: [
        { nodeId: 'auto_steel', name: '钢铁与铝合金', value: 180, activity: 72, cat: '上游' },
        { nodeId: 'auto_tire', name: '汽车轮胎', value: 120, activity: 75, cat: '上游' },
        { nodeId: 'auto_glass', name: '汽车玻璃', value: 100, activity: 70, cat: '上游' },
      ],
    },
    {
      nodeId: 'auto_parts',
      name: '核心零部件',
      value: 350,
      activity: 80,
      cat: '上游',
      children: [
        { nodeId: 'auto_electronics', name: '汽车电子元器件', value: 220, activity: 82, cat: '上游' },
        { nodeId: 'auto_engine', name: '发动机与变速箱', value: 350, activity: 78, cat: '上游' },
        { nodeId: 'auto_assembly', name: '汽车零部件总成', value: 400, activity: 85, cat: '上游' },
      ],
    },
    {
      nodeId: 'auto_vehicle',
      name: '整车制造',
      value: 500,
      activity: 85,
      cat: '核心',
      children: [
        { nodeId: 'auto_fuel', name: '传统燃油车', value: 500, activity: 65, cat: '中游' },
        { nodeId: 'auto_ev', name: '新能源整车', value: 550, activity: 92, cat: '中游' },
      ],
    },
    {
      nodeId: 'auto_smart',
      name: '智能与网联',
      value: 300,
      activity: 86,
      cat: '中游',
      children: [
        { nodeId: 'auto_driving', name: '智能驾驶系统', value: 300, activity: 88, cat: '中游' },
        { nodeId: 'auto_cockpit', name: '车联网与座舱', value: 250, activity: 85, cat: '中游' },
      ],
    },
    {
      nodeId: 'auto_service',
      name: '下游服务',
      value: 350,
      activity: 78,
      cat: '下游',
      children: [
        { nodeId: 'auto_4s', name: '整车销售4S店', value: 350, activity: 75, cat: '下游' },
        { nodeId: 'auto_after', name: '汽车后市场', value: 280, activity: 80, cat: '下游' },
        { nodeId: 'auto_finance', name: '汽车金融与保险', value: 200, activity: 78, cat: '下游' },
      ],
    },
  ],
};

// ─── 融资结构（用于图表）──────────────────────────────────────

export const chainFinancingData: FinancingStructure[] = [
  { env: '电池制造', bank: 92, lease: 8 },
  { env: '锂电设备', bank: 78, lease: 22 },
  { env: 'Pack集成', bank: 88, lease: 12 },
  { env: '正极材料', bank: 85, lease: 15 },
  { env: '储能系统', bank: 70, lease: 30 },
  { env: '光伏组件', bank: 80, lease: 20 },
  { env: '新能源整车', bank: 70, lease: 30 },
  { env: '汽车零部件总成', bank: 78, lease: 22 },
  { env: '智能驾驶系统', bank: 72, lease: 28 },
  { env: '汽车后市场', bank: 75, lease: 25 },
];

// ─── 辅助函数 ─────────────────────────────────────────────────

/** 根据产业链ID获取所有节点 */
export function getNodesByChainId(chainId: string): ChainNodeInfo[] {
  return Object.values(chainNodeDetails).filter(n => n.chainId === chainId);
}

/** 根据企业ID查找所在节点 */
export function getNodesByFirmId(firmId: string): ChainNodeInfo[] {
  return Object.values(chainNodeDetails).filter(n =>
    (n.firms || []).some(f => f.firmId === firmId)
  );
}

/** 根据企业ID查找所在产业链ID */
export function getChainIdsByFirmId(firmId: string): string[] {
  const nodes = getNodesByFirmId(firmId);
  return [...new Set(nodes.map(n => n.chainId))];
}

/** 根据园区ID查找关联的产业链ID */
export function getChainIdsByParkId(_parkId: string, parkChainIds: string[]): string[] {
  return parkChainIds;
}

/** 节点ID → 节点名称 索引 */
export const nodeIdToName: Record<string, string> = Object.fromEntries(
  Object.values(chainNodeDetails).map(n => [n.id, n.name])
);

/** 产业链ID → 名称 索引 */
export const chainIdToName: Record<string, string> = Object.fromEntries(
  chainInfoList.map(c => [c.id, c.name])
);

/** 产业链节点 → 链ID 索引 */
export const nodeIdToChainId: Record<string, string> = Object.fromEntries(
  Object.values(chainNodeDetails).map(n => [n.id, n.chainId])
);

/** 根据产业链ID获取产业链信息 */
export function getChainInfo(chainId: string): ChainInfo | undefined {
  return chainInfoList.find(c => c.id === chainId);
}

/** 获取汽车产业链的所有节点 */
export function getAutoChainNodes(): ChainNodeInfo[] {
  return Object.values(chainNodeDetails).filter(n => n.chainId === 'chain_004');
}

/** 获取汽车产业链的节点（按环节分组） */
export function getAutoChainNodesByStage(): Record<string, ChainNodeInfo[]> {
  const nodes = getAutoChainNodes();
  return {
    upstream: nodes.filter(n => ['node_401', 'node_402', 'node_403', 'node_404', 'node_405', 'node_406'].includes(n.id)),
    midstream: nodes.filter(n => ['node_407', 'node_408', 'node_409', 'node_410'].includes(n.id)),
    downstream: nodes.filter(n => ['node_411', 'node_412', 'node_413'].includes(n.id)),
  };
}
