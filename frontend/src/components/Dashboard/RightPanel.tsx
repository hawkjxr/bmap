import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ShieldAlert, TrendingUp, Radio } from 'lucide-react';

const ScatterChart: React.FC = () => {
  const scatterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scatterRef.current) return;

    const ro = new ResizeObserver(() => {
      if (!scatterRef.current || scatterRef.current.clientWidth === 0) return;
      initChart();
      ro.disconnect();
    });
    ro.observe(scatterRef.current);

    function initChart() {
      if (!scatterRef.current) return;
      const chart = echarts.init(scatterRef.current);

      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        grid: { top: 40, right: 20, bottom: 36, left: 48 },
        xAxis: {
          name: '活力指数',
          nameTextStyle: { color: '#6B7280', fontSize: 10 },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: '#1e4070' } },
          axisLabel: { color: '#6B7280', fontSize: 10 },
          min: 30, max: 100,
        },
        yAxis: {
          name: '金租渗透率(%)',
          nameTextStyle: { color: '#6B7280', fontSize: 10 },
          splitLine: { lineStyle: { color: '#1e4070', type: 'dashed' } },
          axisLine: { lineStyle: { color: '#1e4070' } },
          axisLabel: { color: '#6B7280', fontSize: 10 },
          min: 0, max: 35,
        },
        tooltip: {
          backgroundColor: 'rgba(10, 26, 47, 0.95)',
          borderColor: '#1A3A6A',
          textStyle: { color: '#fff', fontSize: 12 },
          formatter: (params: any) =>
            `<b>${params.data[3]}</b><br/>活力指数: ${params.data[0]}<br/>渗透率: ${params.data[1]}%`,
        },
        visualMap: {
          show: false, dimension: 0, min: 30, max: 100,
          inRange: { color: ['#3B82F6', '#00E676'] },
        },
        series: [
          {
            type: 'scatter',
            symbolSize: (data: any) => data[2] * 2.5,
            data: [
              [92, 6, 12, '常州武进高新区'],
              [45, 22, 7, '苏北重工经开区'],
              [85, 15, 9, '深圳南山科技园'],
              [78, 10, 8, '苏州工业园区'],
              [60, 28, 5, '无锡新区'],
              [88, 8, 10, '合肥经开区'],
              [72, 18, 6, '成都高新区'],
            ],
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,230,118,0.4)' },
            emphasis: { itemStyle: { borderColor: '#fff', borderWidth: 2 } },
          },
          {
            type: 'scatter',
            symbolSize: 0,
            markArea: {
              silent: true,
              itemStyle: { color: 'rgba(0,230,118,0.06)', borderColor: '#00E676', borderWidth: 1, borderType: 'dashed' },
              data: [[{ xAxis: 70, yAxis: 0 }, { xAxis: 100, yAxis: 15 }]],
              label: { show: true, position: 'insideBottom', formatter: '高优拓展区间', color: '#00E676', fontSize: 10 },
            } as any,
            data: [],
          },
        ],
      };

      chart.setOption(option);
      const resizeHandler = () => chart.resize();
      window.addEventListener('resize', resizeHandler);
    }

    return () => ro.disconnect();
  }, []);

  return <div ref={scatterRef} style={{ width: '100%', height: 220 }} />;
};

export const RightPanel: React.FC = () => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute right-4 top-24 bottom-4 w-[310px] flex flex-col gap-3 z-40">
      <div className="tech-panel p-4">
        <h2 className="tech-title flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          高优拓展区锁定
        </h2>
        <div className="bg-dark-bg border border-green-500/30 p-3 rounded-lg" style={{ backgroundColor: 'rgba(4,11,22,0.6)' }}>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-green-400">常州武进高新区</span>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <Radio className={`w-3 h-3 ${pulse ? 'opacity-100' : 'opacity-40'} transition-opacity`} />
              追踪中
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-300 font-mono">92</div>
              <div className="text-[10px] text-gray-500">活力指数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400 font-mono">6%</div>
              <div className="text-[10px] text-gray-500">金租渗透率</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400 font-mono">47</div>
              <div className="text-[10px] text-gray-500">规上企业</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tech-panel p-4 flex-1 flex flex-col min-h-0">
        <h2 className="tech-title text-sm mb-2">产融错配散点图</h2>
        <div className="flex-1 min-h-0">
          <ScatterChart />
        </div>
      </div>

      <div className="tech-panel p-4" style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
        <h2 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4" />
          <span>实时风险阻断</span>
          <span className={`ml-auto w-2 h-2 rounded-full bg-red-500 ${pulse ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
        </h2>
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-red-300">企业C · 苏北经开</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">高危</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              IoT开机率 &lt; 15% · 实控人新增非持牌抵押
            </p>
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-red-400">
              <ShieldAlert className="w-3 h-3" />
              已冻结新增授信 · 排雷工单已下发
            </div>
          </div>
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(113,63,18,0.15)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-yellow-300">企业F · 成都高新</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">关注</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              用电量增速放缓 · 待交叉验证
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
