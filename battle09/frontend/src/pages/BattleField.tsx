import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import {
  Shield, MapPin, Route, Target, Users, Layers,
  MousePointer, CheckCircle, AlertTriangle, Navigation
} from 'lucide-react';
import { useAppStore } from '../store/data';
import { useChartTheme } from '../hooks/useChartTheme';

export const BattleField: React.FC = () => {
  const parks = useAppStore(s => s.parks);
  const firms = useAppStore(s => s.firms);
  const managers = useAppStore(s => s.managers);
  const visitTrails = useAppStore(s => s.visitTrails);
  const workOrders = useAppStore(s => s.workOrders);
  const penetrationData = useAppStore(s => s.penetrationData);

  const [selectedManager, setSelectedManager] = useState<string>('');
  const [mode, setMode] = useState<'dispatch' | 'trail' | 'grid'>('dispatch');

  const managerTrails = useMemo(() => {
    if (!selectedManager) return visitTrails;
    return visitTrails.filter(t => t.managerId === selectedManager);
  }, [visitTrails, selectedManager]);

  const selectedManagerData = managers.find(m => m.id === selectedManager);
  const myWorkOrders = workOrders.filter(w => w.creatorId === 'mgr002' || w.ownerId === 'mgr002');
  const pendingOrders = myWorkOrders.filter(w => w.status !== '已完成');

  return (
    <div className="h-full flex flex-col bg-[var(--c-bg)]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--c-purple)] to-[var(--c-accent)] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold tech-title">战区指挥台</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[var(--c-surface)] rounded-lg p-1">
            <button onClick={() => setMode('dispatch')} className={`px-3 py-1 rounded text-xs transition-colors ${mode === 'dispatch' ? 'badge-blue' : 'text-[var(--c-text-secondary)]'}`}>
              <MousePointer className="w-3 h-3 inline mr-1" />框选派单
            </button>
            <button onClick={() => setMode('trail')} className={`px-3 py-1 rounded text-xs transition-colors ${mode === 'trail' ? 'badge-blue' : 'text-[var(--c-text-secondary)]'}`}>
              <Route className="w-3 h-3 inline mr-1" />鹰眼轨迹
            </button>
            <button onClick={() => setMode('grid')} className={`px-3 py-1 rounded text-xs transition-colors ${mode === 'grid' ? 'badge-blue' : 'text-[var(--c-text-secondary)]'}`}>
              <Layers className="w-3 h-3 inline mr-1" />网格渗透率
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
          {mode === 'dispatch' && <DispatchMap parks={parks} firms={firms} />}
          {mode === 'trail' && <TrailMap trails={managerTrails} parks={parks} />}
          {mode === 'grid' && <GridPenetrationMap penetrationData={penetrationData} parks={parks} />}
        </div>

        <div className="w-80 border-l border-[var(--c-border)] overflow-y-auto p-4 scrollbar-thin shrink-0 bg-[var(--c-bg-elevated)]">
          {mode === 'trail' && (
            <>
              <div className="mb-4">
                <div className="text-xs text-[var(--c-text-muted)] mb-2">选择客户经理</div>
                <select
                  value={selectedManager}
                  onChange={e => setSelectedManager(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] focus:outline-none focus:border-[var(--c-accent)]"
                >
                  <option value="">全部经理</option>
                  {managers.filter(m => m.role === '客户经理').map(m => (
                    <option key={m.id} value={m.id}>{m.name} - {m.area}</option>
                  ))}
                </select>
              </div>

              {selectedManagerData && (
                <div className="tech-panel p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--c-accent)]/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-[var(--c-accent)]">{selectedManagerData.name[0]}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--c-text)]">{selectedManagerData.name}</div>
                      <div className="text-[10px] text-[var(--c-text-muted)]">{selectedManagerData.role} - {selectedManagerData.area}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-[var(--c-bg)] rounded-lg">
                      <div className="text-lg font-bold text-[var(--c-text)]">{selectedManagerData.workOrderCount}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)]">工单数</div>
                    </div>
                    <div className="p-2 bg-[var(--c-bg)] rounded-lg">
                      <div className="text-lg font-bold text-[var(--c-text)]">{selectedManagerData.visitCount}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)]">拜访数</div>
                    </div>
                    <div className="p-2 bg-[var(--c-bg)] rounded-lg">
                      <div className="text-lg font-bold text-[var(--c-text)]">{selectedManagerData.opportunityCount}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)]">商机数</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-xs text-[var(--c-text-muted)]">今日轨迹</div>
                {managerTrails.map((trail, i) => (
                  <div key={i} className="tech-panel p-3">
                    <div className="text-xs font-medium text-[var(--c-text)] mb-2">{trail.date}</div>
                    <div className="text-[10px] text-[var(--c-text-muted)] mb-2">
                      拜访 {trail.firmsVisited.length} 家企业，总行程 {trail.totalDistance || 0}km
                    </div>
                    <div className="space-y-1">
                      {trail.points.map((point, j) => (
                        <div key={j} className="flex items-center gap-2 text-[9px]">
                          <Navigation className="w-3 h-3 text-[var(--c-accent)]" />
                          <span className="text-[var(--c-text-secondary)]">{point.location}</span>
                          <span className="text-[var(--c-text-muted)] ml-auto">{point.timestamp.split(' ')[1]}</span>
                          {point.verified && <CheckCircle className="w-2.5 h-2.5 text-[var(--c-green)]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === 'dispatch' && (
            <>
              <div className="mb-4">
                <div className="text-xs text-[var(--c-text-muted)] mb-2">待派发工单</div>
                <div className="space-y-2">
                  {pendingOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="tech-panel p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${order.type === '排雷' ? 'badge-red' : order.type === '关注' ? 'badge-yellow' : 'badge-green'}`}>
                          {order.type}
                        </span>
                        <span className="text-[9px] text-[var(--c-text-muted)]">{order.id}</span>
                      </div>
                      <div className="text-xs text-[var(--c-text)]">{order.title}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)] mt-1">{order.firmName || '未指定企业'}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tech-panel p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MousePointer className="w-4 h-4 text-[var(--c-accent)]" />
                  <span className="text-sm font-medium">框选操作说明</span>
                </div>
                <div className="space-y-2 text-[10px] text-[var(--c-text-muted)]">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-[var(--c-accent)]/10 text-[var(--c-accent)] flex items-center justify-center shrink-0">1</span>
                    <span>在地图上点击并拖拽，绘制多边形选择区域</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-[var(--c-accent)]/10 text-[var(--c-accent)] flex items-center justify-center shrink-0">2</span>
                    <span>选中的园区和企业将高亮显示</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-[var(--c-accent)]/10 text-[var(--c-accent)] flex items-center justify-center shrink-0">3</span>
                    <span>点击「派发工单」按钮，选择执行人</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === 'grid' && (
            <>
              <div className="mb-4">
                <div className="text-xs text-[var(--c-text-muted)] mb-2">园区渗透率排名</div>
                <div className="space-y-2">
                  {penetrationData.filter(p => p.dimension === 'park').sort((a, b) => b.penetrationRate - a.penetrationRate).map(p => (
                    <div key={p.targetId} className="p-2 rounded-lg bg-[var(--c-surface)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--c-text)]">{p.targetName}</span>
                        <span className={`text-[10px] font-medium ${
                          p.status === 'exceeding' ? 'text-[var(--c-green)]' :
                          p.status === 'below' ? 'text-[var(--c-red)]' : 'text-[var(--c-yellow)]'
                        }`}>
                          {p.penetrationRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[var(--c-bg)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.status === 'exceeding' ? 'bg-[var(--c-green)]' :
                            p.status === 'below' ? 'bg-[var(--c-red)]' : 'bg-[var(--c-yellow)]'
                          }`}
                          style={{ width: `${Math.min(100, (p.penetrationRate / p.targetRate) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DispatchMap: React.FC<{
  parks: ReturnType<typeof useAppStore>['parks'];
  firms: ReturnType<typeof useAppStore>['firms'];
}> = ({ parks, firms }) => {
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
    const riskColor = { low: '#10B981', medium: '#FAAD14', high: '#EF4444' };

    const data = parks.map(p => ({
      name: p.name,
      value: [p.lng, p.lat],
      risk: p.risk,
      firms: p.firmIds?.length || 0,
      investment: p.data['投放'] || 0,
    }));

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        textStyle: { color: ct.tooltipText },
        formatter: (p: any) => `<div style="font-weight:bold">${p.data.name}</div><div style="color:${ct.textSecondary}">企业: ${p.data.firms}家</div><div style="color:${ct.textSecondary}">风险: ${p.data.risk === 'low' ? '低' : p.data.risk === 'medium' ? '中' : '高'}</div>`,
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.3,
        center: [105, 36],
        itemStyle: { areaColor: '#0B1D3A', borderColor: '#1A3A6A', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#0F2547' } },
      },
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        data,
        symbolSize: (val: number[], params: any) => Math.max(12, Math.min(30, params.data.firms * 1.5)),
        itemStyle: {
          color: (params: any) => riskColor[params.data.risk as keyof typeof riskColor] || '#3B82F6',
          shadowBlur: 15,
          shadowColor: (params: any) => riskColor[params.data.risk as keyof typeof riskColor] || '#3B82F6',
        },
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [parks, ct]);

  return <div ref={chartRef} className="w-full h-full" />;
};

const TrailMap: React.FC<{
  trails: ReturnType<typeof useAppStore>['visitTrails'];
  parks: ReturnType<typeof useAppStore>['parks'];
}> = ({ trails, parks }) => {
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

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const seriesData: any[] = [];
    const trailLines: any[] = [];

    trails.forEach((trail, i) => {
      const color = colors[i % colors.length];

      trail.points.forEach((point, j) => {
        seriesData.push({
          name: point.location,
          value: [point.lng, point.lat],
          symbolSize: 10,
          itemStyle: { color, shadowBlur: 10, shadowColor: color },
        });
      });

      if (trail.points.length > 1) {
        const coords = trail.points.map(p => [p.lng, p.lat]);
        trailLines.push({
          coords,
          lineStyle: { color, width: 2, opacity: 0.6 },
        });
      }
    });

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.3,
        center: [105, 36],
        itemStyle: { areaColor: '#0B1D3A', borderColor: '#1A3A6A', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#0F2547' } },
      },
      series: [
        ...trailLines.map(line => ({
          type: 'lines',
          geoIndex: 0,
          polyline: true,
          coordinateSystem: 'geo',
          data: [line],
          effect: { show: true, period: 4, trailLength: 0.3, symbol: 'arrow', symbolSize: 5, color },
        })),
        { type: 'scatter', coordinateSystem: 'geo', data: seriesData, label: { show: true, fontSize: 8, color: ct.text, formatter: (p: any) => p.data.name.split(' ')[0] } },
      ],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [trails, ct]);

  return <div ref={chartRef} className="w-full h-full" />;
};

const GridPenetrationMap: React.FC<{
  penetrationData: ReturnType<typeof useAppStore>['penetrationData'];
  parks: ReturnType<typeof useAppStore>['parks'];
}> = ({ penetrationData, parks }) => {
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
    const parkData = penetrationData.filter(p => p.dimension === 'park');

    const data = parks.map(p => {
      const pd = parkData.find(d => d.targetId === p.id);
      return {
        name: p.name,
        value: [p.lng, p.lat],
        penetrationRate: pd?.penetrationRate || 0,
        status: pd?.status || 'below',
      };
    });

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        textStyle: { color: ct.tooltipText },
        formatter: (p: any) => `<div style="font-weight:bold">${p.data.name}</div><div style="color:${ct.textSecondary}">渗透率: ${p.data.penetrationRate}%</div><div style="color:${ct.textSecondary}">状态: ${p.data.status === 'exceeding' ? '超额完成' : p.data.status === 'below' ? '待提升' : '达标'}</div>`,
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.3,
        center: [105, 36],
        itemStyle: { areaColor: '#0B1D3A', borderColor: '#1A3A6A', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#0F2547' } },
      },
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        data,
        symbolSize: (val: number[], params: any) => Math.max(15, Math.min(35, params.data.penetrationRate / 2)),
        itemStyle: {
          color: (params: any) => {
            if (params.data.status === 'exceeding') return '#10B981';
            if (params.data.status === 'meeting') return '#FAAD14';
            return '#EF4444';
          },
          opacity: 0.8,
        },
      }],
      visualMap: {
        min: 0,
        max: 100,
        textStyle: { color: ct.text },
        inRange: { color: ['#EF4444', '#FAAD14', '#10B981'] },
        right: 20,
        top: 'center',
      },
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [penetrationData, parks, ct]);

  return <div ref={chartRef} className="w-full h-full" />;
};

export default BattleField;
