'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/label';
import type { RiskLevel } from '@/types';
import { cn, formatPercent } from '@/lib/utils';

interface MisinformationMeterProps {
  score: number;
  risk: RiskLevel;
  reliability: number;
}

const riskConfig: Record<RiskLevel, { label: string; Icon: typeof Shield; variant: 'success' | 'warning' | 'danger'; color: string }> = {
  low: { label: 'LOW RISK', Icon: ShieldCheck, variant: 'success', color: '#22C55E' },
  medium: { label: 'MEDIUM RISK', Icon: ShieldAlert, variant: 'warning', color: '#F59E0B' },
  high: { label: 'HIGH RISK', Icon: AlertTriangle, variant: 'danger', color: '#EF4444' },
};

export function MisinformationMeter({ score, risk, reliability }: MisinformationMeterProps) {
  const cfg = riskConfig[risk];
  const { Icon } = cfg;
  const pointerPct = Math.max(4, Math.min(96, score * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="glass lg:col-span-2">
        <CardContent className="p-6 md:p-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={cfg.variant} className="px-4 py-1.5 text-sm font-bold tracking-wider">
                <Icon className="w-4 h-4" />
                {cfg.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Misinformation Risk Index
              </span>
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-display font-black tabular-nums"
              style={{ color: cfg.color }}
            >
              {(score * 100).toFixed(0)}
              <span className="text-lg font-semibold text-muted-foreground ml-1">/100</span>
            </motion.span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest font-semibold">
              <span className="text-neon-green">LOW</span>
              <span className="text-neon-amber">MEDIUM</span>
              <span className="text-neon-red">HIGH</span>
            </div>

            <div className="relative h-12 rounded-xl overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3">
                <div className="bg-gradient-to-r from-neon-green/40 via-neon-green/25 to-neon-green/10 border-r border-white/10" />
                <div className="bg-gradient-to-r from-neon-amber/25 via-neon-amber/40 to-neon-amber/25 border-r border-white/10" />
                <div className="bg-gradient-to-r from-neon-red/10 via-neon-red/35 to-neon-red/50" />
              </div>

              <div className="absolute inset-0 opacity-40">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-white/20"
                    style={{ left: `${(i + 1) * 2.5}%` }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: `${pointerPct}%`, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
                className="absolute top-0 bottom-0 z-10"
                style={{ transform: 'translateX(-50%)' }}
              >
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <div
                    className="w-6 h-6 bg-white rotate-45 shadow-xl border-2"
                    style={{
                      borderColor: cfg.color,
                      boxShadow: `0 0 20px ${cfg.color}99`,
                      marginTop: -6,
                    }}
                  />
                  <div
                    className="w-1 h-full"
                    style={{
                      background: `linear-gradient(180deg, ${cfg.color}, transparent)`,
                    }}
                  />
                </div>
              </motion.div>

              <div className="absolute inset-x-0 bottom-0 flex justify-between px-4 pb-1.5 text-[10px] font-mono text-white/50">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardContent className="p-6 md:p-8 h-full flex flex-col gap-4 justify-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neon-green" />
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Content Reliability
            </h3>
          </div>

          <div className="relative w-full aspect-square max-w-[180px] mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#reliabilityGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - reliability) }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="reliabilityGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: 'spring' }}
                className="text-4xl font-display font-black text-neon-green tabular-nums"
              >
                {formatPercent(reliability, 0)}
              </motion.span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                Score
              </span>
            </div>
          </div>

          <p className={cn('text-center text-sm', reliability > 0.7 ? 'text-neon-green/80' : reliability > 0.4 ? 'text-neon-amber/80' : 'text-neon-red/80')}>
            {reliability > 0.7
              ? 'Content appears trustworthy with high source corroboration.'
              : reliability > 0.4
                ? 'Exercise caution — partial verification only.'
                : 'High likelihood of misinformation — verify independently.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
