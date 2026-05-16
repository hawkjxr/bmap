import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import {
  Users, Search, Radar, TrendingUp, DollarSign, AlertTriangle,
  Building2, MapPin, Link2, FileText, ChevronRight, Star, Filter
} from 'lucide-react';
import { useAppStore } from '../store/data';
import { useChartTheme } from '../hooks/useChartTheme';

export const CustomerView: React.FC = () => {
  const firms = useAppStore(s => s.firms);
  const parks = useAppStore(s => s.parks);
  const executives = useAppStore(s => s.executives);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFirm, setSelectedFirm] = useState<string | null>(null);

  const filteredFirms = useMemo(() => {
    if (!searchQuery) return firms;
    const q = searchQuery.toLowerCase();
    return firms.filter(f => f.name.toLowerCase().includes(q) || f.fullName.toLowerCase().includes(q));
  }, [firms, searchQuery]);

  const selectedFirmData = firms.find(f => f.id === selectedFirm);
  const selectedPark = selectedFirmData?.parkIds?.[0] ? parks.find(p => p.id === selectedFirmData.parkIds[0]) : null;
  const selectedExecs = executives.filter(e => e.firmId === selectedFirm);

  return (
    <div className="h-full flex flex-col bg-[var(--c-bg)]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[var(--c-accent)]" />
          <h1 className="text-lg font-bold tech-title">客户全景视图</h1>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索企业名称..."
            className="w-64 pl-9 pr-4 py-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg text-xs text-[var(--c-text)] placeholder:text-[var(--c-text-muted)] focus:outline-none focus:border-[var(--c-accent)]"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-[var(--c-border)] overflow-y-auto p-4 scrollbar-thin shrink-0">
          <div className="text-xs text-[var(--c-text-muted)] mb-3">企业列表 ({filteredFirms.length})</div>
          <div className="space-y-2">
            {filteredFirms.map(firm => (
              <button
                key={firm.id}
                onClick={() => setSelectedFirm(firm.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedFirm === firm.id
                    ? 'bg-[var(--c-accent)]/10 border border-[var(--c-accent)]/30'
                    : 'bg-[var(--c-surface)] hover:bg-[var(--c-accent)]/5 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--c-text-muted)]" />
                    <div>
                      <div className="text-xs font-medium text-[var(--c-text)]">{firm.name}</div>
                      <div className="text-[9px] text-[var(--c-text-muted)]">{firm.scale} | {firm.industryIds?.[0] || '未知行业'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {firm.risk === 'danger' && <span className="badge-red text-[8px]">高危</span>}
                    {firm.risk === 'warning' && <span className="badge-yellow text-[8px]">关注</span>}
                    {firm.rating && <span className="text-[9px] text-[var(--c-accent)]">{firm.rating}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {selectedFirmData ? (
            <div className="space-y-6">
              <div className="tech-panel p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-[var(--c-text)]">{selectedFirmData.name}</h2>
                      <span className={`text-xs px-2 py-1 rounded ${selectedFirmData.risk === 'danger' ? 'badge-red' : selectedFirmData.risk === 'warning' ? 'badge-yellow' : 'badge-green'}`}>
                        {selectedFirmData.risk === 'danger' ? '高危' : selectedFirmData.risk === 'warning' ? '关注' : '正常'}
                      </span>
                      {selectedFirmData.rating && <span className="text-sm text-[var(--c-accent)]">{selectedFirmData.rating}</span>}
                    </div>
                    <div className="text-sm text-[var(--c-text-secondary)]">{selectedFirmData.fullName}</div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--c-text-muted)]">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{selectedPark?.name || '未知园区'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedFirmData.establishedYear}年成立</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{selectedFirmData.asset}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[var(--c-text)]">{selectedFirmData.indicators.creditScore || '-'}</div>
                    <div className="text-xs text-[var(--c-text-muted)]">信用评分</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="tech-panel p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-4 h-4 text-[var(--c-green)]" />
                    <span className="text-sm font-medium">负债结构</span>
                  </div>
                  <LiabilitySunburst firm={selectedFirmData} />
                </div>

                <div className="tech-panel p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Radar className="w-4 h-4 text-[var(--c-accent)]" />
                    <span className="text-sm font-medium">六维雷达</span>
                  </div>
                  <RadarChart firm={selectedFirmData} />
                </div>

                <div className="tech-panel p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-[var(--c-red)]" />
                    <span className="text-sm font-medium">资信报告</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--c-text-muted)]">信用评分</span>
                      <span className="text-sm font-medium text-[var(--c-text)]">{selectedFirmData.indicators.creditScore || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--c-text-muted)]">不良率</span>
                      <span className={`text-sm font-medium ${(selectedFirmData.indicators.nplRatio || 0) > 2 ? 'text-[var(--c-red)]' : 'text-[var(--c-text)]'}`}>
                        {selectedFirmData.indicators.nplRatio || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--c-text-muted)]">授信额度</span>
                      <span className="text-sm font-medium text-[var(--c-text)]">{(selectedFirmData.indicators.creditLimit || 0) / 1e8}亿</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--c-text-muted)]">已用额度</span>
                      <span className="text-sm font-medium text-[var(--c-text)]">{(selectedFirmData.indicators.usedLimit || 0) / 1e8}亿</span>
                    </div>
                    <div className="pt-2 border-t border-[var(--c-border)]">
                      <div className="h-2 bg-[var(--c-bg)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--c-accent)]"
                          style={{ width: `${Math.min(100, ((selectedFirmData.indicators.usedLimit || 0) / (selectedFirmData.indicators.creditLimit || 1)) * 100)}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-[var(--c-text-muted)] mt-1">额度使用率</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="tech-panel p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-[var(--c-cyan)]" />
                    <span className="text-sm font-medium">IoT/数智指标</span>
                  </div>
                  <IotTrendChart firm={selectedFirmData} />
                </div>

                <div className="tech-panel p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="w-4 h-4 text-[var(--c-purple)]" />
                    <span className="text-sm font-medium">触达关系路径</span>
                  </div>
                  <RelationPath firm={selectedFirmData} />
                </div>
              </div>

              <div className="tech-panel p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-[var(--c-yellow)]" />
                  <span className="text-sm font-medium">高管信息</span>
                </div>
                <div className="space-y-2">
                  {selectedExecs.map(exec => (
                    <div key={exec.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-bg)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--c-accent)]/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-[var(--c-accent)]">{exec.name[0]}</span>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[var(--c-text)]">{exec.name}</div>
                          <div className="text-[9px] text-[var(--c-text-muted)]">{exec.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exec.phone && <span className="text-[9px] text-[var(--c-text-muted)]">{exec.phone}</span>}
                        {exec.isLegalRep && <span className="text-[8px] px-1.5 py-0.5 rounded badge-blue">法人</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 text-[var(--c-text-muted)] mx-auto mb-3" />
                <div className="text-sm text-[var(--c-text-secondary)]">请选择左侧企业查看详情</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LiabilitySunburst: React.FC<{ firm: ReturnType<typeof useAppStore>['firms'][0] }> = ({ firm }) => {
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
    const data = [
      { name: '银行', value: 45, itemStyle: { color: ct.seriesColors[0] } },
      { name: '融资租赁', value: 30, itemStyle: { color: ct.seriesColors[1] } },
      { name: '债券', value: 15, itemStyle: { color: ct.seriesColors[2] } },
      { name: '其他', value: 10, itemStyle: { color: ct.seriesColors[3] } },
    ];

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      series: [{ type: 'sunburst', data, radius: ['40%', '90%'], label: { show: true, fontSize: 9, color: ct.text } }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [ct]);

  return <div ref={chartRef} className="w-full h-[200px]" />;
};

const RadarChart: React.FC<{ firm: ReturnType<typeof useAppStore>['firms'][0] }> = ({ firm }) => {
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
    const ind = firm.indicators;
    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      radar: {
        indicator: [
          { name: '资产规模', max: 100 }, { name: '营收增长', max: 100 }, { name: '信用评分', max: 100 },
          { name: '盈利能力', max: 100 }, { name: '偿债能力', max: 100 }, { name: '运营效率', max: 100 },
        ],
        axisName: { color: ct.textSecondary, fontSize: 10 },
        splitLine: { lineStyle: { color: ct.splitLine } },
        splitArea: { areaStyle: { color: ['transparent', 'transparent'] } },
      },
      series: [{
        type: 'radar',
        data: [{ value: [85, ind.yoyGrowth || 50, ind.creditScore || 60, ind.profitMargin || 50, 100 - (ind.debtRatio || 50), ind.operatingRate || 70], name: firm.name, areaStyle: { color: `${ct.seriesColors[0]}40` }, lineStyle: { color: ct.seriesColors[0] }, itemStyle: { color: ct.seriesColors[0] } }],
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [firm, ct]);

  return <div ref={chartRef} className="w-full h-[200px]" />;
};

const IotTrendChart: React.FC<{ firm: ReturnType<typeof useAppStore>['firms'][0] }> = ({ firm }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();
  const [metric, setMetric] = useState<'electricityUsage' | 'operatingRate' | 'vitalityIndex'>('vitalityIndex');

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
    const metricLabels = { electricityUsage: '用电量(万度)', operatingRate: '开工率(%)', vitalityIndex: '活力指数' };
    const base = metric === 'electricityUsage' ? firm.indicators.electricityUsage || 500 : metric === 'operatingRate' ? firm.indicators.operatingRate || 80 : firm.indicators.vitalityIndex || 75;
    const data = months.map((_, i) => Math.max(0, base * (0.85 + Math.random() * 0.3)));

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel, fontSize: 10 } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.axisLabel }, splitLine: { lineStyle: { color: ct.splitLine } } },
      series: [{ type: 'line', data, smooth: true, areaStyle: { opacity: 0.2 }, lineStyle: { color: ct.seriesColors[2], width: 2 }, itemStyle: { color: ct.seriesColors[2] } }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [firm, metric, ct]);

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {(['electricityUsage', 'operatingRate', 'vitalityIndex'] as const).map(m => (
          <button key={m} onClick={() => setMetric(m)} className={`text-[9px] px-2 py-1 rounded ${metric === m ? 'badge-blue' : 'bg-[var(--c-surface)] text-[var(--c-text-secondary)]'}`}>
            {m === 'electricityUsage' ? '用电量' : m === 'operatingRate' ? '开工率' : '活力指数'}
          </button>
        ))}
      </div>
      <div ref={chartRef} className="w-full h-[170px]" />
    </div>
  );
};

const RelationPath: React.FC<{ firm: ReturnType<typeof useAppStore>['firms'][0] }> = ({ firm }) => {
  const firmRelations = useAppStore(s => s.firmRelations);
  const managers = useAppStore(s => s.managers);
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
    const rels = firmRelations.filter(r => r.sourceFirmId === firm.id || r.targetFirmId === firm.id).slice(0, 5);
    const nodes = [
      { id: firm.id, name: firm.name, x: 0.5, y: 0.5, fixed: true },
      ...rels.map((r, i) => {
        const otherId = r.sourceFirmId === firm.id ? r.targetFirmId : r.sourceFirmId;
        const angle = (i / rels.length) * Math.PI * 2;
        return { id: otherId, name: `企业${i + 1}`, x: 0.5 + Math.cos(angle) * 0.35, y: 0.5 + Math.sin(angle) * 0.35 };
      }),
    ];
    const links = rels.map(r => ({ source: firm.id, target: r.sourceFirmId === firm.id ? r.targetFirmId : r.sourceFirmId }));

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      series: [{
        type: 'graph',
        layout: 'none',
        nodes: nodes.map((n, i) => ({ id: n.id, name: n.name, x: n.x, y: n.y, fixed: n.fixed, symbolSize: i === 0 ? 50 : 30, itemStyle: { color: i === 0 ? ct.seriesColors[0] : ct.seriesColors[i % 4 + 1] } })),
        links: links.map(l => ({ source: l.source, target: l.target })),
        label: { show: true, fontSize: 9, color: ct.text },
        lineStyle: { color: ct.splitLine, curveness: 0.3 },
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [firm, firmRelations, ct]);

  return <div ref={chartRef} className="w-full h-[200px]" />;
};

export default CustomerView;
