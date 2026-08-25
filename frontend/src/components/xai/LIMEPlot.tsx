'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { round } from '@/lib/utils';

interface LIMEDatum {
  feature: string;
  weight: number;
}

interface LIMEPlotProps {
  data: LIMEDatum[];
}

export function LIMEPlot({ data }: LIMEPlotProps) {
  const chartData = data.slice(0, 10).map((d, i) => ({
    ...d,
    abs: Math.abs(d.weight),
    idx: i,
  }));

  return (
    <Card className="glass h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <defs>
              <linearGradient id="limeTitleG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <path
              fill="url(#limeTitleG)"
              d="M3 12h3l3-8 4 16 3-8h5"
              stroke="none"
              strokeWidth="0"
            />
          </svg>
          LIME Feature Weights
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Top 10 local interpretable features driving this prediction.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="limePos" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="limeNeg" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="1" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 4"
                stroke="rgba(255,255,255,0.06)"
                horizontal={true}
                vertical={true}
              />
              <XAxis
                type="number"
                domain={[-1, 1]}
                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(v) => (v === 0 ? '0' : v > 0 ? `+${v}` : `${v}`)}
              />
              <YAxis
                type="category"
                dataKey="feature"
                width={96}
                tick={{
                  fill: 'rgba(255,255,255,0.85)',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                }}
                axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 12,
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                formatter={(value: number) => [
                  <span key="fmt-weight" className="font-mono tabular-nums">
                    {value > 0 ? '+' : ''}
                    {round(value, 3)}
                  </span>,
                  'Weight',
                ]}
              />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.45)" strokeDasharray="5 5" />
              <Bar dataKey="weight" radius={[0, 6, 6, 0]} barSize={16} animationDuration={900}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.weight >= 0 ? 'url(#limePos)' : 'url(#limeNeg)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
