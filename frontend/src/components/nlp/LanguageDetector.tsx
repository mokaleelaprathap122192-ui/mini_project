'use client';

import { motion } from 'framer-motion';
import {
  Globe2,
} from 'lucide-react';
import { Badge } from '@/components/ui/label';
import { GlassPanel } from '@/components/layout/GlassPanel';
import type { Language, LanguageDetection } from '@/types';
import {
  LANGUAGE_LABELS,
  LANGUAGE_FLAGS,
  LANGUAGE_GLYPHS,
  SUPPORTED_LANGUAGES,
} from '@/types';
import { cn, round } from '@/lib/utils';

interface LanguageDetectorProps {
  result: LanguageDetection | null;
  loading?: boolean;
}

export function LanguageDetector({ result, loading = false }: LanguageDetectorProps) {
  const size = 260;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const confidence = result?.confidence ?? 0;
  const offset = circumference - confidence * circumference;

  const mockScores = SUPPORTED_LANGUAGES.reduce<Record<Language, number>>((acc, lang) => {
    if (result && lang === result.language) {
      acc[lang] = confidence;
    } else {
      const base = 0.04 + Math.random() * 0.12;
      acc[lang] = result ? round(Math.min(base, 0.18)) : 0;
    }
    return acc;
  }, {} as Record<Language, number>);

  const rows: Language[][] = [
    SUPPORTED_LANGUAGES.slice(0, 5),
    SUPPORTED_LANGUAGES.slice(5, 10),
    SUPPORTED_LANGUAGES.slice(10, 14),
  ];

  return (
    <GlassPanel className="h-full">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xl md:text-2xl font-display font-bold text-white leading-tight">
            Language
          </h3>
          <h3 className="text-xl md:text-2xl font-display font-bold text-white leading-tight">
            Probabilities
          </h3>
        </div>
        <Badge variant="outline" className="!text-xs !px-4 !py-2 !rounded-full !border-white/20">
          {SUPPORTED_LANGUAGES.length} languages
        </Badge>
      </div>

      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="flex flex-col items-center gap-4 shrink-0 mx-auto md:mx-0">
          <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 180deg, #22C55E 0%, #06B6D4 25%, #2563EB 50%, #7C3AED 75%, #22C55E 100%)',
                opacity: loading ? 0.12 : 0.3,
                filter: 'blur(14px)',
              }}
            />
            <svg width={size} height={size} className="-rotate-90 relative z-10">
              <defs>
                <linearGradient id="lang-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22C55E" />
                  <stop offset="33%" stopColor="#06B6D4" />
                  <stop offset="66%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>

              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
              />

              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="url(#lang-ring-grad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: loading ? circumference : offset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.45))' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <Globe2 className="w-12 h-12 text-neon-cyan animate-pulse" />
                </motion.div>
              ) : result ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
                    className="text-6xl mb-2"
                  >
                    {LANGUAGE_FLAGS[result.language]}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-display font-bold gradient-text tabular-nums mb-1"
                  >
                    {Math.round(confidence * 100)}%
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-white font-display font-semibold"
                  >
                    {result.languageName}
                  </motion.p>
                </>
              ) : (
                <>
                  <Globe2 className="w-12 h-12 text-white/20 mb-2" />
                  <p className="text-base text-muted-foreground">Awaiting text</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-5 gap-3">
              {row.map((lang, i) => {
                const score = mockScores[lang] || 0;
                const isDetected = result?.language === lang;
                const globalIdx = rowIdx * 5 + i;
                return (
                  <motion.div
                    key={lang}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * globalIdx + (result ? 0.7 : 0) }}
                    className={cn(
                      'relative flex flex-col items-center rounded-2xl border px-2 py-4 transition-all overflow-hidden group h-full',
                      isDetected
                        ? 'bg-gradient-to-b from-neon-blue/15 via-neon-purple/10 to-neon-cyan/15 border-neon-purple/40 shadow-glow-purple/40'
                        : 'bg-white/[0.025] border-white/10 hover:border-white/20',
                    )}
                  >
                    {isDetected && score > 0 && (
                      <motion.div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage:
                            'linear-gradient(180deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3))',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.25 }}
                        transition={{ delay: 0.8 }}
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-2 flex-1 w-full">
                      <span className="text-2xl leading-none">{LANGUAGE_FLAGS[lang]}</span>
                      <span
                        className={cn(
                          'text-base font-semibold leading-none',
                          isDetected ? 'text-white' : 'text-foreground/85',
                        )}
                      >
                        {LANGUAGE_GLYPHS[lang]}
                      </span>
                      <motion.span
                        className={cn(
                          'text-[11px] font-mono tabular-nums leading-none',
                          isDetected ? 'text-neon-cyan' : 'text-muted-foreground',
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                      >
                        {Math.round(score * 100)}%
                      </motion.span>
                      <div className="w-full flex-1 min-h-[60px] flex items-end">
                        <div className="w-full h-full flex items-end">
                          <motion.div
                            className={cn(
                              'w-full rounded-t-md',
                              isDetected
                                ? 'bg-gradient-to-t from-neon-cyan via-neon-blue to-neon-purple'
                                : 'bg-white/15',
                            )}
                            initial={{ height: 0 }}
                            animate={{
                              height: `${Math.max(score * 100 * (isDetected ? 1 : 4.5), score > 0 ? 8 : 2)}%`,
                            }}
                            transition={{
                              delay: 0.8 + globalIdx * 0.03,
                              duration: 0.6,
                              ease: 'easeOut',
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={cn(
                          'w-full text-center text-[9px] truncate leading-none mt-1.5',
                          isDetected ? 'text-white/80' : 'text-muted-foreground/70',
                        )}
                        title={LANGUAGE_LABELS[lang]}
                      >
                        {LANGUAGE_LABELS[lang]}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
