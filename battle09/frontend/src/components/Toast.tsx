import React from 'react';
import { useToastStore } from '../../store/toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'var(--c-green)',
  error: 'var(--c-red)',
  info: 'var(--c-accent)',
  warning: 'var(--c-yellow)',
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const color = colorMap[toast.type];
        return (
          <div
            key={toast.id}
            className="tech-panel p-4 min-w-[280px] max-w-[360px] pointer-events-auto flex items-start gap-3 animate-in slide-in-from-right"
            style={{ borderLeft: `3px solid ${color}` }}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--c-text)]">{toast.title}</div>
              {toast.message && (
                <div className="text-xs text-[var(--c-text-secondary)] mt-0.5">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="shrink-0 text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
