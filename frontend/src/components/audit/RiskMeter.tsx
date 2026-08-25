'use client';

import { motion } from 'framer-motion';
import type { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  className?: string;
  title?: string;
}

const POSITIONS: Record<RiskLevel, string> = {
  low: '0% - 30%',
  medium: '30% - 60%',
  high: '60% - 100%',
};

const COLORS: Record<RiskLevel, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

export function RiskMeter({ score, level, className, title = 'Overall Risk' }: RiskMeterProps) {
  const pct = Math.min(100, Math.max(0, Math.round(score * 100)));
  const color = COLORS[level];

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span
              className="font-display font-bold text-3xl"
              style={{ color, textShadow: `0 0 12px ${color}66` }}
            >
              {pct}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <div
          className="relative h-10 rounded-2xl overflow-hidden border border-white/10"
          style={{
            background:
              'linear-gradient(90deg, #111827 0%, #111827 100%)',
          }}
        >
          <div className="absolute inset-0 flex">
            <div
              className="h-full flex items-center justify-center"
              style={{
                width: '30%',
                background:
                  'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.3) 100%)',
              }}
            >
              <span className="text-xs font-semibold text-neon-green/80">LOW</span>
            </div>
            <div
              className="h-full flex items-center justify-center"
              style={{
                width: '30%',
                background:
                  'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.3) 100%)',
              }}
            >
              <span className="text-xs font-semibold text-neon-amber/80">MEDIUM</span>
            </div>
            <div
              className="h-full flex items-center justify-center"
              style={{
                width: '40%',
                background:
                  'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.3) 100%)',
              }}
            >
              <span className="text-xs font-semibold text-neon-red/80">HIGH</span>
            </div>
          </div>

          <motion.div
            initial={{ left: '-2%', opacity: 0 }}
            animate={{ left: `calc(${pct}% - 14px)`, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="absolute top-1/2 -translate-y-1/2 z-10"
          >
            <div
              className="w-7 h-7 rotate-45 border-2 rounded-sm"
              style={{
                background: color,
                borderColor: '#0B1220',
                boxShadow: `0 0 20px ${color}, 0 0 40px ${color}88`,
              }}
            />
          </motion.div>
        </div>

        <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>30</span>
          <span>60</span>
          <span>100</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex flex-wrap gap-3">
          {(['low', 'medium', 'high'] as RiskLevel[]).map((lv) => (
            <div key={lv} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: COLORS[lv], boxShadow: `0 0 6px ${COLORS[lv]}` }}
              />
              <span className="capitalize text-foreground/70">{lv} ({POSITIONS[lv]})</span>
            </div>
          ))}
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize"
          style={{
            background: `${color}18`,
            color,
            border: `1px solid ${color}44`,
          }}
        >
          {level} Risk
        </span>
      </div>
    </div>
  );
}
