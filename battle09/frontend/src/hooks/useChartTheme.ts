import { useMemo } from 'react';
import { useThemeStore } from '../store/theme';

export interface ChartTheme {
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  axisLine: string;
  axisLabel: string;
  splitLine: string;
  text: string;
  textSecondary: string;
  seriesColors: string[];
  backgroundColor: string;
}

const DARK_THEME: ChartTheme = {
  tooltipBg: 'rgba(10, 26, 47, 0.95)',
  tooltipBorder: 'rgba(30, 64, 112, 0.45)',
  tooltipText: '#F0F4F8',
  axisLine: 'rgba(30, 64, 112, 0.45)',
  axisLabel: '#94A3B8',
  splitLine: 'rgba(30, 64, 112, 0.2)',
  text: '#F0F4F8',
  textSecondary: '#94A3B8',
  backgroundColor: 'transparent',
  seriesColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'],
};

const LIGHT_THEME: ChartTheme = {
  tooltipBg: 'rgba(255, 255, 255, 0.95)',
  tooltipBorder: 'rgba(200, 210, 220, 0.6)',
  tooltipText: '#1E293B',
  axisLine: 'rgba(200, 210, 220, 0.6)',
  axisLabel: '#64748B',
  splitLine: 'rgba(200, 210, 220, 0.3)',
  text: '#1E293B',
  textSecondary: '#64748B',
  backgroundColor: 'transparent',
  seriesColors: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0891B2', '#EA580C'],
};

export function useChartTheme(): ChartTheme {
  const theme = useThemeStore((s) => s.theme);
  return theme === 'dark' ? DARK_THEME : LIGHT_THEME;
}
