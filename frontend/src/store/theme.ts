import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: 'dark',
  toggle: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    return { theme: next };
  }),
}));

const darkColors = {
  bg: '#040B16', bgElevated: '#060E1A',
  surface: 'rgba(10,26,47,0.85)', surfaceSolid: '#0A1A2F',
  border: 'rgba(30,64,112,0.45)', borderStrong: 'rgba(50,100,160,0.5)',
  text: '#F0F4F8', textSecondary: '#94A3B8', textMuted: '#475569',
  accent: '#3B82F6', accentGlow: 'rgba(59,130,246,0.4)',
  green: '#00E676', red: '#FF4D4F', yellow: '#FAAD14',
  mapArea: '#0B1D3A', mapArea2: '#0A1628', mapBorder: '#1A3A6A',
  chartAxis: '#1e4070', chartSplit: '#1e4070',
  tooltipBg: 'rgba(10,26,47,0.95)', tooltipBorder: '#1A3A6A', tooltipText: '#fff',
  gridLine: 'rgba(30,64,112,0.15)',
  labelColor: '#a3a8b4', labelMuted: '#6B7280',
  treeBg: '#0A1628', treeBorder: '#1A3A6A',
  nodeText: '#fff',
};

const lightColors = {
  bg: '#F0F2F5', bgElevated: '#FAFBFC',
  surface: 'rgba(255,255,255,0.95)', surfaceSolid: '#FFFFFF',
  border: 'rgba(148,163,184,0.45)', borderStrong: 'rgba(100,116,139,0.4)',
  text: '#0F172A', textSecondary: '#334155', textMuted: '#64748B',
  accent: '#2563EB', accentGlow: 'rgba(37,99,235,0.12)',
  green: '#15803D', red: '#B91C1C', yellow: '#B45309',
  mapArea: '#D5DCE6', mapArea2: '#E2E8F0', mapBorder: '#94A3B8',
  chartAxis: '#94A3B8', chartSplit: '#CBD5E1',
  tooltipBg: 'rgba(255,255,255,0.98)', tooltipBorder: '#94A3B8', tooltipText: '#0F172A',
  gridLine: 'rgba(148,163,184,0.25)',
  labelColor: '#475569', labelMuted: '#64748B',
  treeBg: '#FAFBFC', treeBorder: '#94A3B8',
  nodeText: '#0F172A',
};

export type ChartColors = typeof darkColors;
export const getChartColors = (theme: Theme): ChartColors => theme === 'dark' ? darkColors : lightColors;
