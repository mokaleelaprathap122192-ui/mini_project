'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Database, Play, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BiasCard } from '@/components/audit/BiasCard';
import { RiskMeter } from '@/components/audit/RiskMeter';
import { BiasHeatmap } from '@/components/audit/BiasHeatmap';
import { generateBias } from '@/mock/generators';
import type { BiasDetectionResult } from '@/types';
import { Badge } from '@/components/ui/label';

const DATASETS = [
  { id: 'indic-sentiment', name: 'IndicSentiment-Bench', samples: '1.2M' },
  { id: 'xlm-eval', name: 'XLM-R CrossLing Eval', samples: '680K' },
  { id: 'muril-sent', name: 'MuRIL Sentiment Corpus', samples: '2.4M' },
];

export default function BiasPage() {
  const [dataset, setDataset] = useState(DATASETS[0].id);
  const [result, setResult] = useState<BiasDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setResult(generateBias());
  }, []);

  const runAudit = () => {
    setLoading(true);
    setTimeout(() => {
      const r = generateBias();
      setResult(r);
      setLoading(false);
    }, 700);
  };

  const allRecommendations = result
    ? result.metrics.flatMap((m) => m.recommendations.map((r) => ({ dim: m.dimension, text: r })))
    : [];

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-red/20 to-neon-amber/20 border border-neon-red/30">
              <AlertTriangle className="w-6 h-6 text-neon-red" />
            </div>
            <h1 className="text-3xl font-display font-bold gradient-text">Bias Detection</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            Detect demographic and representational biases across 5 protected attributes and 10 Indian languages using WEAT, SEAT and stereotype-probing benchmarks.
          </p>
        </div>

        <Card className="mb-8 gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-neon-cyan" />
              Audit Configuration
            </CardTitle>
            <CardDescription>Select benchmark dataset and run the cross-lingual bias audit pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {DATASETS.map((ds) => (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => setDataset(ds.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                    dataset === ds.id
                      ? 'bg-gradient-neon-soft border-neon-purple/50 shadow-glow-purple'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="font-semibold text-foreground mb-1">{ds.name}</div>
                  <div className="text-xs text-muted-foreground">{ds.samples} samples · 10 languages</div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Label className="text-sm text-foreground/75 w-auto">Dataset:</Label>
              <Badge variant="info" className="capitalize">
                {DATASETS.find((d) => d.id === dataset)?.name}
              </Badge>
              <div className="flex-1" />
              <Button onClick={runAudit} disabled={loading} className="gap-2">
                <Play className="w-4 h-4" />
                {loading ? 'Running Audit…' : 'Run Bias Audit'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
          >
            <div className="space-y-6 min-w-0">
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle>Bias Dimensions</CardTitle>
                  <CardDescription>Per-dimension bias scores with risk classification.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    {result.metrics.map((m, i) => (
                      <BiasCard
                        key={m.dimension}
                        dimension={m.dimension}
                        score={m.score}
                        level={m.level}
                        recommendation={m.recommendations[0]}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <RiskMeter score={result.overallScore} level={result.overallRisk} />
                </CardContent>
              </Card>

              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-neon-purple" />
                    Bias Heatmap — Dimensions × Languages
                  </CardTitle>
                  <CardDescription>
                    Per-language × per-dimension bias intensity. Dark cells = low bias, bright red/purple = high bias.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BiasHeatmap
                    heatmap={result.heatmap}
                    dimensions={result.dimensions}
                    languages={result.languages}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-4 h-4 text-neon-amber" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>
                    {allRecommendations.length} mitigation steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {allRecommendations.map((rec, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-neon-purple/30 hover:bg-white/[0.06] transition-all duration-200 group"
                      >
                        <ChevronRight className="w-4 h-4 text-neon-purple flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                        <p className="text-sm leading-relaxed text-foreground/85">{rec.text}</p>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
