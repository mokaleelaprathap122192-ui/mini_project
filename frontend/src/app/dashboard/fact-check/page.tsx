'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, BookOpen, Building2, Newspaper, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/label';
import { VerdictCard } from '@/components/verify/VerdictCard';
import { FactEvidenceGrid } from '@/components/verify/FactEvidenceGrid';
import { generateFactCheck } from '@/mock/generators';
import type { FactCheckResult, FactSource } from '@/types';
import { cn } from '@/lib/utils';

const sourceIcons: Record<FactSource, typeof BookOpen> = {
  wikipedia: BookOpen,
  government: Building2,
  news: Newspaper,
};

export default function FactCheckPage() {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 900));
    const res = generateFactCheck(claim);
    setResult(res);
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
              <ShieldCheck className="w-3.5 h-3.5" />
              Verification Module
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            <span className="gradient-text">Fact Check</span> &amp; Verdict Engine
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Enter any claim below. Our system cross-references against Wikipedia, government databases, and verified news sources to deliver an evidence-based verdict.
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
                Enter your claim
              </label>
              <Textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                placeholder="e.g. India&apos;s GDP crossed $4 trillion in 2024..."
                className="min-h-[120px] text-base resize-y"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                Supports claims in 10 Indian languages. Auto-translates for cross-lingual verification.
              </p>
              <Button
                onClick={handleVerify}
                disabled={loading || !claim.trim()}
                className="neon-btn !py-3 !px-8"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying sources...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify Claim
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 space-y-6">
            <VerdictCard verdict={result.verdict} confidence={result.confidence} />
            <FactEvidenceGrid evidence={result.evidence} />
          </div>

          <div className="space-y-5">
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-neon-cyan" />
                  Reference Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {result.evidence.map((ev, i) => {
                  const Icon = sourceIcons[ev.source];
                  return (
                    <motion.a
                      key={i}
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl',
                        'bg-white/[0.03] border border-white/5',
                        'hover:bg-white/[0.07] hover:border-white/15 transition-all',
                      )}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-neon-cyan" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {ev.url.replace(/^https?:\/\//, '').split('/')[0]}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                    </motion.a>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Summary
                </h3>
                <p className="text-sm leading-relaxed">
                  Your claim &quot;<span className="text-foreground/90 font-medium">{result.claim}</span>&quot; was analysed across {result.evidence.length} authoritative sources with a cumulative confidence of <span className="text-neon-cyan font-semibold">{(result.confidence * 100).toFixed(0)}%</span>.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
