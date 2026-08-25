'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { FairnessMetric, Language } from '@/types';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS } from '@/types';
import { cn, round } from '@/lib/utils';

interface FairnessTableProps {
  metrics: FairnessMetric[];
  className?: string;
}

type SortKey =
  | 'language'
  | 'accuracy'
  | 'precision'
  | 'recall'
  | 'f1'
  | 'parity'
  | 'overall';
type SortDir = 'asc' | 'desc';

const METRIC_GRADIENT = 'linear-gradient(90deg, rgba(37,99,235,0.9) 0%, rgba(124,58,237,0.9) 100%)';
const PARITY_GRADIENT = 'linear-gradient(90deg, rgba(6,182,212,0.9) 0%, rgba(34,197,94,0.9) 100%)';
const OVERALL_GRADIENT = 'linear-gradient(90deg, rgba(124,58,237,0.9) 0%, rgba(236,72,153,0.9) 100%)';

const COLUMNS: { key: SortKey; label: string; grad?: string }[] = [
  { key: 'language', label: 'Language' },
  { key: 'accuracy', label: 'Accuracy', grad: METRIC_GRADIENT },
  { key: 'precision', label: 'Precision', grad: METRIC_GRADIENT },
  { key: 'recall', label: 'Recall', grad: METRIC_GRADIENT },
  { key: 'f1', label: 'F1', grad: METRIC_GRADIENT },
  { key: 'parity', label: 'Parity', grad: PARITY_GRADIENT },
  { key: 'overall', label: 'Overall', grad: OVERALL_GRADIENT },
];

function NumberBar({ value, gradient }: { value: number; gradient: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="relative flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: gradient }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground/90 tabular-nums w-11 text-right">
        {pct}%
      </span>
    </div>
  );
}

export function FairnessTable({ metrics, className }: FairnessTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('overall');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const enriched = useMemo(
    () =>
      metrics.map((m) => ({
        ...m,
        overall: round((m.accuracy + m.precision + m.recall + m.f1 + m.parity) / 5),
      })),
    [metrics]
  );

  const sorted = useMemo(() => {
    const copy = [...enriched];
    copy.sort((a, b) => {
      let va: any = a[sortKey];
      let vb: any = b[sortKey];
      if (sortKey === 'language') {
        va = LANGUAGE_LABELS[va as Language];
        vb = LANGUAGE_LABELS[vb as Language];
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [enriched, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'language' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-neon-cyan" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-neon-cyan" />
    );
  };

  return (
    <div className={cn('w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]', className)}>
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                onClick={() => toggleSort(c.key)}
                className="px-4 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                  {c.label}
                  <SortIcon col={c.key} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => (
            <motion.tr
              key={m.language}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors"
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{LANGUAGE_FLAGS[m.language]}</span>
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      {LANGUAGE_LABELS[m.language]}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {m.language}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <NumberBar value={m.accuracy} gradient={METRIC_GRADIENT} />
              </td>
              <td className="px-4 py-3.5">
                <NumberBar value={m.precision} gradient={METRIC_GRADIENT} />
              </td>
              <td className="px-4 py-3.5">
                <NumberBar value={m.recall} gradient={METRIC_GRADIENT} />
              </td>
              <td className="px-4 py-3.5">
                <NumberBar value={m.f1} gradient={METRIC_GRADIENT} />
              </td>
              <td className="px-4 py-3.5">
                <NumberBar value={m.parity} gradient={PARITY_GRADIENT} />
              </td>
              <td className="px-4 py-3.5">
                <NumberBar value={m.overall} gradient={OVERALL_GRADIENT} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
