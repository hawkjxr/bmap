import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import {
  Zap, AlertTriangle, TrendingUp, DollarSign, Activity,
  Shield, CheckCircle, Clock, Eye, MapPin, BarChart3,
  Target, ArrowUp, ArrowDown, Minus, X, Bell
} from 'lucide-react';
import { useAppStore } from '../store/data';
import { useChartTheme } from '../hooks/useChartTheme';

export const CommanderDashboard: React.FC = () => {
  const firms = useAppStore(s => s.firms);
  const parks = useAppStore(s => s.parks);
  const riskAlerts = useAppStore(s => s.riskAlerts);
  const penetrationData = useAppStore(s => s.penetrationData);
  const adminData = useAppStore(s => s.adminData);
  const acknowledgeAlert = useAppStore(s => s.acknowledgeAlert);

  const unacknowledgedAlerts = riskAlerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.level === 'critical' || a.level === 'high');
  const normalFirms = firms.filter(f => f.risk === 'normal').length;
  const warningFirms = firms.filter(f => f.risk === 'warning').length;
  const dangerFirms = firms.filter(f => f.risk === 'danger').length;

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

  const avgPenetration = useMemo(() => {
    const parkData = penetrationData.filter(p => p.dimension === 'park');
    if (!parkData.length) return 0;
    return Math.round(parkData.reduce((a, b) => a + b.penetrationRate, 0) / parkData.length);
  }, [penetrationData]);

  return (
    <div className="h-full flex flex-col bg-[var(--c-bg)]">
      <div className="h-14 px-6 flex items-center justify-between border-b border-[var(--c-border)] shrink-0 bg-[var(--c-bg-elevated)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--c-accent)] to-[var(--c-yellow)] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tech-title">统帅驾驶舱</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {criticalAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--c-red)]/10 border border-[var(--c-red)]/30 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-[var(--c-red)]" />
              <span className="text-xs font-medium text-[var(--c-red)]">{criticalAlerts.length} 个紧急预警</span>
            </div>
          )}
          <span className="text-xs text-[var(--c-text-muted)]">{new Date().toLocaleString('zh-CN')}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        <div className="grid grid-cols-5 gap-4">
          <KPICard
            icon={<DollarSign className="w-5 h-5" />}
            label="实际投放额"
            value={`${totalInvestment.toFixed(1)}亿`}
            trend="+12.5%"
            trendUp
            color="var(--c-accent)"
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label="融资租赁余额"
            value={`${totalLease.toFixed(1)}亿`}
            trend="+8.2%"
            trendUp
            color="var(--c-green)"
          />
          <KPICard
            icon={<Target className="w-5 h-5" />}
            label="平均渗透率"
            value={`${avgPenetration}%`}
            trend="-2.1%"
            trendUp={false}
            color="var(--c-purple)"
          />
          <KPICard
            icon={<Activity className="w-5 h-5" />}
            label="设备IOT在线率"
            value="94.2%"
            trend="+0.5%"
            trendUp
            color="var(--c-cyan)"
          />
          <KPICard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="逾期敞口"
            value="3.2亿"
            trend="+15.8%"
            trendUp={false}
            color="var(--c-red)"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 tech-panel p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--c-red)]" />
                <span className="text-sm font-medium">红绿灯资产预警网</span>
              </div>
              <span className="text-[10px] text-[var(--c-text-muted)]">{unacknowledgedAlerts.length} 未读预警</span>
            </div>
            <RiskLightNetwork alerts={unacknowledgedAlerts} firms={firms} onAcknowledge={acknowledgeAlert} />
          </div>

          <div className="space-y-4">
            <div className="tech-panel p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--c-accent)]" />
                  <span className="text-sm font-medium">客户健康度</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--c-green)]" />
                    <span className="text-xs text-[var(--c-text-secondary)]">正常</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--c-green)]">{normalFirms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--c-yellow)]" />
                    <span className="text-xs text-[var(--c-text-secondary)]">关注</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--c-yellow)]">{warningFirms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--c-red)]" />
                    <span className="text-xs text-[var(--c-text-secondary)]">高危</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--c-red)]">{dangerFirms}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--c-border)]">
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div className="bg-[var(--c-green)]" style={{ width: `${(normalFirms / firms.length) * 100}%` }} />
                  <div className="bg-[var(--c-yellow)]" style={{ width: `${(warningFirms / firms.length) * 100}%` }} />
                  <div className="bg-[var(--c-red)]" style={{ width: `${(dangerFirms / firms.length) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="tech-panel p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-[var(--c-green)]" />
                <span className="text-sm font-medium">园区渗透率达标</span>
              </div>
              <div className="space-y-2">
                {penetrationData.filter(p => p.dimension === 'park').slice(0, 5).map(p => (
                  <div key={p.targetId}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--c-text-secondary)] truncate max-w-[120px]">{p.targetName}</span>
                      <span className={p.status === 'exceeding' ? 'text-[var(--c-green)]' : p.status === 'below' ? 'text-[var(--c-red)]' : 'text-[var(--c-yellow)]'}>
                        {p.penetrationRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--c-bg)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="tech-panel p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--c-accent)]" />
                <span className="text-sm font-medium">区域视角热力图</span>
              </div>
              <div className="flex gap-2">
                {['投放', '渗透率', '不良率'].map(m => (
                  <span key={m} className="text-[10px] px-2 py-1 rounded badge-blue">{m}</span>
                ))}
              </div>
            </div>
            <RegionalHeatmap adminData={adminData} />
          </div>

          <div className="tech-panel p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--c-purple)]" />
                <span className="text-sm font-medium">防雷预警监控</span>
              </div>
            </div>
            <RiskAlertList alerts={unacknowledgedAlerts} onAcknowledge={acknowledgeAlert} />
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  color: string;
}> = ({ icon, label, value, trend, trendUp, color }) => (
  <div className="tech-panel p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <span className="text-xs text-[var(--c-text-secondary)]">{label}</span>
    </div>
    <div className="text-2xl font-bold text-[var(--c-text)] mb-1">{value}</div>
    <div className="flex items-center gap-1">
      {trendUp ? (
        <ArrowUp className="w-3 h-3 text-[var(--c-green)]" />
      ) : (
        <ArrowDown className="w-3 h-3 text-[var(--c-red)]" />
      )}
      <span className={`text-[10px] font-medium ${trendUp ? 'text-[var(--c-green)]' : 'text-[var(--c-red)]'}`}>{trend}</span>
      <span className="text-[9px] text-[var(--c-text-muted)]">环比</span>
    </div>
  </div>
);

const RiskLightNetwork: React.FC<{
  alerts: ReturnType<typeof useAppStore>['riskAlerts'];
  firms: ReturnType<typeof useAppStore>['firms'];
  onAcknowledge: (id: string) => void;
}> = ({ alerts, firms, onAcknowledge }) => {
  const dangerFirms = firms.filter(f => f.risk === 'danger');
  const warningFirms = firms.filter(f => f.risk === 'warning');

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
      {dangerFirms.map(firm => (
        <div key={firm.id} className="p-3 rounded-lg bg-[var(--c-red)]/5 border border-[var(--c-red)]/30 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--c-red)] animate-blink" />
              <span className="text-sm font-medium text-[var(--c-text)]">{firm.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--c-red)]">{firm.rating}</span>
              <button onClick={() => {
                const alert = alerts.find(a => a.firmId === firm.id);
                if (alert) onAcknowledge(alert.id);
              }} className="text-[9px] px-2 py-1 rounded bg-[var(--c-red)]/10 text-[var(--c-red)] hover:bg-[var(--c-red)]/20">
                查看详情
              </button>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-[var(--c-text-muted)]">
            <div>不良率: <span className="text-[var(--c-red)]">{firm.indicators.nplRatio}%</span></div>
            <div>逾期: <span className="text-[var(--c-red)]">92天</span></div>
            <div>IOT: <span className="text-[var(--c-red)]">离线</span></div>
          </div>
        </div>
      ))}
      {warningFirms.map(firm => (
        <div key={firm.id} className="p-3 rounded-lg bg-[var(--c-yellow)]/5 border border-[var(--c-yellow)]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--c-yellow)]" />
              <span className="text-sm font-medium text-[var(--c-text)]">{firm.name}</span>
            </div>
            <span className="text-[10px] text-[var(--c-yellow)]">{firm.rating}</span>
          </div>
        </div>
      ))}
      {dangerFirms.length === 0 && warningFirms.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-10 h-10 text-[var(--c-green)] mx-auto mb-2" />
          <div className="text-sm text-[var(--c-text-secondary)]">暂无风险预警</div>
        </div>
      )}
    </div>
  );
};

const RegionalHeatmap: React.FC<{ adminData: ReturnType<typeof useAppStore>['adminData'] }> = ({ adminData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.EChartsType | null>(null);
  const ct = useChartTheme();
  const [metric, setMetric] = useState<keyof typeof adminData>('投放');

  useEffect(() => {
    if (!chartRef.current) return;
    chart.current = echarts.init(chartRef.current);
    return () => { chart.current?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    const data = adminData[metric];
    if (!data) return;

    const provinces = Object.entries(data).map(([name, value]) => ({ name, value }));

    chart.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.3,
        center: [105, 36],
        itemStyle: { areaColor: '#0B1D3A', borderColor: '#1A3A6A', borderWidth: 1 },
        emphasis: { itemStyle: { areaColor: '#0F2547' }, label: { show: true, color: '#fff', fontSize: 10 } },
      },
      series: [{
        type: 'map',
        geoIndex: 0,
        data: provinces,
        visualMap: {
          min: 0,
          max: Math.max(...Object.values(data).map(v => v || 0)),
          textStyle: { color: ct.text },
          inRange: { color: ['#1a3a5c', '#2e6b9e', '#5ba3d9', '#8ecfff'] },
        },
      }],
    });

    const h = () => chart.current?.resize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [adminData, metric, ct]);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {(['投放', '融资租赁', '活力指数', '不良率'] as const).map(m => (
          <button key={m} onClick={() => setMetric(m)} className={`text-[10px] px-2 py-1 rounded ${metric === m ? 'badge-blue' : 'bg-[var(--c-surface)] text-[var(--c-text-secondary)]'}`}>
            {m}
          </button>
        ))}
      </div>
      <div ref={chartRef} className="w-full h-[300px]" />
    </div>
  );
};

const RiskAlertList: React.FC<{
  alerts: ReturnType<typeof useAppStore>['riskAlerts'];
  onAcknowledge: (id: string) => void;
}> = ({ alerts, onAcknowledge }) => {
  const levelColors: Record<string, string> = {
    critical: 'var(--c-red)',
    high: 'var(--c-red)',
    medium: 'var(--c-yellow)',
    low: 'var(--c-green)',
  };

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
      {alerts.slice(0, 8).map(alert => (
        <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--c-surface)]">
          <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: levelColors[alert.level] }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--c-text)]">{alert.title}</span>
              <button onClick={() => onAcknowledge(alert.id)} className="text-[9px] text-[var(--c-text-muted)] hover:text-[var(--c-accent)]">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[10px] text-[var(--c-text-muted)] mt-0.5">{alert.firmName}</div>
            <div className="text-[9px] text-[var(--c-text-muted)] mt-1">{alert.desc}</div>
          </div>
        </div>
      ))}
      {alerts.length === 0 && (
        <div className="text-center py-8">
          <Bell className="w-10 h-10 text-[var(--c-text-muted)] mx-auto mb-2" />
          <div className="text-sm text-[var(--c-text-secondary)]">暂无未读预警</div>
        </div>
      )}
    </div>
  );
};

export default CommanderDashboard;
