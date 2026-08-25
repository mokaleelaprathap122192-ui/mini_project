'use client';

import { motion } from 'framer-motion';
import {
  HeartHandshake,
  Scale,
  Lightbulb,
  Languages,
  AlertTriangle,
  Network,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SectionTitle from '@/components/common/SectionTitle';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  glow: string;
}

const FEATURES: Feature[] = [
  {
    icon: HeartHandshake,
    title: 'Sentiment Analysis',
    description:
      'Fine-grained polarity detection across 10+ Indian languages with aspect-based breakdowns.',
    color: 'from-neon-pink/20 to-neon-purple/20',
    glow: 'shadow-[0_0_30px_rgba(236,72,153,0.3)]',
  },
  {
    icon: Scale,
    title: 'Fairness Auditing',
    description:
      'Cross-lingual parity metrics (CLFI Score) ensuring equitable model performance per language.',
    color: 'from-neon-blue/20 to-neon-cyan/20',
    glow: 'shadow-[0_0_30px_rgba(37,99,235,0.3)]',
  },
  {
    icon: AlertTriangle,
    title: 'Bias Detection',
    description:
      'Quantify bias along gender, religion, region, caste and age dimensions with risk levels.',
    color: 'from-neon-red/20 to-neon-amber/20',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="relative px-6 py-20 sm:px-8 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      >
        <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-neon-purple/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-80 w-80 rounded-full bg-neon-blue/10 blur-3xl" />
      </div>

      <div className="container relative z-10 flex flex-col gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle
            eyebrow="Core Capabilities"
            title="Everything You Need for Fair AI"
            subtitle="Three integrated modules covering sentiment, fairness, and bias detection."
          />
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className={`group glass relative overflow-hidden p-7 transition-all duration-300 hover:shadow-glow-purple gradient-border`}
              >
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${f.color} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="relative flex flex-col gap-4">
                  <div
                    className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} border border-white/10 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-7 w-7 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-neon-purple opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Learn more
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
