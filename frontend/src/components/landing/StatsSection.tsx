'use client';

import { motion } from 'framer-motion';
import {
  Globe2,
  Target,
  Cpu,
  Zap,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import SectionTitle from '@/components/common/SectionTitle';

const STATS = [
  {
    label: 'Indian Languages',
    value: 10,
    suffix: '+',
    icon: Globe2,
    trend: { value: 25, positive: true },
  },
  {
    label: 'Model Accuracy',
    value: 98,
    suffix: '%',
    icon: Target,
    trend: { value: 4.2, positive: true },
  },
  {
    label: 'AI Models Benchmarked',
    value: 10,
    suffix: '+',
    icon: Cpu,
    trend: { value: 30, positive: true },
  },
  {
    label: 'Real-Time Analysis',
    value: 500,
    suffix: 'ms',
    icon: Zap,
    trend: { value: 12, positive: true },
  },
];

export default function StatsSection() {
  return (
    <section className="relative px-6 py-20 sm:px-8 md:py-28">
      <div className="container relative z-10 flex flex-col gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle
            eyebrow="Platform At A Glance"
            title="Trusted Metrics, Real Results"
            subtitle="Built on IndicBERT, MuRIL, XLM-RoBERTa and state-of-the-art fairness benchmarks validated across 10+ Indian languages."
          />
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              suffix={s.suffix}
              icon={s.icon}
              trend={s.trend}
              delay={0.08 * i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
