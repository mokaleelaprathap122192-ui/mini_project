'use client';

import { motion } from 'framer-motion';
import { BookOpen, Building2, Newspaper, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/label';
import type { FactEvidence, FactSource } from '@/types';
import { cn, formatPercent } from '@/lib/utils';

interface SourceCardProps {
  evidence: FactEvidence;
  index?: number;
  compact?: boolean;
}

const sourceCfg: Record<FactSource, { label: string; Icon: typeof BookOpen; variant: 'info' | 'success' | 'warning'; bar: string }> = {
  wikipedia: { label: 'Wikipedia', Icon: BookOpen, variant: 'info', bar: 'from-neon-cyan to-neon-blue' },
  government: { label: 'Government', Icon: Building2, variant: 'success', bar: 'from-neon-green to-neon-cyan' },
  news: { label: 'News', Icon: Newspaper, variant: 'warning', bar: 'from-neon-amber to-neon-purple' },
};

export function SourceCard({ evidence, index = 0, compact }: SourceCardProps) {
  const cfg = sourceCfg[evidence.source];
  const { Icon } = cfg;

  return (
    <motion.a
      href={evidence.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.4 }}
      className={cn(
        'group block rounded-xl p-4 relative overflow-hidden',
        'bg-white/[0.04] border border-white/10 backdrop-blur-md',
        'hover:bg-white/[0.08] hover:border-neon-purple/30 hover:-translate-y-0.5 transition-all duration-300',
        compact && 'p-3',
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
      />

      <div className="flex items-start gap-3 relative">
        <div
          className={cn(
            'shrink-0 rounded-xl border flex items-center justify-center',
            compact ? 'w-8 h-8' : 'w-10 h-10',
            evidence.source === 'wikipedia' && 'bg-neon-cyan/15 border-neon-cyan/30',
            evidence.source === 'government' && 'bg-neon-green/15 border-neon-green/30',
            evidence.source === 'news' && 'bg-neon-amber/15 border-neon-amber/30',
          )}
        >
          <Icon
            className={cn(
              compact ? 'w-3.5 h-3.5' : 'w-4 h-4',
              evidence.source === 'wikipedia' && 'text-neon-cyan',
              evidence.source === 'government' && 'text-neon-green',
              evidence.source === 'news' && 'text-neon-amber',
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant={cfg.variant} className="px-2 py-0.5 !text-[10px] tracking-wider font-bold">
              {cfg.label.toUpperCase()}
            </Badge>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <h4 className={cn(
            'font-semibold text-foreground leading-snug group-hover:gradient-text transition-colors line-clamp-2',
            compact ? 'text-[13px]' : 'text-sm',
          )}>
            {evidence.title}
          </h4>
          {!compact && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {evidence.snippet}
            </p>
          )}

          <div className={cn('mt-3', compact && 'mt-2')}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                Reliability
              </span>
              <span className="text-[10px] font-mono font-semibold text-white/80 tabular-nums">
                {formatPercent(evidence.reliability, 0)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${evidence.reliability * 100}%` }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.9, ease: 'easeOut' }}
                className={cn('h-full rounded-full bg-gradient-to-r', cfg.bar)}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.a>
  );
}
