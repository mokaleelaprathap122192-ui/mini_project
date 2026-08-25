'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Send, Sparkles, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/label';
import { SentimentGauge } from '@/components/nlp/SentimentGauge';
import { WordCloud } from '@/components/nlp/WordCloud';
import { fetchSentiment } from '@/lib/api';
import { generateSentiment } from '@/mock/generators';
import type { SentimentResult } from '@/types';

const PROB_COLORS = ['#22C55E', '#F59E0B', '#EF4444'];

export default function SentimentPage() {
  const [text, setText] = useState(
    'This is an excellent product with amazing build quality and fantastic service. The quality is wonderful and the price is great, though the delivery was a bit disappointing.'
  );
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiResult = await fetchSentiment(text, 'en');
      setResult(apiResult);
    } catch (err) {
      setError('Backend unavailable. Showing offline sentiment preview.');
      setResult(generateSentiment());
    } finally {
      setLoading(false);
    }
  };

  const probData = result
    ? [
        { name: 'Positive', value: Math.round(result.probabilities.positive * 100) },
        { name: 'Neutral', value: Math.round(result.probabilities.neutral * 100) },
        { name: 'Negative', value: Math.round(result.probabilities.negative * 100) },
      ]
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-purple/30">
              <TrendingUp className="w-6 h-6 text-neon-cyan" />
            </div>
            <h1 className="text-3xl font-display font-bold gradient-text">Sentiment Analysis</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Analyze sentiment polarity and subjectivity across text using cross-lingual IndicBERT embeddings trained on 10+ Indian languages.
          </p>
        </div>

        <Card className="mb-8 gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              Input Text
            </CardTitle>
            <CardDescription>Enter text in any supported Indian language or English.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste text to analyze..."
                className="min-h-[120px] resize-y"
              />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Button onClick={handleAnalyze} disabled={loading || !text.trim()} className="gap-2">
                    <Send className="w-4 h-4" />
                    {loading ? 'Analyzing…' : 'Analyze Sentiment'}
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {text.length} characters · Supports 10 languages
                  </div>
                </div>
                {error ? (
                  <p className="text-sm text-amber-300">{error}</p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-border lg:row-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Sentiment Score</CardTitle>
                  <CardDescription>Polarity gauge from −1 (negative) to +1 (positive)</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <SentimentGauge score={result.score} label={result.label} className="w-full h-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Class Probabilities</CardTitle>
                  <CardDescription>Softmax distribution across sentiment classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={probData} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" width={72} tick={{ fill: '#e2e8f0', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(11,18,32,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            color: '#e2e8f0',
                            fontSize: 12,
                          }}
                          formatter={(v: number) => [`${v}%`, 'Probability']}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
                          {probData.map((_, i) => (
                            <Cell key={i} fill={PROB_COLORS[i]} fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-purple" />
                    Word Cloud
                  </CardTitle>
                  <CardDescription>Token frequency weighted by sentiment contribution</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[240px]">
                  <WordCloud wordCloud={result.wordCloud} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tagged Words</CardTitle>
                  <CardDescription>Positively and negatively associated tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="w-4 h-4 text-neon-green" />
                      <span className="text-sm font-medium text-neon-green/90">Positive</span>
                      <Badge variant="success">{result.positiveWords.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.positiveWords.map((w, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-neon-green/40 bg-neon-green/10 text-neon-green shadow-[0_0_12px_rgba(34,197,94,0.15)]"
                        >
                          {w}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsDown className="w-4 h-4 text-neon-red" />
                      <span className="text-sm font-medium text-neon-red/90">Negative</span>
                      <Badge variant="danger">{result.negativeWords.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.negativeWords.map((w, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-neon-red/40 bg-neon-red/10 text-neon-red shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                        >
                          {w}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
