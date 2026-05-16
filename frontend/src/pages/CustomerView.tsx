import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import {
  Cpu, Brain, Wallet, ArrowLeft, Phone, Bot,
  FileText, MessageSquare, Target, BarChart3, Zap, AlertTriangle,
  ChevronDown, X, ExternalLink, Users, Link2, Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChartTheme } from '../hooks/useChartTheme';
import { useToast } from '../store/toast';
import { CustomerRelationPanel } from '../components/CustomerView/CustomerRelationPanel';
import { RobotChat } from '../components/Robot/RobotChat';
import { customerRobotConfig } from '../data/robotData';

// ─── 指标监测数据配置 ────────────────────────────────────────

// 指标配置：valueGetter 返回 {value: number, unit: string}，用于双Y轴图表
type MetricKey = 'iot' | 'digital' | 'benchmark';

interface MetricConfig {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryUnit: string;
  secondaryUnit: string;
  primaryColor: string;
  secondaryColor: string;
}

const metricConfigs: Record<MetricKey, MetricConfig> = {
  iot: {
    label: 'IoT设备监测',
    icon: Cpu,
    iconColor: '#00E676',
    primaryLabel: '开工时长(h)',
    secondaryLabel: '用电量(kWh)',
    primaryUnit: 'h/天',
    secondaryUnit: 'kWh',
    primaryColor: '#00E676',
    secondaryColor: '#3B82F6',
  },
  digital: {
    label: '数智前瞻指标',
    icon: Brain,
    iconColor: '#A78BFA',
    primaryLabel: 'AI Token量(万/月)',
    secondaryLabel: 'SaaS活跃度(分)',
    primaryUnit: '万/月',
    secondaryUnit: '分',
    primaryColor: '#A78BFA',
    secondaryColor: '#3B82F6',
  },
  benchmark: {
    label: '基准线指标',
    icon: BarChart3,
    iconColor: '#FAAD14',
    primaryLabel: '开工率(%)',
    secondaryLabel: '营收增速(%)',
    primaryUnit: '%',
    secondaryUnit: '%',
    primaryColor: '#FAAD14',
    secondaryColor: '#00E676',
  },
};

// ─── 子图表组件 ─────────────────────────────────────────────

// 通用双 Y 轴图表（可切换指标）
const DualAxisChart: React.FC<{
  metricKey: MetricKey;
  primaryData: number[];
  secondaryData: number[];
  days: number;
  primaryUnit: string;
  secondaryUnit: string;
  primaryColor: string;
  secondaryColor: string;
}> = ({ metricKey, primaryData, secondaryData, days, primaryUnit, secondaryUnit, primaryColor, secondaryColor }) => {
  const ref = useRef<HTMLDivElement>(null);
  const tc = useChartTheme();
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const dateLabels = Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - days + i);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const primaryLabel = metricConfigs[metricKey].primaryLabel;
    const secondaryLabel = metricConfigs[metricKey].secondaryLabel;
    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 40, right: 60, bottom: 30, left: 50 },
      legend: {
        data: [primaryLabel, secondaryLabel],
        textStyle: { color: tc.labelColor, fontSize: 10 }, top: 5
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: tc.tooltipBg,
        borderColor: tc.tooltipBorder,
        textStyle: { color: tc.textWhite }
      },
      xAxis: {
        type: 'category', data: dateLabels,
        axisLabel: { color: tc.labelColor, fontSize: 9, interval: Math.floor(days / 6) },
        axisLine: { lineStyle: { color: tc.axisLine } }
      },
      yAxis: [
        {
          type: 'value', name: primaryUnit,
          nameTextStyle: { color: tc.labelColor, fontSize: 10 },
          axisLabel: { color: tc.labelColor, fontSize: 10 },
          splitLine: { lineStyle: { color: tc.splitLine, type: 'dashed' } },
          axisLine: { lineStyle: { color: tc.axisLine } }
        },
        {
          type: 'value', name: secondaryUnit,
          nameTextStyle: { color: tc.labelColor, fontSize: 10 },
          axisLabel: { color: tc.labelColor, fontSize: 10 },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: tc.axisLine } }
        },
      ],
      series: [
        {
          name: primaryLabel, type: 'line', data: primaryData, smooth: true, symbol: 'none',
          lineStyle: { color: primaryColor, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: primaryColor + '33' },
              { offset: 1, color: 'transparent' }
            ])
          }
        },
        {
          name: secondaryLabel, type: 'line', yAxisIndex: 1, data: secondaryData, smooth: true, symbol: 'none',
          lineStyle: { color: secondaryColor, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: secondaryColor + '26' },
              { offset: 1, color: 'transparent' }
            ])
          }
        },
      ],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [tc, metricKey, primaryData, secondaryData, days, primaryUnit, secondaryUnit, primaryColor, secondaryColor]);
  return <div ref={ref} style={{ width: '100%', height: 220 }} />;
};

// 雷达图：动态基准线对标
const RadarChart: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const tc = useChartTheme();
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      backgroundColor: 'transparent',
      radar: {
        indicator: [
          { name: '开工率', max: 100 }, { name: '能耗增速', max: 100 },
          { name: 'AI活跃度', max: 100 }, { name: '金租依赖度', max: 100 },
          { name: '营收增速', max: 100 }, { name: '信用评级', max: 100 },
        ],
        axisName: { color: tc.labelColor, fontSize: 10 },
        splitLine: { lineStyle: { color: tc.splitLine } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: tc.axisLine } },
      },
      legend: {
        data: ['企业B', '园区均值', '全国均值'],
        textStyle: { color: tc.labelColor, fontSize: 10 }, bottom: 0
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [92, 78, 85, 15, 88, 80], name: '企业B',
            areaStyle: { color: 'rgba(0,230,118,0.15)' },
            lineStyle: { color: '#00E676', width: 2 },
            itemStyle: { color: '#00E676' }
          },
          {
            value: [75, 60, 55, 40, 65, 70], name: '园区均值',
            lineStyle: { color: '#3B82F6', type: 'dashed', width: 1.5 },
            itemStyle: { color: '#3B82F6' }
          },
          {
            value: [68, 50, 45, 35, 55, 65], name: '全国均值',
            lineStyle: { color: tc.labelColor, type: 'dashed', width: 1 },
            itemStyle: { color: tc.labelColor }
          },
        ],
      }],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [tc]);
  return <div ref={ref} style={{ width: '100%', height: 240 }} />;
};

// 旭日图：负债结构
const DebtChart: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const tc = useChartTheme();
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: tc.tooltipBg,
        borderColor: tc.tooltipBorder,
        textStyle: { color: tc.textWhite }
      },
      series: [{
        type: 'sunburst',
        radius: ['15%', '90%'],
        sort: undefined,
        itemStyle: { borderWidth: 2, borderColor: tc.mapArea2 },
        label: { color: tc.textWhite, fontSize: 10 },
        data: [
          {
            name: '银行信贷', value: 18000, itemStyle: { color: '#3B82F6' },
            children: [
              { name: '工商银行', value: 8000, itemStyle: { color: '#2563EB' } },
              { name: '建设银行', value: 5000, itemStyle: { color: '#1D4ED8' } },
              { name: '短期流贷', value: 5000, itemStyle: { color: '#EF4444' }, label: { color: '#EF4444' } },
            ]
          },
          {
            name: '金租同业', value: 0, itemStyle: { color: tc.axisLine },
            children: [{ name: '暂无记录', value: 100, itemStyle: { color: tc.axisLine } }]
          },
          {
            name: '其他融资', value: 3000, itemStyle: { color: tc.labelColor },
            children: [
              { name: '商业承兑', value: 2000, itemStyle: { color: '#4B5563' } },
              { name: '担保融资', value: 1000, itemStyle: { color: '#374151' } },
            ]
          },
        ],
      }],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [tc]);
  return <div ref={ref} style={{ width: '100%', height: 240 }} />;
};

// ─── 弹窗组件 ────────────────────────────────────────────────

// 客户触达路径弹窗
const ReachPathModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="w-[720px] max-h-[80vh] rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)' }}>
      {/* 弹窗头部 */}
      <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>客户触达路径建议</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 transition-colors">
          <X className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />
        </button>
      </div>
      {/* 标签切换 */}
      <div className="px-5 py-3 flex items-center gap-2 shrink-0" style={{ borderBottom: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface)' }}>
        {[
          { icon: Users, label: '存量客户朋友圈', active: true },
          { icon: Link2, label: '产业链中转', active: false },
          { icon: Network, label: '协会机会挖掘', active: false },
        ].map((tab, i) => (
          <button key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${tab.active ? 'bg-blue-500/15 text-blue-400' : 'hover:bg-white/5'}`} style={{ color: tab.active ? '#60A5FA' : 'var(--c-text-muted)' }}>
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>
      {/* 弹窗内容 */}
      <div className="flex-1 overflow-hidden">
        <CustomerRelationPanel chartHeight={420} />
      </div>
    </div>
  </div>
);

// 建立工单弹窗
const WorkOrderModal: React.FC<{ onClose: () => void; toast: { show: (m: string) => void }; navigate: (p: string) => void }> = ({ onClose, toast, navigate }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="w-[480px] rounded-xl overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)' }}>
      {/* 弹窗头部 */}
      <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>建立工单</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">营销方案</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 transition-colors">
          <X className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />
        </button>
      </div>
      {/* 方案内容 */}
      <div className="p-5 space-y-3 flex-1">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-400 font-bold text-base">3年期直租</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 font-bold">优先推荐</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-400">
            <div className="flex justify-between"><span>融资金额</span><span className="text-white font-mono font-bold">5,000 万</span></div>
            <div className="flex justify-between"><span>期限</span><span className="text-white font-mono">36 个月</span></div>
            <div className="flex justify-between"><span>租赁物</span><span className="text-white">新建产线设备</span></div>
            <div className="flex justify-between"><span>预估IRR</span><span className="text-cyan-300 font-mono">6.8%</span></div>
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div className="text-blue-400 font-bold text-[11px] mb-1.5">备选方案</div>
          <div className="space-y-1 text-[10px] text-gray-500">
            <div className="flex justify-between"><span>3年期回租</span><span className="text-gray-400">3,000万 / IRR 6.5%</span></div>
            <div className="flex justify-between"><span>流贷置换</span><span className="text-gray-400">5,000万 / IRR 5.2%</span></div>
          </div>
        </div>
        <button
          onClick={() => { toast.show('已生成拓客工单「3年期直租 · 5000万」，指派给 李明'); onClose(); navigate('/tasks'); }}
          className="w-full py-3 rounded-lg text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          生成拓客工单
        </button>
      </div>
    </div>
  </div>
);

// 客户资信报告内容
const CreditReportContent: React.FC = () => (
  <div className="flex flex-col gap-3 h-full">
    {/* 综合评分 */}
    <div className="tech-panel p-4 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--c-border)" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#00E676" strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 42 * 0.78} ${2 * Math.PI * 42}`}
            strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-green-400">78</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold mb-1" style={{ color: 'var(--c-text)' }}>综合资信评分</div>
        <div className="text-[11px]" style={{ color: 'var(--c-text-secondary)' }}>
          基于开工率/融资结构/数智活跃度等6维度综合评估
        </div>
        <div className="mt-1.5 flex gap-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">优</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">金租机会大</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">短贷错配风险</span>
        </div>
      </div>
    </div>

    {/* 关键指标 */}
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: '资产规模', value: '8.5亿', color: '#3B82F6' },
        { label: '年营收', value: '12.3亿', color: '#00E676' },
        { label: '负债率', value: '62%', color: '#FAAD14' },
        { label: '银行授信', value: '2.1亿', color: '#3B82F6' },
        { label: '已用额度', value: '1.8亿', color: '#EF4444' },
        { label: '金租空间', value: '3000万+', color: '#00E676' },
      ].map(item => (
        <div key={item.label} className="tech-panel p-2.5 text-center">
          <div className="text-[10px] mb-1" style={{ color: 'var(--c-text-muted)' }}>{item.label}</div>
          <div className="text-[13px] font-bold font-mono" style={{ color: item.color }}>{item.value}</div>
        </div>
      ))}
    </div>

    {/* 风险提示 */}
    <div className="tech-panel p-3 flex-1" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[11px] font-bold text-red-400">风险提示</span>
      </div>
      <div className="space-y-1.5 text-[10px]" style={{ color: 'var(--c-text-secondary)' }}>
        <div className="flex items-start gap-1.5">
          <span className="text-red-400 mt-0.5 shrink-0">·</span>
          <span>短贷长投：5000万1年期短贷无匹配用途，疑似用于采购长期产线设备</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-yellow-400 mt-0.5 shrink-0">·</span>
          <span>金租空白：全市场无金租记录，介入空间极大但需防范他行先入</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="text-blue-400 mt-0.5 shrink-0">·</span>
          <span>扩张信号：AI调用量+156%、招聘+18个岗位，扩张意愿强烈</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── 主组件 ─────────────────────────────────────────────────

export const CustomerView: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [customerRobotOpen, setCustomerRobotOpen] = useState(false);
  const [reachPathOpen, setReachPathOpen] = useState(false);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricKey>('iot');

  // 指标数据
  const metricData: Record<MetricKey, { primary: number[]; secondary: number[] }> = {
    iot: {
      primary: Array.from({ length: 90 }, () => 14 + Math.random() * 6),
      secondary: Array.from({ length: 90 }, () => 2000 + Math.random() * 1500),
    },
    digital: {
      primary: Array.from({ length: 180 }, () => 280 + Math.random() * 120),
      secondary: Array.from({ length: 180 }, () => 75 + Math.random() * 30),
    },
    benchmark: {
      primary: Array.from({ length: 365 }, () => 80 + Math.random() * 20),
      secondary: Array.from({ length: 365 }, () => 60 + Math.random() * 30),
    },
  };

  const metricDays: Record<MetricKey, number> = {
    iot: 90,
    digital: 180,
    benchmark: 365,
  };

  const cfg = metricConfigs[activeMetric];

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ═══ 区块 1: 页面顶部固定栏（客户基本信息 + 快捷按钮） ═══ */}
      <div className="shrink-0 px-5 py-3 flex items-center gap-4" style={{ borderBottom: '2px solid var(--c-border-strong)', backgroundColor: 'var(--c-bg-elevated)' }}>
        {/* 返回 */}
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--c-text-muted)' }} />
        </button>

        {/* 企业头像 + 名称 */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-cyan-400 flex items-center justify-center text-white font-bold text-base shrink-0">
          B
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
            武进某锂电设备制造企业
            {/* 机器人图标 */}
            <button
              onClick={() => setCustomerRobotOpen(true)}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-blue-500/20"
              title="企业智脑 AI 问答"
            >
              <Bot className="w-3.5 h-3.5 text-white" />
            </button>
          </h2>
          <div className="flex items-center gap-2 text-[10px] mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
            <span>91320412MA********</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-500/15 text-green-400 font-bold">AA+</span>
            <span>授信: <b className="text-cyan-300 font-mono">0 万</b></span>
          </div>
        </div>

        {/* 快捷操作按钮 + 建议产品 */}
        <div className="ml-auto flex items-center gap-2 h-12">
          {/* 触达路径按钮 */}
          <button
            onClick={() => setReachPathOpen(true)}
            className="h-full flex items-center gap-2 px-3 rounded-lg text-[11px] font-medium transition-all hover:brightness-110"
            style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA' }}
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            触达路径
            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
          </button>

          {/* 建立工单：推荐3年期直租服务 */}
          <div className="h-full tech-panel px-3 flex items-center gap-2" style={{ borderColor: 'rgba(0,230,118,0.25)' }}>
            <MessageSquare className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <div className="flex flex-col justify-center">
              <div className="text-[10px] text-gray-500 leading-tight">建立工单</div>
              <button
                onClick={() => setWorkOrderOpen(true)}
                className="text-[11px] font-bold text-green-400 leading-tight hover:underline transition-all"
              >
                推荐3年期直租服务
              </button>
            </div>
          </div>

          {/* 管户客户经理 */}
          <div className="h-full tech-panel px-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              李
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[11px] font-bold leading-tight" style={{ color: 'var(--c-text)' }}>
                李明 <span className="font-normal text-gray-500 text-[9px]">管户客户经理</span>
              </div>
              <div className="flex items-center gap-2 text-[9px]" style={{ color: 'var(--c-text-muted)' }}>
                <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> 138****5678</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 页面主体：两行布局 ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* 区块 2: 三列布局（负债结构 + 基准线对标 + 指标监测） */}
        <div className="p-4 pb-2 grid grid-cols-3 gap-4 shrink-0">
          {/* 左：负债结构剖析 */}
          <div className="tech-panel p-4 flex flex-col">
            <h3 className="tech-title flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-yellow-400" />
              负债结构剖析
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 font-normal">短贷错配</span>
            </h3>
            <div className="flex gap-3 flex-1">
              <div className="flex-1"><DebtChart /></div>
              <div className="w-[180px] space-y-2 flex flex-col justify-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="text-red-400 font-bold text-[10px] mb-0.5">短贷长投风险</div>
                  <p className="text-[9px] text-gray-500">5000万1年短贷疑似用于采购产线设备，期限错配。</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}>
                  <div className="text-green-400 font-bold text-[10px] mb-0.5">金租介入机会</div>
                  <p className="text-[9px] text-gray-500">全市场无金租记录，介入空间极大。</p>
                </div>
                <table className="w-full text-[9px]">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="text-left py-1 font-normal">机构</th>
                      <th className="text-right py-1 font-normal">金额</th>
                      <th className="text-right py-1 font-normal">到期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['工商银行', '8,000万', '2027-03', false],
                      ['建设银行', '5,000万', '2027-06', false],
                      ['短期流贷', '5,000万', '2026-11', true],
                    ].map(([a, b, c, d], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(30,64,112,0.15)' }}>
                        <td className="py-1 text-gray-500">{a}</td>
                        <td className="py-1 text-right text-gray-400">{b}</td>
                        <td className={`py-1 text-right ${d ? 'text-red-400' : 'text-gray-500'}`}>{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 中：动态基准线对标 */}
          <div className="tech-panel p-4 flex flex-col">
            <h3 className="tech-title flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              动态基准线对标
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-normal">六维雷达</span>
            </h3>
            <div className="flex-1"><RadarChart /></div>
          </div>

          {/* 右：指标监测 */}
          <div className="tech-panel p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <cfg.icon className="w-4 h-4" style={{ color: cfg.iconColor }} />
              <h3 className="tech-title" style={{ color: 'var(--c-text)' }}>指标监测</h3>
              {/* 指标切换下拉 */}
              <div className="ml-auto relative">
                <select
                  value={activeMetric}
                  onChange={e => setActiveMetric(e.target.value as MetricKey)}
                  className="appearance-none pl-2 pr-6 py-1 rounded-lg text-[10px] font-medium outline-none cursor-pointer"
                  style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                >
                  {(Object.keys(metricConfigs) as MetricKey[]).map(key => (
                    <option key={key} value={key}>{metricConfigs[key].label}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-text-muted)' }} />
              </div>
            </div>
            <div className="flex-1">
              <DualAxisChart
                metricKey={activeMetric}
                primaryData={metricData[activeMetric].primary}
                secondaryData={metricData[activeMetric].secondary}
                days={metricDays[activeMetric]}
                primaryUnit={cfg.primaryUnit}
                secondaryUnit={cfg.secondaryUnit}
                primaryColor={cfg.primaryColor}
                secondaryColor={cfg.secondaryColor}
              />
            </div>
            {/* 均值汇总 */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: `${cfg.primaryColor}0F`, border: `1px solid ${cfg.primaryColor}33` }}>
                <div className="text-gray-500 mb-0.5">{cfg.primaryLabel}</div>
                <div className="font-bold font-mono" style={{ color: cfg.primaryColor }}>
                  {activeMetric === 'iot' ? '16.8' : activeMetric === 'digital' ? '342' : '84.5'}{' '}{cfg.primaryUnit}
                </div>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: `${cfg.secondaryColor}0F`, border: `1px solid ${cfg.secondaryColor}33` }}>
                <div className="text-gray-500 mb-0.5">{cfg.secondaryLabel}</div>
                <div className="font-bold font-mono" style={{ color: cfg.secondaryColor }}>
                  {activeMetric === 'iot' ? '2,847' : activeMetric === 'digital' ? '92.3' : '72.1'}{' '}{cfg.secondaryUnit}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 区块 3: 客户资信报告（与区块2宽度对齐） */}
        <div className="px-4 pb-4 shrink-0" style={{ height: '220px' }}>
          <div className="tech-panel p-4 h-full">
            <h3 className="tech-title flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              客户资信报告
            </h3>
            <div className="h-[calc(100%-32px)]"><CreditReportContent /></div>
          </div>
        </div>
      </div>

      {/* ═══ 弹窗 ═══ */}
      {reachPathOpen && <ReachPathModal onClose={() => setReachPathOpen(false)} />}
      {workOrderOpen && <WorkOrderModal onClose={() => setWorkOrderOpen(false)} toast={toast} navigate={navigate} />}
      {customerRobotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setCustomerRobotOpen(false)}
        >
          <div onClick={e => e.stopPropagation()} className="w-[440px] h-[600px]">
            <RobotChat config={customerRobotConfig} onClose={() => setCustomerRobotOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
