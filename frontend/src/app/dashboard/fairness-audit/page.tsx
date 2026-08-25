'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Scale, RefreshCw, Lightbulb, AlertTriangle, BarChart3, RadarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CLFIScore } from '@/components/audit/CLFIScore';
import { FairnessTable } from '@/components/audit/FairnessTable';
import { AlertsList } from '@/components/audit/AlertsList';
import { generateFairnessAudit } from '@/mock/generators';
import { fetchFairnessAudit } from '@/lib/api';
import type { FairnessAuditResult, Language } from '@/types';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS } from '@/types';

const LANG_COLORS: Record<Language, string> = {
  en: '#2563EB',
  hi: '#7C3AED',
  bn: '#F97316',
  te: '#F59E0B',
  mr: '#8B5CF6',
  ta: '#EC4899',
  ur: '#1E3A8A',
  gu: '#EF4444',
  kn: '#10B981',
  ml: '#06B6D4',
  or: '#9333EA',
  pa: '#EAB308',
  as: '#15803D',
  sa: '#14B8A6',
};

export default function FairnessAuditPage() {
  const [result, setResult] = useState<FairnessAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchFairnessAudit();
      setResult(data);
    } catch (err) {
      setError('Unable to reach backend audit service. Displaying fallback data.');
      setResult(generateFairnessAudit());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAudit();
  }, []);

  const refresh = () => {
    void loadAudit();
  };

  const radarData = result
    ? result.radarDatasets[0]?.axes.map((_, i) => {
        const point: Record<string, any> = { axis: result.radarDatasets[0].axes[i].axis };
        result.radarDatasets.forEach((ds) => {
          point[ds.language] = Math.round(ds.axes[i].value * 100);
        });
        return point;
      })
    : [];

  const barData = result
    ? result.metrics.map((m) => ({
        name: LANGUAGE_LABELS[m.language],
        code: m.language,
        flag: LANGUAGE_FLAGS[m.language],
        Accuracy: Math.round(m.accuracy * 100),
        Precision: Math.round(m.precision * 100),
        Recall: Math.round(m.recall * 100),
        F1: Math.round(m.f1 * 100),
        Parity: Math.round(m.parity * 100),
      }))
    : [];

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
                <Scale className="w-6 h-6 text-neon-purple" />
              </div>
              <h1 className="text-3xl font-display font-bold gradient-text">Fairness Audit</h1>
            </div>
            <p className="text-muted-foreground max-w-3xl">
              Cross-lingual fairness benchmarking across 10 Indian languages with equalized odds, demographic parity and disparate impact analyses.
            </p>
          </div>
          <Button variant="glass" onClick={refresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing…' : 'Rerun Audit'}
          </Button>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        {result && (
          <>
            <Card className="mb-8 gradient-border">
              <CardHeader className="text-center pb-0">
                <CardTitle className="text-xl">Cross-Lingual Fairness Index</CardTitle>
                <CardDescription>
                  Weighted composite (60% average accuracy · 40% parity) across 10 Indian languages
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center pt-6">
                <CLFIScore score={result.clfiScore} />
              </CardContent>
            </Card>

            <Card className="mb-8 gradient-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-neon-cyan" />
                  Per-Language Fairness Metrics
                </CardTitle>
                <CardDescription>
                  Click column headers to sort. Each number bar visualizes value relative to 100%.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FairnessTable metrics={result.metrics} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <RadarIcon className="w-5 h-5 text-neon-purple" />
                    Radar — Top-5 Languages
                  </CardTitle>
                  <CardDescription>
                    Multivariate comparison of accuracy / precision / recall / F1 / parity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="78%">
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis
                          dataKey="axis"
                          tick={{ fill: '#cbd5e1', fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          domain={[0, 100]}
                          angle={30}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                          stroke="rgba(255,255,255,0.1)"
                        />
                        {result.radarDatasets.map((ds, i) => (
                          <Radar
                            key={ds.language}
                            name={LANGUAGE_LABELS[ds.language]}
                            dataKey={ds.language}
                            stroke={LANG_COLORS[ds.language]}
                            fill={LANG_COLORS[ds.language]}
                            fillOpacity={0.1 + i * 0.03}
                            strokeWidth={2}
                            animationDuration={800}
                          />
                        ))}
                        <RTooltip
                          contentStyle={{
                            background: 'rgba(11,18,32,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            color: '#e2e8f0',
                            fontSize: 12,
                          }}
                          formatter={(v: number) => [`${v}%`, '']}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12 }}
                          formatter={(v: string) => (
                            <span className="text-foreground/85 ml-1">{v}</span>
                          )}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-neon-green" />
                    Language × Metric Comparison
                  </CardTitle>
                  <CardDescription>All 10 languages — grouped performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[420px] overflow-x-auto">
                    <div style={{ minWidth: 720, height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#cbd5e1', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            angle={-18}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(11,18,32,0.95)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 12,
                              color: '#e2e8f0',
                              fontSize: 12,
                            }}
                            formatter={(v: number, n: string, p: any) => [
                              `${v}% ${p.payload.flag || ''}`,
                              n,
                            ]}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 12 }}
                            formatter={(v: string) => (
                              <span className="text-foreground/85 ml-1">{v}</span>
                            )}
                          />
                          {(['Accuracy', 'Precision', 'Recall', 'F1', 'Parity'] as const).map(
                            (m, mi) => (
                              <Bar
                                key={m}
                                dataKey={m}
                                radius={[4, 4, 0, 0]}
                                animationDuration={800}
                              >
                                {barData.map((_, i) => (
                                  <Cell
                                    key={`${mi}-${i}`}
                                    fill={['#2563EB', '#7C3AED', '#EC4899', '#06B6D4', '#22C55E'][mi]}
                                    fillOpacity={0.85}
                                  />
                                ))}
                              </Bar>
                            )
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="w-5 h-5 text-neon-amber" />
                    Audit Alerts
                  </CardTitle>
                  <CardDescription>
                    {result.alerts.length} statistically significant findings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertsList alerts={result.alerts} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-neon-amber" />
                    Mitigation Recommendations
                  </CardTitle>
                  <CardDescription>Priority-ordered interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-neon-purple/40 hover:from-neon-purple/[0.06] transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                            style={{
                              background:
                                'linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(124,58,237,0.25) 100%)',
                              border: '1px solid rgba(124,58,237,0.4)',
                              color: '#c4b5fd',
                            }}
                          >
                            {i + 1}
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                            {rec}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
