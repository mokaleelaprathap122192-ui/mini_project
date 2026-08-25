'use client';

import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Activity,
  Gauge,
  AlertTriangle,
  ShieldCheck,
  Zap,
  LineChart as LineChartIcon,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Server,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Badge, Separator } from '@/components/ui/label';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { cn, round } from '@/lib/utils';

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const hourlyData = Array.from({ length: 24 }, (_, i) => {
  const h = i;
  const peak = Math.abs(i - 14) < 4;
  const base = peak ? 4200 : 1800;
  const req = round(base + Math.sin(i * 0.6) * 600 + Math.random() * 500, 0);
  const errs = Math.round(req * (0.004 + Math.random() * 0.012));
  return {
    hour: `${String(h).padStart(2, '0')}:00`,
    requests: req,
    errors: errs,
    p50: round(80 + Math.random() * 60, 0),
    p95: round(180 + Math.random() * 120, 0),
    p99: round(320 + Math.random() * 280, 0),
  };
});

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  path: string;
  count2xx: number;
  count4xx: number;
  count5xx: number;
  avgMs: number;
  p99Ms: number;
}

const ENDPOINTS: Endpoint[] = [
  { method: 'POST', path: '/v1/audit/run', count2xx: 8429, count4xx: 132, count5xx: 18, avgMs: 428, p99Ms: 2108 },
  { method: 'POST', path: '/v1/sentiment/analyze', count2xx: 42108, count4xx: 841, count5xx: 92, avgMs: 96, p99Ms: 342 },
  { method: 'POST', path: '/v1/translate/text', count2xx: 28491, count4xx: 512, count5xx: 34, avgMs: 182, p99Ms: 621 },
  { method: 'POST', path: '/v1/asr/transcribe', count2xx: 6218, count4xx: 82, count5xx: 11, avgMs: 712, p99Ms: 3402 },
  { method: 'GET', path: '/v1/reports/:id', count2xx: 18293, count4xx: 291, count5xx: 3, avgMs: 54, p99Ms: 141 },
  { method: 'GET', path: '/v1/models', count2xx: 92410, count4xx: 0, count5xx: 2, avgMs: 12, p99Ms: 38 },
  { method: 'POST', path: '/v1/tts/generate', count2xx: 3912, count4xx: 58, count5xx: 9, avgMs: 1240, p99Ms: 5820 },
  { method: 'POST', path: '/v1/knowledge-graph/query', count2xx: 10428, count4xx: 124, count5xx: 7, avgMs: 218, p99Ms: 891 },
  { method: 'POST', path: '/v1/fact-check/verify', count2xx: 5721, count4xx: 73, count5xx: 15, avgMs: 520, p99Ms: 2410 },
  { method: 'DELETE', path: '/v1/datasets/:id', count2xx: 142, count4xx: 22, count5xx: 1, avgMs: 82, p99Ms: 312 },
];

const METHOD_COLORS: Record<Endpoint['method'], string> = {
  GET: '#22C55E',
  POST: '#2563EB',
  PUT: '#F59E0B',
  PATCH: '#8B5CF6',
  DELETE: '#EF4444',
};

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string; color?: string }>;
  color: string;
  good: boolean;
  delay: number;
}

function KpiCard({ label, value, delta, trend, icon: Icon, color, good, delay }: KpiCardProps) {
  const Trend = good === (trend === 'up') ? TrendingUp : TrendingDown;
  const trendColor = good === (trend === 'up') ? 'text-neon-green' : 'text-neon-red';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <GlassPanel padding="sm" className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}>
            <Icon className="w-5 h-5" color={color} />
          </div>
          <span className={cn('text-xs font-semibold inline-flex items-center gap-0.5', trendColor)}>
            <Trend className="w-3 h-3" />{delta}
          </span>
        </div>
        <div className="text-2xl font-display font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </GlassPanel>
    </motion.div>
  );
}

export default function AdminApiPage() {
  const totalReq = ENDPOINTS.reduce((a, e) => a + e.count2xx + e.count4xx + e.count5xx, 0);
  const totalErr = ENDPOINTS.reduce((a, e) => a + e.count4xx + e.count5xx, 0);
  const errRate = round((totalErr / totalReq) * 100, 2);
  const avgLatency = round(ENDPOINTS.reduce((a, e) => a + e.avgMs, 0) / ENDPOINTS.length, 0);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="rounded-2xl p-4 mb-6 bg-gradient-to-r from-neon-red/15 via-neon-amber/10 to-neon-purple/10 border border-neon-amber/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/20 to-neon-red/20 border border-neon-amber/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-neon-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-neon-amber mb-0.5">ADMIN ONLY · API Monitoring Console</h2>
            <p className="text-sm text-muted-foreground">Live gateway telemetry, per-endpoint SLA, and latency distribution across percentiles.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
              <Activity className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-0.5">
                <span className="gradient-text">API Monitoring</span>
              </h1>
              <p className="text-muted-foreground text-sm">Requests, latency percentiles and errors across all REST endpoints</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="glass" size="sm"><RefreshCw className="w-4 h-4" />Refresh</Button>
            <Button variant="glass" size="sm"><Server className="w-4 h-4" />Regions</Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Requests Today" value={totalReq.toLocaleString()} delta="+12.4%" trend="up" icon={Zap} color="#2563EB" good={true} delay={0} />
        <KpiCard label="Avg Latency" value={`${avgLatency} ms`} delta="-8.2%" trend="down" icon={Clock} color="#7C3AED" good={true} delay={0.05} />
        <KpiCard label="Error Rate" value={`${errRate}%`} delta="+0.3pp" trend="up" icon={AlertTriangle} color="#F59E0B" good={false} delay={0.1} />
        <KpiCard label="Rate Limit Used" value="67.3%" delta="+4.1%" trend="up" icon={ShieldCheck} color="#06B6D4" good={false} delay={0.15} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={fadeInUp}>
          <GlassPanel title="Requests per Hour" description="Total requests + errors over last 24 hours">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="errFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="requests" stroke="#2563EB" strokeWidth={2.5} fill="url(#reqFill)" name="Requests" />
                  <Area type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} fill="url(#errFill)" name="Errors" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <GlassPanel title="Latency Distribution" description="p50 / p95 / p99 (ms) across the day">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="p50" stroke="#06B6D4" strokeWidth={2} dot={false} name="p50" />
                  <Line type="monotone" dataKey="p95" stroke="#7C3AED" strokeWidth={2.2} dot={false} name="p95" />
                  <Line type="monotone" dataKey="p99" stroke="#EF4444" strokeWidth={2.2} dot={false} name="p99" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp}>
        <GlassPanel title="Endpoint SLA Table" description={`${ENDPOINTS.length} endpoints · aggregated last 24h`}>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[960px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 font-medium" colSpan={2}>Method & Path</th>
                  <th className="px-3 py-3 font-medium text-right">2xx</th>
                  <th className="px-3 py-3 font-medium text-right">4xx</th>
                  <th className="px-3 py-3 font-medium text-right">5xx</th>
                  <th className="px-3 py-3 font-medium text-right">Avg</th>
                  <th className="px-3 py-3 font-medium text-right">p99</th>
                  <th className="px-3 py-3 font-medium text-right">SLA</th>
                </tr>
              </thead>
              <tbody>
                {ENDPOINTS.map((e, i) => {
                  const total = e.count2xx + e.count4xx + e.count5xx;
                  const errRateEnd = round(((e.count4xx + e.count5xx) / Math.max(1, total)) * 100, 2);
                  const slaPass = errRateEnd < 2 && e.p99Ms < 3000;
                  return (
                    <motion.tr
                      key={`${e.method}-${e.path}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-3 py-3 w-[100px]">
                        <span
                          className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border"
                          style={{ color: METHOD_COLORS[e.method], background: `${METHOD_COLORS[e.method]}12`, borderColor: `${METHOD_COLORS[e.method]}40` }}
                        >
                          {e.method}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <code className="font-mono text-sm">{e.path}</code>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-neon-green">{e.count2xx.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-neon-amber">{e.count4xx.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-mono text-sm text-neon-red">{e.count5xx.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-mono text-sm flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5 text-neon-cyan" />{e.avgMs}<span className="text-[10px] text-muted-foreground ml-0.5">ms</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="font-mono text-sm" style={{ color: e.p99Ms > 2500 ? '#EF4444' : e.p99Ms > 1000 ? '#F59E0B' : '#E2E8F0' }}>
                          {e.p99Ms.toLocaleString()}<span className="text-[10px] text-muted-foreground ml-0.5">ms</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant={slaPass ? 'success' : 'warning'} className="!text-[10px] !px-2.5">
                            {slaPass ? <ShieldCheck className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                            {slaPass ? 'Pass' : 'At risk'}
                          </Badge>
                          <button className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-cyan transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
