import React, { useState } from 'react';
import { Layers, ChevronDown, Factory, MapPin, Filter, Zap } from 'lucide-react';

export const LeftPanel: React.FC = () => {
  const [isSplitView, setIsSplitView] = useState(false);
  const [industry, setIndustry] = useState('新能源及装备制造');
  const [region, setRegion] = useState('常州武进国家高新区');

  return (
    <div className="absolute left-4 top-24 z-40 flex flex-col gap-3 w-[250px]">
      <button
        onClick={() => setIsSplitView(!isSplitView)}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300
          ${isSplitView
            ? 'bg-blue-600 text-white border border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            : 'tech-panel text-blue-400 hover:bg-blue-900/30'}
        `}
      >
        <Layers className="w-4 h-4" />
        {isSplitView ? '关闭对比沙盘' : '开启分屏对比'}
      </button>

      <div className="tech-panel p-4">
        <h3 className="text-xs text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Filter className="w-3 h-3" />
          时空组装筛选器
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
              <Factory className="w-3 h-3" /> 产业维度
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-md p-2 pr-8 text-xs text-gray-300 outline-none appearance-none cursor-pointer hover:border-blue-500/50 transition-colors"
              >
                <option>新能源及装备制造</option>
                <option>半导体与集成电路</option>
                <option>生物医药与医疗器械</option>
                <option>新材料与高分子</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3" /> 区域选择 (主攻区)
            </label>
            <div className="relative">
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-md p-2 pr-8 text-xs text-gray-300 outline-none appearance-none cursor-pointer hover:border-blue-500/50 transition-colors"
              >
                <option>常州武进国家高新区</option>
                <option>深圳南山科技园</option>
                <option>苏州工业园区</option>
                <option>合肥经开区</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {isSplitView && (
            <div className="border-t border-dark-border pt-3">
              <label className="text-[10px] text-orange-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" /> 区域选择 (对比区)
              </label>
              <div className="relative">
                <select className="w-full bg-dark-bg border-orange-900/50 border rounded-md p-2 pr-8 text-xs text-gray-300 outline-none appearance-none cursor-pointer">
                  <option>苏北某传统重工经开区</option>
                  <option>徐州经济技术开发区</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tech-panel p-4">
        <h3 className="text-xs text-gray-500 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3 h-3 text-yellow-400" />
          实时产业脉搏
        </h3>
        <div className="space-y-2">
          {[
            { label: '区域平均开工率', value: '87.3%', color: 'text-green-400', bar: 87 },
            { label: '用电量月增速', value: '+12.6%', color: 'text-cyan-300', bar: 63 },
            { label: '新增设备投放', value: '2.4亿', color: 'text-blue-400', bar: 48 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">{item.label}</span>
                <span className={`font-mono font-bold ${item.color}`}>{item.value}</span>
              </div>
              <div className="w-full h-1 bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
                  style={{ width: `${item.bar}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
