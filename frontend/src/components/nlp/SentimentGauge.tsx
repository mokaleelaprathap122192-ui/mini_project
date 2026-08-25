'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/label';
import type { SentimentLabel } from '@/types';
import { cn } from '@/lib/utils';

interface SentimentGaugeProps {
  score: number;
  label: SentimentLabel;
  className?: string;
}

const COLORS = ['#EF4444', '#F59E0B', '#22C55E'];

export function SentimentGauge({ score, label, className }: SentimentGaugeProps) {
  const normalized = (score + 1) / 2;
  const angle = -180 + normalized * 180;
  const needleAngle = angle + 90;

  const data = [
    { name: 'negative', value: 33.33 },
    { name: 'neutral', value: 33.33 },
    { name: 'positive', value: 33.33 },
  ];

  const badgeVariant = label === 'positive' ? 'success' : label === 'negative' ? 'danger' : 'warning';
  const needleColor = label === 'positive' ? '#22C55E' : label === 'negative' ? '#EF4444' : '#F59E0B';

  const cx = 150;
  const cy = 150;
  const radius = 110;
  const needleLength = radius - 20;
  const rad = (needleAngle * Math.PI) / 180;
  const nx = cx + needleLength * Math.cos(rad);
  const ny = cy + needleLength * Math.sin(rad);

  return (
    <div className={cn('flex flex-col items-center justify-center w-full h-full', className)}>
      <div className="relative w-full" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart width={300} height={200}>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              type="gauge"
            >
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i]} fillOpacity={0.75} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 200"
          preserveAspectRatio="xMidYMid meet"
        >
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke={needleColor}
            strokeWidth={3}
            strokeLinecap="round"
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              animation: 'needleDrop 1s ease-out both',
              filter: `drop-shadow(0 0 6px ${needleColor})`,
            }}
          />
          <circle cx={cx} cy={cy} r={6} fill={needleColor} />
        </svg>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
          style={{ marginBottom: 8 }}
        >
          <div
            className="text-4xl font-display font-bold"
            style={{ color: needleColor, textShadow: `0 0 16px ${needleColor}55` }}
          >
            {score > 0 ? '+' : ''}
            {score.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Badge variant={badgeVariant as any} className="text-sm px-4 py-1.5 capitalize">
          {label} Sentiment
        </Badge>
      </div>
      <div className="flex justify-between w-full max-w-xs mt-3 text-xs text-muted-foreground px-2">
        <span className="text-neon-red/80">-1.0 Negative</span>
        <span className="text-neon-amber/80">0.0 Neutral</span>
        <span className="text-neon-green/80">+1.0 Positive</span>
      </div>
      <style jsx>{`
        @keyframes needleDrop {
          0% { opacity: 0; transform: rotate(-90deg) scale(0.5); }
          100% { opacity: 1; transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
