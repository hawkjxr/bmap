/**
 * 产业链图谱 V2 版本
 * 使用 chainToGraph.ts 转换函数，遵循 VersionLog.md 设计
 * 
 * 特点：
 * - 斥力图：使用 categories + nodes + links 完整格式
 * - 树形图：使用预定义的 treeData 结构
 * - 支持模式切换（clear + setOption 防残影）
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import { GitBranch, Network, X, ChevronLeft, ChevronRight, Users2, TrendingUp } from 'lucide-react';
import { useDataStore } from '../store/data';
import { useChartTheme } from '../hooks/useChartTheme';
import {
  chainToGraphData,
  getChainTreeData,
  buildForceOption,
  buildTreeOption,
  getAncestorNodeIds,
  getNodeRelatedFirms,
  type FirmSummary,
  CATEGORY_COLORS,
  type GraphData,
} from '../utils/chainToGraph';
import type { ChainNode, Opportunity } from '../data/types';

// ─────────────────────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────────────────────

function activityColor(activity: number): string {
  if (activity >= 85) return '#00E676';
  if (activity >= 70) return '#FAAD14';
  return '#EF4444';
}

// ─────────────────────────────────────────────────────────────
// 子组件：Banner
// ─────────────────────────────────────────────────────────────

interface BannerProps {
  chains: Array<{ id: string; name: string }>;
  currentChainId: string;
  onChainChange: (id: string) => void;
  viewMode: 'tree' | 'graph';
  onViewModeChange: (mode: 'tree' | 'graph') => void;
  textWhite: string;
  labelLight: string;
  mapArea: string;
  mapArea2: string;
  mapBorder: string;
  accent: string;
}

function Banner({ chains, currentChainId, onChainChange, viewMode, onViewModeChange, textWhite, labelLight, mapArea, mapArea2, mapBorder, accent }: BannerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ borderColor: mapBorder, backgroundColor: mapArea2 }}>
      <h2 className="text-lg font-bold" style={{ color: textWhite }}>产业链图谱</h2>

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
  const stageLabel: Record<string, string> = { upstream: '上游', midstream: '中游', downstream: '下游', terminal: '终端' };
  const stageColor: Record<string, string> = { upstream: '#3B82F6', midstream: '#00E676', downstream: '#A78BFA', terminal: '#F59E0B' };

  if (!node) return null;

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
            {firms.map((firm, i) => (
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

export default function IndustryChainV2() {
  const { mapArea, mapArea2, mapBorder, textWhite, labelLight, tooltipBg, tooltipBorder, tooltipText, accent } = useChartTheme();

  // 从 store 读取数据
  const chains = useDataStore(s => s.chains);
  const allChainNodes = useDataStore(s => s.chainNodes);
  const allChainRelations = useDataStore(s => s.chainNodeRelations);
  const allTreeData = useDataStore(s => s.chainTreeData);
  const allChainFirms = useDataStore(s => s.chainFirms);
  const opportunities = useDataStore(s => s.opportunities);
  const firms = useDataStore(s => s.firms);

  // 状态
  const [currentChainId, setCurrentChainId] = useState<string>('chain_power_battery');
  const [viewMode, setViewMode] = useState<'tree' | 'graph'>('graph');
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Refs
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const currentChainIdRef = useRef(currentChainId);
  const viewModeRef = useRef(viewMode);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeRef = useRef({ mapArea, mapArea2, mapBorder, textWhite, labelLight, tooltipBg, tooltipBorder, tooltipText });

  // 同步 ref
  useEffect(() => { currentChainIdRef.current = currentChainId; }, [currentChainId]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { themeRef.current = { mapArea, mapArea2, mapBorder, textWhite, labelLight, tooltipBg, tooltipBorder, tooltipText }; }, [mapArea, mapArea2, mapBorder, textWhite, labelLight, tooltipBg, tooltipBorder, tooltipText]);

  // 当前产业链数据
  const currentChain = useMemo(() => chains.find(c => c.id === currentChainId), [chains, currentChainId]);
  const currentNodes = useMemo(() => allChainNodes.filter(n => n.chainId === currentChainId), [allChainNodes, currentChainId]);
  const currentRelations = useMemo(() => allChainRelations.filter(r => r.chainId === currentChainId), [allChainRelations, currentChainId]);
  const currentFirms = useMemo(() => allChainFirms[currentChainId] || [], [allChainFirms, currentChainId]);

  // 转换为 Graph 数据
  const graphData = useMemo<GraphData | null>(() => {
    if (currentNodes.length === 0) return null;
    return chainToGraphData(currentNodes, currentRelations);
  }, [currentNodes, currentRelations]);

  // 获取树形数据
  const treeData = useMemo(() => {
    return getChainTreeData(currentChainId, allTreeData);
  }, [currentChainId, allTreeData]);

  // 选中节点
  const selectedChainNode = useMemo(() => currentNodes.find(n => n.id === selectedNodeId) || null, [currentNodes, selectedNodeId]);

  // 选中节点关联的企业（汇总当前节点及祖先节点）
  const selectedNodeFirms = useMemo((): FirmSummary[] => {
    if (!selectedNodeId) return [];

    // 树形图模式：需要汇总当前节点及其祖先节点的企业
    if (viewMode === 'tree' && treeData) {
      const ancestorIds = getAncestorNodeIds(selectedNodeId, treeData);
      return getNodeRelatedFirms(ancestorIds, currentFirms, firms);
    }

    // 斥力图模式：直接使用当前节点的 nodeId 匹配
    return currentFirms
      .filter(f => f.nodeId === selectedNodeId)
      .map(f => {
        const firmData = firms.find(item => item.id === f.firmId);
        return {
          firmId: f.firmId,
          name: firmData?.name || f.firmId,
          role: f.role,
          asset: f.asset,
          manager: f.manager,
          managerId: f.managerId,
        };
      });
  }, [selectedNodeId, viewMode, treeData, currentFirms, firms]);

  // 选中节点关联的商机
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

  // ── ECharts 初始化 Effect ──────────────────────────────────
  useEffect(() => {
    if (!chartRef.current || chartInstanceRef.current) return;

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    // Resize 监听
    const ro = new ResizeObserver(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        chart.resize();
      }, 200);
    });
    ro.observe(chartRef.current);

    const prevDispose = chart.dispose.bind(chart);
    chart.dispose = () => {
      ro.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
      prevDispose();
    };

    return () => {
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // ── 渲染图表 Effect ────────────────────────────────────────
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;
    const theme = themeRef.current;

    console.log('[IndustryChainV2] 渲染图表:', { viewMode, chainId: currentChainId, graphData: graphData ? '有数据' : '无数据', treeData: treeData ? '有数据' : '无数据' });

    if (viewMode === 'graph') {
      if (!graphData || graphData.nodes.length === 0) {
        console.warn('[斥力图] 没有图谱数据');
        return;
      }

      // 切换前先 clear，防止残影
      chart.clear();

      // 切换斥力图时恢复容器大小（取消树形图的大画布）
      if (chartRef.current) {
        chartRef.current.style.width = '100%';
        chartRef.current.style.height = '100%';
        chart.resize();
      }

      // 计算画布中心并传入 force 布局
      const chartWidth = chart.getWidth();
      const chartHeight = chart.getHeight();

      const option = buildForceOption(graphData, theme, [chartWidth / 2, chartHeight / 2]);
      chart.setOption(option as EChartsOption);

      // 延迟 200ms 让 force 布局完成初始动画
      setTimeout(() => {
        console.log('[斥力图] 布局完成');
      }, 200);

    } else {
      if (!treeData) {
        console.warn('[树形图] 没有树形数据');
        return;
      }

      // 切换前先 clear，防止残影
      chart.clear();
      const option = buildTreeOption(treeData, theme, currentChain?.name || '');

      // 树形图模式下：显式设置大画布，支持滚动
      if (chartRef.current) {
        chartRef.current.style.width = '3000px';
        chartRef.current.style.height = '2000px';
        chart.resize({ width: 3000, height: 2000 });
      }

      chart.setOption(option as EChartsOption);
      console.log('[树形图] 渲染完成');

      // 滚动条自动滚动到垂直居中位置
      setTimeout(() => {
        if (!chartRef.current) return;
        // 向上遍历找到设置了 overflow: auto 的滚动容器
        let scrollContainer = chartRef.current.parentElement;
        while (scrollContainer) {
          const overflowY = window.getComputedStyle(scrollContainer).overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') {
            break;
          }
          scrollContainer = scrollContainer.parentElement;
        }
        if (!scrollContainer) return;
        const targetScrollTop = Math.max(0, (scrollContainer.scrollHeight - scrollContainer.clientHeight) / 2);
        scrollContainer.scrollTop = targetScrollTop;
      }, 100);
    }

    // 节点点击事件
    chart.off('click');
    chart.on('click', (params: unknown) => {
      const p = params as { dataType?: string; data?: { nodeId?: string; id?: string } };
      // 兼容树形图（nodeId）和斥力图（id）
      const clickedNodeId = p.data?.nodeId || p.data?.id;
      if (p.dataType === 'node' && clickedNodeId) {
        if (infoPanelCollapsed) {
          setInfoPanelCollapsed(false);
        }
        setSelectedNodeId(clickedNodeId);
      }
    });

  }, [viewMode, currentChainId, graphData, treeData, currentChain]);

  // ── 事件处理 ───────────────────────────────────────────────

  const handleChainChange = useCallback((id: string) => {
    setCurrentChainId(id);
    setSelectedNodeId(null);
  }, []);

  const handleViewModeChange = useCallback((mode: 'tree' | 'graph') => {
    setViewMode(mode);
    setSelectedNodeId(null);
  }, []);

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
        mapArea={mapArea}
        mapArea2={mapArea2}
        mapBorder={mapBorder}
        accent={accent}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 图谱区 */}
        <div
          className="flex-1 relative"
          style={{ backgroundColor: mapArea, overflow: viewMode === 'tree' ? 'auto' : 'hidden' }}
        >
          {/* 图例：可折叠 */}
          {viewMode === 'graph' && graphData && graphData.categories.length > 0 && (
            <div className="absolute top-3 right-3 z-10 p-2 rounded border"
              style={{ backgroundColor: mapArea2 + 'CC', borderColor: mapBorder }}>
              {/* 折叠按钮行 */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs" style={{ color: labelLight }}>分类</span>
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
              {!legendCollapsed && graphData.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs mb-1" style={{ color: labelLight }}>
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: cat.itemStyle.color }}
                  />
                  {cat.name}
                </div>
              ))}
            </div>
          )}

          {/* 图表容器 */}
          <div
            ref={chartRef}
            style={{
              width: viewMode === 'tree' ? 'max-content' : '100%',
              height: '100%',
            }}
          />

          {/* 空状态 */}
          {viewMode === 'graph' && !graphData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm" style={{ color: labelLight }}>暂无图谱数据</p>
            </div>
          )}
          {viewMode === 'tree' && !treeData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm" style={{ color: labelLight }}>暂无树形数据</p>
            </div>
          )}
        </div>

        {/* 右部信息栏 */}
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
