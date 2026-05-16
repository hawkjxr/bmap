/**
 * 产业链数据转 ECharts 图谱格式
 * 将 store.chainNodes + chainNodeRelations 转换为 ECharts 所需的 categories + nodes + links 格式
 */

import type { ChainNode, ChainNodeRelation, ChainTreeNode } from '../data/types';

// ─────────────────────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────────────────────

/** ECharts Graph 节点 */
export interface GraphNode {
  id: string;
  name: string;
  category: number;
  symbolSize: number;
  activity: number;
  value?: number;
  description?: string;
  shortName?: string;
}

/** ECharts Graph 链接 */
export interface GraphLink {
  source: string;
  target: string;
  lineStyle: {
    type: 'solid' | 'dashed' | 'dotted';
    width?: number;
    opacity?: number;
    color?: string;
  };
  description?: string;
  strength?: number;
  isPrimary?: boolean;
}

/** ECharts Graph 分类 */
export interface GraphCategory {
  name: string;
  itemStyle: { color: string };
}

/** 完整的 Graph 数据结构 */
export interface GraphData {
  categories: GraphCategory[];
  nodes: GraphNode[];
  links: GraphLink[];
  /** 分类名称到索引的映射 */
  categoryMap: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
// 常量
// ─────────────────────────────────────────────────────────────

/** 分类颜色映射 */
const CATEGORY_COLORS: Record<string, string> = {
  '上游': '#3B82F6',
  '中游': '#00E676',
  '下游': '#A78BFA',
  '核心': '#00E676',
  '装备': '#FAAD14',
  '基础材料': '#06B6D4',
  '上游原材料': '#3B82F6',
  '核心零部件': '#00E676',
  '关键子系统': '#A78BFA',
  '整机制造': '#F97316',
  '终端应用': '#EC4899',
  '研发支撑': '#6B7280',
};

/** 关系类型到线条样式的映射 */
const RELATION_TYPE_TO_LINE_STYLE: Record<string, 'solid' | 'dashed' | 'dotted'> = {
  flow: 'solid',
  fund: 'dashed',
  info: 'dotted',
};

/** 分类名称优先级（用于去重时保持顺序） */
const CATEGORY_PRIORITY = [
  '上游原材料', '上游', '基础材料',
  '核心零部件', '核心', '装备',
  '关键子系统', '中游',
  '整机制造', '下游',
  '终端应用', '研发支撑',
  '终端',
];

/**
 * 根据节点分类获取默认颜色
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#6B7280';
}

/**
 * 根据关系类型获取线条样式
 */
export function getLineStyleType(relationType: string): 'solid' | 'dashed' | 'dotted' {
  return RELATION_TYPE_TO_LINE_STYLE[relationType] || 'solid';
}

// ─────────────────────────────────────────────────────────────
// 核心转换函数
// ─────────────────────────────────────────────────────────────

/**
 * 将 ChainNode[] + ChainNodeRelation[] 转换为 ECharts Graph 数据格式
 * 适用于斥力图 (Force Graph)
 */
export function chainToGraphData(
  chainNodes: ChainNode[],
  chainNodeRelations: ChainNodeRelation[]
): GraphData {
  // 1. 收集所有分类
  const categorySet = new Set<string>();
  chainNodes.forEach(node => {
    const cat = node.graphCategory || node.stage;
    if (cat) categorySet.add(cat);
  });

  // 2. 按优先级排序分类
  const sortedCategories = Array.from(categorySet).sort((a, b) => {
    const idxA = CATEGORY_PRIORITY.indexOf(a);
    const idxB = CATEGORY_PRIORITY.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  // 3. 构建分类数组和映射
  const categories: GraphCategory[] = sortedCategories.map(name => ({
    name,
    itemStyle: { color: getCategoryColor(name) },
  }));

  const categoryMap: Record<string, number> = {};
  sortedCategories.forEach((name, index) => {
    categoryMap[name] = index;
  });

  // 4. 转换节点
  const nodes: GraphNode[] = chainNodes.map(node => {
    const cat = node.graphCategory || node.stage || 'other';
    return {
      id: node.id,
      name: node.shortName || node.name,
      category: categoryMap[cat] ?? 0,
      symbolSize: (node.graphSize || 44) * 0.8, // 缩小至 80%
      activity: node.activity,
      value: node.scale,
      description: node.description,
      shortName: node.shortName,
    };
  });

  // 5. 转换链接
  const links: GraphLink[] = chainNodeRelations
    .filter(rel => rel.sourceNodeId && rel.targetNodeId)
    .map(rel => ({
      source: rel.sourceNodeId,
      target: rel.targetNodeId,
      lineStyle: {
        type: getLineStyleType(rel.relationType),
        width: rel.isPrimary ? 2 : 1,
        opacity: 0.7,
      },
      description: rel.description,
      strength: rel.strength,
      isPrimary: rel.isPrimary,
    }));

  return { categories, nodes, links, categoryMap };
}

/**
 * 获取指定产业链的预定义树形数据
 * 直接使用 mockChainTreeData
 */
export function getChainTreeData(
  chainId: string,
  treeDataMap: Record<string, ChainTreeNode>
): ChainTreeNode | null {
  return treeDataMap[chainId] || null;
}

/**
 * 根据节点 ID 查找树形数据中的节点
 */
export function findNodeInTree(
  tree: ChainTreeNode | null,
  nodeId: string
): ChainTreeNode | null {
  if (!tree) return null;
  if (tree.nodeId === nodeId) return tree;
  for (const child of tree.children ?? []) {
    const found = findNodeInTree(child, nodeId);
    if (found) return found;
  }
  return null;
}

/**
 * 根据节点ID，递归查找所有祖先节点ID（含自身）
 * 用于汇总父子节点关联的企业
 * @param nodeId  当前节点ID
 * @param treeData 树形数据
 * @returns 节点ID数组 [当前, 父, 祖父, ...]
 */
export function getAncestorNodeIds(
  nodeId: string,
  treeData: ChainTreeNode
): string[] {
  if (!treeData) return [];

  const result: string[] = [];

  function findPath(node: ChainTreeNode, path: string[]): boolean {
    const currentPath = [...path, node.nodeId];
    if (node.nodeId === nodeId) {
      result.push(...currentPath);
      return true;
    }
    for (const child of node.children ?? []) {
      if (findPath(child, currentPath)) {
        return true;
      }
    }
    return false;
  }

  findPath(treeData, []);
  return result;
}

/**
 * 企业汇总信息
 */
export interface FirmSummary {
  firmId: string;
  name: string;
  role: string;
  asset: string;
  manager?: string;
  managerId?: string;
}

/**
 * 根据节点ID列表，汇总关联的企业信息
 * @param nodeIds     节点ID数组（从 getAncestorNodeIds 获取）
 * @param chainFirms  节点→企业关联数据
 * @param firms       企业详情列表
 * @returns 汇总后的企业列表（含企业名称）
 */
export function getNodeRelatedFirms(
  nodeIds: string[],
  chainFirms: Array<{ nodeId: string; firmId: string; role: string; asset: string; manager?: string; managerId?: string }>,
  firms: Array<{ id: string; name: string }>
): FirmSummary[] {
  // 去重用 Set
  const seenFirmIds = new Set<string>();
  const result: FirmSummary[] = [];

  for (const nodeId of nodeIds) {
    const relatedFirms = chainFirms.filter(cf => cf.nodeId === nodeId);
    for (const cf of relatedFirms) {
      if (seenFirmIds.has(cf.firmId)) continue;
      seenFirmIds.add(cf.firmId);

      const firmData = firms.find(f => f.id === cf.firmId);
      result.push({
        firmId: cf.firmId,
        name: firmData?.name || cf.firmId,
        role: cf.role,
        asset: cf.asset,
        manager: cf.manager,
        managerId: cf.managerId,
      });
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// ECharts 配置生成
// ─────────────────────────────────────────────────────────────

export interface ChartTheme {
  mapArea: string;
  mapArea2: string;
  mapBorder: string;
  textWhite: string;
  labelLight: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
}

/**
 * 生成力导向图配置
 */
export function buildForceOption(
  graphData: GraphData,
  theme: ChartTheme,
  center?: [number, number]
): Record<string, unknown> {
  const { categories, nodes, links } = graphData;

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.tooltipText, fontSize: 12 },
      formatter: (params: { dataType?: string; data?: Record<string, unknown>; name?: string }) => {
        if (params.dataType !== 'node' || !params.data) return '';
        const node = params.data;
        const activity = node.activity as number;
        const actColor = activity >= 85 ? '#00E676' : activity >= 70 ? '#FAAD14' : '#EF4444';
        const catName = categories[node.category as number]?.name || '未知';
        return `<div style="font-size:12px">
          <b style="color:${theme.textWhite}">${params.name}</b><br/>
          <span style="color:${theme.labelLight}">分类: ${catName}</span><br/>
          <span style="color:${actColor}">景气 ${activity}%</span><br/>
          <span style="color:${theme.labelLight}">规模 ${node.value || 0}亿</span>
        </div>`;
      },
    },
    legend: {
      data: categories.map(c => c.name),
      bottom: 10,
      textStyle: { color: theme.labelLight },
    },
    xAxis: { show: false, min: 0, max: 2000 },
    yAxis: { show: false, min: 0, max: 1000 },
    series: [{
      type: 'graph',
      layout: 'force',
      legendHoverLink: true,
      data: nodes.map(n => ({
        id: n.id,
        name: n.name,
        category: n.category,
        value: n.value,
        activity: n.activity,
        symbolSize: n.symbolSize,
        itemStyle: {
          color: categories[n.category]?.itemStyle.color || '#3B82F6',
          borderColor: categories[n.category]?.itemStyle.color || '#3B82F6',
          borderWidth: 2,
          shadowBlur: 12,
          shadowColor: (categories[n.category]?.itemStyle.color || '#3B82F6') + '40',
          borderRadius: 6,
        },
        label: {
          show: true,
          position: 'inside',
          fontSize: 11,
          color: '#fff',
          formatter: (p: { data?: GraphNode }) => {
            const d = p.data || {};
            return `${d.name || ''}\n景气 ${d.activity || 0}%`;
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            borderWidth: 3,
          },
        },
      })),
      links: links.map(l => ({
        source: l.source,
        target: l.target,
        lineStyle: {
          color: '#3B82F680',
          ...l.lineStyle,
          curveness: 0.15,
        },
        symbol: ['none', 'arrow'],
        symbolSize: [5, 8],
        emphasis: {
          lineStyle: { width: 3, opacity: 1 },
        },
      })),
      categories: categories.map(c => ({
        name: c.name,
        itemStyle: c.itemStyle,
      })),
      force: {
        repulsion: 400,
        edgeLength: [150, 300],
        layoutAnimation: true,
        gravity: 0.05,
        friction: 0.6,
        center: center,
      },
      roam: true,
      zoom: 1,
      silent: false,
      lineStyle: { opacity: 0.7 },
      edgeLabel: { show: false },
    }],
  };
}

/**
 * 生成树形图配置
 * 注意：ECharts 原生 tree 类型不支持节点单独拖拽
 * 如需拖拽功能，请使用 IndustryChain.tsx（graph + layout: none 模式）
 */
export function buildTreeOption(
  treeData: ChainTreeNode,
  theme: ChartTheme,
  chainName: string
): Record<string, unknown> {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.tooltipText, fontSize: 12 },
      formatter: (params: { dataType?: string; data?: { activity?: number; value?: number; name?: string } }) => {
        if (params.dataType !== 'node' || !params.data) return '';
        const node = params.data;
        const actColor = node.activity! >= 85 ? '#00E676' : node.activity! >= 70 ? '#FAAD14' : '#EF4444';
        return `<div style="font-size:12px">
          <b style="color:${theme.textWhite}">${node.name}</b><br/>
          <span style="color:${actColor}">景气 ${node.activity}%</span><br/>
          <span style="color:${theme.labelLight}">规模 ${node.value}亿</span>
        </div>`;
      },
    },
    xAxis: { show: false, min: -200, max: 'dataMax' + 600 },
    yAxis: { show: false, min: -200, max: 'dataMax' + 600 },
    series: [{
      type: 'tree',
      name: chainName,
      data: [treeData],
      roam: true,
      expandAndCollapse: true,
      initialTreeDepth: 2,
      orient: 'LR', // 从左到右
      symbol: 'roundRect',
      symbolSize: [120, 55],
      nodePadding: 100,
      layerPadding: 300,
      label: {
        show: true,
        position: 'inside',
        fontSize: 11,
        color: '#ffffff',
        formatter: (params: { data?: ChainTreeNode }) => {
          const d = params.data || {};
          return `{name|${d.name || ''}}\n{activity|景气 ${d.activity || 0}%}`;
        },
        rich: {
          name: { fontSize: 11, fontWeight: 'bold' },
          activity: { fontSize: 9, color: 'rgba(255,255,255,0.8)' },
        },
      },
      itemStyle: {
        color: (params: { data?: { cat?: string; level?: number; itemStyle?: { color?: string } } }) => {
          // 根据层级设置颜色：根节点(0)用亮蓝，叶子节点用标准蓝，中间节点用深蓝
          const level = params.data?.level ?? 1;
          if (level === 0) return '#38BDF8'; // 根节点 - 亮蓝
          if (level >= 3) return '#38BDF8';  // 第3级及以下 - 标准蓝（叶子节点效果）
          return '#0EA5E9';                    // 中间层级 - 深蓝
        },
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
      },
      lineStyle: {
        color: theme.mapBorder,
        width: 1.5,
        curveness: 0.1,
      },
      leaves: {
        itemStyle: {
          color: '#38BDF8',
          borderColor: 'rgba(255,255,255,0.5)',
          borderWidth: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(56,189,248,0.4)',
          borderRadius: 8,
        },
        label: {
          position: 'inside',
          fontSize: 11,
          color: '#ffffff',
          formatter: (params: { data?: ChainTreeNode }) => {
            const d = params.data || {};
            return `{name|${d.name || ''}}\n{activity|景气 ${d.activity || 0}%}`;
          },
          rich: {
            name: { fontSize: 11, fontWeight: 'bold' },
            activity: { fontSize: 9, color: 'rgba(255,255,255,0.8)' },
          },
        },
      },
      emphasis: {
        focus: 'descendant',
        itemStyle: {
          shadowBlur: 20,
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.5)',
        },
      },
      animation: true,
      animationDuration: 500,
      animationEasing: 'cubicOut',
    }],
  };
}

// ─────────────────────────────────────────────────────────────
// 导出分类颜色常量供外部使用
// ─────────────────────────────────────────────────────────────

export { CATEGORY_COLORS };
