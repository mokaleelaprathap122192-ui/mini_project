'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import type { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

export interface AlertItem {
  severity: RiskLevel;
  message: string;
}

interface AlertsListProps {
  alerts: AlertItem[];
  className?: string;
}

const ALERT_STYLES: Record<
  RiskLevel,
  {
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  high: {
    Icon: XCircle,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    label: 'Critical',
  },
  medium: {
    Icon: AlertTriangle,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    label: 'Warning',
  },
  low: {
    Icon: Info,
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.3)',
    label: 'Info',
  },
};

export function AlertsList({ alerts, className }: AlertsListProps) {
  const ordered = [...alerts].sort((a, b) => {
    const order: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className={cn('space-y-3 w-full', className)}>
      {ordered.map((a, i) => {
        const s = ALERT_STYLES[a.severity];
        const Icon = s.Icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 hover:translate-x-0.5'
            )}
            style={{
              background: s.bg,
              borderColor: s.border,
              boxShadow: `inset 0 0 30px ${s.color}0a`,
            }}
          >
            <div
              className="flex-shrink-0 p-2 rounded-xl border"
              style={{
                background: `${s.color}15`,
                borderColor: `${s.color}33`,
              }}
            >
              <Icon
                className="w-4 h-4"
                style={{
                  color: s.color,
                  filter: `drop-shadow(0 0 4px ${s.color}88)`,
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: s.color }}
                >
                  {s.label}
                </span>
                <AlertCircle className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{a.message}</p>
            </div>
          </motion.div>
        );
      })}
      {ordered.length === 0 && (
        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-center text-muted-foreground">
          <Info className="w-8 h-8 mx-auto mb-2 opacity-60" />
          No alerts detected.
        </div>
      )}
    </div>
  );
}
