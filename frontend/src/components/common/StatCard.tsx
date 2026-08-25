'use client';

import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  trend?: { value: number; positive?: boolean };
  className?: string;
  delay?: number;
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        let formatted: number;
        if (value >= 100) formatted = Math.round(latest);
        else if (value >= 10) formatted = Number(latest.toFixed(0));
        else formatted = Number(latest.toFixed(1));
        setDisplay(formatted);
      },
    });
    return controls.stop;
  }, [inView, value]);

  return (
    <span ref={ref} className="font-display font-bold">
      {display}
      {suffix}
    </span>
  );
}

export default function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  trend,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={cn(
        'glass relative overflow-hidden p-6 transition-all duration-300 hover:shadow-glow-purple gradient-border',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)',
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <div className="text-4xl sm:text-5xl bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan bg-clip-text text-transparent">
            <AnimatedNumber value={value} suffix={suffix} />
          </div>
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium',
                trend.positive ? 'text-neon-green' : 'text-neon-red',
              )}
            >
              {trend.positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trend.positive ? '+' : ''}
              {trend.value}% vs last month
            </div>
          )}
        </div>
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 blur-lg" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-7 w-7 text-neon-purple" strokeWidth={2} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
