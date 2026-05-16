/**
 * 产业链结构化沙盘页面
 * 按 round22 需求重新构建
 */

import React, { useEffect, useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { GitBranch, Network, X, ChevronLeft, ChevronRight, ChevronRightCircle, Users2, TrendingUp } from 'lucide-react';
import { useDataStore } from '../store/data';
import { useChartTheme } from '../hooks/useChartTheme';
import { computeChainLayout, DEFAULT_LAYOUT_CONFIG } from '../utils/chainLayout';
import type { ChainTreeNode, ChainNode } from '../data/types';
import type { IndustryChain, Opportunity } from '../data/types';

// ─────────────────────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────────────────────

const CAT_COLOR: Record<string, string> = {
  '上游': '#3B82F6', '中游': '#00E676', '下游': '#A78BFA',
  '核心': '#00E676', '装备': '#FAAD14', '基础材料': '#06B6D4',
  '上游原材料': '#3B82F6', '核心零部件': '#00E676', '关键子系统': '#A78BFA',
  '整机制造': '#F97316', '终端应用': '#EC4899', '研发支撑': '#6B7280',
};

function activityColor(activity: number): string {
  if (activity >= 85) return '#00E676';
  if (activity >= 70) return '#FAAD14';
  return '#EF4444';
}

function findNodeInTree(tree: ChainTreeNode | null, nodeId: string): ChainTreeNode | null {
  if (!tree) return null;
  if (tree.nodeId === nodeId) return tree;
  for (const child of tree.children ?? []) {
    const found = findNodeInTree(child, nodeId);
    if (found) return found;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// 子组件：Banner
// ─────────────────────────────────────────────────────────────

interface BannerProps {
  chains: IndustryChain[];
  currentChainId: string;
  onChainChange: (id: string) => void;
  viewMode: 'tree' | 'graph';
  onViewModeChange: (mode: 'tree' | 'graph') => void;
  textWhite: string;
  labelLight: string;
  labelColor: string;
  mapArea: string;
  mapArea2: string;
  mapBorder: string;
  accent: string;
}

function Banner({ chains, currentChainId, onChainChange, viewMode, onViewModeChange, textWhite, labelLight, labelColor, mapArea, mapArea2, mapBorder, accent }: BannerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ borderColor: mapBorder, backgroundColor: mapArea2 }}>
      <h2 className="text-lg font-bold" style={{ color: textWhite }}>产业链</h2>

      <select
        value={currentChainId}
        onChange={e => onChainChange(e.target.value)}
        className="px-3 py-1.5 rounded text-sm font-medium border"
        style={{ backgroundColor: mapArea, borderColor: mapBorder, color: textWhite }}
      >
        {chains.map(c => (
          <option key={c.id} value={c.id} style={{ backgroundColor: mapArea }}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1 ml-2 px-2 py-1 rounded border" style={{ borderColor: mapBorder }}>
        <button
          onClick={() => onViewModeChange('tree')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-all"
          style={{
            backgroundColor: viewMode === 'tree' ? accent : 'transparent',
            color: viewMode === 'tree' ? '#fff' : labelLight,
          }}
        >
          <GitBranch size={14} />
          树形图
        </button>
        <button
          onClick={() => onViewModeChange('graph')}
          className="flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-all"
          style={{
            backgroundColor: viewMode === 'graph' ? accent : 'transparent',
            color: viewMode === 'graph' ? '#fff' : labelLight,
          }}
        >
          <Network size={14} />
          斥力图
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 子组件：右部信息栏
// ─────────────────────────────────────────────────────────────

interface InfoPanelProps {
  visible: boolean;
  collapsed: boolean;
  onCollapse: () => void;
  children: React.ReactNode;
  mapBorder: string;
  mapArea: string;
  mapArea2: string;
  labelLight: string;
}

function InfoPanel({ visible, collapsed, onCollapse, children, mapBorder, mapArea, mapArea2, labelLight }: InfoPanelProps) {
  if (!visible) return null;

  return (
    <div
      className="flex flex-col h-full border-l transition-all duration-300"
      style={{
        width: collapsed ? '40px' : '20%',
        minWidth: collapsed ? '40px' : '240px',
        maxWidth: collapsed ? '40px' : '360px',
        borderColor: mapBorder,
        backgroundColor: mapArea2,
      }}
    >
      <button
        onClick={onCollapse}
        className="flex items-center justify-center w-full py-2 border-b transition-colors hover:opacity-70"
        style={{ borderColor: mapBorder, backgroundColor: mapArea }}
        title={collapsed ? '展开信息栏' : '收起信息栏'}
      >
        {collapsed ? (
          <ChevronLeft size={14} style={{ color: labelLight }} />
        ) : (
          <ChevronRight size={14} style={{ color: labelLight }} />
        )}
      </button>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 子组件：节点信息面板
// ─────────────────────────────────────────────────────────────

interface NodeInfoPanelProps {
  node: ChainNode | null;
  firms: Array<{ firmId: string; name?: string; role: string; asset: string; manager?: string }>;
  mapBorder: string;
  mapArea: string;
  textWhite: string;
  labelLight: string;
}

function NodeInfoPanel({ node, firms, mapBorder, mapArea, textWhite, labelLight }: NodeInfoPanelProps) {
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const stageLabel: Record<string, string> = { upstream: '上游', midstream: '中游', downstream: '下游', terminal: '终端' };
  const stageColor: Record<string, string> = { upstream: '#3B82F6', midstream: '#00E676', downstream: '#A78BFA', terminal: '#F59E0B' };

  if (!node) return null;

  const totalPages = Math.ceil(firms.length / pageSize);
  const paged = firms.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold" style={{ color: textWhite }}>{node.name}</h3>

      <div className="flex flex-wrap gap-2 mb-2">
        <span className="px-2 py-0.5 rounded text-xs font-medium border"
          style={{ borderColor: (stageColor[node.stage] || '#6B7280') + '60', backgroundColor: (stageColor[node.stage] || '#6B7280') + '20', color: stageColor[node.stage] || '#6B7280' }}>
          {stageLabel[node.stage] || node.stage}
        </span>
        <span className="px-2 py-0.5 rounded text-xs font-medium border"
          style={{ borderColor: (node.activity >= 85 ? '#00E676' : node.activity >= 70 ? '#F59E0B' : '#EF4444') + '60', backgroundColor: (node.activity >= 85 ? '#00E676' : node.activity >= 70 ? '#F59E0B' : '#EF4444') + '20', color: node.activity >= 85 ? '#00E676' : node.activity >= 70 ? '#F59E0B' : '#EF4444' }}>
          景气 {node.activity}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded border" style={{ borderColor: mapBorder, backgroundColor: mapArea }}>
          <div style={{ color: labelLight }}>规模</div>
          <div style={{ color: textWhite }}>{node.scale}亿</div>
        </div>
        <div className="p-2 rounded border" style={{ borderColor: mapBorder, backgroundColor: mapArea }}>
          <div style={{ color: labelLight }}>银行占比</div>
          <div style={{ color: textWhite }}>{node.bankRatio}%</div>
        </div>
      </div>

      {node.description && (
        <p className="text-xs mt-2" style={{ color: labelLight }}>{node.description}</p>
      )}

      {firms.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold flex items-center gap-1" style={{ color: labelLight }}>
              <Users2 size={12} />相关企业
            </h4>
            <span className="text-xs" style={{ color: labelLight }}>{firms.length}家</span>
          </div>
          <div className="space-y-2">
            {paged.map((firm, i) => (
              <div key={firm.firmId || i} className="p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                style={{ borderColor: mapBorder, backgroundColor: mapArea }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: textWhite }}>{firm.name || firm.firmId}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#00E67620', color: '#00E676' }}>{firm.role}</span>
                </div>
                <div className="flex gap-2 text-xs" style={{ color: labelLight }}>
                  <span>资产: {firm.asset}</span>
                  {firm.manager && <span>经理: {firm.manager}</span>}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1 rounded border text-xs transition-colors disabled:opacity-30" style={{ borderColor: mapBorder, color: labelLight }}>
                <ChevronLeft size={12} />
              </button>
              <span className="text-xs" style={{ color: labelLight }}>{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1 rounded border text-xs transition-colors disabled:opacity-30" style={{ borderColor: mapBorder, color: labelLight }}>
                <ChevronRightCircle size={12} />
              </button>
            </div>
          )}
        </div>
      )}

      {firms.length === 0 && (
        <div className="text-center py-6 text-xs" style={{ color: labelLight }}>暂无关联企业</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 子组件：商机面板
// ─────────────────────────────────────────────────────────────

interface OpportunityPanelProps {
  opportunities: Opportunity[];
  onClose: () => void;
  mapBorder: string;
  mapArea: string;
  textWhite: string;
  labelLight: string;
}

function OpportunityPanel({ opportunities, onClose, mapBorder, mapArea, textWhite, labelLight }: OpportunityPanelProps) {
  const statusColor = (status?: string) => {
    const map: Record<string, string> = { '发现': '#6B7280', '跟进中': '#3B82F6', '方案沟通': '#8B5CF6', '尽调中': '#F59E0B', '审批中': '#F97316', '已签约': '#00E676', '已失效': '#EF4444' };
    return map[status || ''] || '#6B7280';
  };
  const levelColor = (level?: string) => {
    if (level === 'high') return '#EF4444';
    if (level === 'medium') return '#F59E0B';
    return '#6B7280';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-1" style={{ color: textWhite }}>
          <TrendingUp size={14} />商机信息
        </h3>
        <button onClick={onClose} className="p-1 rounded hover:opacity-70 transition-opacity" style={{ color: labelLight }}>
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {opportunities.map(opp => (
          <div key={opp.id} className="p-3 rounded border"
            style={{ borderColor: levelColor(opp.level) + '40', backgroundColor: mapArea }}>
            <div className="flex items-start justify-between mb-1.5">
              <span className="text-sm font-medium" style={{ color: textWhite }}>{opp.title || '未命名商机'}</span>
              <span className="text-xs px-1.5 py-0.5 rounded shrink-0"
                style={{ backgroundColor: statusColor(opp.status) + '20', color: statusColor(opp.status) }}>
                {opp.status}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: labelLight }}>{opp.desc}</p>
            <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: labelLight }}>
              <div><span style={{ color: textWhite }}>{opp.firmName || '—'}</span></div>
              <div>金额: <span style={{ color: '#67E8F9' }}>{opp.amount || '—'}</span></div>
              <div>产品: {opp.product || '—'}</div>
              <div>概率: <span style={{ color: '#67E8F9' }}>{opp.probability ? opp.probability + '%' : '—'}</span></div>
            </div>
            {opp.nextActionDate && (
              <div className="mt-1.5 text-xs" style={{ color: labelLight }}>
                下步: <span style={{ color: textWhite }}>{opp.nextActionDate}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────────────────────

export default function IndustryChain() {
  const { mapArea, mapArea2, mapBorder, textWhite, labelLight, labelColor, tooltipBg, tooltipBorder, tooltipText, accent, yellow } = useChartTheme();

  // 从 store 读取数据（各自独立 selector，避免不必要重渲染）
  const chains = useDataStore(s => s.chains);
  const allChainNodes = useDataStore(s => s.chainNodes);
  const allChainRelations = useDataStore(s => s.chainNodeRelations);
  const allTreeData = useDataStore(s => s.chainTreeData);
  const allChainFirms = useDataStore(s => s.chainFirms);
  const opportunities = useDataStore(s => s.opportunities);
  const firms = useDataStore(s => s.firms);

  // 状态
  const [currentChainId, setCurrentChainId] = useState<string>('chain_power_battery');
  const [viewMode, setViewMode] = useState<'tree' | 'graph'>('tree');
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  // 图例显示状态：category -> 是否显示
  const [legendVisible, setLegendVisible] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.keys(CAT_COLOR).forEach(cat => { init[cat] = true; });
    return init;
  });
  // 列折叠状态：depth -> 是否折叠（折叠后该层节点和边全部隐藏）
  const [collapsedLevels, setCollapsedLevels] = useState<Record<number, boolean>>({});

  // 用 useRef 存储不会导致重渲染的依赖数据
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const currentChainIdRef = useRef(currentChainId);
  const viewModeRef = useRef(viewMode);
  const collapsedMapRef = useRef<Record<string, boolean>>({});
  const tcRef = useRef({ mapArea, mapArea2, mapBorder, textWhite, labelLight, tooltipBg, tooltipBorder, tooltipText });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const legendVisibleRef = useRef(legendVisible);
  const collapsedLevelsRef = useRef(collapsedLevels);

  // 标记容器是否已渲染完成（用于等待 DOM 尺寸就绪）
  const [containerReady, setContainerReady] = useState(false);

  // 同步 ref
  useEffect(() => { currentChainIdRef.current = currentChainId; }, [currentChainId]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { tcRef.current = { mapArea, mapArea2, mapBorder, textWhite, labelLight, tooltipBg, tooltipBorder, tooltipText }; }, [mapArea, mapArea2, mapBorder, textWhite, labelLight, tooltipBg, tooltipBorder, tooltipText]);
  useEffect(() => { legendVisibleRef.current = legendVisible; }, [legendVisible]);
  useEffect(() => { collapsedLevelsRef.current = collapsedLevels; }, [collapsedLevels]);

  // 等待 DOM 渲染完成后标记容器就绪
  useLayoutEffect(() => {
    const timer = requestAnimationFrame(() => {
      if (chartRef.current?.clientWidth && chartRef.current?.clientHeight) {
        setContainerReady(true);
      } else {
        // 再等一帧
        const timer2 = requestAnimationFrame(() => setContainerReady(true));
        return () => cancelAnimationFrame(timer2);
      }
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // 当前产业链数据（用 useMemo 确保稳定性）
  const currentChain = useMemo(() => chains.find(c => c.id === currentChainId), [chains, currentChainId]);
  const currentTreeData = useMemo(() => allTreeData[currentChainId] || null, [allTreeData, currentChainId]);
  const currentNodes = useMemo(() => allChainNodes.filter(n => n.chainId === currentChainId), [allChainNodes, currentChainId]);
  const currentRelations = useMemo(() => allChainRelations.filter(r => r.chainId === currentChainId), [allChainRelations, currentChainId]);
  const currentFirms = useMemo(() => allChainFirms[currentChainId] || [], [allChainFirms, currentChainId]);
  const selectedChainNode = useMemo(() => currentNodes.find(n => n.id === selectedNodeId) || null, [currentNodes, selectedNodeId]);

  // 选中节点关联的企业
  const selectedNodeFirms = useMemo(() => {
    if (!selectedNodeId) return [];
    return currentFirms.filter(f => f.nodeId === selectedNodeId).map(f => {
      const firmData = firms.find(item => item.id === f.firmId);
      return { firmId: f.firmId, name: firmData?.name || f.firmId, role: f.role, asset: f.asset, manager: f.manager };
    });
  }, [selectedNodeId, currentFirms, firms]);

  // 选中节点关联的商机（通过企业链节点关联）
  const selectedNodeOpportunities = useMemo(() => {
    if (!selectedNodeId) return [];
    const nodeIds = new Set([selectedNodeId]);
    return opportunities.filter(opp => {
      if (!opp.firmId) return false;
      const firm = firms.find(f => f.id === opp.firmId);
      if (!firm) return false;
      return firm.chainNodeIds?.some(id => nodeIds.has(id));
    });
  }, [selectedNodeId, opportunities, firms]);

  // ── ECharts 初始化 Effect（只执行一次）─────────────────────
  // 用途：初始化图表实例，设置 resize 监听（仅在斥力图时需要，渲染时显式设尺寸会跳过）
  useEffect(() => {
    if (!chartRef.current || chartInstanceRef.current) return;

    // 确保 DOM 已渲染（宽高 > 0）
    const container = chartRef.current;
    if (!container.clientWidth || !container.clientHeight) {
      // DOM 还没渲染好，等待下一帧
      const timer = requestAnimationFrame(() => {
        if (!chartInstanceRef.current) {
          const chart = echarts.init(chartRef.current!);
          chartInstanceRef.current = chart;
          setupChartInstance(chart);
        }
      });
      return () => { cancelAnimationFrame(timer); };
    }

    const chart = echarts.init(container);
    chartInstanceRef.current = chart;
    setupChartInstance(chart);
  }, []);

  // 设置图表实例的 resize 监听
  function setupChartInstance(chart: ECharts) {
    const ro = new ResizeObserver(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (explicitSizeSetRef.current) return;
        chart.resize();
      }, 200);
    });
    if (chartRef.current) ro.observe(chartRef.current);

    const prevDispose = chart.dispose.bind(chart);
    chart.dispose = () => {
      ro.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
      prevDispose();
    };
  }

  // 渲染函数显式设置 ECharts 尺寸后，写入此标志，阻止 ResizeObserver 的 resize 覆盖
  const explicitSizeSetRef = useRef(false);

  // ── 构建层级色带背景和折叠按钮（ECharts graphic）─────────────────
  function buildLevelGraphicElements(
    layout: ReturnType<typeof computeChainLayout>,
    tc: { mapArea2: string; mapBorder: string; textWhite: string; labelLight: string },
    collapsedLevels: Record<number, boolean>,
    onToggle: (depth: number) => void,
    ): Record<string, unknown>[] {
    const elements: Record<string, unknown>[] = [];
    const { levelBands } = layout;
    const levelNames: Record<number, string> = {
      0: '根节点', 1: '上游', 2: '中游', 3: '下游', 4: '终端', 5: '其他',
    };

    levelBands.forEach(band => {
      const xStart = band.depth * 220 + 30; // 对齐节点 X 坐标
      const xEnd = xStart + 140;
      const yStart = band.yMin - 12;
      const yEnd = band.yMax + 12;
      const isCollapsed = collapsedLevels[band.depth] ?? false;
      const labelName = levelNames[band.depth] ?? `层级${band.depth}`;
      const bgAlpha = isCollapsed ? '0' : '12'; // 折叠时色带消失

      // 半透明色带背景
      elements.push({
        type: 'rect',
        shape: { x: xStart, y: yStart, width: xEnd - xStart, height: yEnd - yStart },
        style: {
          fill: band.color + bgAlpha,
          stroke: band.color + '30',
          lineWidth: 1,
        },
        z: 0,
      });

      // 左侧标签（色带外侧可见）
      elements.push({
        type: 'text',
        style: {
          x: xStart - 4,
          y: (yStart + yEnd) / 2,
          text: labelName,
          fill: band.color,
          fontSize: 10,
          fontWeight: 'bold',
          textAlign: 'right',
          textVerticalAlign: 'middle',
        },
        z: 1,
      });

      // 折叠按钮（色带右上角，点击调用 onToggle）
      const btnX = xEnd + 4;
      const btnY = yStart;
      const btnText = isCollapsed ? '▶' : '◀';
      elements.push({
        type: 'group',
        x: btnX,
        y: btnY,
        children: [{
          type: 'rect',
          shape: { cx: 10, cy: 10, r: 10 },
          style: {
            fill: '#1a1a2e',
            stroke: band.color,
            lineWidth: 1.5,
            cursor: 'pointer',
          },
          onclick: () => onToggle(band.depth),
        }, {
          type: 'text',
          style: {
            x: 10,
            y: 10,
            text: btnText,
            fill: band.color,
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
            textVerticalAlign: 'middle',
          },
          onclick: () => onToggle(band.depth),
        }],
      });
    });

    return elements;
  }

  // ── 节点尺寸配置（斥力图）统一缩小至 80%────────────────────────
  const GRAPH_NODE_SIZE_RATIO = 0.8;

  /** ECharts ZRender internal shape element (opaque internals, accessed via getZr) */
  type ZrShapeElement = {
    $el?: { width?: number; height?: number; setAttribute?: (k: string, v: string) => void };
  };
  type ZrStorageRoot = { allElements: ZrShapeElement[] };
  type ZrStorage = { getRoot: () => ZrStorageRoot };
  type ZRender = { storage: ZrStorage };
  type EChartsInstance = { getZr: () => ZRender };

  // ── 渲染函数（供两个 Effect 调用）────────────────────────────

  function renderTreeChart() {
    const chart = chartInstanceRef.current;
    const tc = tcRef.current;
    const treeData = currentTreeData;
    const collapsed = collapsedMapRef.current;
    const chainName = currentChain?.name || '';

    if (!chart || !treeData) return;

    // 获取容器实际宽高，使画布与容器对齐（不产生水平溢出）
    const containerWidth = chartRef.current?.clientWidth ?? 846;
    const containerHeight = chartRef.current?.clientHeight ?? 554;

    const layout = computeChainLayout(
      treeData,
      collapsed,
      { ...DEFAULT_LAYOUT_CONFIG, canvasWidth: containerWidth },
      { name: chainName },
      { mapArea: tc.mapArea, mapArea2: tc.mapArea2, textWhite: tc.textWhite, mapBorder: tc.mapBorder },
      collapsedLevelsRef.current,
    );

    // 图例过滤：隐藏某些分类的节点（斥力图和树形图共用）
    const legendVis = legendVisibleRef.current;

    // 设置 scroll wrapper 的画布尺寸，取"树展开所需高度"与"容器实际高度"的较大值
    // 这样树小时画布撑满容器，树大时超出容器可滚动
    const canvasHeight = Math.max(layout.maxCanvasHeight, containerHeight);

    explicitSizeSetRef.current = true;
    if (chartRef.current) {
      chartRef.current.style.width = `${layout.canvasWidth}px`;
      chartRef.current.style.height = `${canvasHeight}px`;

      requestAnimationFrame(() => {
        if (!chartInstanceRef.current) return;

        // 第一个 RAF：强制 resize，触发 layout 计算
        chart.resize({ width: layout.canvasWidth, height: canvasHeight });

        requestAnimationFrame(() => {
          if (!chartInstanceRef.current) return;

          chart.setOption({
          backgroundColor: 'transparent',
          tooltip: {
            backgroundColor: tc.tooltipBg,
            borderColor: tc.tooltipBorder,
            textStyle: { color: tc.tooltipText, fontSize: 12 },
            formatter: (p: { name?: string; data?: { activity?: number; value?: number; name?: string }; dataType?: string }) => {
              if (p.dataType !== 'node' || !p.data) return '';
              const actColor = activityColor(p.data.activity || 0);
              return `<div style="font-size:12px"><b style="color:${tc.textWhite}">${p.data.name || p.name || ''}</b><br/><span style="color:${actColor}">景气 ${p.data.activity}%</span><br/><span style="color:${tc.labelLight}">规模 ${p.data.value}亿</span></div>`;
            },
          },
          xAxis: { show: false, min: -200, max: 'dataMax' + 400 },
          yAxis: { show: false, min: -200, max: 'dataMax' + 400 },
          series: [{
            type: 'graph',
            layout: 'none',
            coordinateSystem: 'cartesian2d',
            roam: true,
            silent: false,
            data: layout.nodes.map(n => ({
              name: n.name, nodeId: n.nodeId, value: n.value,
              activity: n.activity, cat: n.cat, x: n.x, y: n.y,
              draggable: true, itemStyle: n.itemStyle, label: n.label,
              symbol: n.symbol, symbolSize: n.symbolSize,
              opacity: legendVis[n.cat] !== false ? 1 : 0.08,
            })),
            links: layout.edges
              .filter(e => {
                const srcHidden = legendVis[layout.nodes.find(n => n.name === e.source)?.cat ?? ''] === false;
                const tgtHidden = legendVis[layout.nodes.find(n => n.name === e.target)?.cat ?? ''] === false;
                return !srcHidden && !tgtHidden;
              })
              .map(e => ({
                source: e.source, target: e.target,
                lineStyle: { color: tc.mapBorder, width: 1.5, curveness: 0.1, opacity: 0.6 },
                symbol: ['none', 'arrow'], symbolSize: [6, 10],
              })),
            lineStyle: { opacity: 0.6 },
            emphasis: { lineStyle: { width: 3, opacity: 1 }, itemStyle: { shadowBlur: 20, borderWidth: 3 } },
            edgeLabel: { show: false },
          }],
          graphic: buildLevelGraphicElements(layout, tc, collapsedLevelsRef.current, (depth: number) => {
            setCollapsedLevels(prev => ({ ...prev, [depth]: !prev[depth] }));
          }),
          }, { notMerge: true });

          // 渲染完成后，将可视区域滚动到树的中上部
          setTimeout(() => {
            if (chartRef.current) {
              chartRef.current.scrollTop = 0;
            }
          }, 150);

          chart.off('click');
          chart.on('click', (params: unknown) => {
            const p = params as { dataType?: string; data?: { nodeId?: string } };
            if (p.dataType === 'node' && p.data?.nodeId) {
              const nodeId = p.data.nodeId;
              const nodeInTree = findNodeInTree(treeData, nodeId);
              if (nodeInTree && (nodeInTree.children?.length ?? 0) > 0) {
                collapsedMapRef.current = { ...collapsedMapRef.current, [nodeId]: !collapsedMapRef.current[nodeId] };
                renderTreeChart();
              }
              if (infoPanelCollapsedRef.current) {
                setInfoPanelCollapsed(false);
              }
              setSelectedNodeId(nodeId);
            }
          });

          chart.off('mouseup');
          chart.on('mouseup', (params: unknown) => {
            const p = params as { data?: { x?: number; y?: number; nodeId?: string } };
            if (p.data?.nodeId && p.data?.x !== undefined && p.data?.y !== undefined) {
              const nodeId = p.data.nodeId;
              const x = p.data.x;
              const y = p.data.y;
              console.log('[树形图] 节点拖拽完成:', nodeId, '位置:', x.toFixed(0), y.toFixed(0));
            }
          });
        });
      });
    }
  }

  // 用 ref 存储 currentNodes 避免闭包问题
  const currentNodesRef = useRef(currentNodes);
  useEffect(() => { currentNodesRef.current = currentNodes; }, [currentNodes]);

  function renderGraphChart() {
    const chart = chartInstanceRef.current;
    const tc = tcRef.current;
    const nodes = currentNodesRef.current;
    const relations = currentRelations;
    const legendVis = legendVisibleRef.current;

    if (!chart || nodes.length === 0) {
      console.warn('[斥力图] 没有节点数据');
      return;
    }

    // 调试：打印所有节点数据
    console.log('[斥力图] 原始数据:', { nodeCount: nodes.length, relationCount: relations.length, legendVisible: legendVis });

    // 根据图例状态过滤节点
    const visibleNodes = nodes.filter(n => {
      const cat = n.graphCategory || n.stage;
      return legendVis[cat] !== false;
    });

    // 构建图谱节点数据（可见节点）
    const gNodes = visibleNodes.map(n => ({
      name: n.shortName || n.name,
      nodeId: n.id,
      activity: n.activity,
      cat: n.graphCategory || n.stage,
      // 增大初始间距，避免重叠
      x: n.graphX ?? Math.random() * 600 + 200,
      y: n.graphY ?? Math.random() * 400 + 100,
      draggable: true,
      symbolSize: (n.graphSize || 44) * GRAPH_NODE_SIZE_RATIO,
      itemStyle: {
        color: CAT_COLOR[n.graphCategory || n.stage] || '#3B82F6',
        borderColor: CAT_COLOR[n.graphCategory || n.stage] || '#3B82F6',
        borderWidth: 2, shadowBlur: 12,
        shadowColor: (CAT_COLOR[n.graphCategory || n.stage] || '#3B82F6') + '40',
        borderRadius: 6,
      },
      label: {
        show: true, position: 'inside', fontSize: 11, color: '#fff',
        formatter: (p: { data?: { name?: string; activity?: number } }) => {
          const d = p.data || {};
          return `${d.name || ''}\n景气 ${d.activity || 0}%`;
        },
      },
    }));

    // 构建图谱边数据（只包含可见节点之间的边）
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const gLinks = relations
      .filter(r => r.sourceNodeId && r.targetNodeId && visibleNodeIds.has(r.sourceNodeId) && visibleNodeIds.has(r.targetNodeId))
      .map(r => {
        const src = nodes.find(n => n.id === r.sourceNodeId);
        const tgt = nodes.find(n => n.id === r.targetNodeId);
        return {
          source: src?.shortName || src?.name || r.sourceNodeId,
          target: tgt?.shortName || tgt?.name || r.targetNodeId,
          lineStyle: { color: '#3B82F680', width: r.isPrimary ? 2 : 1, curveness: 0.15, type: r.isPrimary ? 'solid' as const : 'dashed' as const, opacity: 0.7 },
          symbol: ['none', 'arrow'], symbolSize: [5, 8],
        };
      });

    console.log('[斥力图] 渲染:', { nodeCount: gNodes.length, linkCount: gLinks.length });

    requestAnimationFrame(() => {
      if (!chartInstanceRef.current) return;
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          backgroundColor: tc.tooltipBg,
          borderColor: tc.tooltipBorder,
          textStyle: { color: tc.tooltipText, fontSize: 12 },
          formatter: (p: { name?: string; dataType?: string; data?: { activity?: number; value?: number; cat?: string; nodeId?: string } }) => {
            if (p.dataType !== 'node' || !p.data) return '';
            const node = p.data;
            return `<div style="font-size:12px"><b style="color:${tc.textWhite}">${p.name}</b><br/><span style="color:${tc.labelLight}">分类: ${node.cat}</span><br/><span style="color:${activityColor(node.activity || 0)}">景气 ${node.activity}%</span></div>`;
          },
        },
        xAxis: { show: false, min: 0, max: 2000 },
        yAxis: { show: false, min: 0, max: 1000 },
        series: [{
          type: 'graph',
          layout: 'force',
          force: {
            repulsion: 400,
            edgeLength: [150, 300],
            layoutAnimation: true,
            gravity: 0.05,
          },
          roam: true,
          zoom: 1,
          silent: false,
          data: gNodes,
          links: gLinks,
          lineStyle: { opacity: 0.7 },
          emphasis: { lineStyle: { width: 3, opacity: 1 }, itemStyle: { shadowBlur: 20, borderWidth: 3 } },
          edgeLabel: { show: false },
        }],
      }, { notMerge: true });

      chart.off('click');
      chart.on('click', (params: unknown) => {
        const p = params as { dataType?: string; data?: { nodeId?: string } };
        if (p.dataType === 'node' && p.data?.nodeId) {
          if (infoPanelCollapsedRef.current) {
            setInfoPanelCollapsed(false);
          }
          setSelectedNodeId(p.data.nodeId);
        }
      });

      chart.off('mouseup');
      chart.on('mouseup', (params: unknown) => {
        const p = params as { data?: { x?: number; y?: number; nodeId?: string } };
        if (p.data?.nodeId && p.data?.x !== undefined && p.data?.y !== undefined) {
          console.log('[斥力图] 节点拖拽完成:', p.data.nodeId, '位置:', p.data.x.toFixed(0), p.data.y.toFixed(0));
        }
      });
    });
  }

  const infoPanelCollapsedRef = useRef(infoPanelCollapsed);
  useEffect(() => { infoPanelCollapsedRef.current = infoPanelCollapsed; }, [infoPanelCollapsed]);

  // ── 视图渲染 Effect（监控 viewMode 和数据切换）────────────────────
  useEffect(() => {
    if (!chartInstanceRef.current || !containerReady) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (viewModeRef.current === 'tree') renderTreeChart();
      else renderGraphChart();
    }, 100);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [viewMode, currentChainId, currentTreeData, currentNodes, currentRelations, JSON.stringify(legendVisible), JSON.stringify(collapsedLevels), containerReady]);

  // ── 事件处理 ───────────────────────────────────────────────

  const handleChainChange = useCallback((id: string) => {
    setCurrentChainId(id);
    setSelectedNodeId(null);
    collapsedMapRef.current = {};
    setCollapsedLevels({ 1: true });
  }, []);

  const handleViewModeChange = useCallback((mode: 'tree' | 'graph') => {
    if (mode === 'graph') explicitSizeSetRef.current = false;
    setViewMode(mode);
    setSelectedNodeId(null);
  }, []);

  // 切换图例显示状态
  const toggleLegend = useCallback((cat: string) => {
    setLegendVisible(prev => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  // 信息栏是否显示
  const infoPanelVisible = selectedNodeId !== null;

  // ── 渲染 ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: '100%', backgroundColor: mapArea }}>
      <Banner
        chains={chains}
        currentChainId={currentChainId}
        onChainChange={handleChainChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        textWhite={textWhite}
        labelLight={labelLight}
        labelColor={labelColor}
        mapArea={mapArea}
        mapArea2={mapArea2}
        mapBorder={mapBorder}
        accent={accent}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 图谱区：使用 overflow-hidden 让 ECharts 的 roam 功能正常工作 */}
        <div
          className="flex-1 relative"
          style={{ backgroundColor: mapArea, overflow: 'hidden' }}
        >
          {/* 图例：可点击切换显示/隐藏，可折叠以扩大图表区域 */}
          <div className="absolute top-3 right-3 z-10 p-2 rounded border"
            style={{ backgroundColor: mapArea2 + 'CC', borderColor: mapBorder }}>
            {/* 折叠按钮行 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs" style={{ color: labelLight }}>图例</span>
              <button
                className="text-xs px-1 py-0.5 rounded border cursor-pointer"
                style={{ color: labelLight, borderColor: mapBorder, backgroundColor: 'transparent' }}
                onClick={() => setLegendCollapsed(v => !v)}
                title={legendCollapsed ? '展开图例' : '折叠图例'}
              >
                {legendCollapsed ? '▶' : '▼'}
              </button>
            </div>
            {/* 图例项 */}
            {!legendCollapsed && Object.entries(CAT_COLOR).map(([cat, color]) => {
              const isVisible = legendVisible[cat] !== false;
              return (
                <div
                  key={cat}
                  className="flex items-center gap-1 text-xs cursor-pointer transition-opacity hover:opacity-80"
                  style={{ color: isVisible ? labelLight : labelLight + '40' }}
                  onClick={() => toggleLegend(cat)}
                  title={isVisible ? `隐藏 ${cat}` : `显示 ${cat}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: isVisible ? color : 'transparent', border: `1px solid ${color}` }}
                  />
                  {cat}
                </div>
              );
            })}
          </div>

          {/* 图表容器：单一容器，样式根据 viewMode 动态切换 */}
          <div
            ref={chartRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: viewMode === 'tree' ? 'auto' : 'hidden',
            }}
          />

          {/* 空状态 */}
          {!currentTreeData && viewMode === 'tree' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm" style={{ color: labelLight }}>暂无树形数据</p>
            </div>
          )}
          {currentNodes.length === 0 && viewMode === 'graph' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm" style={{ color: labelLight }}>暂无图谱数据</p>
            </div>
          )}
        </div>

        {/* 右部信息栏：点击节点后同时展示企业列表 + 关联商机 */}
        <InfoPanel
          visible={infoPanelVisible}
          collapsed={infoPanelCollapsed}
          onCollapse={() => setInfoPanelCollapsed(v => !v)}
          mapBorder={mapBorder}
          mapArea={mapArea}
          mapArea2={mapArea2}
          labelLight={labelLight}
        >
          {selectedChainNode && (
            <NodeInfoPanel
              node={selectedChainNode}
              firms={selectedNodeFirms}
              mapBorder={mapBorder}
              mapArea={mapArea}
              textWhite={textWhite}
              labelLight={labelLight}
            />
          )}
          {selectedNodeOpportunities.length > 0 && (
            <OpportunityPanel
              opportunities={selectedNodeOpportunities}
              onClose={() => {}}
              mapBorder={mapBorder}
              mapArea={mapArea}
              textWhite={textWhite}
              labelLight={labelLight}
            />
          )}
        </InfoPanel>
      </div>
    </div>
  );
}
