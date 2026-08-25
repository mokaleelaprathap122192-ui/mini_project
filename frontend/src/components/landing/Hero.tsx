'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Rocket,
  PlayCircle,
  Github,
  FileText,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROTATING_PHRASES = [
  'State-of-the-art fairness detection across all Indian languages',
  'Multilingual model evaluation with explainable decision insights',
  'Advanced parity and bias analysis for sentiment models',
];

export default function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % ROTATING_PHRASES.length);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center px-6 py-16 sm:px-8 md:py-24">
      <div className="container relative z-10 max-w-5xl mx-auto grid items-center gap-14">
        <div className="flex flex-col gap-8 items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            <span className="gradient-text">
              Cross-Lingual Fairness Audit
            </span>
            <br />
            <span className="text-foreground">
              of Sentiment Models on{' '}
              <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                Indian Languages
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            An advanced model for cross-lingual sentiment fairness auditing across Indian languages.
            Detect bias, quantify parity, and explain predictions using SHAP, LIME, and GraphRAG.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative h-8 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={phraseIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-neon-cyan"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan shadow-glow-cyan" />
                {ROTATING_PHRASES[phraseIdx]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex justify-center gap-3"
          >
            <Button asChild size="lg" className="neon-btn !h-12 !px-7 text-base">
              <Link href="/login">
                <Rocket className="h-5 w-5" />
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground"
          >
            <span className="font-medium text-neon-cyan">Advanced cross-lingual inference model</span>
            <span>High-precision fairness insights across 10+ Indian languages</span>
          </motion.div>
        </div>

        {/* Right column removed */}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <a 
          href="#features" 
          className="pointer-events-auto cursor-pointer flex flex-col items-center gap-2 hover:text-neon-purple transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5 text-neon-purple" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}
