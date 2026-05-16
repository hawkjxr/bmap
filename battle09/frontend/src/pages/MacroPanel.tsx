import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import {
  TrendingUp, Building2, Activity, Users, AlertTriangle, DollarSign,
  Zap, Eye, RefreshCw, BarChart3, MapPin
} from 'lucide-react';
import { useAppStore } from '../store/data';
import { useChartTheme } from '../hooks/useChartTheme';
import type { MetricKey } from '../data/types';

const METRICS: MetricKey[] = ['投放', '融资租赁', '企业贷款', '全量融资', '活力指数', '开工率', '金租渗透率', '不良率', '客户数', '在园企业数'];

export const MacroPanel: React.FC = () => {
  const firms = useAppStore(s => s.firms);
  const parks = useAppStore(s => s.parks);
  const adminData = useAppStore(s => s.adminData);
  const firmsCount = firms.length;
  const parksCount = parks.length;
  const riskFirmsCount = firms.filter(f => f.risk === 'danger' || f.risk === 'warning').length;

  const totalInvestment = useMemo(() => {
    const val = adminData['投放'];
    if (!val) return 0;
    return Object.values(val).reduce((a, b) => a + b, 0);
  }, [adminData]);

  const totalLease = useMemo(() => {
    const val = adminData['融资租赁'];
    if (!val) return 0;
    return Object.values(val).reduce((a, b) => a + b, 0);
  }, [adminData]);

  return (
    <div className="h-full flex flex-col bg-[var(--c-bg)]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-[var(--c-accent)]" />
          <h1 className="text-lg font-bold tech-title">宏观态势感知</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--c-text-muted)]">
            数据更新时间: {new Date().toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        <div className="grid grid-cols-5 gap-4">
          <KpiCard
            icon={<DollarSign className="w-5 h-5" />}
            label="累计投放"
            value={`${(totalInvestment).toFixed(1)}亿`}
            sub="全国合计"
            color="var(--c-accent)"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="融资租赁余额"
            value={`${(totalLease).toFixed(1)}亿`}
            sub="全国合计"
            color="var(--c-green)"
          />
          <KpiCard
            icon={<Building2 className="w-5 h-5" />}
            label="园区数量"
            value={String(parksCount)}
            sub="覆盖全国"
            color="var(--c-purple)"
          />
          <KpiCard
            icon={<Users className="w-5 h-5" />}
            label="管户企业"
            value={String(firmsCount)}
            sub="活跃客户"
            color="var(--c-cyan)"
          />
          <KpiCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="风险预警"
            value={String(riskFirmsCount)}
            sub="关注/高危"
            color="var(--c-red)"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 tech-panel p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--c-accent)]" />
                <span className="text-sm font-medium">全国产业园区分布</span>
              </div>
              <span className="text-[10px] text-[var(--c-text-muted)]">{parksCount} 个园区</span>
            </div>
            <div className="h-[400px] bg-[var(--c-bg)] rounded-lg p-4">
              <ParkScatterMap />
            </div>
          </div>

          <div className="space-y-4">
            <div className="tech-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-[var(--c-green)]" />
                <span className="text-sm font-medium">区域投放排名</span>
              </div>
              <div className="space-y-3">
                {['江苏省', '广东省', '浙江省', '四川省', '山东省'].map((prov, i) => {
                  const val = adminData['投放']?.[prov] || 0;
                  const maxVal = 200;
                  const pct = Math.min((val / maxVal) * 100, 100);
                  return (
                    <div key={prov}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--c-text-secondary)]">{prov}</span>
                        <span className="text-[var(--c-text)] font-medium">{val}亿</span>
                      </div>
                      <div className="h-2 bg-[var(--c-bg)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: i === 0 ? 'var(--c-accent)' : i === 1 ? 'var(--c-green)' : i === 2 ? 'var(--c-cyan)' : 'var(--c-purple)' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="tech-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-[var(--c-yellow)]" />
                <span className="text-sm font-medium">高风险园区</span>
              </div>
              <div className="space-y-2">
                {parks.filter(p => p.risk === 'high').map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--c-red)]/5 border border-[var(--c-red)]/20">
                    <div>
                      <div className="text-xs font-medium text-[var(--c-text)]">{p.name}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)]">{p.scale}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded badge-red">高危</span>
                  </div>
                ))}
                {parks.filter(p => p.risk === 'high').length === 0 && (
                  <div className="text-xs text-[var(--c-text-muted)] text-center py-4">暂无高风险园区</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="tech-panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[var(--c-accent)]" />
              <span className="text-sm font-medium">产业链渗透分析</span>
            </div>
            <ChainPenetrationChart />
          </div>

          <div className="tech-panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[var(--c-green)]" />
              <span className="text-sm font-medium">关键指标趋势</span>
            </div>
            <MetricsTrendChart />
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string; sub: string; color: string }> = ({ icon, label, value, sub, color }) => (
  <div className="tech-panel p-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="text-xs text-[var(--c-text-secondary)]">{label}</span>
    </div>
    <div className="text-2xl font-bold text-[var(--c-text)] mb-1">{value}</div>
    <div className="text-[10px] text-[var(--c-text-muted)]">{sub}</div>
  </div>
);

const ParkScatterMap: React.FC = () => {
  const parks = useAppStore(s => s.parks);
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current || !parks.length) return;
    const data = parks.map(p => ({
      name: p.name,
      value: [p.lng, p.lat],
      risk: p.risk,
      firms: p.firmIds?.length || 0,
      investment: p.data['投放'] || 0,
    }));

    const riskColor = { low: '#10B981', medium: '#FAAD14', high: '#EF4444' };

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        textStyle: { color: ct.tooltipText, fontSize: 12 },
        formatter: (p: any) => `<div style="font-weight:bold">${p.data.name}</div><div style="color:${ct.textSecondary}">企业: ${p.data.firms}家</div><div style="color:${ct.textSecondary}">投放: ${p.data.investment}亿</div>`,
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [105, 36],
        itemStyle: { areaColor: '#0B1D3A', borderColor: '#1A3A6A', borderWidth: 1 },
        emphasis: {
          itemStyle: { areaColor: '#0F2547' },
          label: { show: false },
        },
      },
      series: [{
        type: 'scatter',
        coordinateSystem: 'geo',
        data,
        symbolSize: (val: number[], params: any) => {
          const firms = params.data.firms;
          return Math.max(8, Math.min(25, firms / 10));
        },
        itemStyle: {
          color: (params: any) => riskColor[params.data.risk as keyof typeof riskColor] || '#3B82F6',
          shadowBlur: 10,
          shadowColor: (params: any) => riskColor[params.data.risk as keyof typeof riskColor] || '#3B82F6',
        },
        emphasis: { scale: 1.5 },
      }],
    });

    const handleResize = () => chart.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [parks, ct]);

  return <div ref={chartRef} className="w-full h-full" />;
};

const ChainPenetrationChart: React.FC = () => {
  const chains = useAppStore(s => s.chains);
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
    if (!chart.current) return;
    const data = chains.map(c => ({
      name: c.name,
      value: chainNodes.filter(n => n.chainId === c.id).length,
    }));

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        textStyle: { color: ct.tooltipText },
      },
      xAxis: { type: 'category', data: data.map(d => d.name), axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel, fontSize: 10, rotate: 15 } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel }, splitLine: { lineStyle: { color: ct.splitLine } } },
      series: [{
        type: 'bar',
        data: data.map((d, i) => ({ value: d.value, itemStyle: { color: chains[i]?.color || ct.seriesColors[0] } })),
        barWidth: '50%',
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [chains, chainNodes, ct]);

  return <div ref={chartRef} className="w-full h-[200px]" />;
};

const MetricsTrendChart: React.FC = () => {
  const adminData = useAppStore(s => s.adminData);
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('活力指数');

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    const metricData = adminData[selectedMetric];
    if (!metricData) return;

    const provinces = Object.keys(metricData).slice(0, 8);
    const values = provinces.map(p => metricData[p]);

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      xAxis: { type: 'category', data: provinces, axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel, fontSize: 10, rotate: 20 } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel }, splitLine: { lineStyle: { color: ct.splitLine } } },
      series: [{
        type: 'line',
        data: values,
        smooth: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { color: ct.seriesColors[0], width: 2 },
        itemStyle: { color: ct.seriesColors[0] },
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [adminData, selectedMetric, ct]);

  return (
    <div>
      <div className="flex gap-2 mb-2">
        {(['活力指数', '开工率', '金租渗透率'] as MetricKey[]).map(m => (
          <button key={m} onClick={() => setSelectedMetric(m)} className={`text-[10px] px-2 py-1 rounded ${selectedMetric === m ? 'badge-blue' : 'bg-[var(--c-surface)] text-[var(--c-text-secondary)]'}`}>
            {m}
          </button>
        ))}
      </div>
      <div ref={chartRef} className="w-full h-[170px]" />
    </div>
  );
};

export default MacroPanel;
