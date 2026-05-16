/**
 * 产业链树形布局算法
 *
 * 设计原则：
 * - 纯函数，输入任意 ChainTreeNode，输出 ECharts 所需节点/边数据
 * - 不依赖任何具体产业链 ID 或节点名称
 * - 布局参数可通过 ChainLayoutConfig 配置
 * - 折叠状态在坐标计算阶段就体现，展开后自动重排，无重叠
 */

import type { ChainTreeNode } from '../data/types';

// ─────────────────────────────────────────────────────────────
// 布局配置
// ─────────────────────────────────────────────────────────────

export interface ChainLayoutConfig {
  /** 层级（X轴）间距 */
  levelWidth: number;
  /** 节点最小高度 */
  nodeHeight: number;
  /** 包裹框内子节点之间的垂直间距 */
  layerPadding: number;
  /** 画布边距 */
  canvasMargin: number;
  /** 固定画布宽度（px），不填则自动按层级数计算 */
  canvasWidth?: number;
}

export const DEFAULT_LAYOUT_CONFIG: ChainLayoutConfig = {
  levelWidth: 220,
  nodeHeight: 50,
  layerPadding: 20,
  canvasMargin: 80,
};

// ─────────────────────────────────────────────────────────────
// 类型
// ─────────────────────────────────────────────────────────────

export interface GraphNode {
  name: string;
  nodeId: string;
  value: number;
  activity: number;
  cat: string;
  depth: number;
  collapsed: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;
  itemStyle: Record<string, unknown>;
  label: Record<string, unknown>;
  symbol: string;
  symbolKeepAspect: boolean;
  symbolSize: [number, number];
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface ChainLayoutResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  canvasWidth: number;
  canvasHeight: number;
  maxCanvasHeight: number;
  /** 各层级（depth）的 Y 坐标范围，用于绘制色带背景和折叠按钮 */
  levelBands: Array<{
    depth: number;
    yMin: number;
    yMax: number;
    label: string;
    color: string;
  }>;
}

interface LayoutInfo {
  nodeId: string;
  depth: number;
  y: number;
  subtreeHeight: number;
}

// ─────────────────────────────────────────────────────────────
// 尺寸估算
// ─────────────────────────────────────────────────────────────

function estimateSize(node: ChainTreeNode): { width: number; height: number } {
  const level = node.level ?? 0;
  const hasChildren = (node.children?.length ?? 0) > 0;
  if (level === 0) return { width: 140, height: 50 };
  if (hasChildren) return { width: 120, height: 44 };
  return { width: 110, height: 38 };
}

// ─────────────────────────────────────────────────────────────
// 计算全展开时的最大画布高度（用于初始化容器，折叠时保持此高度不变）
// ─────────────────────────────────────────────────────────────

function computeMaxCanvasHeight(
  node: ChainTreeNode,
  config: ChainLayoutConfig,
  depth = 0,
): { maxDepth: number; maxY: number } {
  const { nodeHeight, layerPadding, canvasMargin } = config;
  const children = node.children ?? [];

  if (children.length === 0) {
    return { maxDepth: depth, maxY: canvasMargin + nodeHeight / 2 };
  }

  const childResults = children.map(c => computeMaxCanvasHeight(c, config, depth + 1));
  const maxChild = childResults.reduce((a, b) => (b.maxY > a.maxY ? b : a));

  // 该节点的子节点区域下边界
  const childTotalH = childResults.reduce((sum, r) => sum + r.maxY, 0) + (children.length - 1) * layerPadding;
  const nodeY = maxChild.maxY - childTotalH / 2;
  const maxY = Math.max(nodeY + nodeHeight / 2, maxChild.maxY);

  return { maxDepth: Math.max(depth, maxChild.maxDepth), maxY };
}

// ─────────────────────────────────────────────────────────────
// 核心布局算法
// ─────────────────────────────────────────────────────────────

/**
 * 通用产业链树布局（Reingold-Tilford 变体）
 *
 * 第一遍：bottom-up，计算每个节点的 subtreeHeight（可见子树总高度）
 * 第二遍：top-down，根节点 Y = canvasMargin + rootSubtreeH/2，
 *         子节点 Y = 父节点 Y + (index偏移) × nodeHeight
 *
 * @param treeData     产业链树数据
 * @param collapsedMap 折叠状态（nodeId → boolean）
 * @param config       布局参数
 * @param chainMeta    链名称元数据
 * @param themeColors  主题颜色
 * @param collapsedLevels 列折叠状态：depth → 是否折叠（折叠后整层节点隐藏）
 */
export function computeChainLayout(
  treeData: ChainTreeNode,
  collapsedMap: Record<string, boolean>,
  config: ChainLayoutConfig = DEFAULT_LAYOUT_CONFIG,
  chainMeta?: { name: string },
  themeColors?: { mapArea: string; mapArea2: string; textWhite: string; mapBorder: string },
  /** 列折叠状态：depth → 是否折叠（折叠后整层节点隐藏） */
  collapsedLevels?: Record<number, boolean>,
): ChainLayoutResult {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const hiddenNodeIds = new Set<string>();
  const layoutInfo = new Map<string, LayoutInfo>();
  const { levelWidth, nodeHeight, layerPadding, canvasMargin } = config;

  // ── 计算全展开时的画布高度（用于初始化容器，不受折叠影响）──
  const { maxY: maxYAll } = computeMaxCanvasHeight(treeData, config);
  const maxCanvasHeight = maxYAll + canvasMargin;

  // ── 收集折叠节点的隐藏子树 ─────────────────────────────────
  function collectHidden(node: ChainTreeNode) {
    (node.children ?? []).forEach(child => {
      hiddenNodeIds.add(child.nodeId);
      collectHidden(child);
    });
  }

  // ── 第一遍：bottom-up，计算 subtreeHeight ──────────────────
  // 同时构建 layoutInfo 的 nodeId / depth 基础字段
  function computeHeight(node: ChainTreeNode, depth: number): number {
    const isCollapsed = collapsedMap[node.nodeId] ?? false;
    if (isCollapsed) { collectHidden(node); }

    const children = (isCollapsed ? [] : node.children ?? []);
    const { height } = estimateSize(node);

    if (children.length === 0) {
      layoutInfo.set(node.nodeId, { nodeId: node.nodeId, depth, y: 0, subtreeHeight: height });
      return height;
    }

    // 递归计算每个可见子节点的高度
    const childHeights = children.map(c => computeHeight(c, depth + 1));
    const totalChildrenH = childHeights.reduce((a, b) => a + b, 0);
    const totalPadding = (children.length - 1) * layerPadding;
    const subtreeH = Math.max(height, totalChildrenH + totalPadding);

    layoutInfo.set(node.nodeId, { nodeId: node.nodeId, depth, y: 0, subtreeHeight: subtreeH });
    return subtreeH;
  }

  const rootSubtreeH = computeHeight(treeData, 0);

  // ── 第二遍：top-down，分配 Y 坐标 ─────────────────────────
  // 使用 cursor 累加策略：每个兄弟的 Y 由前面所有兄弟的实际高度决定
  function assignY(node: ChainTreeNode, childStartY: number): void {
    const info = layoutInfo.get(node.nodeId)!;
    const isCollapsed = collapsedMap[node.nodeId] ?? false;
    const children = node.children ?? [];

    // 节点 Y = childStartY（父节点已居中于子树，子节点起点作为参数传入）
    info.y = childStartY;

    if (isCollapsed || children.length === 0) return;

    // 计算子节点总高度，子节点起点 = childStartY - totalChildrenH / 2（使节点居中于子树）
    const childHeights = children.map(c => layoutInfo.get(c.nodeId)?.subtreeHeight ?? nodeHeight);
    const childTotalH = childHeights.reduce((a, b) => a + b, 0);
    const childTotalPad = (children.length - 1) * layerPadding;
    const childY0 = childStartY - (childTotalH + childTotalPad) / 2;

    // 累加偏移：为每个子节点分配 Y
    let cursor = childY0;
    children.forEach((child) => {
      const childSubtreeH = layoutInfo.get(child.nodeId)?.subtreeHeight ?? nodeHeight;
      layoutInfo.get(child.nodeId)!.y = cursor + childSubtreeH / 2;
      edges.push({ source: node.name, target: child.name });
      assignY(child, cursor + childSubtreeH / 2);
      cursor += childSubtreeH + layerPadding;
    });
  }

  // ── 根节点位置：垂直居中于画布高度 ─────────────────────────
  // 确保根节点在画布垂直中央，便于初始查看
  const rootY = Math.max(canvasMargin + 80, maxCanvasHeight / 2);
  layoutInfo.get(treeData.nodeId)!.y = rootY;

  // 从根节点向下递归分配子节点 Y 坐标
  (treeData.children ?? []).forEach(child => {
    edges.push({ source: treeData.name, target: child.name });
    const childSubtreeH = layoutInfo.get(child.nodeId)?.subtreeHeight ?? nodeHeight;
    layoutInfo.get(child.nodeId)!.y = rootY + childSubtreeH / 2;
    assignY(child, rootY + childSubtreeH / 2);
  });

  // ── 第三遍：生成 ECharts 节点数据 ──────────────────────────
  function generateNodes(node: ChainTreeNode) {
    const isCollapsed = collapsedMap[node.nodeId] ?? false;
    const children = node.children ?? [];
    const info = layoutInfo.get(node.nodeId)!;
    const { depth, y } = info;
    const { width, height } = estimateSize(node);
    const x = canvasMargin + depth * levelWidth;

    const isRoot = node.level === 0;
    const isCore = node.cat === '核心';
    const isEquip = node.cat === '装备';
    const hasChildren = children.length > 0;

    const borderColor = isCore ? '#00E676' : isEquip ? '#FAAD14' : '#3B82F6';
    const actColor = node.activity >= 85 ? '#00E676' : node.activity >= 70 ? '#FAAD14' : '#FF4D4F';
    const labelFontSize = isRoot ? 14 : isCore ? 13 : hasChildren ? 12 : 11;
    const bgColor = themeColors?.mapArea ?? '#1a1a2e';
    const bgColor2 = themeColors?.mapArea2 ?? '#16213e';
    const textWhite = themeColors?.textWhite ?? '#e0e0e0';

    nodes.push({
      name: node.name,
      nodeId: node.nodeId,
      value: node.value,
      activity: node.activity,
      cat: node.cat ?? '',
      depth,
      collapsed: isCollapsed,
      x,
      y,
      width,
      height,
      draggable: true,
      itemStyle: {
        color: isRoot ? bgColor : bgColor2,
        borderColor,
        borderWidth: isCore ? 3 : isEquip ? 2.5 : 1.5,
        shadowBlur: isCore ? 20 : 8,
        shadowColor: borderColor + '40',
        borderRadius: 6,
      },
      label: {
        show: true,
        position: 'inside',
        formatter: isRoot
          ? `{title|${chainMeta?.name ?? '产业链'}}`
          : [
              `{title|${node.name}}`,
              `{scale|${node.value}亿} {dot|●} {act|景气 ${node.activity}%}${hasChildren ? ` {toggle|${isCollapsed ? '▶' : '▼'}}` : ''}`,
            ].join('\n'),
        rich: {
          title: {
            fontSize: labelFontSize,
            fontWeight: 'bold',
            color: isCore ? '#00E676' : isEquip ? '#FAAD14' : textWhite,
            backgroundColor: 'rgba(0,0,0,0)',
            padding: [4, 6, 0, 6],
            align: 'center',
          },
          scale: {
            fontSize: hasChildren ? 9 : 10,
            color: '#67e8f9',
            backgroundColor: 'rgba(0,0,0,0)',
            padding: [1, 6, 0, 6],
            align: 'center',
          },
          dot: {
            fontSize: 6,
            color: themeColors?.mapBorder ?? '#555',
            backgroundColor: 'rgba(0,0,0,0)',
            padding: [0, 3, 0, 3],
            align: 'center',
          },
          act: {
            fontSize: hasChildren ? 9 : 10,
            color: actColor,
            backgroundColor: 'rgba(0,0,0,0)',
            padding: [1, 6, 4, 6],
            align: 'center',
          },
          toggle: {
            fontSize: 10,
            fontWeight: 'bold',
            color: '#F59E0B',
            backgroundColor: 'rgba(0,0,0,0)',
            padding: [1, 4, 4, 2],
            align: 'left',
          },
        },
        verticalAlign: 'middle',
        align: 'center',
      },
      symbol: 'roundRect',
      symbolKeepAspect: true,
      symbolSize: [width, height],
    });

    if (!isCollapsed) children.forEach(generateNodes);
  }

  generateNodes(treeData);

  // ── 过滤：移除被折叠节点及其悬空边（同时过滤折叠的列层级）─────
  const visibleNodes = nodes.filter(n =>
    !hiddenNodeIds.has(n.nodeId) && !(collapsedLevels?.[n.depth] ?? false),
  );
  const visibleEdges = edges.filter(e =>
    visibleNodes.some(n => n.name === e.source) &&
    visibleNodes.some(n => n.name === e.target),
  );

  // ── 根节点居中：当只有根节点可见时（其他层级全折叠），将根节点 Y 移到画布垂直居中 ──
  // 逻辑：计算当前可见节点的 Y 范围，取中点，偏移所有节点使中点位于 canvasHeight/2
  if (visibleNodes.length > 0) {
    let minY = Infinity, maxY = -Infinity;
    visibleNodes.forEach(n => {
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
    const contentMid = (minY + maxY) / 2;
    const targetMid = (maxY + canvasMargin) / 2; // canvasHeight = maxY + canvasMargin
    const yShift = targetMid - contentMid;
    if (Math.abs(yShift) > 1) {
      visibleNodes.forEach(n => { n.y += yShift; });
      // 同时更新 edges 中记录的目标节点 Y（用于折线控制点），用 edges 对象引用修改
      // 但 edges 的 source/target 仅为名称引用，ECharts 会根据节点 name 匹配实际 x/y，所以无需修改 edges
    }
  }

  // ── 层级色带数据（基于可见节点，折叠层级不生成色带）────────────
  const depthStats = new Map<number, { yMin: number; yMax: number; color: string; label: string }>();
  visibleNodes.forEach(n => {
    const existing = depthStats.get(n.depth);
    if (existing) {
      existing.yMin = Math.min(existing.yMin, n.y - n.height / 2);
      existing.yMax = Math.max(existing.yMax, n.y + n.height / 2);
    } else {
      const borderColor = n.itemStyle?.borderColor as string ?? '#3B82F6';
      depthStats.set(n.depth, { yMin: n.y - n.height / 2, yMax: n.y + n.height / 2, color: borderColor, label: '' });
    }
  });
  const levelBands = Array.from(depthStats.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([depth, stats]) => ({ depth, ...stats }));

  // ── 画布尺寸（仅包含可见层级）──────────────────────────────────
  let maxY = 0, maxDepth = 0;
  visibleNodes.forEach(n => {
    if (n.y > maxY) maxY = n.y;
    if (n.depth > maxDepth) maxDepth = n.depth;
  });
  const canvasHeight = maxY + canvasMargin;
  // 优先使用 config.canvasWidth 固定宽度，否则按层级数自动计算
  const canvasWidth = config.canvasWidth ?? (canvasMargin * 2 + (maxDepth + 1) * levelWidth + 80);

  return { nodes: visibleNodes, edges: visibleEdges, canvasWidth, canvasHeight, maxCanvasHeight, levelBands };
}
