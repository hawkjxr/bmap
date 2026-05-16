import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Map, GitBranch, Users, LayoutDashboard, Settings,
  Shield, Sun, Moon, ChevronRight, Zap
} from 'lucide-react';
import { useThemeStore } from '../../store/theme';
import { useAppStore } from '../../store/data';

export const AppLayout: React.FC = () => {
  const { theme, toggle } = useThemeStore();
  const riskAlerts = useAppStore(s => s.riskAlerts);
  const unacknowledged = riskAlerts.filter(a => !a.acknowledged).length;

  const navItems = [
    { to: '/', icon: Map, label: '宏观态势', sub: '产业渗透 · 全局把控' },
    { to: '/chain', icon: GitBranch, label: '产业链沙盘', sub: '拓扑图谱 · 融资结构' },
    { to: '/customer', icon: Users, label: '客户全景', sub: '触达路径 · 资信报告' },
    { to: '/tasks', icon: LayoutDashboard, label: '个人工作台', sub: '工单闭环 · 商机发现' },
    { to: '/commander', icon: Zap, label: '统帅驾驶舱', sub: '北极星 KPI · 红绿灯预警', new: true },
    { to: '/battlefield', icon: Shield, label: '战区指挥台', sub: '框选派单 · 鹰眼轨迹', new: true },
    { to: '/rules', icon: Settings, label: '规则配置', sub: '数据目录 · 策略画布' },
  ];

  return (
    <div className="h-full flex bg-[var(--c-bg)]">
      <aside className="w-[200px] shrink-0 flex flex-col border-r border-[var(--c-border)] bg-[var(--c-bg-elevated)]">
        <div className="h-14 px-4 flex items-center border-b border-[var(--c-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--c-accent)] to-[var(--c-cyan)] flex items-center justify-center">
              <Map className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-gradient-accent">BattleMap</div>
              <div className="text-[8px] text-[var(--c-text-muted)]">v0.9.0 battle09</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--c-accent)]/10 text-[var(--c-accent)] border border-[var(--c-accent)]/30'
                    : 'text-[var(--c-text-secondary)] hover:bg-[var(--c-surface)] hover:text-[var(--c-text)]'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium flex items-center gap-1">
                  {item.label}
                  {item.new && (
                    <span className="text-[8px] px-1 py-0.5 rounded bg-[var(--c-accent)]/10 text-[var(--c-accent)]">
                      NEW
                    </span>
                  )}
                  {item.to === '/commander' && unacknowledged > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--c-red)] text-white text-[8px] flex items-center justify-center">
                      {unacknowledged > 9 ? '9+' : unacknowledged}
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-[var(--c-text-muted)] truncate">{item.sub}</div>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--c-border)]">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--c-surface)] hover:bg-[var(--c-surface)]/80 transition-colors text-[var(--c-text-secondary)]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-xs">{theme === 'dark' ? '亮色模式' : '暗色模式'}</span>
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
