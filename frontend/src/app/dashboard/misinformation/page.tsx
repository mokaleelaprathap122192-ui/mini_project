'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Link2, FileText, Loader2, AlertCircle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea, Input } from '@/components/ui/input';
import { Badge, Separator } from '@/components/ui/label';
import { MisinformationMeter } from '@/components/verify/MisinformationMeter';
import { generateMisinformation } from '@/mock/generators';
import type { MisinformationResult } from '@/types';
import { cn, formatPercent } from '@/lib/utils';

export default function MisinformationPage() {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<MisinformationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim() && !url.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 900));
    setResult(generateMisinformation());
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
            <Badge variant="danger" className="px-3 py-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Intelligence Module
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            <span className="gradient-text">Misinformation</span> Detector
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Paste text or a URL to analyse for signs of disinformation, sensationalism, source bias, and claim-level contradiction patterns across Indian languages.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass">
          <CardContent className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground/90 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Paste content to verify
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the article text, social media post, or claim snippet here..."
                className="min-h-[140px] text-base resize-y"
              />
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Separator className="flex-1 !my-0" />
              <span className="text-xs uppercase tracking-widest">OR</span>
              <Separator className="flex-1 !my-0" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground/90 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                Article URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news-article"
                className="h-12 text-base"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-end pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setText('');
                  setUrl('');
                  setResult(null);
                }}
              >
                Clear
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={loading || (!text.trim() && !url.trim())}
                className="neon-btn !py-3 !px-8"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analysing patterns...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Analyze Misinformation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <MisinformationMeter score={result.score} risk={result.risk} reliability={result.reliability} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-neon-amber" />
                  Analysis Reasons
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Why the model flagged this content with {result.risk.toUpperCase()} risk.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-3">
                  {result.reasons.map((reason, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                          result.risk === 'high'
                            ? 'bg-neon-red/15 border border-neon-red/30'
                            : result.risk === 'medium'
                              ? 'bg-neon-amber/15 border border-neon-amber/30'
                              : 'bg-neon-green/15 border border-neon-green/30',
                        )}
                      >
                        {result.risk === 'low' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" />
                        ) : result.risk === 'medium' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-neon-amber" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-neon-red" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                          Signal #{i + 1}
                        </p>
                        <p className="text-sm leading-relaxed">{reason}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-5">
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    Reliability Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline justify-between p-4 rounded-xl bg-gradient-to-br from-neon-green/10 to-neon-cyan/10 border border-white/10">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        Overall
                      </p>
                      <p className="text-3xl font-display font-black text-neon-green tabular-nums">
                        {formatPercent(result.reliability, 0)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        result.reliability > 0.7
                          ? 'success'
                          : result.reliability > 0.4
                            ? 'warning'
                            : 'danger'
                      }
                      className="px-3 py-1"
                    >
                      {result.reliability > 0.7 ? 'TRUSTED' : result.reliability > 0.4 ? 'MIXED' : 'SUSPICIOUS'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source Credibility</span>
                      <span className="font-medium tabular-nums">{formatPercent(result.reliability * 0.92)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Claim Consistency</span>
                      <span className="font-medium tabular-nums">{formatPercent(Math.min(1, result.reliability * 1.1))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cross-Lang Match</span>
                      <span className="font-medium tabular-nums">{formatPercent(Math.max(0.3, result.reliability - 0.1))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-neon-amber" />
                    Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {result.warnings.map((w, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-neon-amber/[0.08] border border-neon-amber/20"
                    >
                      <AlertTriangle className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">{w}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
