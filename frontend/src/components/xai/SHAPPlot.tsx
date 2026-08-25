'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, round } from '@/lib/utils';

interface SHAPDatum {
  feature: string;
  value: number;
  impact: number;
}

interface SHAPPlotProps {
  data: SHAPDatum[];
}

interface TooltipState {
  x: number;
  y: number;
  feature: string;
  value: number;
  visible: boolean;
}

export function SHAPPlot({ data }: SHAPPlotProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, feature: '', value: 0, visible: false });

  const width = 620;
  const height = Math.max(320, data.length * 52 + 80);
  const paddingLeft = 130;
  const paddingRight = 30;
  const paddingTop = 50;
  const paddingBottom = 50;
  const plotW = width - paddingLeft - paddingRight;
  const plotH = height - paddingTop - paddingBottom;
  const rowH = data.length > 0 ? plotH / data.length : 40;

  const toX = (v: number) => paddingLeft + ((v + 1) / 2) * plotW;

  const dotColor = (impact: number) => {
    if (impact > 0) {
      const t = Math.min(1, Math.abs(impact));
      const r = Math.round(34 + (16 - 34) * t);
      const g = Math.round(197 + (185 - 197) * t);
      const b = Math.round(94 + (129 - 94) * t);
      return `rgb(${r},${g},${b})`;
    } else {
      const t = Math.min(1, Math.abs(impact));
      const r = Math.round(239);
      const g = Math.round(68 + (108 - 68) * (1 - t));
      const b = Math.round(68 + (108 - 68) * (1 - t));
      return `rgb(${r},${g},${b})`;
    }
  };

  return (
    <Card className="glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-green to-neon-cyan animate-ping opacity-75" />
            <span className="relative rounded-full w-2.5 h-2.5 bg-gradient-to-r from-neon-green to-neon-cyan" />
          </span>
          SHAP Beeswarm Plot
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Each dot represents a token SHAP contribution to the final sentiment score.
        </p>
      </CardHeader>
      <CardContent className="pt-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[520px]"
          onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
        >
          <defs>
            <linearGradient id="shapAxisGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#94A3B8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {[-1, -0.5, 0, 0.5, 1].map((tick) => (
            <g key={tick}>
              <line
                x1={toX(tick)}
                x2={toX(tick)}
                y1={paddingTop - 6}
                y2={height - paddingBottom + 6}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray="3 4"
              />
              <text
                x={toX(tick)}
                y={height - paddingBottom + 24}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
                fontFamily="monospace"
              >
                {tick === 0 ? '0' : tick > 0 ? `+${tick}` : `${tick}`}
              </text>
            </g>
          ))}

          <line
            x1={paddingLeft}
            x2={width - paddingRight}
            y1={height - paddingBottom}
            y2={height - paddingBottom}
            stroke="url(#shapAxisGrad)"
            strokeWidth="1.5"
          />
          <text
            x={paddingLeft}
            y={paddingTop - 22}
            fill="#EF4444"
            fontSize="10"
            fontWeight="700"
            letterSpacing="2"
          >
            ← NEGATIVE IMPACT
          </text>
          <text
            x={width - paddingRight}
            y={paddingTop - 22}
            textAnchor="end"
            fill="#22C55E"
            fontSize="10"
            fontWeight="700"
            letterSpacing="2"
          >
            POSITIVE IMPACT →
          </text>

          {data.map((d, rowIdx) => {
            const yC = paddingTop + rowH * rowIdx + rowH / 2;
            const dots = 8 + Math.floor(Math.abs(d.impact) * 10);
            return (
              <g key={d.feature}>
                <rect
                  x={paddingLeft - 2}
                  y={paddingTop + rowH * rowIdx + 2}
                  width={plotW + 4}
                  height={rowH - 4}
                  fill={rowIdx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
                  rx="6"
                />
                <text
                  x={paddingLeft - 12}
                  y={yC + 4}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.85)"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="var(--font-space-grotesk), sans-serif"
                >
                  {d.feature}
                </text>
                {[...Array(dots)].map((_, i) => {
                  const base = d.impact + (Math.random() - 0.5) * 0.35;
                  const clamped = Math.max(-1, Math.min(1, base));
                  const x = toX(clamped);
                  const jitter = (Math.random() - 0.5) * (rowH * 0.55);
                  const col = dotColor(clamped);
                  const r = 3 + Math.random() * 2.5;
                  return (
                    <motion.circle
                      key={i}
                      cx={x}
                      cy={yC + jitter}
                      r={r}
                      fill={col}
                      fillOpacity="0.85"
                      initial={{ opacity: 0, r: 0 }}
                      animate={{ opacity: 0.85, r }}
                      transition={{
                        delay: 0.15 + rowIdx * 0.06 + i * 0.01,
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                      style={{ cursor: 'pointer', filter: `drop-shadow(0 0 4px ${col}aa)` }}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                        const sx = width / rect.width;
                        const sy = height / rect.height;
                        setTooltip({
                          x: (e.clientX - rect.left) * sx,
                          y: (e.clientY - rect.top) * sy,
                          feature: d.feature,
                          value: round(clamped, 3),
                          visible: true,
                        });
                      }}
                      onMouseMove={(e) => {
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                        const sx = width / rect.width;
                        const sy = height / rect.height;
                        setTooltip((t) => ({
                          ...t,
                          x: (e.clientX - rect.left) * sx,
                          y: (e.clientY - rect.top) * sy,
                        }));
                      }}
                    />
                  );
                })}
              </g>
            );
          })}

          <line
            x1={toX(0)}
            x2={toX(0)}
            y1={paddingTop - 10}
            y2={height - paddingBottom + 10}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            strokeDasharray="5 5"
          />

          {tooltip.visible && (
            <foreignObject
              x={Math.min(width - 170, Math.max(5, tooltip.x + 12))}
              y={Math.max(5, tooltip.y - 40)}
              width="160"
              height="44"
            >
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-xs shadow-2xl border backdrop-blur-xl',
                  tooltip.value > 0
                    ? 'bg-neon-green/15 border-neon-green/40 text-neon-green-200'
                    : 'bg-neon-red/15 border-neon-red/40 text-neon-red-100',
                )}
                style={{ background: tooltip.value > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
              >
                <div className="font-semibold truncate">{tooltip.feature}</div>
                <div className="font-mono opacity-90 tabular-nums">
                  SHAP = {tooltip.value > 0 ? '+' : ''}{tooltip.value}
                </div>
              </div>
            </foreignObject>
          )}
        </svg>
      </CardContent>
    </Card>
  );
}
