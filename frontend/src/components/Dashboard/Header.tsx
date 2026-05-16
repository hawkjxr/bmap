import React, { useEffect, useState } from 'react';
import { Activity, Target, Clock } from 'lucide-react';

const AnimatedNumber: React.FC<{ target: number; decimals?: number; prefix?: string; suffix?: string }> = ({
  target, decimals = 0, prefix = '', suffix = ''
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <span className="font-mono font-bold">
      {prefix}{current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
    </span>
  );
};

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="absolute top-0 left-0 w-full h-20 z-50 flex items-center justify-between px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #040B16 0%, #040B16cc 50%, transparent 100%)' }}
      />

      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400">
            作战地图
          </h1>
          <p className="text-[10px] text-gray-500 tracking-[0.3em] -mt-0.5">INDUSTRIAL BATTLE MAP</p>
        </div>
      </div>

      <div className="relative flex items-center gap-10">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 tracking-wider">资产总规模</span>
          <span className="text-2xl text-cyan-300">
            <AnimatedNumber target={1245.8} decimals={1} suffix=" 亿" />
          </span>
        </div>
        <div className="w-px h-8" style={{ backgroundColor: 'var(--color-dark-border)' }} />
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 tracking-wider">战略客户数</span>
          <span className="text-2xl text-blue-400">
            <AnimatedNumber target={3421} />
          </span>
        </div>
        <div className="w-px h-8" style={{ backgroundColor: 'var(--color-dark-border)' }} />
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-500 tracking-wider">大盘活力指数</span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-2xl text-green-400">
              <AnimatedNumber target={86.4} decimals={1} />
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-2 text-gray-500 text-xs">
        <Clock className="w-3.5 h-3.5" />
        <span className="font-mono">{time.toLocaleString('zh-CN', { hour12: false })}</span>
      </div>
    </header>
  );
};
