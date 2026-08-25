'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { BiasDimension, Language } from '@/types';
import { BIAS_LABELS, LANGUAGE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface BiasHeatmapProps {
  heatmap: number[][];
  dimensions: BiasDimension[];
  languages: Language[];
  className?: string;
}

function interpolateColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const dark = { r: 17, g: 24, b: 39 };
  const purple = { r: 124, g: 58, b: 237 };
  const red = { r: 239, g: 68, b: 68 };

  let r: number, g: number, b: number;
  if (clamped < 0.5) {
    const k = clamped * 2;
    r = Math.round(dark.r + (purple.r - dark.r) * k);
    g = Math.round(dark.g + (purple.g - dark.g) * k);
    b = Math.round(dark.b + (purple.b - dark.b) * k);
  } else {
    const k = (clamped - 0.5) * 2;
    r = Math.round(purple.r + (red.r - purple.r) * k);
    g = Math.round(purple.g + (red.g - purple.g) * k);
    b = Math.round(purple.b + (red.b - purple.b) * k);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

export function BiasHeatmap({ heatmap, dimensions, languages, className }: BiasHeatmapProps) {
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="inline-block min-w-full pb-2">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-navy-950/80 backdrop-blur-sm p-2 text-left"></th>
              {languages.map((lang, j) => (
                <th
                  key={j}
                  className="p-2 text-[11px] font-medium text-foreground/80 text-center whitespace-nowrap"
                >
                  {LANGUAGE_LABELS[lang]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dim, i) => (
              <motion.tr
                key={dim}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <th className="sticky left-0 z-20 bg-navy-950/80 backdrop-blur-sm p-2 pr-3 text-right text-xs font-medium text-foreground/85 whitespace-nowrap">
                  {BIAS_LABELS[dim]}
                </th>
                {languages.map((lang, j) => {
                  const val = heatmap[i]?.[j] ?? 0;
                  const bg = interpolateColor(val);
                  const isHovered = hover?.row === i && hover?.col === j;
                  const rowHovered = hover?.row === i;
                  const colHovered = hover?.col === j;
                  return (
                    <td
                      key={`${i}-${j}`}
                      className="p-1 text-center relative"
                      onMouseEnter={() => setHover({ row: i, col: j })}
                      onMouseLeave={() => setHover(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: i * 0.05 + j * 0.02,
                          duration: 0.25,
                        }}
                        className={cn(
                          'aspect-square min-w-[44px] min-h-[40px] w-full rounded-lg cursor-pointer flex items-center justify-center text-[11px] font-bold transition-all duration-200 relative',
                          isHovered && 'ring-2 ring-white/80 scale-[1.15] z-10',
                          (rowHovered || colHovered) && !isHovered && 'brightness-125'
                        )}
                        style={{
                          background: bg,
                          color: val > 0.55 ? '#fff' : 'rgba(255,255,255,0.85)',
                          boxShadow: isHovered
                            ? `0 0 18px ${bg}cc`
                            : `inset 0 0 8px rgba(0,0,0,0.2)`,
                        }}
                      >
                        {Math.round(val * 100)}
                        {isHovered && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg bg-navy-950/95 border border-white/15 text-[11px] whitespace-nowrap shadow-2xl">
                            <span className="font-semibold" style={{ color: bg }}>
                              {Math.round(val * 100)}%
                            </span>
                            <span className="text-foreground/70 mx-1">·</span>
                            <span className="text-foreground/80">
                              {BIAS_LABELS[dim]} × {LANGUAGE_LABELS[lang]}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex items-center gap-4 flex-wrap justify-center">
          <span className="text-xs text-muted-foreground font-medium">Bias Intensity:</span>
          <div className="flex items-center gap-1.5">
            <div
              className="w-8 h-5 rounded-md border border-white/10"
              style={{ background: interpolateColor(0) }}
            />
            <div
              className="w-8 h-5 rounded-md border border-white/10"
              style={{ background: interpolateColor(0.25) }}
            />
            <div
              className="w-8 h-5 rounded-md border border-white/10"
              style={{ background: interpolateColor(0.5) }}
            />
            <div
              className="w-8 h-5 rounded-md border border-white/10"
              style={{ background: interpolateColor(0.75) }}
            />
            <div
              className="w-8 h-5 rounded-md border border-white/10"
              style={{ background: interpolateColor(1) }}
            />
          </div>
          <div className="flex items-center gap-5 text-[11px] text-muted-foreground">
            <span>Low (0)</span>
            <span>Medium</span>
            <span>High (100)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
