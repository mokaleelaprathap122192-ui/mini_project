'use client';

import { motion } from 'framer-motion';
import { Globe, Clock, BookOpen, Sparkles } from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { TranslatorPanel } from '@/components/nlp/TranslatorPanel';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS } from '@/types';

export default function TranslationPage() {
  const features = [
    {
      icon: Globe,
      title: '14 Languages',
      desc: 'English + Hindi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Marathi, Bengali, Sanskrit, Urdu, Odia, Punjabi, Assamese',
      gradient: 'from-neon-blue/20 to-neon-cyan/20',
    },
    {
      icon: Clock,
      title: '3-Tier Engine Chain',
      desc: 'IndicTrans2 primary → Google Cloud Translation fallback → Gemini context-aware.  Failures gracefully cascade.',
      gradient: 'from-neon-purple/20 to-neon-blue/20',
    },
    {
      icon: BookOpen,
      title: 'Context-Aware',
      desc: 'Preserves idioms, proper nouns and cultural nuance specific to regional dialects via Gemini final tier.',
      gradient: 'from-neon-cyan/20 to-neon-green/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <TranslatorPanel />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassPanel padding="default" className="h-full">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-glow-purple/30`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>

      <GlassPanel
        title="Supported Language Matrix"
        description="Fully connected bidirectional translation between all language pairs"
      >
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-[auto_repeat(14,minmax(32px,1fr))] gap-1 text-center text-xs">
              <div className="p-2 text-left font-medium text-muted-foreground/60">From →</div>
              {SUPPORTED_LANGUAGES.map((l) => (
                <div key={l} className="p-1.5 font-semibold text-muted-foreground/80" title={LANGUAGE_LABELS[l]}>
                  {LANGUAGE_FLAGS[l]}
                </div>
              ))}

              {SUPPORTED_LANGUAGES.flatMap((row) => {
                const rowLabel = (
                  <div
                    key={`rowlbl-${row}`}
                    className="p-2 text-left font-semibold text-sm whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span>{LANGUAGE_FLAGS[row]}</span>
                    <span className="text-muted-foreground/80 hidden md:inline">
                      {LANGUAGE_LABELS[row]}
                    </span>
                  </div>
                );
                const cells = SUPPORTED_LANGUAGES.map((col) => {
                  const isDiag = row === col;
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={
                        'aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold transition-all ' +
                        (isDiag
                          ? 'bg-white/[0.02] text-muted-foreground/30'
                          : 'bg-gradient-to-br from-neon-blue/15 via-neon-purple/10 to-neon-cyan/15 text-neon-cyan shadow-glow-cyan/20 hover:scale-110')
                      }
                      title={isDiag ? 'Same language' : `${LANGUAGE_LABELS[row]} → ${LANGUAGE_LABELS[col]}`}
                    >
                      {isDiag ? '—' : <Sparkles className="w-3 h-3" />}
                    </div>
                  );
                });
                return [rowLabel, ...cells];
              })}
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
