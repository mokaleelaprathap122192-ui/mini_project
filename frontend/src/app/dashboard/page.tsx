'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  Workflow,
  Globe,
  ShieldCheck,
  Languages,
  BrainCircuit,
  TrendingUp,
  ArrowUpRight,
  FileText,
  ChevronRight,
  Zap,
  Scale,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Badge, Separator } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUploadStore } from '@/stores/upload';
import { usePipelineStore } from '@/stores/pipeline';
import { formatFileSize, formatDate } from '@/lib/utils';
import { fetchFairnessAudit } from '@/lib/api';

interface KpiCard {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  shadow: string;
}

const KPI_CARDS: KpiCard[] = [
  {
    label: 'Files Processed',
    value: '1,284',
    delta: '+12.4%',
    trend: 'up',
    icon: Upload,
    gradient: 'from-neon-blue/20 to-neon-purple/20',
    shadow: 'shadow-glow-blue/30',
  },
  {
    label: 'Languages Covered',
    value: '10',
    delta: '+2',
    trend: 'up',
    icon: Globe,
    gradient: 'from-neon-cyan/20 to-neon-green/20',
    shadow: 'shadow-glow-cyan/30',
  },
  {
    label: 'Avg Fairness Score',
    value: '87.3%',
    delta: '+3.2%',
    trend: 'up',
    icon: ShieldCheck,
    gradient: 'from-neon-green/20 to-neon-cyan/20',
    shadow: 'shadow-glow-green/30',
  },
  {
    label: 'Translations',
    value: '5,612',
    delta: '+18.7%',
    trend: 'up',
    icon: Languages,
    gradient: 'from-neon-amber/20 to-neon-red/20',
    shadow: 'shadow-glow-amber/30',
  },
  // XAI and Pipeline cards removed per UI update
];

const QUICK_ACTIONS = [
  {
    label: 'Upload File',
    description: 'Drop documents, audio, video',
    href: '/dashboard/upload',
    icon: Upload,
    gradient: 'from-neon-blue to-neon-purple',
  },
  {
    label: 'Run Fairness Audit',
    description: 'Cross-lingual bias analysis',
    href: '/dashboard/fairness',
    icon: Scale,
    gradient: 'from-neon-purple to-neon-cyan',
  },
  {
    label: 'Fact Check',
    description: 'Verify claims with sources',
    href: '/dashboard/fact-check',
    icon: FileCheck2,
    gradient: 'from-neon-cyan to-neon-green',
  },
  {
    label: 'Ask GraphRAG',
    description: 'Intelligent Q&A over KG',
    href: '/dashboard/graphrag',
    icon: Sparkles,
    gradient: 'from-neon-amber to-neon-red',
  },
];

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function DashboardPage() {
  const files = useUploadStore((s) => s.files);
  const recentFiles = files.slice(0, 5);
  const stages = usePipelineStore((s) => s.stages);
  const overallProgress = usePipelineStore((s) => s.overallProgress);
  const completed = stages.filter((s) => s.status === 'completed').length;
  const [avgFairnessScore, setAvgFairnessScore] = useState('87.3%');
  const [backendStatus, setBackendStatus] = useState('Checking backend...');

  useEffect(() => {
    let active = true;

    const loadBackendSummary = async () => {
      try {
        const response = await fetchFairnessAudit();
        if (!active) return;
        setAvgFairnessScore(`${response.clfiScore}%`);
        setBackendStatus('Backend connected, live audit data loaded.');
      } catch {
        if (!active) return;
        setBackendStatus('Backend unavailable — falling back to local preview.');
      }
    };

    void loadBackendSummary();
    return () => {
      active = false;
    };
  }, []);

  const kpiCards = KPI_CARDS.map((kpi) =>
    kpi.label === 'Avg Fairness Score'
      ? { ...kpi, value: avgFairnessScore }
      : kpi,
  );

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header removed per user request */}

      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <GlassPanel padding="sm" className="h-full">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center mb-3 ${kpi.shadow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-display font-bold">{kpi.value}</span>
                    <span
                      className={`text-xs font-semibold inline-flex items-center gap-0.5 ${
                        kpi.trend === 'up'
                          ? 'text-neon-green'
                          : kpi.trend === 'down'
                          ? 'text-neon-red'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                      {kpi.delta}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <GlassPanel title="Recent Uploads" description="Latest files added to the platform">
            {recentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Upload className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground mb-2">No uploads yet</p>
                <Button size="sm" variant="default" asChild>
                  <Link href="/dashboard/upload">Upload your first file</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentFiles.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue/15 to-neon-purple/15 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-neon-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(f.size)} · {formatDate(f.uploadedAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        f.status === 'completed'
                          ? 'success'
                          : f.status === 'failed'
                          ? 'danger'
                          : f.status === 'processing'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {f.status}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.div>
                ))}
                <Separator />
                <Link
                  href="/dashboard/upload"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm text-neon-cyan hover:underline py-2"
                >
                  View all uploads <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <GlassPanel title="Pipeline Overview" description={`Stage ${completed}/${stages.length} complete`}>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-semibold gradient-text">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2.5" />
              </div>
              <div className="space-y-2">
                {stages.slice(0, 6).map((st) => (
                  <div key={st.id} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        st.status === 'completed'
                          ? 'bg-neon-green shadow-glow-green'
                          : st.status === 'active'
                          ? 'bg-neon-cyan animate-pulse shadow-glow-cyan'
                          : st.status === 'error'
                          ? 'bg-neon-red'
                          : st.status === 'skipped'
                          ? 'bg-white/30'
                          : 'bg-white/20'
                      }`}
                    />
                    <span className="text-xs flex-1 truncate">{st.label}</span>
                    <span className="text-[10px] text-muted-foreground">{st.progress}%</span>
                  </div>
                ))}
              </div>
              <Button variant="default" size="sm" className="w-full" asChild>
                <Link href="/dashboard/pipeline">
                  <Workflow className="w-4 h-4" />
                  View Full Pipeline
                </Link>
              </Button>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-display font-bold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Jump to common workflows</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={action.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                  <GlassPanel padding="default" className="h-full hover:border-white/20 group cursor-pointer">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display font-semibold text-base mb-1 group-hover:gradient-text transition-all">
                      {action.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </GlassPanel>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
