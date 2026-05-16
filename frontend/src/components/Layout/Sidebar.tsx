import React from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, GitBranch, User, ClipboardList, Settings, Target, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../store/theme';

const navItems = [
  { to: '/', icon: Globe, label: '宏观态势', sub: '区域对比 · GIS地图' },
  { to: '/chain', icon: GitBranch, label: '产业链沙盘', sub: '拓扑图谱 · 商机发现' },
  { to: '/customer', icon: User, label: '客户全景', sub: '单体穿透 · 雷达对标' },
  { to: '/tasks', icon: ClipboardList, label: '个人工作台', sub: '工单派发 · 执行闭环' },
  { to: '/rules', icon: Settings, label: '规则配置', sub: '数据字典 · 策略画布' },
];

export const Sidebar: React.FC = () => {
  const { theme, toggle } = useTheme();

  return (
    <aside className="w-[220px] h-screen flex flex-col border-r shrink-0 transition-colors" style={{ backgroundColor: 'var(--c-bg-elevated)', borderColor: 'var(--c-border)' }}>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center" style={{ boxShadow: 'var(--shadow-glow)' }}>
          <Target className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-widest" style={{ background: 'linear-gradient(to right, var(--c-accent), #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>作战地图</div>
          <div className="text-[9px] tracking-[0.2em] -mt-0.5" style={{ color: 'var(--c-text-muted)' }}>BATTLE MAP</div>
        </div>
      </div>

      <div className="w-full h-px" style={{ backgroundColor: 'var(--c-border)' }} />

      <nav className="flex-1 py-3 px-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'border'
                  : 'hover:bg-[var(--c-accent-glow)] border border-transparent'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: 'var(--c-accent-glow)', borderColor: 'var(--c-border-strong)' } : {}}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 shrink-0 transition-colors" style={{ color: isActive ? 'var(--c-accent)' : 'var(--c-text-muted)' }} />
                <div>
                  <div className="text-sm font-medium transition-colors" style={{ color: isActive ? 'var(--c-text)' : 'var(--c-text-secondary)' }}>
                    {item.label}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--c-text-muted)' }}>{item.sub}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all"
          style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}
        >
          <Sun className="w-4 h-4" style={{ color: '#FAAD14', display: theme === 'dark' ? 'block' : 'none' }} />
          <Moon className="w-4 h-4" style={{ color: 'var(--c-accent)', display: theme === 'light' ? 'block' : 'none' }} />
          <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
        </button>
      </div>

      <div className="px-5 py-3 text-[10px]" style={{ color: 'var(--c-text-muted)', borderTop: '1px solid var(--c-border)' }}>
        v2.0.1 · 数据更新: 实时
      </div>
    </aside>
  );
};
