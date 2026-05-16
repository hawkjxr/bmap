import { useMemo } from 'react';
import { useTheme } from '../store/theme';

function buildColors(isDark: boolean) {
  return {
    isDark,
    theme: isDark ? 'dark' as const : 'light' as const,
    mapArea: isDark ? '#0B1D3A' : '#D5DCE6',
    mapArea2: isDark ? '#0A1628' : '#E2E8F0',
    mapBorder: isDark ? '#1A3A6A' : '#94A3B8',
    tooltipBg: isDark ? 'rgba(10,26,47,0.95)' : 'rgba(255,255,255,0.98)',
    tooltipBorder: isDark ? '#1A3A6A' : '#94A3B8',
    tooltipText: isDark ? '#fff' : '#0F172A',
    axisLine: isDark ? '#1e4070' : '#94A3B8',
    splitLine: isDark ? '#1e4070' : '#CBD5E1',
    labelColor: isDark ? '#6B7280' : '#475569',
    labelLight: isDark ? '#a3a8b4' : '#334155',
    textWhite: isDark ? '#fff' : '#0F172A',
    dimBg: isDark ? 'rgba(10,26,47,0.5)' : 'rgba(226,232,240,0.6)',
    emphasisArea: isDark ? '#1C3D6E' : '#93C5FD',
    accent: isDark ? '#3B82F6' : '#2563EB',
    green: isDark ? '#00E676' : '#15803D',
    red: isDark ? '#FF4D4F' : '#B91C1C',
    yellow: isDark ? '#FAAD14' : '#B45309',
  };
}

export type ChartThemeColors = ReturnType<typeof buildColors>;

export function useChartTheme(): ChartThemeColors {
  const { theme } = useTheme();
  return useMemo(() => buildColors(theme === 'dark'), [theme]);
}
