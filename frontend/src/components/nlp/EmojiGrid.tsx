'use client';

import { motion } from 'framer-motion';
import { EMOTION_EMOJI, EMOTION_LABELS } from '@/types';
import type { EmotionKey } from '@/types';
import { cn } from '@/lib/utils';

interface EmojiGridProps {
  scores: Record<EmotionKey, number>;
  dominant: EmotionKey;
  className?: string;
}

const EMOTION_COLORS: Record<EmotionKey, string> = {
  happy: '#22C55E',
  sad: '#3B82F6',
  fear: '#8B5CF6',
  surprise: '#F59E0B',
  anger: '#EF4444',
  disgust: '#10B981',
};

export function EmojiGrid({ scores, dominant, className }: EmojiGridProps) {
  const keys: EmotionKey[] = ['happy', 'sad', 'fear', 'surprise', 'anger', 'disgust'];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4 w-full', className)}>
      {keys.map((k, i) => {
        const pct = Math.round(scores[k] * 100);
        const isDominant = dominant === k;
        const color = EMOTION_COLORS[k];
        return (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
            className={cn(
              'relative p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300',
              isDominant
                ? 'bg-white/10 border-2 shadow-glow-purple'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            )}
            style={
              isDominant
                ? {
                    borderColor: `${color}66`,
                    boxShadow: `0 0 24px ${color}33, inset 0 0 30px ${color}11`,
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="text-5xl select-none"
                style={{
                  filter: isDominant ? `drop-shadow(0 0 12px ${color}88)` : 'none',
                }}
              >
                {EMOTION_EMOJI[k]}
              </div>
              {isDominant && (
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{
                    background: `${color}22`,
                    color,
                    border: `1px solid ${color}55`,
                  }}
                >
                  Dominant
                </span>
              )}
            </div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-foreground">{EMOTION_LABELS[k]}</h4>
              <span className="font-display font-bold text-lg" style={{ color }}>
                {pct}%
              </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${color}99, ${color})`,
                  boxShadow: `0 0 10px ${color}88`,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
