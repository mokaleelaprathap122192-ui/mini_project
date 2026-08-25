'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  ShieldAlert,
  Search,
  CalendarDays,
  AlertOctagon,
  AlertTriangle,
  Info,
  Bug,
  Filter,
  Trash2,
  RefreshCw,
  Activity,
  Database,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge, Separator } from '@/components/ui/label';
import { cn, formatDate } from '@/lib/utils';

type LogLevel = 'all' | 'error' | 'warn' | 'info' | 'debug';
type LogLevelValue = Exclude<LogLevel, 'all'>;

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevelValue;
  service: string;
  message: string;
  traceId: string;
  user?: string;
  metadata?: Record<string, string>;
}

const SERVICES = ['api-gateway', 'auth-svc', 'audit-engine', 'nlp-pipeline', 'model-host', 'storage-svc', 'report-gen', 'fairness-orc'];

function randId() { return Math.random().toString(36).slice(2, 10); }

function generateLog(i: number, base: Date): LogEntry {
  const levels: LogLevelValue[] = ['error', 'warn', 'info', 'info', 'info', 'debug', 'info', 'info'];
  const level = levels[i % levels.length];
  const service = SERVICES[i % SERVICES.length];
  const t = new Date(base.getTime() - i * (32_000 + Math.random() * 180_000));
  const messages: Record<LogLevelValue, string[]> = {
    error: [
      `Model inference failed on replica pod-${i % 8} · connection reset after 25000ms`,
      `Database deadlock detected in transaction txn_${randId().slice(0, 6)} on audit_results table`,
      `Out-of-memory in GPU worker gpu-${i % 4} · alloc 18.4GB / limit 24GB`,
      `Authentication failure: invalid signature for JWT from 45.79.${10 + (i % 200)}.${i % 255}`,
    ],
    warn: [
      `Rate limit approaching for tenant lab-${i % 6}: 8920 / 10000 requests`,
      `High latency on /v1/sentiment endpoint · p95 ${300 + (i * 7) % 400}ms (SLA 400ms)`,
      `Cache hit ratio dropped to 62.4% · consider warming keyspace`,
      `Deprecated endpoint /v0/audit called by user-${i % 50}, remove in v3.2`,
    ],
    info: [
      `Audit pipeline AUD-${10000 + i} completed · clfi=${(0.7 + (i % 30) / 100).toFixed(3)} · 10 langs`,
      `Successfully deployed model IndicBERT to region ap-south-1 · replica ${i % 5}`,
      `Report generated · PDF · ${(2 + (i % 8))}MB · sent via email`,
      `User user_${i % 60} logged in · SSO provider Google Workspace · Bengaluru`,
      `Storage cleanup complete · removed ${1200 + i * 7} stale objects (${(12 + (i % 20))}GB freed)`,
    ],
    debug: [
      `Cache MISS for key emb:${randId()} · populated from source in ${i % 50}ms`,
      `Trace span pipeline.stage-${i % 9} finished · duration=${i % 200}ms`,
      `DB query SELECT FROM metrics · rows=${500 + (i * 23) % 2000} · plan seq scan`,
      `Scheduled job lang_detect_cron executed in ${i % 1000}ms`,
    ],
  };
  const arr = messages[level];
  const msg = arr[i % arr.length];
  return {
    id: `log_${randId()}`,
    timestamp: t.toISOString(),
    level,
    service,
    message: msg,
    traceId: `trc_${randId()}${randId()}`,
    user: (i % 7 === 0) ? `user_${i % 60}` : undefined,
  };
}

const BASE = new Date();
const INITIAL = Array.from({ length: 40 }, (_, i) => generateLog(i, BASE));

const LEVEL_META: Record<LogLevelValue, { label: string; variant: 'danger' | 'warning' | 'info' | 'default'; icon: typeof AlertOctagon; color: string }> = {
  error: { label: 'ERROR', variant: 'danger', icon: AlertOctagon, color: '#EF4444' },
  warn: { label: 'WARN', variant: 'warning', icon: AlertTriangle, color: '#F59E0B' },
  info: { label: 'INFO', variant: 'info', icon: Info, color: '#06B6D4' },
  debug: { label: 'DEBUG', variant: 'default', icon: Bug, color: '#94A3B8' },
};

const stagger = { animate: { transition: { staggerChildren: 0.03 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL);
  const [level, setLevel] = useState<LogLevel>('all');
  const [search, setSearch] = useState('');
  const [service, setService] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tail, setTail] = useState(true);
  const [clearAnim, setClearAnim] = useState(false);

  useEffect(() => {
    if (!tail) return;
    const id = setInterval(() => {
      setLogs((prev) => [generateLog(-(prev.length + 1), new Date()), ...prev].slice(0, 200));
    }, 4200);
    return () => clearInterval(id);
  }, [tail]);

  const filtered = logs.filter((l) => {
    if (level !== 'all' && l.level !== level) return false;
    if (service !== 'all' && l.service !== service) return false;
    const q = search.toLowerCase();
    if (q && !l.message.toLowerCase().includes(q) && !l.service.toLowerCase().includes(q) && !l.traceId.includes(q)) return false;
    if (fromDate) {
      const f = new Date(fromDate).getTime();
      if (new Date(l.timestamp).getTime() < f) return false;
    }
    if (toDate) {
      const t = new Date(toDate).getTime() + 86400_000;
      if (new Date(l.timestamp).getTime() > t) return false;
    }
    return true;
  });

  const counts = {
    all: logs.length,
    error: logs.filter((l) => l.level === 'error').length,
    warn: logs.filter((l) => l.level === 'warn').length,
    info: logs.filter((l) => l.level === 'info').length,
    debug: logs.filter((l) => l.level === 'debug').length,
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="rounded-2xl p-4 mb-6 bg-gradient-to-r from-neon-red/15 via-neon-amber/10 to-neon-purple/10 border border-neon-amber/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/20 to-neon-red/20 border border-neon-amber/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-neon-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-neon-amber mb-0.5">ADMIN ONLY · System Logs Console</h2>
            <p className="text-sm text-muted-foreground">Aggregated logs across all microservices. Live tail streams new entries every 4s.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
              <ScrollText className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-0.5">
                <span className="gradient-text">System Logs</span>
              </h1>
              <p className="text-muted-foreground text-sm">Search, filter, and tail distributed service logs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTail(!tail)}
              className={cn(
                'h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 border transition-all',
                tail
                  ? 'bg-gradient-to-r from-neon-green/20 to-neon-cyan/10 border-neon-green/30 text-neon-green shadow-glow-green/40'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white',
              )}
            >
              {tail ? <><Play className="w-4 h-4 fill-current" />Live Tail <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" /></> : <><Pause className="w-4 h-4" />Paused</>}
            </button>
            <Button variant="glass" onClick={() => { setClearAnim(true); setTimeout(() => setClearAnim(false), 180); setLogs([]); }}>
              <Trash2 className="w-4 h-4" />Clear Logs
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <GlassPanel>
          <Tabs value={level} onValueChange={(v) => setLevel(v as LogLevel)}>
            <TabsList className="w-full max-w-2xl grid grid-cols-5 mb-5">
              <TabsTrigger value="all" className="gap-1.5"><Filter className="w-3.5 h-3.5" />All <Badge variant="outline" className="!text-[10px] !py-0 !ml-1">{counts.all}</Badge></TabsTrigger>
              <TabsTrigger value="error" className="gap-1.5"><AlertOctagon className="w-3.5 h-3.5 text-neon-red" />Error <Badge variant="danger" className="!text-[10px] !py-0 !ml-1">{counts.error}</Badge></TabsTrigger>
              <TabsTrigger value="warn" className="gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-neon-amber" />Warn <Badge variant="warning" className="!text-[10px] !py-0 !ml-1">{counts.warn}</Badge></TabsTrigger>
              <TabsTrigger value="info" className="gap-1.5"><Info className="w-3.5 h-3.5 text-neon-cyan" />Info <Badge variant="info" className="!text-[10px] !py-0 !ml-1">{counts.info}</Badge></TabsTrigger>
              <TabsTrigger value="debug" className="gap-1.5"><Bug className="w-3.5 h-3.5" />Debug <Badge variant="outline" className="!text-[10px] !py-0 !ml-1">{counts.debug}</Badge></TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 mb-5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="!pl-10" placeholder="Search message, trace ID, service…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="neon-input md:w-48" value={service} onChange={(e) => setService(e.target.value)}>
              <option value="all">All services</option>
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="md:w-44" />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="md:w-44" />
          </div>

          <div className={cn('rounded-xl border border-white/10 overflow-hidden transition-all', clearAnim && 'opacity-0')}>
            <div className="max-h-[560px] overflow-y-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="sticky top-0 z-10 backdrop-blur-xl bg-navy-900/90 border-b border-white/10">
                  <tr className="text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Level</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Message</th>
                    <th className="px-4 py-3 font-medium">Trace ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center mb-3">
                          <ScrollText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium mb-0.5">No log entries match</p>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">Try a different level filter, service or keyword.</p>
                      </td>
                    </tr>
                  )}
                  {filtered.map((l, i) => {
                    const meta = LEVEL_META[l.level];
                    const Icon = meta.icon;
                    return (
                      <motion.tr
                        key={l.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.01, 0.3) }}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-4 py-3 align-top w-[200px]">
                          <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(l.timestamp)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top w-[100px]">
                          <Badge variant={meta.variant as any} className="!text-[10px] !px-2.5 font-mono tracking-wider">
                            <Icon className="w-3 h-3 mr-1" />{meta.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 align-top w-[160px]">
                          <span className="text-xs font-mono inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-muted-foreground whitespace-nowrap">
                            <Database className="w-3 h-3 text-neon-blue" />{l.service}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="font-mono text-[12.5px] leading-relaxed text-foreground/95 break-words">
                            <span className="text-white/50 mr-1">[{String(i + 1).padStart(3, '0')}]</span>
                            {l.message}
                          </p>
                          {l.user && <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1.5 font-mono">👤 {l.user}</p>}
                        </td>
                        <td className="px-4 py-3 align-top w-[180px]">
                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <code className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-muted-foreground truncate max-w-[130px]" title={l.traceId}>
                              {l.traceId.slice(0, 14)}…
                            </code>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02] text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-neon-cyan" />Showing {filtered.length} entries · buffer {logs.length}</span>
              <Button variant="ghost" size="sm"><RefreshCw className="w-3.5 h-3.5" />Refresh</Button>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
