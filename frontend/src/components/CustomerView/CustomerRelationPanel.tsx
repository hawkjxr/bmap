import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Link2, Network, TreePine, MapPinned, Users2, Award, ArrowRight } from 'lucide-react';
import { useChartTheme } from '../../hooks/useChartTheme';
import {
  buildRelationSpanningTree,
  CUSTOMER_PANORAMA_ENTERPRISE_ID,
  enterpriseNodes,
  firmIdToNode,
  relationLinks,
  relationTypeConfig,
  type EnterpriseNode,
  type RelationLink,
  type RelationTreeNode,
  type RelationType,
} from '../../data/relationLinkData';

function toEchartsTree(
  node: RelationTreeNode,
  tc: ReturnType<typeof useChartTheme>,
): any {
  const c = node.color || '#3B82F6';
  const isRoot = node.isRoot;
  return {
    name: node.name,
    fullName: node.fullName,
    shortName: node.shortName,
    industry: node.industry,
    itemStyle: {
      color: isRoot ? 'rgba(250,173,20,0.25)' : 'rgba(10,26,47,0.85)',
      borderColor: c,
      borderWidth: isRoot ? 3 : 2,
      borderRadius: 8,
      shadowBlur: isRoot ? 22 : 10,
      shadowColor: c + '55',
    },
    label: {
      show: true,
      position: 'inside' as const,
      formatter: node.edgeToParent
        ? `{t|${node.name}}\n{e|${node.edgeToParent}}`
        : `{r|${node.name}}`,
      rich: {
        r: { fontSize: 13, fontWeight: 'bold' as const, color: '#FBBF24', align: 'center' as const },
        t: { fontSize: 12, fontWeight: 'bold' as const, color: tc.textWhite, align: 'center' as const, padding: [0, 0, 4, 0] },
        e: { fontSize: 9, color: '#94a3b8', align: 'center' as const, lineHeight: 14, width: 108 },
      },
    },
    symbol: 'roundRect',
    symbolSize: node.edgeToParent ? [128, 52] : [140, 44],
    children: node.children?.map(ch => toEchartsTree(ch, tc)),
  };
}

interface CustomerRelationPanelProps {
  centerFirmId?: string;
  chartHeight?: number;
}

export const CustomerRelationPanel: React.FC<CustomerRelationPanelProps> = ({
  centerFirmId = CUSTOMER_PANORAMA_ENTERPRISE_ID,
  chartHeight = 400,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const tc = useChartTheme();
  const [linkView, setLinkView] = useState<'tree' | 'graph'>('graph');
  const [activeRelTypes, setActiveRelTypes] = useState<Set<RelationType>>(
    new Set(['chain', 'park', 'city', 'executive', 'association']),
  );
  const [selectedNode, setSelectedNode] = useState<EnterpriseNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<RelationLink | null>(null);

  const toggleRelType = (t: RelationType) => {
    setActiveRelTypes(prev => {
      const s = new Set(prev);
      s.has(t) ? s.delete(t) : s.add(t);
      return s;
    });
  };

  const filteredLinks = useMemo(
    () => relationLinks.filter(l => activeRelTypes.has(l.type)),
    [activeRelTypes],
  );

  const nodeRelations = useMemo(() => {
    if (!selectedNode) return [];
    return filteredLinks.filter(l => l.sourceId === selectedNode.firmId || l.targetId === selectedNode.firmId);
  }, [selectedNode, filteredLinks]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const nodeMap = new Map(enterpriseNodes.map(n => [n.firmId, n]));

    if (linkView === 'graph') {
      const gNodes = enterpriseNodes.map(n => {
        const isCenter = n.firmId === centerFirmId;
        const deg = filteredLinks.filter(l => l.sourceId === n.firmId || l.targetId === n.firmId).length;
        return {
          name: n.short,
          firmId: n.firmId,
          fullName: n.name,
          symbolSize: isCenter ? Math.max(deg * 8 + 44, 56) : deg * 7 + 28,
          itemStyle: {
            color: n.color,
            borderColor: isCenter ? '#FBBF24' : n.color,
            borderWidth: isCenter ? 4 : 2,
            shadowBlur: isCenter ? 28 : 16,
            shadowColor: (isCenter ? '#FBBF24' : n.color) + '55',
          },
          label: { show: true, color: tc.textWhite, fontSize: isCenter ? 12 : 11, fontWeight: isCenter ? ('bold' as const) : ('normal' as const), formatter: '{b}' },
        };
      });
      const gLinks = filteredLinks.map(l => ({
        source: nodeMap.get(l.sourceId)?.short || l.sourceId,
        target: nodeMap.get(l.targetId)?.short || l.targetId,
        fullSource: l.sourceId,
        fullTarget: l.targetId,
        relType: l.type,
        relLabel: l.label,
        relDetail: l.detail,
        lineStyle: {
          color: relationTypeConfig[l.type].color,
          width: l.type === 'chain' ? 2.5 : 1.8,
          curveness: l.type === 'executive' ? 0.3 : l.type === 'association' ? -0.2 : 0.1,
          type: l.type === 'executive' ? ('dashed' as const) : l.type === 'association' ? ('dotted' as const) : ('solid' as const),
          opacity: 0.75,
        },
      }));
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          backgroundColor: tc.tooltipBg,
          borderColor: tc.tooltipBorder,
          textStyle: { color: tc.textWhite, fontSize: 12 },
          formatter: (p: any) => {
            if (p.dataType === 'node') {
              const nd = nodeMap.get(p.data.firmId);
              if (!nd) return p.name;
              const mark = nd.firmId === centerFirmId ? '<span style="color:#FBBF24">（本户）</span>' : '';
              return `<div style="font-weight:bold;font-size:13px;margin-bottom:4px">${nd.name}${mark}</div>
                <div style="color:${nd.color};margin-bottom:2px">${nd.industry} · ${nd.city}</div>
                <div style="font-size:11px;color:#94a3b8">园区: ${firmIdToNode[nd.firmId]?.parkId || nd.parkId || '-'}</div>
                <div style="font-size:11px;color:#94a3b8">高管: ${nd.executive}</div>`;
            }
            if (p.dataType === 'edge') {
              const cfg = relationTypeConfig[p.data.relType as RelationType];
              return `<div style="margin-bottom:4px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cfg.color};margin-right:6px"></span><b>${cfg.label}</b></div>
                <div style="font-size:12px;margin-bottom:2px">${p.data.relLabel}</div>
                ${p.data.relDetail ? `<div style="font-size:11px;color:#94a3b8">${p.data.relDetail}</div>` : ''}`;
            }
            return '';
          },
        },
        series: [{
          type: 'graph',
          layout: 'force',
          roam: true,
          zoom: 1,
          force: { repulsion: 420, gravity: 0.14, edgeLength: [110, 240], friction: 0.58 },
          data: gNodes,
          links: gLinks,
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          emphasis: {
            focus: 'adjacency' as const,
            lineStyle: { width: 4, opacity: 1 },
            itemStyle: { shadowBlur: 32, borderWidth: 4 },
          },
          edgeLabel: { show: false },
        }],
      } as any);
      chart.on('click', (params: any) => {
        if (params.dataType === 'node') {
          const nd = nodeMap.get(params.data.firmId);
          if (nd) {
            setSelectedNode(nd);
            setSelectedLink(null);
          }
        }
        if (params.dataType === 'edge') {
          const link = filteredLinks.find(l => {
            const sn = nodeMap.get(l.sourceId)?.short;
            const tn = nodeMap.get(l.targetId)?.short;
            return sn === params.data.source && tn === params.data.target && l.type === params.data.relType;
          });
          if (link) {
            setSelectedLink(link);
            setSelectedNode(null);
          }
        }
      });
    } else {
      const rawTree = buildRelationSpanningTree(centerFirmId, filteredLinks, enterpriseNodes, 4);
      if (!rawTree) {
        chart.clear();
        const h = () => chart.resize();
        window.addEventListener('resize', h);
        return () => { window.removeEventListener('resize', h); chart.dispose(); };
      }
      const treeData = toEchartsTree(rawTree, tc);
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          backgroundColor: tc.tooltipBg,
          borderColor: tc.tooltipBorder,
          textStyle: { color: tc.textWhite, fontSize: 12 },
          formatter: (p: any) => {
            const d = p.data;
            if (!d?.firmId) return p.name;
            const nd = nodeMap.get(d.firmId);
            if (!nd) return p.name;
            return `<div style="font-weight:bold;margin-bottom:4px">${nd.name}</div>
              <div style="color:${nd.color}">${nd.industry} · ${nd.city}</div>
              <div style="font-size:11px;color:#94a3b8">园区: ${firmIdToNode[nd.firmId]?.parkId || nd.parkId || '-'}</div>`;
          },
        },
        series: [{
          type: 'tree',
          data: [treeData],
          orient: 'LR',
          roam: true,
          zoom: 0.85,
          symbol: 'roundRect',
          initialTreeDepth: -1,
          edgeShape: 'polyline',
          edgeForkPosition: '63%',
          lineStyle: { color: tc.mapBorder, width: 1.5 },
          emphasis: { focus: 'descendant' as const, lineStyle: { color: '#3B82F6', width: 2.5 } },
          leaves: { label: { position: 'inside' as const } },
          animationDuration: 600,
        }],
      } as any);
      chart.on('click', (params: any) => {
        const fid = params.data?.firmId;
        if (fid) {
          const nd = nodeMap.get(fid);
          if (nd) {
            setSelectedNode(nd);
            setSelectedLink(null);
          }
        }
      });
    }

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, [linkView, tc, filteredLinks, centerFirmId]);

  return (
    <div className="tech-panel p-0 col-span-3 flex flex-col overflow-hidden min-h-0" style={{ minHeight: chartHeight }}>
      <div className="shrink-0 px-4 py-3 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold">联系链路</span>
          <span className="text-[11px] text-gray-500">以本户为中心 · {linkView === 'tree' ? '树形展开' : '力导向图谱'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-dark-border)' }}>
            <button
              type="button"
              onClick={() => { setLinkView('tree'); setSelectedNode(null); setSelectedLink(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${linkView === 'tree' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <TreePine className="w-3.5 h-3.5" /> 树图
            </button>
            <button
              type="button"
              onClick={() => { setLinkView('graph'); setSelectedNode(null); setSelectedLink(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${linkView === 'graph' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Network className="w-3.5 h-3.5" /> 图谱
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            {(Object.entries(relationTypeConfig) as [RelationType, typeof relationTypeConfig[RelationType]][]).map(([k, cfg]) => {
              const Icon = cfg.icon;
              const active = activeRelTypes.has(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleRelType(k)}
                  className={`flex items-center gap-0.5 px-2 py-1 rounded-md transition-all ${active ? 'ring-1' : 'opacity-45 hover:opacity-80'}`}
                  style={active ? { backgroundColor: cfg.color + '22', color: cfg.color } : { color: '#6b7280' }}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  {cfg.label}
                  <span className="font-mono opacity-80">({relationLinks.filter(l => l.type === k).length})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0" style={{ minHeight: chartHeight - 56 }}>
        <div ref={chartRef} className="flex-1 min-w-0 min-h-[320px]" style={{ height: chartHeight - 56 }} />
        <div className="w-[300px] shrink-0 overflow-y-auto text-xs" style={{ borderLeft: '1px solid var(--color-dark-border)' }}>
          {selectedNode && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedNode.color }} />
                <span className="font-bold">{selectedNode.short}</span>
                {selectedNode.name === firmIdToNode[centerFirmId]?.name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">本户</span>}
                <span className="text-[10px] text-gray-500 ml-auto">{selectedNode.industry}</span>
              </div>
              <div className="space-y-1 text-[11px]" style={{ color: 'var(--c-text-secondary)' }}>
                <div className="flex items-center gap-2"><MapPinned className="w-3.5 h-3.5 text-cyan-400 shrink-0" /><span>{selectedNode.city} · {firmIdToNode[selectedNode.firmId]?.parkId || selectedNode.parkId || '-'}</span></div>
                <div className="flex items-center gap-2"><Users2 className="w-3.5 h-3.5 text-orange-400 shrink-0" /><span>高管: {selectedNode.executive}</span></div>
                {selectedNode.associations.length > 0 && (
                  <div className="flex items-start gap-2"><Award className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" /><span>{selectedNode.associations.join('、')}</span></div>
                )}
              </div>
              <div className="text-[10px] text-gray-500 mt-2 mb-1">关联链路 ({nodeRelations.length})</div>
              {nodeRelations.map((r, i) => {
                const cfg = relationTypeConfig[r.type];
                const peerFirmId = r.sourceId === selectedNode.firmId ? r.targetId : r.sourceId;
                const peerNode = enterpriseNodes.find(n => n.firmId === peerFirmId);
                return (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    className="flex items-start gap-2 py-2 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
                    style={{ borderBottom: '1px solid rgba(30,64,112,0.15)' }}
                    onClick={() => { setSelectedLink(r); setSelectedNode(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') { setSelectedLink(r); setSelectedNode(null); } }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cfg.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span style={{ color: 'var(--c-text-secondary)' }}>{peerNode?.short || peerFirmId}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">{r.label}</div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-600 shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          )}
          {selectedLink && (
            <div className="p-3" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4" style={{ color: relationTypeConfig[selectedLink.type].color }} />
                <span className="font-bold" style={{ color: relationTypeConfig[selectedLink.type].color }}>{relationTypeConfig[selectedLink.type].label}</span>
              </div>
              <div className="flex items-center gap-2 mb-2 text-[11px]">
                <div className="flex-1 text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(10,26,47,0.5)' }}>
                  <div className="font-bold" style={{ color: enterpriseNodes.find(n => n.firmId === selectedLink.sourceId)?.color }}>{enterpriseNodes.find(n => n.firmId === selectedLink.sourceId)?.short}</div>
                </div>
                <span className="text-[9px] shrink-0" style={{ color: relationTypeConfig[selectedLink.type].color }}>{selectedLink.label}</span>
                <div className="flex-1 text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(10,26,47,0.5)' }}>
                  <div className="font-bold" style={{ color: enterpriseNodes.find(n => n.firmId === selectedLink.targetId)?.color }}>{enterpriseNodes.find(n => n.firmId === selectedLink.targetId)?.short}</div>
                </div>
              </div>
              {selectedLink.detail && (
                <div className="p-2 rounded-lg text-[11px]" style={{ backgroundColor: 'rgba(10,26,47,0.4)', color: 'var(--c-text-secondary)', borderLeft: `3px solid ${relationTypeConfig[selectedLink.type].color}` }}>
                  {selectedLink.detail}
                </div>
              )}
            </div>
          )}
          {!selectedNode && !selectedLink && (
            <div className="p-3">
              <div className="text-[11px] text-gray-500 mb-2">点击树图/图谱中的节点或连线查看详情；可筛选关系类型。</div>
              <div className="space-y-1.5">
                {(Object.entries(relationTypeConfig) as [RelationType, typeof relationTypeConfig[RelationType]][]).map(([k, cfg]) => {
                  const cnt = relationLinks.filter(l => l.type === k).length;
                  const Icon = cfg.icon;
                  return (
                    <div key={k} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: activeRelTypes.has(k) ? cfg.color + '12' : 'transparent' }}>
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                      <span className="flex-1" style={{ color: activeRelTypes.has(k) ? cfg.color : '#6b7280' }}>{cfg.label}</span>
                      <span className="font-mono text-[10px]" style={{ color: cfg.color }}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
