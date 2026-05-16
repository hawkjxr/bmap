import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import {
  GitBranch, Link2, TrendingUp, PieChart, Target,
  ChevronRight, ChevronDown, Filter
} from 'lucide-react';
import { useAppStore } from '../store/data';
import { useChartTheme } from '../hooks/useChartTheme';

export const IndustryChain: React.FC = () => {
  const chains = useAppStore(s => s.chains);
  const chainNodes = useAppStore(s => s.chainNodes);
  const firms = useAppStore(s => s.firms);
  const [selectedChain, setSelectedChain] = useState<string>(chains[0]?.id || '');
  const [viewMode, setViewMode] = useState<'tree' | 'force'>('tree');

  const selectedChainData = chains.find(c => c.id === selectedChain);
  const nodesInChain = chainNodes.filter(n => n.chainId === selectedChain);

  const stages = ['upstream', 'midstream', 'downstream', 'terminal'] as const;
  const stageLabels: Record<string, string> = { upstream: '上游', midstream: '中游', downstream: '下游', terminal: '终端' };
  const stageColors: Record<string, string> = { upstream: '#10B981', midstream: '#3B82F6', downstream: '#F59E0B', terminal: '#8B5CF6' };

  const totalFirms = useMemo(() => nodesInChain.reduce((acc, n) => acc + (n.firmIds?.length || 0), 0), [nodesInChain]);

  return (
    <div className="h-full flex flex-col bg-[var(--c-bg)]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-[var(--c-accent)]" />
          <h1 className="text-lg font-bold tech-title">产业链结构化沙盘</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--c-surface)] rounded-lg p-1">
            {chains.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChain(c.id)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  selectedChain === c.id
                    ? 'bg-[var(--c-accent)] text-white'
                    : 'text-[var(--c-text-secondary)] hover:text-[var(--c-text)]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-[var(--c-surface)] rounded-lg p-1">
            <button onClick={() => setViewMode('tree')} className={`px-2 py-1 rounded text-[10px] ${viewMode === 'tree' ? 'badge-blue' : 'text-[var(--c-text-secondary)]'}`}>树形</button>
            <button onClick={() => setViewMode('force')} className={`px-2 py-1 rounded text-[10px] ${viewMode === 'force' ? 'badge-blue' : 'text-[var(--c-text-secondary)]'}`}>图谱</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="w-64 border-r border-[var(--c-border)] overflow-y-auto p-4 scrollbar-thin shrink-0">
          <div className="mb-4">
            <div className="text-xs text-[var(--c-text-muted)] mb-1">当前产业链</div>
            <div className="text-sm font-medium" style={{ color: selectedChainData?.color }}>{selectedChainData?.name}</div>
            <div className="text-[10px] text-[var(--c-text-muted)] mt-1">{totalFirms} 家企业</div>
          </div>

          {stages.map(stage => {
            const stageNodes = nodesInChain.filter(n => n.stage === stage);
            if (stageNodes.length === 0) return null;
            return (
              <div key={stage} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColors[stage] }} />
                  <span className="text-xs font-medium text-[var(--c-text-secondary)]">{stageLabels[stage]}</span>
                  <span className="text-[10px] text-[var(--c-text-muted)]">({stageNodes.length})</span>
                </div>
                <div className="space-y-1 ml-4">
                  {stageNodes.map(node => {
                    const nodeFirms = firms.filter(f => f.chainNodeIds?.includes(node.id));
                    return (
                      <div key={node.id} className="p-2 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-accent)]/10 transition-colors cursor-pointer group">
                        <div className="text-xs font-medium text-[var(--c-text)] group-hover:text-[var(--c-accent)]">{node.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-[var(--c-text-muted)]">{node.scale}</span>
                          <span className="text-[9px] text-[var(--c-text-muted)]">|</span>
                          <span className="text-[9px]" style={{ color: stageColors[stage] }}>活跃度 {node.activity}%</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] text-[var(--c-text-muted)]">银行{node.bankRatio}%</span>
                          <span className="text-[9px] text-[var(--c-green)]">租赁{node.leaseRatio}%</span>
                        </div>
                        <div className="text-[9px] text-[var(--c-accent)] mt-1">{nodeFirms.length} 家关联企业</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-4 gap-4">
            {stages.map(stage => {
              const stageNodes = nodesInChain.filter(n => n.stage === stage);
              const firmCount = stageNodes.reduce((acc, n) => acc + (n.firmIds?.length || 0), 0);
              const avgActivity = stageNodes.length ? Math.round(stageNodes.reduce((acc, n) => acc + n.activity, 0) / stageNodes.length) : 0;
              return (
                <div key={stage} className="tech-panel p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stageColors[stage] }} />
                    <span className="text-sm font-medium">{stageLabels[stage]}</span>
                  </div>
                  <div className="text-2xl font-bold text-[var(--c-text)]">{stageNodes.length}</div>
                  <div className="text-[10px] text-[var(--c-text-muted)]">节点数</div>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--c-border)]">
                    <div>
                      <div className="text-lg font-bold text-[var(--c-text)]">{firmCount}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)]">企业</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: stageColors[stage] }}>{avgActivity}%</div>
                      <div className="text-[9px] text-[var(--c-text-muted)]">平均活跃</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="tech-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-[var(--c-accent)]" />
                <span className="text-sm font-medium">融资结构对比</span>
              </div>
              <FinancingStructureChart nodes={nodesInChain} />
            </div>

            <div className="tech-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-4 h-4 text-[var(--c-purple)]" />
                <span className="text-sm font-medium">企业关系图谱</span>
              </div>
              {viewMode === 'tree' ? (
                <ChainTreeChart chainId={selectedChain} />
              ) : (
                <ForceGraphChart chainId={selectedChain} />
              )}
            </div>
          </div>

          <div className="tech-panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[var(--c-green)]" />
              <span className="text-sm font-medium">园区-节点关联分析</span>
            </div>
            <ParkNodeRelationChart chainId={selectedChain} />
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancingStructureChart: React.FC<{ nodes: ReturnType<typeof useAppStore>['chainNodes'] }> = ({ nodes }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    const stageLabels: Record<string, string> = { upstream: '上游', midstream: '中游', downstream: '下游', terminal: '终端' };
    const stages = ['upstream', 'midstream', 'downstream', 'terminal'];

    const bankData = stages.map(s => {
      const ns = nodes.filter(n => n.stage === s);
      return ns.length ? ns.reduce((acc, n) => acc + n.bankRatio, 0) / ns.length : 0;
    });
    const leaseData = stages.map(s => {
      const ns = nodes.filter(n => n.stage === s);
      return ns.length ? ns.reduce((acc, n) => acc + n.leaseRatio, 0) / ns.length : 0;
    });

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      legend: { data: ['银行贷款', '融资租赁'], textStyle: { color: ct.textSecondary }, top: 0 },
      xAxis: { type: 'category', data: stages.map(s => stageLabels[s]), axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel, formatter: '{value}%' }, splitLine: { lineStyle: { color: ct.splitLine } } },
      series: [
        { name: '银行贷款', type: 'bar', data: bankData, itemStyle: { color: ct.seriesColors[0] }, barWidth: '30%' },
        { name: '融资租赁', type: 'bar', data: leaseData, itemStyle: { color: ct.seriesColors[1] }, barWidth: '30%' },
      ],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [nodes, ct]);

  return <div ref={chartRef} className="w-full h-[250px]" />;
};

const ChainTreeChart: React.FC<{ chainId: string }> = ({ chainId }) => {
  const chainNodes = useAppStore(s => s.chainNodes);
  const firms = useAppStore(s => s.firms);
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current || !chainId) return;
    const nodes = chainNodes.filter(n => n.chainId === chainId);
    const stageLabels: Record<string, string> = { upstream: '上游', midstream: '中游', downstream: '下游', terminal: '终端' };
    const stageColors: Record<string, string> = { upstream: '#10B981', midstream: '#3B82F6', downstream: '#F59E0B', terminal: '#8B5CF6' };

    const treeData = {
      name: '产业链',
      children: ['upstream', 'midstream', 'downstream', 'terminal'].map(stage => ({
        name: stageLabels[stage],
        children: nodes.filter(n => n.stage === stage).map(n => ({
          name: n.name,
          children: firms.filter(f => f.chainNodeIds?.includes(n.id)).slice(0, 3).map(f => ({
            name: f.name,
            value: f.indicators.asset ? Math.round(f.indicators.asset / 1e8) : 50,
          })),
        })),
      })),
    };

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      series: [{
        type: 'tree',
        data: [treeData],
        orient: 'LR',
        symbol: 'circle',
        symbolSize: (val: number, params: any) => params.data.children ? 16 : Math.max(8, Math.min(16, val / 20)),
        itemStyle: { color: (params: any) => {
          if (params.data.children) return stageColors[params.data.name] || ct.seriesColors[0];
          return ct.seriesColors[1];
        }},
        lineStyle: { color: ct.splitLine, curveness: 0.5 },
        label: { show: true, fontSize: 9, color: ct.text },
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [chainId, chainNodes, firms, ct]);

  return <div ref={chartRef} className="w-full h-[300px]" />;
};

const ForceGraphChart: React.FC<{ chainId: string }> = ({ chainId }) => {
  const firms = useAppStore(s => s.firms);
  const firmRelations = useAppStore(s => s.firmRelations);
  const chainNodes = useAppStore(s => s.chainNodes);
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current || !chainId) return;
    const chainNodeIds = firms.filter(f => f.chainNodeIds?.some(id => chainNodes.some(n => n.chainId === chainId && n.id === id))).flatMap(f => f.chainNodeIds || []);
    const relatedFirms = firms.filter(f => f.chainNodeIds?.some(id => chainNodeIds.includes(id))).slice(0, 15);
    const firmIds = relatedFirms.map(f => f.id);

    const graphFirms = relatedFirms.map(f => ({ id: f.id, name: f.name, category: f.risk === 'normal' ? 0 : f.risk === 'warning' ? 1 : 2, symbolSize: f.indicators.asset ? Math.max(20, Math.min(60, f.indicators.asset / 5e9)) : 30 }));
    const graphRels = firmRelations.filter(r => firmIds.includes(r.sourceFirmId) && firmIds.includes(r.targetFirmId)).map(r => ({ source: r.sourceFirmId, target: r.targetFirmId, lineStyle: { width: r.strength / 20, color: ct.seriesColors[2] } }));

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      legend: { data: ['正常', '关注', '高危'], textStyle: { color: ct.textSecondary }, top: 0 },
      series: [{
        type: 'graph',
        layout: 'force',
        data: graphFirms,
        links: graphRels,
        categories: [{ name: '正常' }, { name: '关注' }, { name: '高危' }],
        roam: true,
        label: { show: true, fontSize: 8, color: ct.text },
        lineStyle: { curveness: 0.3 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 4 } },
        force: { repulsion: 80, edgeLength: 100 },
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [chainId, firms, firmRelations, chainNodes, ct]);

  return <div ref={chartRef} className="w-full h-[300px]" />;
};

const ParkNodeRelationChart: React.FC<{ chainId: string }> = ({ chainId }) => {
  const parks = useAppStore(s => s.parks);
  const chainNodes = useAppStore(s => s.chainNodes);
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current || !chainId) return;
    const nodes = chainNodes.filter(n => n.chainId === chainId);
    const nodeIds = nodes.map(n => n.id);
    const relatedParks = parks.filter(p => p.chainIds?.includes(chainId)).slice(0, 8);

    const data = relatedParks.map(p => ({
      name: p.name,
      value: [p.lng, p.lat],
      symbolSize: Math.max(10, Math.min(30, (p.firmIds?.length || 0) / 10)),
      nodeCount: nodes.filter(n => p.chainIds?.includes(chainId)).length,
    }));

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText }, formatter: (p: any) => `${p.data.name}<br/>节点数: ${p.data.nodeCount}<br/>企业: ${Math.round(p.data.symbolSize * 10)}家` },
      geo: { map: 'china', roam: true, zoom: 1.5, center: [110, 35], itemStyle: { areaColor: '#0B1D3A', borderColor: '#1A3A6A', borderWidth: 1 } },
      series: [{ type: 'scatter', coordinateSystem: 'geo', data, symbolSize: (val: number[], params: any) => params.data.symbolSize, itemStyle: { color: ct.seriesColors[0], shadowBlur: 10, shadowColor: ct.seriesColors[0] } }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [chainId, parks, chainNodes, ct]);

  return <div ref={chartRef} className="w-full h-[300px]" />;
};

export default IndustryChain;
