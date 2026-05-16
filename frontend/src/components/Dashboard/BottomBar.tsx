import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const MiniChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chart.setOption({
      grid: { top: 2, right: 0, bottom: 2, left: 0 },
      xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color + '40' },
            { offset: 1, color: color + '05' },
          ]),
        },
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [data, color]);

  return <div ref={chartRef} style={{ width: 96, height: 32 }} />;
};

export const BottomBar: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 tech-panel px-6 py-3 flex items-center gap-8">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] text-gray-500">开工率趋势</div>
          <div className="text-sm font-mono text-green-400 font-bold">87.3%</div>
        </div>
        <MiniChart data={[72, 75, 78, 74, 80, 82, 85, 83, 87]} color="#00E676" />
      </div>

      <div className="w-px h-8" style={{ backgroundColor: 'var(--color-dark-border)' }} />

      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] text-gray-500">用电增速</div>
          <div className="text-sm font-mono text-cyan-300 font-bold">+12.6%</div>
        </div>
        <MiniChart data={[5, 6, 8, 7, 9, 10, 11, 10, 12]} color="#22D3EE" />
      </div>

      <div className="w-px h-8" style={{ backgroundColor: 'var(--color-dark-border)' }} />

      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] text-gray-500">AI调用量(万)</div>
          <div className="text-sm font-mono text-purple-400 font-bold">342.1</div>
        </div>
        <MiniChart data={[50, 80, 120, 140, 180, 220, 260, 300, 342]} color="#A78BFA" />
      </div>

      <div className="w-px h-8" style={{ backgroundColor: 'var(--color-dark-border)' }} />

      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] text-gray-500">待处理工单</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-yellow-400 font-bold">12</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">3 紧急</span>
          </div>
        </div>
      </div>
    </div>
  );
};
