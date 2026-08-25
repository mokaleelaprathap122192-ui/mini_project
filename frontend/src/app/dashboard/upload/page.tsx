'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Languages,
  ShieldCheck,
  Sparkles,
  MessageSquareHeart,
  SmilePlus,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  BarChart2,
  TrendingUp,
  Brain,
  FileCheck,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { DropZone } from '@/components/upload/DropZone';
import { RecentUploads } from '@/components/upload/RecentUploads';
import { Badge, Separator } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUploadStore } from '@/stores/upload';

export default function UploadPage() {
  const files = useUploadStore((s) => s.files);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('sentiment');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);

  const hasFiles = files.length > 0;

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-10 bg-gradient-to-br from-navy-900/80 via-navy-900/60 to-navy-900/40 backdrop-blur-xl"
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 0%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(6,182,212,0.2), transparent 55%)',
          }}
        />
        <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <Badge variant="info" className="mb-4 !px-3 !py-1 !text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Unified Upload & Analysis Engine
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              <span className="gradient-text">Upload & Analyze</span> Multilingual Content
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Upload documents, audio, video files or web URLs. Automatically analyze sentiment,
              emotion breakdown, bias detection, and cross-lingual fairness audits across Indian languages in one unified view.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="neon-btn shadow-glow-purple"
            >
              {analyzing ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Running Analysis…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Analyze Uploaded Content
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Upload File Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassPanel title="Upload & Input Source" description="Support for PDF, DOCX, TXT, MP3, WAV, MP4, and Web URLs">
          <DropZone />
        </GlassPanel>
      </motion.div>

      {/* Recent Uploads List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-display font-bold">Recent Uploads</h2>
            <p className="text-sm text-muted-foreground">
              Manage your uploaded files and view instant analysis
            </p>
          </div>
          <Badge variant="outline">{files.length} files in queue</Badge>
        </div>
        <RecentUploads />
      </motion.div>

      {/* Integrated Analysis Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Badge variant="info" className="mb-2 !text-xs !px-2.5 !py-0.5">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Integrated Audit Hub
            </Badge>
            <h2 className="text-2xl font-display font-bold">Content Analysis Results</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive sentiment, emotion, bias, and fairness metrics for uploaded data
            </p>
          </div>
        </div>

        <Tabs value={activeAnalysisTab} onValueChange={setActiveAnalysisTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto p-1.5 bg-navy-900/80 border border-white/10 rounded-2xl">
            <TabsTrigger value="sentiment" className="gap-2 py-3">
              <MessageSquareHeart className="w-4 h-4 text-neon-blue" />
              <span>Sentiment</span>
            </TabsTrigger>
            <TabsTrigger value="emotion" className="gap-2 py-3">
              <SmilePlus className="w-4 h-4 text-neon-purple" />
              <span>Emotion</span>
            </TabsTrigger>
            <TabsTrigger value="bias" className="gap-2 py-3">
              <Scale className="w-4 h-4 text-neon-amber" />
              <span>Bias Detection</span>
            </TabsTrigger>
            <TabsTrigger value="fairness" className="gap-2 py-3">
              <ShieldCheck className="w-4 h-4 text-neon-green" />
              <span>Fairness Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GlassPanel className="lg:col-span-2" title="Sentiment Polarity & Score Distribution">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-2xl bg-neon-green/10 border border-neon-green/20">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Positive</p>
                      <p className="text-2xl md:text-3xl font-display font-bold text-neon-green mt-1">68.4%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-neon-blue/10 border border-neon-blue/20">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Neutral</p>
                      <p className="text-2xl md:text-3xl font-display font-bold text-neon-blue mt-1">21.2%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-neon-red/10 border border-neon-red/20">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Negative</p>
                      <p className="text-2xl md:text-3xl font-display font-bold text-neon-red mt-1">10.4%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-neon-green">Positive Sentiment Confidence</span>
                        <span>68.4%</span>
                      </div>
                      <Progress value={68.4} className="h-2.5 bg-white/10" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-neon-blue">Neutral Sentiment Confidence</span>
                        <span>21.2%</span>
                      </div>
                      <Progress value={21.2} className="h-2.5 bg-white/10" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-neon-red">Negative Sentiment Confidence</span>
                        <span>10.4%</span>
                      </div>
                      <Progress value={10.4} className="h-2.5 bg-white/10" />
                    </div>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel title="Key Phrase Insights">
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-semibold text-neon-green mb-1">Top Positive Indicators</p>
                    <p className="text-xs text-muted-foreground">&quot;excellent governance&quot;, &quot;growth opportunities&quot;, &quot;highly effective solution&quot;</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-semibold text-neon-red mb-1">Top Negative Indicators</p>
                    <p className="text-xs text-muted-foreground">&quot;delayed response&quot;, &quot;minor disparity&quot;, &quot;unclear documentation&quot;</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-semibold text-neon-cyan mb-1">Model Predictor</p>
                    <p className="text-xs text-muted-foreground">IndicBERT & XLM-RoBERTa consensus score: 96.4% confidence</p>
                  </div>
                </div>
              </GlassPanel>
            </div>
          </TabsContent>

          {/* Emotion Tab */}
          <TabsContent value="emotion" className="mt-4">
            <GlassPanel title="6-Axis Emotion Intensity Breakdown">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Joy / Optimism', pct: 64, color: 'text-neon-green', bg: 'bg-neon-green' },
                  { name: 'Surprise / Curiosity', pct: 42, color: 'text-neon-cyan', bg: 'bg-neon-cyan' },
                  { name: 'Sadness / Empathy', pct: 18, color: 'text-neon-blue', bg: 'bg-neon-blue' },
                  { name: 'Anger / Frustration', pct: 12, color: 'text-neon-red', bg: 'bg-neon-red' },
                  { name: 'Fear / Anxiety', pct: 9, color: 'text-neon-amber', bg: 'bg-neon-amber' },
                  { name: 'Disgust / Skepticism', pct: 6, color: 'text-neon-purple', bg: 'bg-neon-purple' },
                ].map((emo) => (
                  <div key={emo.name} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span>{emo.name}</span>
                      <span className={emo.color}>{emo.pct}%</span>
                    </div>
                    <Progress value={emo.pct} className="h-2 bg-white/10" />
                  </div>
                ))}
              </div>
            </GlassPanel>
          </TabsContent>

          {/* Bias Detection Tab */}
          <TabsContent value="bias" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GlassPanel className="lg:col-span-2" title="Demographic Parity & Bias Dimensions">
                <div className="space-y-4">
                  {[
                    { category: 'Gender Bias', disparity: '1.8%', status: 'Low Risk', level: 'low' },
                    { category: 'Religion & Cultural Bias', disparity: '3.4%', status: 'Low Risk', level: 'low' },
                    { category: 'Regional Dialect Variance', disparity: '6.2%', status: 'Moderate Warning', level: 'medium' },
                    { category: 'Caste & Socioeconomic Bias', disparity: '2.1%', status: 'Low Risk', level: 'low' },
                    { category: 'Age Demographic Parity', disparity: '1.4%', status: 'Low Risk', level: 'low' },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.category}</p>
                        <p className="text-xs text-muted-foreground">Disparity variance delta: {item.disparity}</p>
                      </div>
                      <Badge variant={item.level === 'medium' ? 'warning' : 'success'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel title="Bias Alert Summary">
                <div className="p-4 rounded-2xl bg-neon-amber/10 border border-neon-amber/20 space-y-3">
                  <div className="flex items-center gap-2 text-neon-amber font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Dialect Disparity Alert</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Higher sentiment variation observed in Bengali & Marathi informal dialect samples. Recommendation: Apply balanced sub-dialect normalization.
                  </p>
                </div>
              </GlassPanel>
            </div>
          </TabsContent>

          {/* Fairness Audit Tab */}
          <TabsContent value="fairness" className="mt-4">
            <GlassPanel title="Cross-Lingual Fairness Index (CLFI)">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-neon-purple/20 via-neon-blue/20 to-neon-cyan/20 border border-white/15 text-center shadow-glow-purple">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall CLFI Score</p>
                  <p className="text-4xl md:text-5xl font-display font-bold gradient-text my-2">94.2 / 100</p>
                  <Badge variant="success" className="!px-3 !py-1">High Fairness Compliance</Badge>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-sm font-medium">Demographic Selection Rate Parity</span>
                    <span className="text-sm font-bold text-neon-green">96.8%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-sm font-medium">Equalized Odds Across 10 Languages</span>
                    <span className="text-sm font-bold text-neon-cyan">93.5%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                    <span className="text-sm font-medium">English Baseline Performance Gap</span>
                    <span className="text-sm font-bold text-neon-blue">1.9% Discrepancy</span>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
