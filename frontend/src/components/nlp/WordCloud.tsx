'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface WordCloudWord {
  text: string;
  value: number;
}

interface WordCloudProps {
  wordCloud: WordCloudWord[];
  className?: string;
}

const NEON_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#06B6D4',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
];

export function WordCloud({ wordCloud, className }: WordCloudProps) {
  const positioned = useMemo(() => {
    const sorted = [...wordCloud].sort((a, b) => b.value - a.value);
    const maxVal = Math.max(...sorted.map((w) => w.value));
    const minVal = Math.min(...sorted.map((w) => w.value));
    const range = maxVal - minVal || 1;

    return sorted.map((w, i) => {
      const norm = (w.value - minVal) / range;
      const fontSize = 14 + norm * 26;
      const top = Math.random() * 80;
      const left = Math.random() * 85;
      return {
        text: w.text,
        fontSize,
        top,
        left,
        color: NEON_COLORS[i % NEON_COLORS.length],
        rotation: (Math.random() - 0.5) * 16,
        fontWeight: 500 + Math.round(norm * 300),
      };
    });
  }, [wordCloud]);

  return (
    <div className={`relative w-full h-full min-h-[200px] overflow-hidden ${className || ''}`}>
      {positioned.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.3, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
          className="absolute inline-block whitespace-nowrap select-none"
          style={{
            top: `${w.top}%`,
            left: `${w.left}%`,
            fontSize: `${w.fontSize}px`,
            color: w.color,
            fontWeight: w.fontWeight,
            transform: `rotate(${w.rotation}deg)`,
            textShadow: `0 0 8px ${w.color}55, 0 0 16px ${w.color}33`,
            lineHeight: 1,
          }}
        >
          {w.text}
        </motion.span>
      ))}
    </div>
  );
}
