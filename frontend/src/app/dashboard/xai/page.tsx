'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BrainCircuit,
  Loader2,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/label';
import { SHAPPlot } from '@/components/xai/SHAPPlot';
import { LIMEPlot } from '@/components/xai/LIMEPlot';
import ExplanationBox from '@/components/xai/ExplanationBox';
import { generateXAI } from '@/mock/generators';
import type { XAIResult } from '@/types';
import { round } from '@/lib/utils';

export default function XAIPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<XAIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1100));
    setResult(generateXAI());
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info" className="px-3 py-1">
              <BrainCircuit className="w-3.5 h-3.5" />
              Explainable AI Module
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            <span className="gradient-text">Explainable AI</span> (XAI) Insights
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Understand exactly why your model produced a given prediction. SHAP values, LIME local explanations, global feature importance, and human-readable reasoning for cross-lingual sentiment models.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/90 mb-2 block">
                Text to analyze
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the sentence or paragraph you want the model to explain..."
                className="min-h-[130px] text-base resize-y"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-end pt-1">
              <Button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="neon-btn !py-3 !px-8"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Computing explanations...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run XAI Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SHAPPlot data={result.shapValues} />
            </div>
            <div className="space-y-6">
              <LIMEPlot data={result.limeExplanations} />

              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-neon-purple" />
                    Feature Importance
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Global importance of tokens across the model.
                  </p>
                </CardHeader>
                <CardContent className="pt-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="w-full h-[280px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={result.featureImportance.slice(0, 8)}
                        margin={{ top: 8, right: 8, left: -12, bottom: 8 }}
                      >
                        <defs>
                          <linearGradient id="fiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7C3AED" stopOpacity="1" />
                            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.7" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 4"
                          stroke="rgba(255,255,255,0.06)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="word"
                          tick={{
                            fill: 'rgba(255,255,255,0.85)',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{
                            fill: 'rgba(255,255,255,0.55)',
                            fontSize: 10,
                            fontFamily: 'monospace',
                          }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                          tickLine={false}
                          domain={[0, 1]}
                          tickFormatter={(v) => v.toFixed(1)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            color: '#fff',
                            fontSize: 12,
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                          }}
                          cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }}
                          formatter={(value: number) => [
                            <span key="fmt-val" className="font-mono tabular-nums">{round(value, 3)}</span>,
                            'Importance',
                          ]}
                        />
                        <Bar
                          dataKey="importance"
                          radius={[6, 6, 0, 0]}
                          animationDuration={1000}
                        >
                          {result.featureImportance.slice(0, 8).map((_, i) => (
                            <Cell key={i} fill="url(#fiGrad)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </div>

          <ExplanationBox>{result.naturalExplanation}</ExplanationBox>
        </motion.div>
      )}
    </div>
  );
}
