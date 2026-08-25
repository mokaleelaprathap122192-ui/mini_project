'use client';

import { motion } from 'framer-motion';
import { Users, Church, MapPin, UsersRound, Cake, Lightbulb } from 'lucide-react';
import type { BiasDimension, RiskLevel } from '@/types';
import { BIAS_LABELS } from '@/types';
import { Badge } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BiasCardProps {
  dimension: BiasDimension;
  score: number;
  level: RiskLevel;
  recommendation: string;
  className?: string;
}

const ICONS: Record<BiasDimension, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  gender: Users,
  religion: Church,
  region: MapPin,
  caste: UsersRound,
  age: Cake,
};

const RISK_GRADIENT: Record<RiskLevel, string> = {
  low: 'linear-gradient(90deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.9) 100%)',
  medium: 'linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.9) 100%)',
  high: 'linear-gradient(90deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.9) 100%)',
};

const RISK_BADGE: Record<RiskLevel, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

const RISK_COLOR: Record<RiskLevel, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
};

export function BiasCard({ dimension, score, level, recommendation, className }: BiasCardProps) {
  const Icon = ICONS[dimension];
  const color = RISK_COLOR[level];
  const pct = Math.round(score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cn(
        'relative p-5 rounded-2xl backdrop-blur-xl border bg-white/5 border-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-glow-purple',
        className
      )}
      style={{
        boxShadow: `inset 0 0 40px ${color}10`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2.5 rounded-xl border"
          style={{
            background: `${color}15`,
            borderColor: `${color}40`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <Badge variant={RISK_BADGE[level] as any} className="capitalize">
          {level} Risk
        </Badge>
      </div>

      <h4 className="text-lg font-semibold mb-1 text-foreground">{BIAS_LABELS[dimension]}</h4>
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span
            className="font-display font-bold text-3xl"
            style={{ color, textShadow: `0 0 12px ${color}55` }}
          >
            {pct}
          </span>
          <span className="text-xs text-muted-foreground">/ 100 bias score</span>
        </div>
        <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: RISK_GRADIENT[level] }}
          />
        </div>
      </div>

      <div
        className="p-3 rounded-xl border flex items-start gap-2.5 text-sm"
        style={{
          background: `${color}0a`,
          borderColor: `${color}25`,
        }}
      >
        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
        <p className="text-foreground/80 leading-relaxed">{recommendation}</p>
      </div>
    </motion.div>
  );
}
