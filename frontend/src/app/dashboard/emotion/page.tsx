'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Smile, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { EmojiGrid } from '@/components/nlp/EmojiGrid';
import { generateEmotion } from '@/mock/generators';
import { fetchEmotion } from '@/lib/api';
import type { EmotionResult, EmotionKey } from '@/types';
import { EMOTION_LABELS, EMOTION_EMOJI } from '@/types';

const PIE_COLORS: Record<EmotionKey, string> = {
  happy: '#22C55E',
  sad: '#3B82F6',
  fear: '#8B5CF6',
  surprise: '#F59E0B',
  anger: '#EF4444',
  disgust: '#10B981',
};

export default function EmotionPage() {
  const [text, setText] = useState(
    'I was absolutely amazed by the surprise gift, but I was a bit angry at the late delivery and slightly fearful about whether it would arrive in one piece. Overall it was a wonderful surprise!'
  );
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const r = await fetchEmotion(text, 'en');
      setResult(r);
    } catch (err) {
      console.error(err);
      setResult(generateEmotion());
    } finally {
      setLoading(false);
    }
  };

  const pieData = result
    ? (Object.keys(result.scores) as EmotionKey[]).map((k) => ({
        name: EMOTION_LABELS[k],
        value: Math.round(result.scores[k] * 100),
        emoji: EMOTION_EMOJI[k],
        key: k,
      }))
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-amber/20 to-neon-purple/20 border border-neon-amber/30">
              <Smile className="w-6 h-6 text-neon-amber" />
            </div>
            <h1 className="text-3xl font-display font-bold gradient-text">Emotion Detection</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Detect 6 universal emotions (happy, sad, fear, surprise, anger, disgust) with fine-grained Ekman emotion classification across Indian languages.
          </p>
        </div>

        <Card className="mb-8 gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              Input Text
            </CardTitle>
            <CardDescription>Enter multilingual text to extract emotion distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste text to analyze emotions..."
                className="min-h-[120px] resize-y"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <Button onClick={handleAnalyze} disabled={loading || !text.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? 'Detecting…' : 'Detect Emotions'}
                </Button>
                <div className="text-xs text-muted-foreground">
                  6-class Ekman model · Multilingual XLM-R
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <Card className="gradient-border">
              <CardHeader>
                <CardTitle>Emotion Dashboard</CardTitle>
                <CardDescription>
                  Per-emotion confidence. Dominant:{' '}
                  <span className="font-semibold text-foreground capitalize">
                    {EMOTION_LABELS[result.dominant]} {EMOTION_EMOJI[result.dominant]}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmojiGrid scores={result.scores} dominant={result.dominant} />
              </CardContent>
            </Card>

            <Card className="gradient-border">
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
                <CardDescription>Donut chart of normalized emotion probabilities</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="w-full max-w-xl h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={140}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="rgba(11,18,32,0.9)"
                        strokeWidth={2}
                        animationBegin={100}
                        animationDuration={900}
                      >
                        {pieData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[entry.key]}
                            fillOpacity={0.88}
                            style={{
                              filter: `drop-shadow(0 0 8px ${PIE_COLORS[entry.key]}44)`,
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(11,18,32,0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          color: '#e2e8f0',
                          fontSize: 13,
                        }}
                        formatter={(v: number, n: string, p: any) => [
                          `${v}% ${p.payload.emoji}`,
                          n,
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(v: string) => (
                          <span className="text-sm text-foreground/85">{v}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
