'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { cn, formatPercent } from '@/lib/utils';

interface VerdictCardProps {
  verdict: 'true' | 'false' | 'partial';
  confidence: number;
}

const verdictConfig = {
  true: {
    label: 'VERIFIED TRUE',
    Icon: CheckCircle,
    badgeClass: 'bg-neon-green/15 text-neon-green border-neon-green/30',
    glowClass: 'shadow-glow-green',
    textClass: 'text-neon-green',
    ringColor: '#22C55E',
  },
  false: {
    label: 'DEBUNKED FALSE',
    Icon: XCircle,
    badgeClass: 'bg-neon-red/15 text-neon-red border-neon-red/30',
    glowClass: 'shadow-glow-red',
    textClass: 'text-neon-red',
    ringColor: '#EF4444',
  },
  partial: {
    label: 'PARTIALLY TRUE',
    Icon: HelpCircle,
    badgeClass: 'bg-neon-amber/15 text-neon-amber border-neon-amber/30',
    glowClass: 'shadow-glow-amber',
    textClass: 'text-neon-amber',
    ringColor: '#F59E0B',
  },
};

export function VerdictCard({ verdict, confidence }: VerdictCardProps) {
  const config = verdictConfig[verdict];
  const { Icon } = config;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - confidence * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'glass p-8 flex flex-col md:flex-row items-center gap-8',
        config.glowClass,
      )}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className={cn(
          'badge px-5 py-2.5 text-sm font-bold tracking-wider border',
          config.badgeClass,
        )}
      >
        <Icon className="w-5 h-5" />
        FACT CHECK VERDICT
      </motion.div>

      <div className="flex flex-col items-center md:items-start flex-1">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={cn(
            'text-5xl md:text-7xl font-display font-black tracking-tight',
            config.textClass,
          )}
        >
          {config.label}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-muted-foreground mt-3 text-base md:text-lg"
        >
          Cross-referenced against 3 independent verified sources with confidence score below.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
        className="relative w-36 h-36 shrink-0"
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={config.ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${config.ringColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className={cn('text-4xl font-display font-black', config.textClass)}
          >
            {formatPercent(confidence, 0)}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
            Confidence
          </span>
        </div>
      </motion.div>

      {[...Array(12)].map((_, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.4],
            x: Math.cos((i / 12) * Math.PI * 2) * (60 + Math.random() * 40),
            y: Math.sin((i / 12) * Math.PI * 2) * (60 + Math.random() * 40),
          }}
          transition={{
            delay: 0.9 + i * 0.03,
            duration: 1.1,
            ease: 'easeOut',
          }}
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full pointer-events-none"
          style={{ backgroundColor: config.ringColor }}
        />
      ))}
    </motion.div>
  );
}
