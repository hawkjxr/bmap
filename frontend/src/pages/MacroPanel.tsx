import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import { TrendingUp, ShieldAlert, Radio, Layers, Filter, Factory, ChevronDown, Zap, Building2, MapPinned, UserCircle, Users, GitBranch, Link2, Briefcase, ArrowRight, Crosshair, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChartTheme } from '../hooks/useChartTheme';
import { useDataStore } from '../store/data';
import type { Metric, MetricKey, ParkInfo, ChainNodeInfo } from '../data/types';
import chinaGeo from '../data/chinaGeoJSON.json';
import { loadProvinceGeo } from '../data/geoLoader';

let geoCache: any = null;
const loadGeo = () => {
  if (geoCache) return Promise.resolve(geoCache);
  geoCache = chinaGeo;
  echarts.registerMap('china', geoCache as any);
  return Promise.resolve(geoCache);
};

function distributeToCities(geoJson: any, provinceValue: number): Record<string, number> {
  const features = geoJson.features || [];
  if (!features.length) return {};
  const result: Record<string, number> = {};
  const weights = features.map((f: any) => {
    const name: string = f.properties?.name || '';
    let h = 0;
    for (let i = 0; i < name.length; i++) h = ((h << 5) - h) + name.charCodeAt(i);
    return Math.abs(h % 80) + 20;
  });
  const total = weights.reduce((a: number, b: number) => a + b, 0);
  features.forEach((f: any, i: number) => {
    const name = f.properties?.name || '';
    if (name) result[name] = Math.round((provinceValue * weights[i] / total) * 10) / 10;
  });
  return result;
}

type ViewLayer = 'overview' | 'chain' | 'team';
type OverviewSubView = 'admin' | 'park';
type ChainSubView = 'supply' | 'chain' | 'sector';

const supplyLinks = [
  { from: '合肥经开区', to: '常州武进高新区', type: '设备供应', color: '#FAAD14' },
  { from: '苏州工业园区', to: '常州武进高新区', type: '装备供应', color: '#FAAD14' },
  { from: '深圳南山科技园', to: '常州武进高新区', type: '材料供应', color: '#3B82F6' },
  { from: '常州武进高新区', to: '上海浦东新区', type: '电池供应', color: '#00E676' },
  { from: '宁德蕉城', to: '上海浦东新区', type: '电池供应', color: '#00E676' },
  { from: '武汉东湖高新', to: '成都高新区', type: '组件供应', color: '#A78BFA' },
  { from: '无锡新区', to: '深圳南山科技园', type: '芯片供应', color: '#06B6D4' },
  { from: '西安高新区', to: '宁德蕉城', type: '隔膜供应', color: '#8B5CF6' },
  { from: '长沙高新区', to: '重庆两江新区', type: '部件供应', color: '#F97316' },
];

const parkIndustry: Record<string, { sector: string; color: string }> = {
  '常州武进高新区': { sector: '动力电池', color: '#00E676' },
  '深圳南山科技园': { sector: '锂电材料', color: '#3B82F6' },
  '上海浦东新区': { sector: '新能源整车', color: '#A78BFA' },
  '合肥经开区': { sector: '电池装备', color: '#FAAD14' },
  '宁德蕉城': { sector: '动力电池', color: '#00E676' },
  '成都高新区': { sector: '储能系统', color: '#06B6D4' },
  '武汉东湖高新': { sector: '光伏组件', color: '#8B5CF6' },
  '西安高新区': { sector: '隔膜材料', color: '#F97316' },
  '苏北某重工经开区': { sector: '传统制造', color: '#EF4444' },
  '苏州工业园区': { sector: '新能源装备', color: '#FAAD14' },
  '无锡新区': { sector: '半导体封测', color: '#22D3EE' },
  '长沙高新区': { sector: '工程机械', color: '#10B981' },
  '重庆两江新区': { sector: '汽车零部件', color: '#F59E0B' },
};

const sectorColors: Record<string, string> = {
  '动力电池': '#00E676', '锂电材料': '#3B82F6', '新能源整车': '#A78BFA',
  '电池装备': '#FAAD14', '储能系统': '#06B6D4', '光伏组件': '#8B5CF6',
  '隔膜材料': '#F97316', '传统制造': '#EF4444', '新能源装备': '#FAAD14',
  '半导体封测': '#22D3EE', '工程机械': '#10B981', '汽车零部件': '#F59E0B',
};

const catColor: Record<string, string> = {
  '上游': '#3B82F6', '中游': '#00E676', '装备': '#FAAD14', '下游': '#A78BFA', '核心': '#00E676',
};

// 行政区热力地图 - highlight 高亮省份, accentColor 高亮色
const AdminMap: React.FC<{ metric: Metric; highlight?: string; accentColor?: string; focusZoom?: boolean }> = ({ metric, highlight, accentColor, focusZoom }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const metricDefs = useDataStore(s => s.metricDefs);
  const adminData = useDataStore(s => s.adminData);
  const provinceCenters = useDataStore(s => s.provinceCenters);
  const mDef = metricDefs.find(m => m.key === metric)!;
  const mData = adminData[metric];
  const vals = Object.values(mData);
  const ac = accentColor || mDef.color;
  const focusCenter = highlight && provinceCenters[highlight] ? provinceCenters[highlight] : [104.5, 36] as [number, number];

  useEffect(() => {
    if (!ref.current) return;
    let chart: echarts.ECharts | null = null;
    const ro = new ResizeObserver(() => {
      if (!ref.current || ref.current.clientWidth === 0 || ref.current.clientHeight === 0) return;
      if (!chart) {
        chart = echarts.init(ref.current);
        loadGeo().then(() => {
          chart?.setOption({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 },
              formatter: (p: any) => {
                if (p.value === undefined) return p.name;
                const isHL = p.name === highlight;
                return `<b>${p.name}</b>${isHL ? ' ★' : ''}<br/>${mDef.label}: <b style="color:${isHL ? ac : mDef.color}">${p.value}${mDef.unit}</b>`;
              },
            },
            visualMap: highlight && focusZoom ? { show: false } : {
              min: Math.min(...vals) * 0.5, max: Math.max(...vals),
              left: 16, bottom: 16, text: ['高', '低'], textStyle: { color: ct.labelColor, fontSize: 10 },
              inRange: { color: [ct.mapArea2, ct.mapArea, mDef.color + '60', mDef.color] },
              calculable: true, orient: 'vertical', itemWidth: 12, itemHeight: 100,
            },
            geo: {
              map: 'china', roam: true,
              zoom: focusZoom && highlight ? 3.5 : 1.15,
              center: focusZoom ? focusCenter : [104.5, 36],
              scaleLimit: { min: 0.8, max: 10 },
              label: { show: false },
              itemStyle: { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.8 },
              emphasis: { label: { show: true, color: ct.textWhite, fontSize: 11 }, itemStyle: { areaColor: ct.emphasisArea, borderColor: ac, borderWidth: 2 } },
              regions: highlight ? [{
                name: highlight,
                itemStyle: { areaColor: ac + '50', borderColor: ac, borderWidth: 3 },
                label: { show: true, color: ct.textWhite, fontSize: 13, fontWeight: 'bold' },
              }] : [],
            },
            series: [
              {
                type: 'map', map: 'china', geoIndex: 0,
                data: Object.entries(mData).map(([name, value]) => ({
                  name, value,
                  ...(highlight && focusZoom ? {
                    itemStyle: name === highlight
                      ? { areaColor: ac + '60', borderColor: ac, borderWidth: 3 }
                      : { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.5, opacity: 0.4 },
                    label: name === highlight ? { show: true, color: ct.textWhite, fontSize: 12, fontWeight: 'bold' as const, formatter: `{a|${name}}\n{b|${value}${mDef.unit}}`, rich: { a: { fontSize: 12, fontWeight: 'bold' as const, color: ct.textWhite, padding: [0, 0, 2, 0] }, b: { fontSize: 11, color: ac, fontWeight: 'bold' as const } } } : { show: false },
                  } : {}),
                })),
              },
              ...(highlight && provinceCenters[highlight] ? [{
                type: 'effectScatter' as const, coordinateSystem: 'geo' as const, zlevel: 3,
                rippleEffect: { brushType: 'stroke' as const, scale: 5, period: 2.5 },
                symbolSize: 18,
                data: [{ name: highlight, value: [...provinceCenters[highlight], mData[highlight] || 0], itemStyle: { color: ac, shadowBlur: 20, shadowColor: ac } }],
                label: { show: !focusZoom, formatter: '{b}', position: 'right' as const, color: ac, fontSize: 11, fontWeight: 'bold' as const },
              }] : []),
            ],
          } as any);
        });
      } else {
        chart.resize();
      }
    });
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart?.dispose(); };
  }, [metric, mDef, mData, vals, highlight, accentColor, focusZoom, ac, focusCenter, ct]);
  return <div ref={ref} className="w-full h-full" />;
};

// 产业园区散点地图 - highlight: 高亮园区名, accentColor: 高亮色, focusZoom: 是否聚焦
const ParkMap: React.FC<{ metric: Metric; highlight?: string; accentColor?: string; focusZoom?: boolean }> = ({ metric, highlight, accentColor, focusZoom }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const metricDefs = useDataStore(s => s.metricDefs);
  const parkData = useDataStore(s => s.parkData);
  const mDef = metricDefs.find(m => m.key === metric)!;
  const vals = parkData.map(p => p.data?.[metric] ?? 0);
  const maxVal = Math.max(...vals);
  const focusPark = highlight ? parkData.find(p => p.name === highlight) : null;
  const ac = accentColor || mDef.color;

  useEffect(() => {
    if (!ref.current) return;
    let chart: echarts.ECharts | null = null;
    const ro = new ResizeObserver(() => {
      if (!ref.current || ref.current.clientWidth === 0 || ref.current.clientHeight === 0) return;
      if (!chart) {
        chart = echarts.init(ref.current);
        loadGeo().then(() => {
          const geoCenter: [number, number] = focusPark && focusZoom ? [focusPark.lng, focusPark.lat] : [104.5, 36];
          const geoZoom = focusPark && focusZoom ? 4.5 : 1.15;

          chart?.setOption({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 },
              formatter: (p: any) => {
                if (p.seriesType === 'effectScatter' || p.seriesType === 'scatter') {
                  const pk = parkData.find(d => d.name === p.name);
                  if (!pk) return p.name;
                  return `<b>${p.name}</b><br/><span style="color:${ct.labelLight}">${pk.label}</span><br/>${mDef.label}: <b style="color:${ac}">${pk.data?.[metric] ?? 0}${mDef.unit}</b><br/>投放: ${pk.data?.['投放'] ?? 0}亿 · 租赁: ${pk.data?.['融资租赁'] ?? 0}亿<br/>贷款: ${pk.data?.['企业贷款'] ?? 0}亿 · 中登: ${pk.data?.['全量融资'] ?? 0}亿`;
                }
                return p.name;
              },
            },
            geo: {
              map: 'china', roam: true, zoom: geoZoom, center: geoCenter,
              scaleLimit: { min: 0.8, max: 12 },
              label: { show: false },
              itemStyle: { areaColor: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: ct.mapArea }, { offset: 1, color: ct.mapArea2 }] }, borderColor: ct.mapBorder, borderWidth: 0.8 },
              emphasis: { label: { show: true, color: ct.textWhite, fontSize: 11 }, itemStyle: { areaColor: ct.emphasisArea, borderColor: ac, borderWidth: 2 } },
            },
            series: [
              { type: 'map', map: 'china', geoIndex: 0, data: [] },
              // 普通散点（非高亮园区）
              {
                type: 'effectScatter', coordinateSystem: 'geo', zlevel: 2,
                rippleEffect: { brushType: 'stroke', scale: 3, period: 3 },
                symbolSize: (v: any) => Math.max((v[2] / maxVal) * 28, 6),
                data: parkData.filter(p => p.name !== highlight).map(p => ({
                  name: p.name, value: [p.lng, p.lat, p.data?.[metric] ?? 0],
                  itemStyle: { color: '#6B728080', shadowBlur: 6, shadowColor: '#6B728040' },
                })),
                label: { show: !focusZoom, formatter: '{b}', position: 'right', color: '#6B7280', fontSize: 8 },
              },
              // 高亮散点（选中的园区）
              ...(focusPark ? [{
                type: 'effectScatter' as const, coordinateSystem: 'geo' as const, zlevel: 3,
                rippleEffect: { brushType: 'stroke' as const, scale: 6, period: 2 },
                symbolSize: 28,
                data: [{ name: focusPark.name, value: [focusPark.lng, focusPark.lat, focusPark.data?.[metric] ?? 0], itemStyle: { color: ac, shadowBlur: 25, shadowColor: ac } }],
                label: { show: true, formatter: `{a|${focusPark.name}}\n{b|${focusPark.data?.[metric] ?? 0}${mDef.unit}}`, position: 'right' as const, rich: { a: { color: '#fff', fontSize: 12, fontWeight: 'bold' as const, padding: [0, 0, 2, 0] }, b: { color: ac, fontSize: 11, fontWeight: 'bold' as const } } },
              }] : []),
              // 金融机构散点（真实城市坐标）
              ...(focusPark ? [{
                type: 'scatter' as const, coordinateSystem: 'geo' as const, zlevel: 2,
                symbol: 'diamond',
                symbolSize: 12,
                itemStyle: { color: ac + 'B0', borderColor: ac, borderWidth: 1.5 },
                label: { show: true, formatter: '{b}', position: 'top' as const, color: ct.labelLight, fontSize: 9 },
                data: [
                  { name: '工商银行(北京)', value: [116.40, 39.90] },
                  { name: '建设银行(北京)', value: [116.80, 39.50] },
                  { name: '金租同业(上海)', value: [121.47, 31.23] },
                  { name: '中登(深圳)', value: [114.06, 22.54] },
                ],
              }] : []),
              // 飞线（从金融机构流入园区，表示融资来源）
              ...(focusPark ? [{
                type: 'lines' as const, coordinateSystem: 'geo' as const, zlevel: 1,
                effect: { show: true, period: 3, trailLength: 0.5, symbol: 'arrow' as const, symbolSize: 5, color: ac },
                lineStyle: { color: ac + '40', width: 1.2, curveness: 0.25 },
                data: [
                  { coords: [[116.40, 39.90], [focusPark.lng, focusPark.lat]] },
                  { coords: [[116.80, 39.50], [focusPark.lng, focusPark.lat]] },
                  { coords: [[121.47, 31.23], [focusPark.lng, focusPark.lat]] },
                  { coords: [[114.06, 22.54], [focusPark.lng, focusPark.lat]] },
                ],
              }] : []),
            ],
          } as any);
        });
      } else {
        chart.resize();
      }
    });
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart?.dispose(); };
  }, [metric, mDef, maxVal, highlight, accentColor, focusZoom, focusPark, ac, ct]);
  return <div ref={ref} className="w-full h-full" />;
};

const CombinedMap: React.FC<{
  metric: Metric; highlightProvince?: string; highlightPark?: string; accentColor?: string; focusZoom?: boolean;
  drillProvince?: string | null; onDrillDown?: (province: string) => void;
}> = ({ metric, highlightProvince, highlightPark, accentColor, focusZoom, drillProvince, onDrillDown }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const metricDefs = useDataStore(s => s.metricDefs);
  const adminData = useDataStore(s => s.adminData);
  const parkData = useDataStore(s => s.parkData);
  const provinceCenters = useDataStore(s => s.provinceCenters);
  const mDef = metricDefs.find(m => m.key === metric)!;
  const mData = adminData[metric];
  const vals = Object.values(mData);
  const ac = accentColor || mDef.color;
  const maxParkVal = Math.max(...parkData.map(p => p.data?.[metric] ?? 0));
  const focusPark = highlightPark ? parkData.find(p => p.name === highlightPark) : null;
  const focusCenter: [number, number] = focusPark && focusZoom
    ? [focusPark.lng, focusPark.lat]
    : highlightProvince && provinceCenters[highlightProvince]
      ? provinceCenters[highlightProvince]
      : [104.5, 36];

  useEffect(() => {
    if (!ref.current) return;
    const container = ref.current;
    const chart = echarts.init(container);

    const renderNational = async () => {
      await loadGeo();
      const zoom = focusZoom ? (focusPark ? 4.5 : 3.5) : 1.15;
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 },
          formatter: (p: any) => {
            if (p.seriesType === 'effectScatter' || p.seriesType === 'scatter') {
              const pk = parkData.find(d => d.name === p.name);
              if (pk) return `<b>${p.name}</b><br/><span style="color:${ct.labelLight}">${pk.label}</span><br/>${mDef.label}: <b style="color:${ac}">${pk.data?.[metric] ?? 0}${mDef.unit}</b>`;
            }
            if (p.value === undefined) return `${p.name}<br/><span style="font-size:10px;color:${ct.labelLight}">双击下钻到市</span>`;
            const isHL = p.name === highlightProvince;
            return `<b>${p.name}</b>${isHL ? ' ★' : ''}<br/>${mDef.label}: <b style="color:${isHL ? ac : mDef.color}">${p.value}${mDef.unit}</b><br/><span style="font-size:10px;color:${ct.labelLight}">双击下钻到市</span>`;
          },
        },
        visualMap: focusZoom ? { show: false } : {
          min: Math.min(...vals) * 0.5, max: Math.max(...vals),
          left: 16, bottom: 16, text: ['高', '低'], textStyle: { color: ct.labelColor, fontSize: 10 },
          inRange: { color: [ct.mapArea2, ct.mapArea, mDef.color + '60', mDef.color] },
          calculable: true, orient: 'vertical', itemWidth: 12, itemHeight: 100,
        },
        geo: {
          map: 'china', roam: true, zoom, center: focusZoom ? focusCenter : [104.5, 36],
          scaleLimit: { min: 0.8, max: 12 },
          label: { show: false },
          itemStyle: { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.8 },
          emphasis: { label: { show: true, color: ct.textWhite, fontSize: 11 }, itemStyle: { areaColor: ct.emphasisArea, borderColor: ac, borderWidth: 2 } },
          regions: highlightProvince ? [{
            name: highlightProvince,
            itemStyle: { areaColor: ac + '50', borderColor: ac, borderWidth: 3 },
            label: { show: true, color: ct.textWhite, fontSize: 13, fontWeight: 'bold' },
          }] : [],
        },
        series: [
          {
            type: 'map', map: 'china', geoIndex: 0,
            data: Object.entries(mData).map(([name, value]) => ({
              name, value,
              ...(highlightProvince && focusZoom ? {
                itemStyle: name === highlightProvince
                  ? { areaColor: ac + '60', borderColor: ac, borderWidth: 3 }
                  : { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.5, opacity: 0.4 },
              } : {}),
            })),
          },
          {
            type: 'effectScatter', coordinateSystem: 'geo', zlevel: 2,
            rippleEffect: { brushType: 'stroke', scale: 3, period: 3 },
            symbolSize: (v: any) => Math.max((v[2] / maxParkVal) * 24, 5),
            data: parkData.filter(p => p.name !== highlightPark).map(p => ({
              name: p.name, value: [p.lng, p.lat, p.data?.[metric] ?? 0],
              itemStyle: { color: highlightPark ? '#6B728080' : (p.risk === 'high' ? '#FF4D4F' : p.risk === 'medium' ? '#FAAD14' : '#22D3EE'), shadowBlur: 6, shadowColor: '#22D3EE30' },
            })),
            label: { show: !focusZoom, formatter: '{b}', position: 'right', color: ct.labelLight, fontSize: 8 },
          },
          ...(focusPark ? [{
            type: 'effectScatter' as const, coordinateSystem: 'geo' as const, zlevel: 3,
            rippleEffect: { brushType: 'stroke' as const, scale: 6, period: 2 },
            symbolSize: 28,
            data: [{ name: focusPark.name, value: [focusPark.lng, focusPark.lat, focusPark.data?.[metric] ?? 0], itemStyle: { color: ac, shadowBlur: 25, shadowColor: ac } }],
            label: { show: true, formatter: `{a|${focusPark.name}}\n{b|${focusPark.data?.[metric] ?? 0}${mDef.unit}}`, position: 'right' as const, rich: { a: { color: '#fff', fontSize: 12, fontWeight: 'bold' as const, padding: [0, 0, 2, 0] }, b: { color: ac, fontSize: 11, fontWeight: 'bold' as const } } },
          }] : []),
          ...(highlightProvince && provinceCenters[highlightProvince] ? [{
            type: 'effectScatter' as const, coordinateSystem: 'geo' as const, zlevel: 1,
            rippleEffect: { brushType: 'stroke' as const, scale: 5, period: 2.5 },
            symbolSize: 14, symbol: 'diamond',
            data: [{ name: highlightProvince, value: [...provinceCenters[highlightProvince], mData[highlightProvince] || 0], itemStyle: { color: ac + '80', shadowBlur: 15, shadowColor: ac + '40' } }],
            label: { show: !focusPark, formatter: '{b}', position: 'right' as const, color: ac, fontSize: 11, fontWeight: 'bold' as const },
          }] : []),
        ],
      } as any);
      chart.off('dblclick');
      chart.on('dblclick', (params: any) => {
        const name = params.name || params.data?.name;
        if (name && provinceCenters[name] && onDrillDown) onDrillDown(name);
      });
    };

    const renderProvince = async (province: string) => {
      const result = await loadProvinceGeo(province);
      if (!result) { renderNational(); return; }
      const { geo, mapName } = result;
      const provinceValue = mData[province] || 0;
      const cityData = distributeToCities(geo, provinceValue);
      const cityVals = Object.values(cityData);
      const minCity = cityVals.length ? Math.min(...cityVals) : 0;
      const maxCity = cityVals.length ? Math.max(...cityVals) : 1;
      const provinceParks = parkData.filter(_ => {
        return true;
      });

      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 },
          formatter: (p: any) => {
            if (p.seriesType === 'effectScatter') {
              const pk = parkData.find(d => d.name === p.name);
              if (pk) return `<b>${p.name}</b><br/><span style="color:${ct.labelLight}">${pk.label}</span><br/>${mDef.label}: <b style="color:${ac}">${pk.data?.[metric] ?? 0}${mDef.unit}</b>`;
            }
            if (p.value === undefined || p.value === null) return p.name;
            return `<b>${p.name}</b><br/>${mDef.label}: <b style="color:${mDef.color}">${p.value}${mDef.unit}</b>`;
          },
        },
        visualMap: {
          min: minCity * 0.5, max: maxCity,
          left: 16, bottom: 16, text: ['高', '低'], textStyle: { color: ct.labelColor, fontSize: 10 },
          inRange: { color: [ct.mapArea2, ct.mapArea, mDef.color + '60', mDef.color] },
          calculable: true, orient: 'vertical', itemWidth: 12, itemHeight: 100,
        },
        geo: {
          map: mapName, roam: true, zoom: 1.05,
          scaleLimit: { min: 0.5, max: 10 },
          label: { show: true, color: ct.labelLight, fontSize: 10 },
          itemStyle: { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.8 },
          emphasis: { label: { show: true, color: ct.textWhite, fontSize: 12, fontWeight: 'bold' }, itemStyle: { areaColor: ct.emphasisArea, borderColor: ac, borderWidth: 2 } },
        },
        series: [
          {
            type: 'map', map: mapName, geoIndex: 0,
            data: Object.entries(cityData).map(([name, value]) => ({ name, value })),
          },
          {
            type: 'effectScatter', coordinateSystem: 'geo', zlevel: 3,
            rippleEffect: { brushType: 'stroke', scale: 4, period: 2.5 },
            symbolSize: 16,
            data: provinceParks.map(p => ({
              name: p.name, value: [p.lng, p.lat, p.data?.[metric] ?? 0],
              itemStyle: { color: p.risk === 'high' ? '#FF4D4F' : p.risk === 'medium' ? '#FAAD14' : '#22D3EE', shadowBlur: 15, shadowColor: '#22D3EE60' },
            })),
            label: { show: true, formatter: '{b}', position: 'right', color: '#fff', fontSize: 10, fontWeight: 'bold' },
          },
        ],
      } as any);
      chart.off('dblclick');
    };

    if (drillProvince) {
      renderProvince(drillProvince);
    } else {
      renderNational();
    }

    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [metric, mDef, mData, vals, highlightProvince, highlightPark, accentColor, focusZoom, ac, focusCenter, maxParkVal, ct, drillProvince, onDrillDown]);
  return <div ref={ref} className="w-full h-full" />;
};

// 供应链地图：园区散点 + 供应链流线
const SupplyChainMap: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const parkData = useDataStore(s => s.parkData);
  useEffect(() => {
    if (!ref.current) return;
    let chart: echarts.ECharts | null = null;
    const ro = new ResizeObserver(() => {
      if (!ref.current || ref.current.clientWidth === 0 || ref.current.clientHeight === 0) return;
      if (!chart) {
        chart = echarts.init(ref.current);
        loadGeo().then(() => {
          const parkMap = new Map(parkData.map(p => [p.name, p]));
          chart?.setOption({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 },
              formatter: (p: any) => {
                if (p.seriesType === 'effectScatter') {
                  const pk = parkData.find(d => d.name === p.name);
                  if (pk) { const ind = parkIndustry[pk.name]; return `<b>${pk.name}</b><br/>${ind?.sector || ''}<br/>${pk.label}`; }
                }
                if (p.seriesType === 'lines' && p.data?.type) return `<b>${p.data.type}</b>`;
                return p.name || '';
              },
            },
            geo: {
              map: 'china', roam: true, zoom: 1.15, center: [104.5, 36],
              scaleLimit: { min: 0.8, max: 12 },
              label: { show: false },
              itemStyle: { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.8 },
              emphasis: { label: { show: true, color: ct.textWhite, fontSize: 11 }, itemStyle: { areaColor: ct.emphasisArea, borderColor: ct.accent, borderWidth: 2 } },
            },
            series: [
              { type: 'map', map: 'china', geoIndex: 0, data: [] },
              {
                type: 'effectScatter', coordinateSystem: 'geo', zlevel: 3,
                rippleEffect: { brushType: 'stroke', scale: 3, period: 3 },
                symbolSize: 14,
                data: parkData.map(p => {
                  const ind = parkIndustry[p.name];
                  return { name: p.name, value: [p.lng, p.lat], itemStyle: { color: ind?.color || '#6B7280', shadowBlur: 10, shadowColor: (ind?.color || '#6B7280') + '60' } };
                }),
                label: { show: true, formatter: '{b}', position: 'right', color: ct.labelLight, fontSize: 9 },
              },
              ...supplyLinks.map(link => {
                const fromPark = parkMap.get(link.from);
                const toPark = parkMap.get(link.to);
                if (!fromPark || !toPark) return null;
                return {
                  type: 'lines' as const, coordinateSystem: 'geo' as const, zlevel: 2,
                  effect: { show: true, period: 3.5, trailLength: 0.5, symbol: 'arrow' as const, symbolSize: 5, color: link.color },
                  lineStyle: { color: link.color + '50', width: 1.5, curveness: 0.25 },
                  data: [{ coords: [[fromPark.lng, fromPark.lat], [toPark.lng, toPark.lat]], type: link.type }],
                };
              }).filter(Boolean),
            ],
          } as any);
        });
      } else { chart.resize(); }
    });
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart?.dispose(); };
  }, [ct]);
  return <div ref={ref} className="w-full h-full" />;
};

const chainNodeGeo: Record<string, { lng: number; lat: number; city: string }> = {
  '锂矿开采': { lng: 101.78, lat: 29.05, city: '四川甘孜' },
  '正极材料': { lng: 114.39, lat: 27.80, city: '江西宜春' },
  '负极材料': { lng: 113.12, lat: 23.02, city: '广东佛山' },
  '电解液': { lng: 117.50, lat: 30.67, city: '安徽池州' },
  '隔膜': { lng: 108.94, lat: 34.26, city: '陕西西安' },
  '锂电设备': { lng: 117.27, lat: 31.86, city: '安徽合肥' },
  '电池制造': { lng: 119.97, lat: 31.77, city: '江苏常州' },
  'BMS系统': { lng: 114.07, lat: 22.54, city: '广东深圳' },
  'Pack集成': { lng: 121.47, lat: 31.23, city: '上海浦东' },
  '储能系统': { lng: 104.07, lat: 30.57, city: '四川成都' },
  '新能源整车': { lng: 121.80, lat: 31.00, city: '上海临港' },
};

const chainFlows: { from: string; to: string }[] = [
  { from: '锂矿开采', to: '正极材料' }, { from: '锂矿开采', to: '负极材料' },
  { from: '正极材料', to: '电池制造' }, { from: '负极材料', to: '电池制造' },
  { from: '电解液', to: '电池制造' }, { from: '隔膜', to: '电池制造' },
  { from: '锂电设备', to: '电池制造' },
  { from: '电池制造', to: 'BMS系统' }, { from: '电池制造', to: 'Pack集成' },
  { from: 'BMS系统', to: 'Pack集成' },
  { from: 'Pack集成', to: '储能系统' }, { from: 'Pack集成', to: '新能源整车' },
];

const ChainGeoMap: React.FC<{ onSelectNode: (node: ChainNodeInfo | null) => void }> = ({ onSelectNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const nodeDetails = useDataStore(s => s.chainNodeDetails);

  useEffect(() => {
    if (!ref.current) return;
    let chart: echarts.ECharts | null = null;
    const ro = new ResizeObserver(() => {
      if (!ref.current || ref.current.clientWidth === 0 || ref.current.clientHeight === 0) return;
      if (!chart) {
        chart = echarts.init(ref.current);
        loadGeo().then(() => {
          const nodes = Object.entries(chainNodeGeo).map(([name, geo]) => {
            const detail = nodeDetails[name];
            const nodeColor = catColor[name === '电池制造' ? '核心' : name === '锂电设备' ? '装备' : ['锂矿开采','正极材料','负极材料','电解液','隔膜'].includes(name) ? '上游' : ['储能系统','新能源整车'].includes(name) ? '下游' : '中游'] || '#3B82F6';
            const size = detail ? Math.max(detail.scale / 15, 12) : 12;
            return {
              name, value: [geo.lng, geo.lat, detail?.scale || 0],
              symbolSize: size,
              itemStyle: { color: nodeColor, borderColor: nodeColor, borderWidth: name === '电池制造' ? 3 : 1.5, shadowBlur: 15, shadowColor: nodeColor + '60' },
              label: {
                show: true, position: 'bottom' as const, distance: 4,
                formatter: `{name|${name}}\n{city|${geo.city}}`,
                rich: {
                  name: { fontSize: 11, fontWeight: 'bold' as const, color: nodeColor, align: 'center' as const },
                  city: { fontSize: 9, color: ct.labelLight, align: 'center' as const },
                },
              },
            };
          });

          chart?.setOption({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 },
              formatter: (p: any) => {
                if (p.seriesType === 'effectScatter') {
                  const detail = nodeDetails[p.name];
                  if (!detail) return p.name;
                  const color = catColor[p.name === '电池制造' ? '核心' : '上游'] || '#3B82F6';
                  return `<div style="font-weight:bold;font-size:13px;margin-bottom:4px">${detail.name}</div>
                    <div style="color:${color};margin-bottom:2px">${chainNodeGeo[p.name]?.city || ''}</div>
                    <div>行业规模: <b>${detail.scale}亿</b></div>
                    <div>开工景气: <b style="color:${detail.activity >= 85 ? '#00E676' : '#FAAD14'}">${detail.activity}%</b></div>
                    <div>银行: ${detail.bankRatio}% · 金租: ${detail.leaseRatio}%</div>`;
                }
                if (p.seriesType === 'lines' && p.data?.flowLabel) return `<b>${p.data.flowLabel}</b>`;
                return '';
              },
            },
            geo: {
              map: 'china', roam: true, zoom: 1.15, center: [112, 32],
              scaleLimit: { min: 0.8, max: 12 },
              label: { show: false },
              itemStyle: { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.8 },
              emphasis: { label: { show: true, color: ct.textWhite, fontSize: 11 }, itemStyle: { areaColor: ct.emphasisArea, borderColor: '#00E676', borderWidth: 2 } },
            },
            series: [
              { type: 'map', map: 'china', geoIndex: 0, data: [] },
              {
                type: 'effectScatter', coordinateSystem: 'geo', zlevel: 3,
                rippleEffect: { brushType: 'stroke', scale: 3, period: 3 },
                data: nodes,
              },
              ...chainFlows.map(f => {
                const fromGeo = chainNodeGeo[f.from];
                const toGeo = chainNodeGeo[f.to];
                if (!fromGeo || !toGeo) return null;
                const fromColor = catColor[['锂矿开采','正极材料','负极材料','电解液','隔膜'].includes(f.from) ? '上游' : f.from === '锂电设备' ? '装备' : ['储能系统','新能源整车'].includes(f.from) ? '下游' : '中游'] || '#3B82F6';
                return {
                  type: 'lines' as const, coordinateSystem: 'geo' as const, zlevel: 2,
                  effect: { show: true, period: 4, trailLength: 0.5, symbol: 'arrow' as const, symbolSize: 5, color: fromColor },
                  lineStyle: { color: fromColor + '45', width: 1.5, curveness: 0.2 },
                  data: [{ coords: [[fromGeo.lng, fromGeo.lat], [toGeo.lng, toGeo.lat]], flowLabel: `${f.from} → ${f.to}` }],
                };
              }).filter(Boolean),
            ],
          } as any);
          chart?.on('click', (params: any) => {
            if (params.seriesType === 'effectScatter' && params.name && nodeDetails[params.name]) {
              onSelectNode(nodeDetails[params.name]);
            }
          });
        });
      } else {
        chart.resize();
      }
    });
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart?.dispose(); };
  }, [ct, nodeDetails, onSelectNode]);
  return <div ref={ref} className="w-full h-full" />;
};

// 行业分布地图：按行业着色的园区散点
const SectorGeoMap: React.FC<{ selectedSector: string | null }> = ({ selectedSector }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const parkData = useDataStore(s => s.parkData);
  useEffect(() => {
    if (!ref.current) return;
    let chart: echarts.ECharts | null = null;
    const ro = new ResizeObserver(() => {
      if (!ref.current || ref.current.clientWidth === 0 || ref.current.clientHeight === 0) return;
      if (!chart) {
        chart = echarts.init(ref.current);
        loadGeo().then(() => {
          const sectors = new Map<string, { parks: typeof parkData; color: string }>();
          parkData.forEach(p => {
            const ind = parkIndustry[p.name];
            if (!ind) return;
            if (!sectors.has(ind.sector)) sectors.set(ind.sector, { parks: [], color: ind.color });
            sectors.get(ind.sector)!.parks.push(p);
          });

          chart?.setOption({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 },
              formatter: (p: any) => {
                if (p.seriesType === 'effectScatter' || p.seriesType === 'scatter') {
                  const pk = parkData.find(d => d.name === p.name);
                  const ind = parkIndustry[p.name];
                  if (pk && ind) return `<b>${p.name}</b><br/><span style="color:${ind.color}">${ind.sector}</span><br/>${pk.label}`;
                }
                return p.name || '';
              },
            },
            geo: {
              map: 'china', roam: true, zoom: 1.15, center: [104.5, 36],
              scaleLimit: { min: 0.8, max: 12 },
              label: { show: false },
              itemStyle: { areaColor: ct.mapArea2, borderColor: ct.mapBorder, borderWidth: 0.8 },
              emphasis: { label: { show: true, color: ct.textWhite, fontSize: 11 }, itemStyle: { areaColor: ct.emphasisArea, borderColor: ct.accent, borderWidth: 2 } },
            },
            series: [
              { type: 'map', map: 'china', geoIndex: 0, data: [] },
              ...Array.from(sectors.entries()).map(([sector, { parks, color }]) => {
                const isDim = selectedSector && selectedSector !== sector;
                return {
                  type: 'effectScatter' as const, coordinateSystem: 'geo' as const, zlevel: isDim ? 1 : 3, name: sector,
                  rippleEffect: { brushType: 'stroke' as const, scale: isDim ? 2 : 4, period: 3 },
                  symbolSize: isDim ? 8 : 16,
                  itemStyle: { color: isDim ? color + '30' : color, shadowBlur: isDim ? 0 : 12, shadowColor: color + '50' },
                  label: { show: !isDim, formatter: '{b}', position: 'right' as const, color: color, fontSize: 9 },
                  data: parks.map(p => ({ name: p.name, value: [p.lng, p.lat] })),
                };
              }),
            ],
          } as any);
        });
      } else { chart.resize(); }
    });
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart?.dispose(); };
  }, [selectedSector, ct]);
  return <div ref={ref} className="w-full h-full" />;
};

const allMetricKeys: Metric[] = ['活力指数', '开工率', '投放', '融资租赁', '企业贷款', '全量融资', '用电增速', '设备投放', '客户数', '金租渗透率', '不良率'];

const CompareBar: React.FC<{ leftName: string; leftData: Record<Metric, number>; rightName: string; rightData: Record<Metric, number> }> = ({ leftName, leftData, rightName, rightData }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const metricDefs = useDataStore(s => s.metricDefs);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    const labels = allMetricKeys.map(k => { const d = metricDefs.find(m => m.key === k)!; return d.label + (d.unit ? `(${d.unit})` : ''); });
    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 20, right: 30, bottom: 26, left: 110 },
      legend: { data: [leftName, rightName], textStyle: { color: ct.labelColor, fontSize: 10 }, top: 0, itemWidth: 10, itemHeight: 8 },
      xAxis: { type: 'value', axisLabel: { color: ct.labelColor, fontSize: 9 }, splitLine: { lineStyle: { color: ct.splitLine, type: 'dashed' } }, axisLine: { show: false } },
      yAxis: { type: 'category', data: labels, axisLabel: { color: ct.labelLight, fontSize: 9 }, axisLine: { lineStyle: { color: ct.axisLine } } },
      tooltip: { backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText } },
      series: [
        { name: leftName, type: 'bar', data: allMetricKeys.map(k => leftData[k]), itemStyle: { color: '#3B82F6' }, barWidth: 6, barGap: '30%' },
        { name: rightName, type: 'bar', data: allMetricKeys.map(k => rightData[k]), itemStyle: { color: '#F97316' }, barWidth: 6 },
      ],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); chart.dispose(); };
  }, [leftName, leftData, rightName, rightData, ct]);
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const ScatterChart: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => { if (ref.current && ref.current.clientWidth > 0) { init(); ro.disconnect(); } });
    ro.observe(ref.current);
    function init() {
      if (!ref.current) return;
      const chart = echarts.init(ref.current);
      chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 40, right: 15, bottom: 32, left: 44 },
        xAxis: { name: '活力指数', nameTextStyle: { color: ct.labelColor, fontSize: 10 }, splitLine: { show: false }, axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.labelColor, fontSize: 10 }, min: 30, max: 100 },
        yAxis: { name: '渗透率(%)', nameTextStyle: { color: ct.labelColor, fontSize: 10 }, splitLine: { lineStyle: { color: ct.splitLine, type: 'dashed' } }, axisLine: { lineStyle: { color: ct.axisLine } }, axisLabel: { color: ct.labelColor, fontSize: 10 }, min: 0, max: 35 },
        tooltip: { backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.tooltipText, fontSize: 12 }, formatter: (p: any) => `<b>${p.data[3]}</b><br/>活力: ${p.data[0]} · 渗透率: ${p.data[1]}%` },
        visualMap: { show: false, dimension: 0, min: 30, max: 100, inRange: { color: [ct.accent, ct.green] } },
        series: [
          { type: 'scatter', symbolSize: (d: any) => d[2] * 2.5, data: [[92,6,12,'常州武进'],[45,22,7,'苏北经开'],[85,15,9,'深圳南山'],[78,10,8,'苏州工业园'],[60,28,5,'无锡新区'],[88,8,10,'合肥经开'],[72,18,6,'成都高新']], itemStyle: { shadowBlur: 10, shadowColor: ct.green + '40' } },
          { type: 'scatter', symbolSize: 0, markArea: { silent: true, itemStyle: { color: ct.green + '08', borderColor: ct.green, borderWidth: 1, borderType: 'dashed' }, data: [[{ xAxis: 70, yAxis: 0 }, { xAxis: 100, yAxis: 15 }]], label: { show: true, position: 'insideBottom', formatter: '高优拓展区', color: ct.green, fontSize: 10 } } as any, data: [] },
        ],
      });
      window.addEventListener('resize', () => chart.resize());
    }
    return () => ro.disconnect();
  }, [ct.theme]);
  return <div ref={ref} style={{ width: '100%', height: 220 }} />;
};

const KpiCard: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ label, value, color, icon, active, onClick }) => (
  <div onClick={onClick} className={`tech-panel px-3 py-2 flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`} style={{ minWidth: 120, ...(active ? { boxShadow: `inset 0 0 0 1.5px ${color}40` } : {}) }}>
    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>{icon}</div>
    <div className="min-w-0">
      <div className="text-[9px] truncate" style={{ color: 'var(--c-text-muted)' }}>{label}</div>
      <div className="text-base font-bold font-mono leading-tight" style={{ color }}>{value}</div>
    </div>
  </div>
);

const statusColor: Record<string, string> = { '跟进中': '#00E676', '方案阶段': '#3B82F6', '待拜访': '#FAAD14', '排雷中': '#FF4D4F', '监控中': '#A78BFA', '关注预警': '#F97316' };

const ParkRankItem: React.FC<{
  park: ParkInfo; metric: MetricKey; metricDef: { key: MetricKey; label: string; unit: string; color: string; kpi?: string }; maxVal: number;
  onNavigate: () => void; expandedPark: string | null; setExpandedPark: (v: string | null) => void;
}> = ({ park: p, metric, metricDef, maxVal, onNavigate, expandedPark, setExpandedPark }) => {
  const isExpanded = expandedPark === p.name;
  return (
    <div className="mb-1">
      <div className="flex justify-between text-[10px] items-start">
        <span style={{ color: 'var(--c-text-secondary)' }} className="cursor-pointer hover:text-blue-400 transition-colors" onClick={onNavigate}>{p.name}</span>
        <span className="font-mono font-bold shrink-0" style={{ color: metricDef.color }}>{p.data?.[metric] ?? 0}{metricDef.unit}</span>
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <div className="flex items-center gap-1 text-[9px] cursor-pointer" style={{ color: 'var(--c-text-muted)' }} onClick={() => setExpandedPark(isExpanded ? null : p.name)}>
          <UserCircle className="w-3 h-3" />
          <span>{p.managers?.map(m => m.name).join('、') ?? ''}</span>
          <span style={{ color: 'var(--c-accent)' }}>({p.managers?.length ?? 0}人)</span>
        </div>
      </div>
      <div className="w-full h-1 rounded-full overflow-hidden mt-0.5" style={{ backgroundColor: 'var(--c-bg)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((p.data?.[metric] ?? 0) / maxVal) * 100}%`, backgroundColor: metricDef.color }} />
      </div>
      {isExpanded && (
        <div className="mt-1.5 mb-2 rounded-lg p-2 space-y-1.5" style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <div className="text-[9px] font-bold" style={{ color: 'var(--c-text-muted)' }}>跟进人员 ({p.managers?.length ?? 0})</div>
          {p.managers?.map(m => (
            <div key={m.name} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ backgroundColor: statusColor[m.status] || '#6B7280' }}>
                {m.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--c-text)' }}>{m.name}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded" style={{ backgroundColor: (statusColor[m.status] || '#6B7280') + '20', color: statusColor[m.status] || '#6B7280' }}>{m.status}</span>
                </div>
                <div className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>{m.role} · 管户 {m.clients} 家</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const teamColors = ['#3B82F6', '#00E676', '#F97316', '#A78BFA', '#06B6D4', '#EF4444', '#FAAD14'];
function computeManagers(parkData: ParkInfo[]) {
  const map = new Map<string, { parks: string[]; coords: [number, number][]; clients: number; role: string; department: string }>();
  parkData.forEach(p => {
    p.managers?.forEach(m => {
      const existing = map.get(m.name);
      if (existing) { existing.parks.push(p.name); existing.coords.push([p.lng, p.lat]); existing.clients += m.clients; }
      else map.set(m.name, { parks: [p.name], coords: [[p.lng, p.lat]], clients: m.clients, role: m.role, department: m.department });
    });
  });
  return Array.from(map.entries()).map(([name, d], i) => ({ name, ...d, color: teamColors[i % teamColors.length] }));
}

const TeamMap: React.FC<{ selectedMember: string | null }> = ({ selectedMember }) => {
  const ref = useRef<HTMLDivElement>(null);
  const ct = useChartTheme();
  const parkData = useDataStore(s => s.parkData);
  const allManagers = useMemo(() => computeManagers(parkData), [parkData]);
  useEffect(() => {
    if (!ref.current) return;
    let chart: echarts.ECharts | null = null;
    const ro = new ResizeObserver(() => {
      if (!ref.current || ref.current.clientWidth === 0 || ref.current.clientHeight === 0) return;
      if (!chart) {
        chart = echarts.init(ref.current);
        loadGeo().then(() => {
          const members = selectedMember ? allManagers.filter(m => m.name === selectedMember) : allManagers;
          const dimMembers = selectedMember ? allManagers.filter(m => m.name !== selectedMember) : [];

          chart?.setOption({
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'item', backgroundColor: ct.tooltipBg, borderColor: ct.tooltipBorder, textStyle: { color: ct.textWhite, fontSize: 12 },
              formatter: (p: any) => {
                if (p.seriesIndex >= 2 && p.data?.mgrName) return `<b>${p.data.mgrName}</b><br/>${p.name}<br/>管户: ${p.data.clients}家`;
                return p.name || '';
              },
            },
            geo: {
              map: 'china', roam: true, zoom: 1.15, center: [104.5, 36],
              scaleLimit: { min: 0.8, max: 10 },
              label: { show: false },
              itemStyle: { areaColor: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: ct.mapArea }, { offset: 1, color: ct.mapArea2 }] }, borderColor: ct.mapBorder, borderWidth: 0.8 },
              emphasis: { label: { show: true, color: ct.textWhite, fontSize: 11 }, itemStyle: { areaColor: ct.emphasisArea, borderColor: ct.accent, borderWidth: 2 } },
            },
            series: [
              { type: 'map', map: 'china', geoIndex: 0, data: [] },
              // 暗淡的非选中成员散点
              ...dimMembers.map(m => ({
                type: 'scatter' as const, coordinateSystem: 'geo' as const, zlevel: 1,
                symbol: 'circle', symbolSize: 6,
                itemStyle: { color: m.color + '30', borderColor: m.color + '50', borderWidth: 1 },
                label: { show: false },
                data: m.coords.map((c, i) => ({ name: m.parks[i], value: c })),
              })),
              // 高亮的选中成员散点 + 覆盖范围圈
              ...members.map(m => ({
                type: 'effectScatter' as const, coordinateSystem: 'geo' as const, zlevel: 3,
                rippleEffect: { brushType: 'stroke' as const, scale: 4, period: 3 },
                symbolSize: 14,
                itemStyle: { color: m.color, shadowBlur: 15, shadowColor: m.color },
                label: { show: true, formatter: (p: any) => `${m.name}\n${p.name}`, position: 'right' as const, color: ct.textWhite, fontSize: 10, lineHeight: 14 },
                data: m.coords.map((c, i) => ({ name: m.parks[i], value: [...c, m.clients], mgrName: m.name, clients: m.clients })),
              })),
              // 同一客户经理的园区之间连线（拜访路径）
              ...members.filter(m => m.coords.length > 1).map(m => ({
                type: 'lines' as const, coordinateSystem: 'geo' as const, zlevel: 2,
                effect: { show: true, period: 4, trailLength: 0.4, symbol: 'arrow' as const, symbolSize: 4, color: m.color },
                lineStyle: { color: m.color + '50', width: 1.5, curveness: 0.2, type: 'dashed' as const },
                data: m.coords.slice(0, -1).map((c, i) => ({ coords: [c, m.coords[i + 1]] })),
              })),
            ],
          } as any);
        });
      } else {
        chart.resize();
      }
    });
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart?.dispose(); };
  }, [selectedMember, ct]);
  return <div ref={ref} className="w-full h-full" />;
};

export const MacroPanel: React.FC = () => {
  const [pulse, setPulse] = useState(true);
  const [splitView, setSplitView] = useState(false);
  const [viewLayer, setViewLayer] = useState<ViewLayer>('overview');
  const [overviewSubView, setOverviewSubView] = useState<OverviewSubView>('admin');
  const [activeMetric, setActiveMetric] = useState<Metric>('投放');
  const [leftRegion, setLeftRegion] = useState('常州武进高新区');
  const [rightRegion, setRightRegion] = useState('苏北某重工经开区');
  const [leftProvince, setLeftProvince] = useState('江苏省');
  const [rightProvince, setRightProvince] = useState('广东省');
  const [expandedPark, setExpandedPark] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('全部');
  const [chainSubView, setChainSubView] = useState<ChainSubView>('supply');
  const [selectedChainNode, setSelectedChainNode] = useState<ChainNodeInfo | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [drillProvince, setDrillProvince] = useState<string | null>(null);
  const navigate = useNavigate();
  const metricDefs = useDataStore(s => s.metricDefs);
  const adminData = useDataStore(s => s.adminData);
  const parkData = useDataStore(s => s.parkData);
  const chainNodeDetails = useDataStore(s => s.chainNodeDetails);
  const allManagers = useMemo(() => computeManagers(parkData), [parkData]);
  const departments = useMemo(() => {
    const depts = new Set(allManagers.map(m => m.department));
    return ['全部', ...Array.from(depts)];
  }, [allManagers]);
  const filteredManagers = useMemo(() => {
    if (selectedDepartment === '全部') return allManagers;
    return allManagers.filter(m => m.department === selectedDepartment);
  }, [allManagers, selectedDepartment]);
  const allProvinces = useMemo(() => Object.keys(adminData['投放'] || {}), [adminData]);
  const leftPark = parkData.find(p => p.name === leftRegion)!;
  const rightPark = parkData.find(p => p.name === rightRegion)!;
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1500); return () => clearInterval(t); }, []);

  const activeDef = metricDefs.find(m => m.key === activeMetric)!;

  return (
    <div className="h-full flex flex-col">
      {/* KPI Bar - scrollable, click to switch map metric */}
      <div className="shrink-0 px-3 py-2 flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
        {metricDefs.map(m => (
          <div key={m.key} className="shrink-0">
            <KpiCard label={m.label} value={m.kpi || ''} color={m.color} icon={<div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />} active={activeMetric === m.key} onClick={() => setActiveMetric(m.key)} />
          </div>
        ))}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left filter */}
        <div className="w-[220px] shrink-0 p-3 flex flex-col gap-2.5 overflow-y-auto" style={{ borderRight: '1px solid var(--color-dark-border)' }}>
          {/* 视图切换: 战略态势 / 产业布局 / 人力布局 */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-dark-border)' }}>
            <button onClick={() => setViewLayer('overview')} className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${viewLayer === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`} style={viewLayer !== 'overview' ? { color: 'var(--c-text-muted)' } : {}}>
              <Layers className="w-3 h-3" /> 战略态势
            </button>
            <button onClick={() => setViewLayer('chain')} className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${viewLayer === 'chain' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`} style={viewLayer !== 'chain' ? { color: 'var(--c-text-muted)' } : {}}>
              <GitBranch className="w-3 h-3" /> 产业布局
            </button>
            <button onClick={() => setViewLayer('team')} className={`flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${viewLayer === 'team' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`} style={viewLayer !== 'team' ? { color: 'var(--c-text-muted)' } : {}}>
              <Users className="w-3 h-3" /> 人力布局
            </button>
          </div>

          {viewLayer === 'overview' && (
            <button onClick={() => setSplitView(!splitView)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${splitView ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'tech-panel text-blue-400'}`}>
              <Layers className="w-3.5 h-3.5" />{splitView ? '关闭对比' : '分屏对比'}
            </button>
          )}

          {viewLayer === 'overview' && (
            <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid var(--color-dark-border)' }}>
              {([['admin', '行政区', MapPinned], ['park', '工业园区', Building2]] as const).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setOverviewSubView(key)} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-medium transition-colors ${overviewSubView === key ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}`} style={overviewSubView !== key ? { color: 'var(--c-text-muted)' } : {}}>
                  <Icon className="w-2.5 h-2.5" /> {label}
                </button>
              ))}
            </div>
          )}

          {/* 产业链子视图切换 */}
          {viewLayer === 'chain' && (
            <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid var(--color-dark-border)' }}>
              {([['supply', '供应链', Link2], ['chain', '产业链', GitBranch], ['sector', '行业分布', Briefcase]] as const).map(([key, label, Icon]) => (
                <button key={key} onClick={() => setChainSubView(key)} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-medium transition-colors ${chainSubView === key ? 'bg-green-600 text-white' : 'hover:bg-white/5'}`} style={chainSubView !== key ? { color: 'var(--c-text-muted)' } : {}}>
                  <Icon className="w-2.5 h-2.5" /> {label}
                </button>
              ))}
            </div>
          )}

          {/* 当前指标标签 */}
          <div className="tech-panel p-2.5">
            <div className="text-[9px] text-gray-600 mb-1.5">{viewLayer === 'chain' ? '当前视图' : '当前地图着色指标'}</div>
            {viewLayer === 'chain' ? (
              <>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-bold text-green-400">{chainSubView === 'supply' ? '供应链网络' : chainSubView === 'chain' ? '产业上下游行业情况' : '行业分布'}</span>
                </div>
                <div className="text-[9px] text-gray-600 mt-1">{chainSubView === 'supply' ? '园区间供应关系流线' : chainSubView === 'chain' ? '产业链节点地理分布 · 上下游流向' : '按行业分类散点分布'}</div>
              </>
            ) : viewLayer === 'overview' ? (
              <>
                <div className="flex items-center gap-2">
                  {overviewSubView === 'admin' ? <MapPinned className="w-3 h-3 text-blue-400" /> : <Building2 className="w-3 h-3 text-cyan-300" />}
                  <span className="text-xs font-bold" style={{ color: overviewSubView === 'admin' ? '#3B82F6' : '#22D3EE' }}>{overviewSubView === 'admin' ? '行政区' : '工业园区'}</span>
                </div>
                <div className="text-[9px] text-gray-600 mt-1">{overviewSubView === 'admin' ? (drillProvince ? `已下钻到 ${drillProvince} 市级` : '行政区热力分布 · 双击省份下钻') : '工业园区散点分布 · 支持园区聚焦'}</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: activeDef.color }} />
                  <span className="text-xs font-bold" style={{ color: activeDef.color }}>{activeDef.label}</span>
                </div>
                <div className="text-[9px] text-gray-600 mt-1">按客户经理覆盖范围</div>
              </>
            )}
          </div>

          {viewLayer === 'overview' && <div className="tech-panel p-2.5">
            <div className="text-[10px] text-gray-500 flex items-center gap-1 mb-2"><Filter className="w-3 h-3" /> 筛选</div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-gray-600 flex items-center gap-1"><Factory className="w-3 h-3" /> 产业</label>
                <div className="relative mt-1"><select className="w-full bg-dark-bg border border-dark-border rounded p-1.5 text-xs text-gray-300 outline-none appearance-none"><option>新能源及装备</option><option>半导体与集成电路</option><option>生物医药</option><option>新材料与高分子</option><option>智能制造</option></select><ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" /></div>
              </div>
              {overviewSubView === 'admin' ? (
                <>
                  <div>
                    <label className="text-[10px] flex items-center gap-1" style={{ color: '#3B82F6' }}><Building2 className="w-3 h-3" /> 主攻省份</label>
                    <div className="relative mt-1">
                      <select value={leftProvince} onChange={e => setLeftProvince(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded p-1.5 text-xs text-gray-300 outline-none appearance-none">
                        {allProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                    </div>
                  </div>
                  {splitView && (
                    <div>
                      <label className="text-[10px] flex items-center gap-1" style={{ color: '#F97316' }}><Building2 className="w-3 h-3" /> 对比省份</label>
                      <div className="relative mt-1">
                        <select value={rightProvince} onChange={e => setRightProvince(e.target.value)} className="w-full bg-dark-bg rounded p-1.5 text-xs text-gray-300 outline-none appearance-none" style={{ border: '1px solid rgba(249,115,22,0.4)' }}>
                          {allProvinces.filter(p => p !== leftProvince).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] flex items-center gap-1" style={{ color: '#22D3EE' }}><MapPinned className="w-3 h-3" /> 聚焦园区</label>
                    <div className="relative mt-1">
                      <select value={leftRegion} onChange={e => setLeftRegion(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded p-1.5 text-xs text-gray-300 outline-none appearance-none">
                        <option value="">不聚焦</option>
                        {parkData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                    </div>
                  </div>
                  {splitView && (
                    <div>
                      <label className="text-[10px] flex items-center gap-1" style={{ color: '#F97316' }}><MapPinned className="w-3 h-3" /> 对比园区</label>
                      <div className="relative mt-1">
                        <select value={rightRegion} onChange={e => setRightRegion(e.target.value)} className="w-full bg-dark-bg rounded p-1.5 text-xs text-gray-300 outline-none appearance-none" style={{ border: '1px solid rgba(249,115,22,0.4)' }}>
                          <option value="">不聚焦</option>
                          {parkData.filter(p => p.name !== leftRegion).map(p => <option key={p.name} value={p.name}>{p.name}</option>) }
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>}

          {viewLayer === 'team' ? (
            /* 人员列表 */
            <div className="tech-panel p-2.5 flex-1 min-h-0 overflow-y-auto">
              <div className="text-[10px] flex items-center gap-1 mb-2" style={{ color: 'var(--c-text-muted)' }}><Users className="w-3 h-3 text-blue-400" /> 团队成员 ({filteredManagers.length}/{allManagers.length}人)</div>
              <div className="mb-2">
                <label className="text-[9px] flex items-center gap-1 mb-1" style={{ color: 'var(--c-text-muted)' }}><Building2 className="w-3 h-3" /> 部门筛选</label>
                <div className="relative">
                  <select value={selectedDepartment} onChange={e => { setSelectedDepartment(e.target.value); setSelectedMember(null); }} className="w-full bg-dark-bg border border-dark-border rounded p-1.5 text-xs text-gray-300 outline-none appearance-none">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" />
                </div>
              </div>
              <div className="text-[9px] mb-2" style={{ color: 'var(--c-text-muted)' }}>点击成员查看覆盖范围</div>
              {selectedMember && (
                <button onClick={() => setSelectedMember(null)} className="w-full mb-2 py-1.5 rounded text-[10px] font-medium text-blue-400 hover:bg-white/5 transition-colors" style={{ border: '1px solid var(--c-border)' }}>
                  显示全部成员
                </button>
              )}
              {filteredManagers.map(m => (
                <div key={m.name} onClick={() => setSelectedMember(selectedMember === m.name ? null : m.name)}
                  className="p-2 rounded-lg mb-1.5 cursor-pointer transition-all"
                  style={{
                    backgroundColor: selectedMember === m.name ? m.color + '15' : 'transparent',
                    border: `1px solid ${selectedMember === m.name ? m.color + '40' : 'transparent'}`,
                  }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: m.color }}>{m.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold" style={{ color: selectedMember === m.name ? m.color : 'var(--c-text)' }}>{m.name}</span>
                        <span className="text-[9px] font-mono" style={{ color: m.color }}>{m.clients}户</span>
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--c-text-muted)' }}>{m.role} · {m.department}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.parks.map(pk => (
                      <span key={pk} className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: m.color + '15', color: m.color }}>{pk}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : viewLayer === 'chain' ? (
            /* 产业链面板 */
            <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-y-auto">
              {chainSubView === 'supply' && (
                <div className="tech-panel p-2.5">
                  <div className="text-[10px] flex items-center gap-1 mb-2" style={{ color: 'var(--c-text-muted)' }}><Link2 className="w-3 h-3 text-green-400" /> 供应链关系 ({supplyLinks.length}条)</div>
                  {supplyLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-1.5 py-1.5 text-[10px]" style={{ borderBottom: '1px solid rgba(30,64,112,0.15)' }}>
                      <span style={{ color: 'var(--c-text-secondary)' }} className="truncate flex-1">{link.from}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" style={{ color: link.color }} />
                      <span style={{ color: 'var(--c-text-secondary)' }} className="truncate flex-1">{link.to}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded shrink-0" style={{ backgroundColor: link.color + '20', color: link.color }}>{link.type}</span>
                    </div>
                  ))}
                </div>
              )}
              {chainSubView === 'chain' && (
                <div className="tech-panel p-2.5">
                  <div className="text-[10px] flex items-center gap-1 mb-2" style={{ color: 'var(--c-text-muted)' }}><GitBranch className="w-3 h-3 text-green-400" /> 产业链节点</div>
                  <div className="text-[9px] mb-2" style={{ color: 'var(--c-text-muted)' }}>点击图中节点查看详情</div>
                  {selectedChainNode && (
                    <div className="p-2 rounded-lg mb-2" style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[11px] font-bold" style={{ color: 'var(--c-text)' }}>{selectedChainNode.name}</span>
                        <span className="text-[9px] ml-auto" style={{ color: 'var(--c-text-muted)' }}>{selectedChainNode.scale}亿</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {[
                          { v: `${selectedChainNode.activity}%`, l: '景气度', c: selectedChainNode.activity >= 85 ? '#00E676' : '#FAAD14' },
                          { v: `${selectedChainNode.bankRatio}%`, l: '银行', c: '#3B82F6' },
                          { v: `${selectedChainNode.leaseRatio}%`, l: '金租', c: '#22D3EE' },
                        ].map(k => (
                          <div key={k.l} className="text-center p-1 rounded" style={{ backgroundColor: 'var(--c-bg)' }}>
                            <div className="text-[11px] font-bold font-mono" style={{ color: k.c }}>{k.v}</div>
                            <div className="text-[8px]" style={{ color: 'var(--c-text-muted)' }}>{k.l}</div>
                          </div>
                        ))}
                      </div>
                      {selectedChainNode.firms && selectedChainNode.firms.length > 0 && (
                        <div>
                          <div className="text-[9px] mb-1" style={{ color: 'var(--c-text-muted)' }}>链上企业</div>
                          {selectedChainNode.firms.map((f, i) => (
                            <div key={i} className="flex items-center justify-between py-1 text-[10px] cursor-pointer hover:bg-white/5 rounded px-1" onClick={() => navigate('/customer')}>
                              <div>
                                <span style={{ color: 'var(--c-text-secondary)' }}>{f.firmId}</span>
                                <span className="text-[8px] ml-1" style={{ color: 'var(--c-text-muted)' }}>{f.role}</span>
                              </div>
                              <span className="text-[9px] font-mono" style={{ color: '#22D3EE' }}>{f.asset}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {Object.entries(chainNodeDetails).map(([name, node]) => (
                    <div key={name} onClick={() => setSelectedChainNode(node)}
                      className="flex items-center justify-between py-1.5 px-1.5 rounded cursor-pointer hover:bg-white/5 transition-colors text-[10px]"
                      style={{ borderBottom: '1px solid rgba(30,64,112,0.15)', backgroundColor: selectedChainNode?.name === name ? 'rgba(0,230,118,0.08)' : 'transparent' }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: catColor[Object.entries(catColor).find(([,]) => true)?.[0] || ''] || '#3B82F6' }} />
                        <span style={{ color: selectedChainNode?.name === name ? '#00E676' : 'var(--c-text-secondary)' }}>{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono" style={{ color: node.activity >= 85 ? '#00E676' : node.activity >= 70 ? '#FAAD14' : '#FF4D4F' }}>{node.activity}%</span>
                        <span style={{ color: 'var(--c-text-muted)' }}>{node.scale}亿</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {chainSubView === 'sector' && (
                <div className="tech-panel p-2.5">
                  <div className="text-[10px] flex items-center gap-1 mb-2" style={{ color: 'var(--c-text-muted)' }}><Briefcase className="w-3 h-3 text-green-400" /> 行业分布</div>
                  <div className="text-[9px] mb-2" style={{ color: 'var(--c-text-muted)' }}>点击行业聚焦显示</div>
                  {selectedSector && (
                    <button onClick={() => setSelectedSector(null)} className="w-full mb-2 py-1.5 rounded text-[10px] font-medium text-green-400 hover:bg-white/5 transition-colors" style={{ border: '1px solid var(--c-border)' }}>
                      显示全部行业
                    </button>
                  )}
                  {Object.entries(
                    parkData.reduce((acc, p) => {
                      const ind = parkIndustry[p.name];
                      if (!ind) return acc;
                      if (!acc[ind.sector]) acc[ind.sector] = { color: ind.color, parks: [] };
                      acc[ind.sector].parks.push(p.name);
                      return acc;
                    }, {} as Record<string, { color: string; parks: string[] }>)
                  ).map(([sector, { color, parks }]) => (
                    <div key={sector} onClick={() => setSelectedSector(selectedSector === sector ? null : sector)}
                      className="p-2 rounded-lg mb-1.5 cursor-pointer transition-all"
                      style={{
                        backgroundColor: selectedSector === sector ? color + '15' : 'transparent',
                        border: `1px solid ${selectedSector === sector ? color + '40' : 'transparent'}`,
                      }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[11px] font-bold" style={{ color: selectedSector === sector ? color : 'var(--c-text)' }}>{sector}</span>
                        <span className="text-[9px] ml-auto font-mono" style={{ color }}>{parks.length}个园区</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parks.map(pk => (
                          <span key={pk} className="text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: color + '15', color }}>{pk}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* 园区指标排行 */
            <div className="tech-panel p-2.5 flex-1 min-h-0 overflow-y-auto">
              <div className="text-[10px] text-gray-500 flex items-center gap-1 mb-2"><Zap className="w-3 h-3 text-yellow-400" /> {overviewSubView === 'admin' ? `${activeDef.label}排行` : '工业园区排行'}</div>
              {[...parkData].sort((a, b) => (b.data?.[activeMetric] ?? 0) - (a.data?.[activeMetric] ?? 0)).map(p => (
                <ParkRankItem key={p.name} park={p} metric={activeMetric} metricDef={activeDef} maxVal={Math.max(...parkData.map(x => x.data?.[activeMetric] ?? 0))} onNavigate={() => navigate('/customer')} expandedPark={expandedPark} setExpandedPark={setExpandedPark} />
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex min-h-0">
            {viewLayer === 'team' ? (
              <div className="flex-1 relative">
                <TeamMap selectedMember={selectedMember} />
                <div className="absolute top-3 left-3 w-10 h-10 border-l-2 border-t-2 border-blue-500/30 pointer-events-none" />
                <div className="absolute top-3 right-3 w-10 h-10 border-r-2 border-t-2 border-blue-500/30 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-10 h-10 border-l-2 border-b-2 border-blue-500/30 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-10 h-10 border-r-2 border-b-2 border-blue-500/30 pointer-events-none" />
              </div>
            ) : viewLayer === 'chain' ? (
              <div className="flex-1 relative">
                {chainSubView === 'supply' && <SupplyChainMap />}
                {chainSubView === 'chain' && <ChainGeoMap onSelectNode={setSelectedChainNode} />}
                {chainSubView === 'sector' && <SectorGeoMap selectedSector={selectedSector} />}
                <div className="absolute top-3 left-3 w-10 h-10 border-l-2 border-t-2 border-green-500/30 pointer-events-none" />
                <div className="absolute top-3 right-3 w-10 h-10 border-r-2 border-t-2 border-green-500/30 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-10 h-10 border-l-2 border-b-2 border-green-500/30 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-10 h-10 border-r-2 border-b-2 border-green-500/30 pointer-events-none" />
                {chainSubView === 'supply' && (
                  <div className="absolute top-4 left-16 flex items-center gap-3 text-[9px]">
                    {[['设备/装备', '#FAAD14'], ['材料', '#3B82F6'], ['电池', '#00E676'], ['组件', '#A78BFA'], ['芯片', '#06B6D4'], ['隔膜', '#8B5CF6']].map(([l, c]) => (
                      <span key={l} className="flex items-center gap-1"><span className="w-2 h-0.5 rounded" style={{ backgroundColor: c as string }} /><span style={{ color: c as string }}>{l}</span></span>
                    ))}
                  </div>
                )}
                {chainSubView === 'chain' && (
                  <div className="absolute top-4 left-16 flex items-center gap-3 text-[9px]">
                    {[['上游原材料', '#3B82F6'], ['中游制造', '#00E676'], ['装备供应', '#FAAD14'], ['下游应用', '#A78BFA']].map(([l, c]) => (
                      <span key={l} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: c as string }} /><span style={{ color: c as string }}>{l}</span></span>
                    ))}
                  </div>
                )}
                {chainSubView === 'sector' && (
                  <div className="absolute top-4 left-16 flex flex-wrap gap-2 text-[9px] max-w-[300px]">
                    {Object.entries(sectorColors).slice(0, 8).map(([s, c]) => (
                      <span key={s} className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: c }} /><span style={{ color: c }}>{s}</span></span>
                    ))}
                  </div>
                )}
              </div>
            ) : splitView ? (
              <>
                <div className="flex-1 relative" style={{ borderRight: '2px solid var(--color-dark-border)' }}>
                  {overviewSubView === 'admin' ? (
                    <AdminMap metric={activeMetric} highlight={leftProvince} accentColor="#3B82F6" focusZoom />
                  ) : (
                    <ParkMap metric={activeMetric} highlight={leftRegion || undefined} accentColor="#22D3EE" focusZoom />
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor: overviewSubView === 'admin' ? 'rgba(59,130,246,0.15)' : 'rgba(34,211,238,0.15)', color: overviewSubView === 'admin' ? '#3B82F6' : '#22D3EE' }}>
                      {overviewSubView === 'admin' ? `主攻 · ${leftProvince}` : `主攻 · ${leftRegion || '全部园区'}`}
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative">
                  {overviewSubView === 'admin' ? (
                    <AdminMap metric={activeMetric} highlight={rightProvince} accentColor="#F97316" focusZoom />
                  ) : (
                    <ParkMap metric={activeMetric} highlight={rightRegion || undefined} accentColor="#F97316" focusZoom />
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#F97316' }}>
                      {overviewSubView === 'admin' ? `对比 · ${rightProvince}` : `对比 · ${rightRegion || '全部园区'}`}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 relative">
                {overviewSubView === 'admin' ? (
                  <CombinedMap metric={activeMetric} drillProvince={drillProvince} onDrillDown={setDrillProvince} />
                ) : (
                  <ParkMap metric={activeMetric} highlight={leftRegion || undefined} accentColor="#22D3EE" focusZoom={!!leftRegion} />
                )}
                {overviewSubView === 'admin' && drillProvince && (
                  <button onClick={() => setDrillProvince(null)}
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-blue-400 transition-all hover:bg-white/10 z-10"
                    style={{ backgroundColor: 'rgba(4,11,22,0.85)', border: '1px solid rgba(59,130,246,0.4)', backdropFilter: 'blur(8px)' }}>
                    <ArrowLeft className="w-3.5 h-3.5" /> 返回全国
                  </button>
                )}
                {overviewSubView === 'admin' && drillProvince && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[11px] font-bold z-10"
                    style={{ backgroundColor: 'rgba(4,11,22,0.85)', color: activeDef.color, border: `1px solid ${activeDef.color}40`, backdropFilter: 'blur(8px)' }}>
                    {drillProvince} · 市级下钻
                  </div>
                )}
                {!(overviewSubView === 'admin' && drillProvince) && (
                  <>
                    <div className="absolute top-3 left-3 w-10 h-10 border-l-2 border-t-2 pointer-events-none" style={{ borderColor: activeDef.color + '40' }} />
                    <div className="absolute top-3 right-3 w-10 h-10 border-r-2 border-t-2 pointer-events-none" style={{ borderColor: activeDef.color + '40' }} />
                    <div className="absolute bottom-3 left-3 w-10 h-10 border-l-2 border-b-2 pointer-events-none" style={{ borderColor: activeDef.color + '40' }} />
                    <div className="absolute bottom-3 right-3 w-10 h-10 border-r-2 border-b-2 pointer-events-none" style={{ borderColor: activeDef.color + '40' }} />
                  </>
                )}
              </div>
            )}
          </div>
          {splitView && viewLayer === 'overview' && (
            <div className="shrink-0 h-[220px]" style={{ borderTop: '1px solid var(--color-dark-border)' }}>
              {leftRegion && rightRegion && leftPark && rightPark
                ? <CompareBar leftName={leftRegion} leftData={leftPark.data ?? {} as Record<MetricKey, number>} rightName={rightRegion} rightData={rightPark.data ?? {} as Record<MetricKey, number>} />
                : <CompareBar
                    leftName={leftProvince}
                    leftData={Object.fromEntries(allMetricKeys.map(k => [k, adminData[k][leftProvince] || 0])) as Record<Metric, number>}
                    rightName={rightProvince}
                    rightData={Object.fromEntries(allMetricKeys.map(k => [k, adminData[k][rightProvince] || 0])) as Record<Metric, number>}
                  />
              }
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-[270px] shrink-0 p-3 flex flex-col gap-2.5 overflow-y-auto" style={{ borderLeft: '1px solid var(--color-dark-border)' }}>
          <div className="tech-panel p-3">
            <div className="tech-title flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-blue-400" /> 高优拓展区</div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(4,11,22,0.6)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-green-400 cursor-pointer hover:underline" onClick={() => navigate('/customer')}>常州武进高新区</span>
                <span className="flex items-center gap-1 text-[10px] text-green-400"><Radio className={`w-3 h-3 ${pulse ? 'opacity-100' : 'opacity-40'} transition-opacity`} /> 追踪中</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {[{ v: '92', l: '活力', c: 'text-cyan-300' }, { v: '6%', l: '渗透率', c: 'text-yellow-400' }, { v: '47', l: '规上企业', c: 'text-blue-400' }].map(k => (
                  <div key={k.l} className="text-center"><div className={`text-sm font-bold font-mono ${k.c}`}>{k.v}</div><div className="text-[9px] text-gray-600">{k.l}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="tech-panel p-3 flex-1 min-h-0">
            <div className="tech-title text-xs mb-1">产融错配散点图</div>
            <ScatterChart />
          </div>
          <div className="tech-panel p-3" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="text-xs font-bold text-red-400 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4" /> 风险阻断
              <span className={`ml-auto w-2 h-2 rounded-full bg-red-500 ${pulse ? 'opacity-100' : 'opacity-30'} transition-opacity`} />
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(127,29,29,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-red-300 cursor-pointer hover:underline" onClick={() => navigate('/customer')}>企业C · 苏北经开</span>
                <span className="text-[9px] px-1 py-0.5 bg-red-500/20 text-red-400 rounded">高危</span>
              </div>
              <p className="text-[10px] text-gray-500">IoT开机率&lt;15% · 隐性举债</p>
              <div className="text-[10px] text-red-400 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3" />已冻结授信</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
