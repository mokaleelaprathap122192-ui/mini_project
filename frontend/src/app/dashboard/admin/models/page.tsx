'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  ShieldAlert,
  RefreshCw,
  Activity,
  Clock,
  Heart,
  Gauge,
  Loader2,
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Badge, Separator } from '@/components/ui/label';
import { cn, formatDate, round } from '@/lib/utils';

type ModelStatus = 'Online' | 'Degraded' | 'Offline';

interface ModelCard {
  id: string;
  name: string;
  version: string;
  tagline: string;
  status: ModelStatus;
  latencyP95: number;
  uptimePct: number;
  heartbeat: string;
  requestsToday: number;
  category: 'ASR' | 'MT' | 'Embedding' | 'Sentiment' | 'LLM' | 'Safety';
}

const MODELS: ModelCard[] = [
  { id: 'm1', name: 'Whisper Large V3', version: 'v3.0.1', tagline: 'Multilingual ASR · 97+ languages', status: 'Online', latencyP95: 342, uptimePct: 99.97, heartbeat: new Date(Date.now() - 42_000).toISOString(), requestsToday: 18532, category: 'ASR' },
  { id: 'm2', name: 'IndicTrans2', version: 'v2.1', tagline: '110-way Indic translation', status: 'Online', latencyP95: 812, uptimePct: 99.91, heartbeat: new Date(Date.now() - 18_000).toISOString(), requestsToday: 24901, category: 'MT' },
  { id: 'm3', name: 'IndicBERT', version: 'large', tagline: 'Indian languages encoder', status: 'Online', latencyP95: 128, uptimePct: 99.99, heartbeat: new Date(Date.now() - 6_000).toISOString(), requestsToday: 48291, category: 'Embedding' },
  { id: 'm4', name: 'XLM-RoBERTa', version: 'xlarge', tagline: '100-language embeddings', status: 'Degraded', latencyP95: 521, uptimePct: 98.23, heartbeat: new Date(Date.now() - 96_000).toISOString(), requestsToday: 31488, category: 'Embedding' },
  { id: 'm5', name: 'MuRIL', version: 'v1.0', tagline: 'BERT for Indian languages', status: 'Online', latencyP95: 164, uptimePct: 99.95, heartbeat: new Date(Date.now() - 12_000).toISOString(), requestsToday: 21763, category: 'Embedding' },
  { id: 'm6', name: 'mBERT', version: 'base', tagline: 'Multilingual BERT base', status: 'Online', latencyP95: 98, uptimePct: 99.98, heartbeat: new Date(Date.now() - 8_000).toISOString(), requestsToday: 37219, category: 'Sentiment' },
  { id: 'm7', name: 'Llama 3', version: '8B-Instruct', tagline: 'Open instruct LLM · GPU-A100', status: 'Online', latencyP95: 1820, uptimePct: 99.61, heartbeat: new Date(Date.now() - 24_000).toISOString(), requestsToday: 5218, category: 'LLM' },
  { id: 'm8', name: 'Gemma', version: '7B-IT', tagline: 'Google safety-aligned model', status: 'Offline', latencyP95: 0, uptimePct: 94.12, heartbeat: new Date(Date.now() - 2 * 3600_000).toISOString(), requestsToday: 0, category: 'LLM' },
];

const STATUS_META: Record<ModelStatus, { variant: 'success' | 'warning' | 'danger'; icon: typeof CheckCircle2; color: string; grad: string }> = {
  Online: { variant: 'success', icon: CheckCircle2, color: '#22C55E', grad: 'from-neon-green/20 to-neon-cyan/10' },
  Degraded: { variant: 'warning', icon: AlertTriangle, color: '#F59E0B', grad: 'from-neon-amber/20 to-neon-red/10' },
  Offline: { variant: 'danger', icon: XCircle, color: '#EF4444', grad: 'from-neon-red/20 to-neon-amber/10' },
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const pulse = {
  Online: 'bg-neon-green shadow-glow-green',
  Degraded: 'bg-neon-amber shadow-glow-amber animate-pulse',
  Offline: 'bg-neon-red shadow-glow-red animate-pulse',
};

export default function AdminModelsPage() {
  const [restarting, setRestarting] = useState<string | null>(null);

  const healthOnline = MODELS.filter((m) => m.status === 'Online').length;
  const overallPct = Math.round((MODELS.reduce((a, m) => a + m.uptimePct, 0) / MODELS.length) * 100) / 100;
  const totalReqs = MODELS.reduce((a, m) => a + m.requestsToday, 0);
  const avgLatency = round(MODELS.filter((m) => m.status !== 'Offline').reduce((a, m) => a + m.latencyP95, 0) / Math.max(1, MODELS.filter((m) => m.status !== 'Offline').length), 0);

  const restart = (id: string) => {
    setRestarting(id);
    setTimeout(() => setRestarting(null), 2200);
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="rounded-2xl p-4 mb-6 bg-gradient-to-r from-neon-red/15 via-neon-amber/10 to-neon-purple/10 border border-neon-amber/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/20 to-neon-red/20 border border-neon-amber/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-neon-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-neon-amber mb-0.5">ADMIN ONLY · AI Model Fleet</h2>
            <p className="text-sm text-muted-foreground">GPU-backed model instances. Restart and heartbeat controls are logged.</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-neon-green/10 via-neon-cyan/5 to-neon-blue/10 backdrop-blur-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-green/30 via-neon-cyan/20 to-neon-blue/20 border border-white/10 flex items-center justify-center shadow-glow-green">
              <Heart className="w-7 h-7 text-neon-green fill-neon-green/30" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl mb-1">Overall System Health · <span className="gradient-text">{overallPct}%</span></h3>
              <p className="text-sm text-muted-foreground">{healthOnline} / {MODELS.length} models online · Degraded: {MODELS.filter((m) => m.status === 'Degraded').length} · Offline: {MODELS.filter((m) => m.status === 'Offline').length}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[400px]">
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/10 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Requests (24h)</p>
              <p className="text-xl font-display font-bold flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-neon-amber" />
                {totalReqs.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/10 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Avg P95 Latency</p>
              <p className="text-xl font-display font-bold flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-neon-cyan" />
                {avgLatency}<span className="text-xs text-muted-foreground font-medium ml-0.5">ms</span>
              </p>
            </div>
            <div className="rounded-xl p-3 bg-white/[0.04] border border-white/10 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Healthy Models</p>
              <p className="text-xl font-display font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-neon-green" />
                {healthOnline}<span className="text-xs text-muted-foreground font-medium ml-0.5">/ {MODELS.length}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
            <Cpu className="w-6 h-6 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-0.5">
              <span className="gradient-text">AI Model Status</span>
            </h1>
            <p className="text-muted-foreground text-sm">Live heartbeat, latency and request counters across our hosted LLM/NLP fleet</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MODELS.map((m, i) => {
          const meta = STATUS_META[m.status];
          const StatusIcon = meta.icon;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
            >
              <div className={cn('glass p-5 h-full flex flex-col relative overflow-hidden', m.status === 'Degraded' && 'gradient-border')}>
                <div className={cn('absolute inset-0 opacity-40 pointer-events-none bg-gradient-to-br', meta.grad)} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center shrink-0">
                        <Server className="w-5 h-5 text-white/90" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold leading-tight truncate">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{m.version} · {m.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('w-2.5 h-2.5 rounded-full', pulse[m.status])} />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{m.tagline}</p>

                  <div className="rounded-xl p-3 bg-white/[0.04] border border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={meta.variant as any} className="!text-[10px] !px-2.5">
                        <StatusIcon className="w-3 h-3 mr-1" />{m.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3" />{m.requestsToday.toLocaleString()} req
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Gauge className="w-3.5 h-3.5 text-neon-cyan" />Latency P95</span>
                        <span className="font-mono font-medium">{m.latencyP95}<span className="text-[10px] text-muted-foreground ml-0.5">ms</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (m.latencyP95 / 2000) * 100)}%` }}
                          transition={{ duration: 0.9, delay: 0.3 + i * 0.03 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${meta.color}, ${m.status === 'Online' ? '#06B6D4' : '#F59E0B'})` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Heart className="w-3.5 h-3.5 text-neon-red" />Uptime</span>
                        <span className="font-mono font-medium">{m.uptimePct.toFixed(2)}<span className="text-[10px] text-muted-foreground ml-0.5">%</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mb-4">
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Beat {formatDate(m.heartbeat).split(',')[1]?.trim() || '—'}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-neon-cyan" />
                  </div>

                  <Button
                    variant={m.status === 'Offline' ? 'default' : 'glass'}
                    size="sm"
                    className="w-full"
                    onClick={() => restart(m.id)}
                    disabled={restarting === m.id}
                  >
                    {restarting === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {restarting === m.id ? 'Restarting…' : 'Restart Model'}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
