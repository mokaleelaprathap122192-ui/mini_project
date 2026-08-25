'use client';

import { motion } from 'framer-motion';
import { BookOpen, Building2, Newspaper, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/label';
import type { FactEvidence, FactSource } from '@/types';
import { cn, formatPercent } from '@/lib/utils';

interface FactEvidenceGridProps {
  evidence: FactEvidence[];
}

const sourceConfig: Record<FactSource, { label: string; Icon: typeof BookOpen; variant: 'info' | 'success' | 'warning'; barColor: string }> = {
  wikipedia: {
    label: 'Wikipedia',
    Icon: BookOpen,
    variant: 'info',
    barColor: 'from-neon-cyan to-neon-blue',
  },
  government: {
    label: 'Government',
    Icon: Building2,
    variant: 'success',
    barColor: 'from-neon-green to-neon-cyan',
  },
  news: {
    label: 'News Media',
    Icon: Newspaper,
    variant: 'warning',
    barColor: 'from-neon-amber to-neon-purple',
  },
};

export function FactEvidenceGrid({ evidence }: FactEvidenceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {evidence.map((ev, idx) => {
        const cfg = sourceConfig[ev.source];
        const { Icon } = cfg;
        return (
          <motion.div
            key={ev.source}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.1, duration: 0.5 }}
          >
            <Card className="h-full glass-hover">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Badge variant={cfg.variant} className="px-3 py-1 gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatPercent(ev.reliability, 0)}
                  </span>
                </div>

                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'font-display font-semibold text-base leading-tight',
                    'hover:gradient-text transition-colors duration-200 line-clamp-2',
                    'group inline-flex items-start gap-1.5',
                  )}
                >
                  {ev.title}
                  <ExternalLink className="w-3.5 h-3.5 mt-1 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {ev.snippet}
                </p>

                <div className="mt-auto pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Source Reliability
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ev.reliability * 100}%` }}
                      transition={{
                        delay: 0.4 + idx * 0.1,
                        duration: 0.9,
                        ease: 'easeOut',
                      }}
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r',
                        cfg.barColor,
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
