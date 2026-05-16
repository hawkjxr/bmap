import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import chinaGeo from '../data/chinaGeoJSON.json';

const mockCities = [
  { name: '常州武进高新区', value: [119.973, 31.778, 10], risk: 'low', label: '企业A · 动力电池链主' },
  { name: '苏北某重工经开区', value: [119.178, 33.529, 2], risk: 'high', label: '企业C · 传统机加工' },
  { name: '深圳南山科技园', value: [114.057, 22.543, 8], risk: 'low', label: '企业D · 锂电材料' },
  { name: '上海浦东新区', value: [121.473, 31.230, 15], risk: 'low', label: '企业E · 新能源整车' },
  { name: '成都高新区', value: [104.066, 30.572, 5], risk: 'medium', label: '企业F · 储能系统' },
  { name: '武汉东湖高新', value: [114.399, 30.511, 6], risk: 'low', label: '企业G · 光伏组件' },
  { name: '合肥经开区', value: [117.282, 31.866, 7], risk: 'low', label: '企业H · 电池装备' },
  { name: '宁德蕉城', value: [119.527, 26.660, 12], risk: 'low', label: '企业I · 电池巨头' },
  { name: '西安高新区', value: [108.940, 34.260, 3], risk: 'medium', label: '企业J · 隔膜材料' },
];

const riskColor = (risk: string) => {
  if (risk === 'high') return '#FF4D4F';
  if (risk === 'medium') return '#FAAD14';
  return '#00E676';
};

export const ChinaMap: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
    chartInstance.current = chart;

    // 注册本地 GeoJSON 数据
    echarts.registerMap('china', chinaGeo as any);

    const option: echarts.EChartsOption = {
          backgroundColor: 'transparent',
          geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            center: [104.5, 36],
            scaleLimit: { min: 0.8, max: 6 },
            label: { show: false },
            itemStyle: {
              areaColor: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#0B1D3A' },
                  { offset: 1, color: '#0A1628' },
                ],
              },
              borderColor: '#1A3A6A',
              borderWidth: 1,
            },
            emphasis: {
              label: { show: true, color: '#fff', fontSize: 12 },
              itemStyle: {
                areaColor: '#1C3D6E',
                borderColor: '#3B82F6',
                borderWidth: 2,
              },
            },
            select: {
              label: { show: true, color: '#fff' },
              itemStyle: { areaColor: '#1E4A8A' },
            },
          },
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(10, 26, 47, 0.95)',
            borderColor: '#1A3A6A',
            textStyle: { color: '#fff', fontSize: 13 },
            formatter: (params: any) => {
              if (params.seriesType === 'effectScatter') {
                const d = mockCities.find(c => c.name === params.name);
                return `<div style="font-weight:bold;margin-bottom:4px;">${params.name}</div>
                        <div style="color:#a3a8b4">${d?.label || ''}</div>
                        <div style="margin-top:4px">资产规模: <span style="color:#00E676;font-weight:bold">${params.value[2]}亿</span></div>`;
              }
              return params.name;
            },
          },
          series: [
            {
              type: 'map',
              map: 'china',
              geoIndex: 0,
              data: [],
            },
            // 资产散点 - 带脉冲动画
            {
              type: 'effectScatter',
              coordinateSystem: 'geo',
              zlevel: 2,
              rippleEffect: {
                brushType: 'stroke',
                scale: 4,
                period: 3,
              },
              symbol: 'circle',
              symbolSize: (val: any) => Math.max(val[2] * 1.8, 8),
              data: mockCities.map(c => ({
                name: c.name,
                value: c.value,
                itemStyle: {
                  color: riskColor(c.risk),
                  shadowBlur: 10,
                  shadowColor: riskColor(c.risk),
                },
              })),
            },
            // 飞线动画: 从常州武进到各地的资产连接
            {
              type: 'lines',
              coordinateSystem: 'geo',
              zlevel: 1,
              effect: {
                show: true,
                period: 4,
                trailLength: 0.6,
                symbol: 'arrow',
                symbolSize: 4,
                color: '#3B82F6',
              },
              lineStyle: {
                color: '#1A3A6A',
                width: 1,
                curveness: 0.3,
                opacity: 0.4,
              },
              data: [
                { coords: [[119.973, 31.778], [121.473, 31.230]] },
                { coords: [[119.973, 31.778], [114.057, 22.543]] },
                { coords: [[119.973, 31.778], [117.282, 31.866]] },
                { coords: [[119.973, 31.778], [119.527, 26.660]] },
                { coords: [[119.973, 31.778], [119.178, 33.529]], lineStyle: { color: '#FF4D4F', opacity: 0.6 } },
              ],
            },
          ],
        };

        chart.setOption(option);

        const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <div ref={chartRef} className="w-full h-full" />
      {/* 四角装饰框 */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-blue-500/30 pointer-events-none" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-blue-500/30 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-blue-500/30 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-blue-500/30 pointer-events-none" />
    </div>
  );
};
