'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CLFIScoreProps {
  score: number;
  className?: string;
}

function interpret(s: number): { label: string; color: string; text: string } {
  if (s >= 85) return { label: 'Excellent', color: '#22C55E', text: 'Cross-lingual parity is within 95% CI; model generalizes fairly across languages.' };
  if (s >= 70) return { label: 'Good', color: '#06B6D4', text: 'Minor disparities observed; focus debiasing on lowest-resource languages.' };
  if (s >= 55) return { label: 'Moderate', color: '#F59E0B', text: 'Statistically significant gaps detected; apply per-language threshold tuning.' };
  if (s >= 40) return { label: 'Poor', color: '#EF4444', text: 'Major fairness failure; upsampling + adversarial debiasing recommended.' };
  return { label: 'Critical', color: '#DC2626', text: 'Severe cross-lingual disparity; audit training data representation immediately.' };
}

export function CLFIScore({ score, className }: CLFIScoreProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const info = interpret(clamped);
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;
  const gradientId = 'clfi-ring-grad';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-3xl border backdrop-blur-2xl p-8 mx-auto',
        className
      )}
      style={{
        width: 280,
        height: 280,
        background:
          'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.18) 0%, rgba(6,182,212,0.12) 40%, rgba(255,255,255,0.03) 100%)',
        borderColor: 'rgba(124,58,237,0.3)',
        boxShadow:
          '0 0 60px rgba(124,58,237,0.2), inset 0 0 60px rgba(6,182,212,0.06), 0 10px 40px -10px rgba(0,0,0,0.5)',
      }}
    >
      <svg width={220} height={220} viewBox="0 0 220 220" className="absolute">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="glow-clfi">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={110}
          cy={110}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={10}
        />

        <motion.circle
          cx={110}
          cy={110}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
          transform={`rotate(-90 110 110)`}
          filter="url(#glow-clfi)"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center pt-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-baseline"
        >
          <span
            className="font-display font-extrabold leading-none tracking-tight bg-clip-text text-transparent"
            style={{
              fontSize: 72,
              backgroundImage: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              textShadow: '0 0 40px rgba(124,58,237,0.4)',
            }}
          >
            {clamped}
          </span>
        </motion.div>
        <div
          className="mt-1 text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: info.color }}
        >
          {info.label}
        </div>
        <div className="mt-3 text-center">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
            Cross-Lingual
          </div>
          <div className="text-sm font-semibold gradient-text">Fairness Index</div>
        </div>
      </div>

      <div className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground max-w-[230px]">
        {info.text}
      </div>
    </motion.div>
  );
}
