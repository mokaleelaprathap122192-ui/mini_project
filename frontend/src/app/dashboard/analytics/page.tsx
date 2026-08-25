'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  Database,
  Globe,
  HardDrive,
  LineChart as LineChartIcon,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Scale,
  Languages,
  Gauge,
  AlertOctagon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  ReferenceLine,
} from 'recharts';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Badge } from '@/components/ui/label';
import { cn, formatDate, formatPercent, round } from '@/lib/utils';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, LANGUAGE_NATIVE_NAMES } from '@/types';
import type { Language } from '@/types';

const sparklineData = Array.from({ length: 12 }, (_, i) => ({
  t: i,
  v: 30 + Math.sin(i * 0.8) * 20 + Math.random() * 30,
}));

function Sparkline({ color = '#7C3AED' }: { color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={sparklineData}>
        <defs>
          <linearGradient id={`spark-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.slice(1)})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  delay: number;
}

function KpiCard({ label, value, delta, trend, icon: Icon, color, delay }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <GlassPanel padding="sm" className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <span
            className={cn(
              'text-xs font-semibold inline-flex items-center gap-0.5',
              trend === 'up' ? 'text-neon-green' : 'text-neon-red',
            )}
          >
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        </div>
        <div className="text-2xl font-display font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        <Sparkline color={color} />
      </GlassPanel>
    </motion.div>
  );
}

const KPI_CARDS: Array<KpiCardProps & { labelKey?: string }> = [
  { label: 'Total Requests', value: '847,293', delta: '+18.2%', trend: 'up', icon: Zap, color: '#2563EB', delay: 0 },
  { label: 'Avg Accuracy', value: '92.4%', delta: '+2.1%', trend: 'up', icon: ShieldCheck, color: '#10B981', delay: 0.05 },
  { label: 'Avg CLFI Score', value: '0.782', delta: '+5.3%', trend: 'up', icon: BarChart3, color: '#7C3AED', delay: 0.1 },
  { label: 'Languages Analyzed', value: '14', delta: '+40%', trend: 'up', icon: Globe, color: '#06B6D4', delay: 0.15 },
  { label: 'Users Active', value: '1,284', delta: '+12.7%', trend: 'up', icon: Users, color: '#F59E0B', delay: 0.2 },
  { label: 'Uptime', value: '99.98%', delta: '-0.01%', trend: 'down', icon: Activity, color: '#EF4444', delay: 0.25 },
];

const dailyUsageData = Array.from({ length: 30 }, (_, i) => {
  const base = 8000 + Math.sin(i * 0.3) * 2000;
  return {
    day: `D${i + 1}`,
    requests: Math.round(base + Math.random() * 3000),
    processingTime: round(80 + Math.sin(i * 0.5) * 30 + Math.random() * 20),
  };
});

const modelAccuracyData = [
  { model: 'IndicBERT', Acc: 91.2, Prec: 89.8, Rec: 90.5, F1: 90.1 },
  { model: 'XLM-R', Acc: 88.7, Prec: 87.2, Rec: 89.1, F1: 88.1 },
  { model: 'MuRIL', Acc: 90.4, Prec: 89.1, Rec: 91.0, F1: 90.0 },
  { model: 'mBERT', Acc: 85.3, Prec: 84.0, Rec: 86.2, F1: 85.1 },
  { model: 'Ensemble', Acc: 93.8, Prec: 92.9, Rec: 93.5, F1: 93.2 },
];

const trainingCurves = Array.from({ length: 50 }, (_, i) => {
  const epoch = i + 1;
  const train = 55 + 40 * (1 - Math.exp(-i / 10)) + (Math.random() - 0.5) * 2;
  const val = 52 + 38 * (1 - Math.exp(-i / 11)) + (Math.random() - 0.5) * 2.5;
  const loss = 1.8 * Math.exp(-i / 12) + 0.15 + (Math.random() - 0.5) * 0.05;
  return {
    epoch,
    trainAcc: round(Math.min(98, train), 1),
    valAcc: round(Math.min(96, val), 1),
    loss: round(loss, 3),
  };
});

const prfByClass = [
  { cls: 'Positive', Precision: 94.2, Recall: 92.8, F1: 93.5, Support: 4210 },
  { cls: 'Neutral', Precision: 88.6, Recall: 90.1, F1: 89.3, Support: 3102 },
  { cls: 'Negative', Precision: 91.3, Recall: 89.7, F1: 90.5, Support: 3688 },
];

const modelRadarData = modelAccuracyData.map((m) => ({
  subject: m.model,
  Accuracy: m.Acc,
  Precision: m.Prec,
  Recall: m.Rec,
  F1: m.F1,
  fullMark: 100,
}));

const AUDIT_LANGS: Language[] = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or'];
const LANG_COLORS = ['#2563EB', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316'];

const langDistData = AUDIT_LANGS.map((l, i) => ({
  name: LANGUAGE_NATIVE_NAMES[l],
  value: round((100 - i * 8) * (1 + Math.random() * 0.2), 1),
  lang: l,
}));

const latencyData = [
  { stage: 'Preprocess', min: 8, avg: 15, max: 32 },
  { stage: 'Detection', min: 24, avg: 45, max: 98 },
  { stage: 'Translation', min: 45, avg: 120, max: 280 },
  { stage: 'Sentiment', min: 18, avg: 32, max: 68 },
  { stage: 'Bias', min: 35, avg: 78, max: 195 },
  { stage: 'Fairness', min: 60, avg: 140, max: 360 },
  { stage: 'Report', min: 22, avg: 50, max: 130 },
];

const biasAlertsData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  Low: Math.round(3 + Math.sin(i * 0.4) * 2 + Math.random() * 3),
  Medium: Math.round(1 + Math.cos(i * 0.3) * 1.5 + Math.random() * 2),
  High: Math.round(Math.max(0, Math.sin(i * 0.2) * 0.8 + Math.random() * 1.2)),
}));

const liveFeedEvents = Array.from({ length: 10 }, (_, i) => {
  const statuses: Array<'success' | 'warning' | 'danger' | 'info'> = ['success', 'success', 'warning', 'info', 'success', 'danger', 'success', 'info', 'success', 'warning'];
  const events = [
    'Pipeline completed',
    'Language detected',
    'High bias alert',
    'Report exported',
    'Model deployed',
    'Processing failed',
    'Fairness audit complete',
    'User uploaded file',
    'Translation batch done',
    'CLFI threshold exceeded',
  ];
  const users = ['Vaishnavi', 'Surya', 'Leela', 'Dr. Sharma', 'Priya', 'Rahul', 'Ananya', 'Karthik', 'Maya', 'Arjun'];
  return {
    id: i,
    timestamp: new Date(Date.now() - i * 1000 * 60 * (5 + Math.random() * 10)).toISOString(),
    status: statuses[i],
    event: events[i],
    user: users[i],
    language: SUPPORTED_LANGUAGES[Math.floor(Math.random() * SUPPORTED_LANGUAGES.length)],
  };
});

const fairnessParityData = AUDIT_LANGS.map((l, i) => {
  const base = 88 - i * 1.2;
  const jitter = () => round((Math.random() - 0.5) * 4, 1);
  return {
    lang: LANGUAGE_NATIVE_NAMES[l],
    code: l.toUpperCase(),
    accuracy: round(base + jitter(), 1),
    parity: round(75 + Math.random() * 20, 1),
    equalizedOdds: round(70 + Math.random() * 25, 1),
    selectionRate: round(65 + Math.random() * 30, 1),
    tpr: round(78 + Math.random() * 18, 1),
    fpr: round(2 + Math.random() * 10, 1),
  };
});

const languagePerfGap = AUDIT_LANGS.map((l, i) => {
  const englishF1 = 93.2;
  const gap = round(i * 1.8 + Math.random() * 3, 1);
  return {
    lang: LANGUAGE_NATIVE_NAMES[l],
    f1: round(englishF1 - gap, 1),
    gap,
    baseline: englishF1,
    support: Math.round(5000 - i * 350 + Math.random() * 400),
  };
});

const parityScatter = fairnessParityData.map((r, i) => ({
  lang: r.lang,
  parity: r.parity,
  equalizedOdds: r.equalizedOdds,
  size: 80 + Math.random() * 40,
  color: LANG_COLORS[i % LANG_COLORS.length],
}));

function SystemGauge({ health }: { health: number }) {
  const cx = 100, cy = 100, r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (health / 100) * circumference * 0.75;
  return (
    <svg viewBox="0 0 200 140" className="w-full h-40">
      <defs>
        <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="url(#gauge-grad)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75}`}
        strokeDashoffset={offset}
        transform={`rotate(${135 - (health / 100) * 270}, ${cx}, ${cy})`}
        style={{ transition: 'all 0.8s ease' }}
      />
      <text x={cx} y={cy - 5} textAnchor="middle" className="fill-white font-display" fontWeight="bold" fontSize="32">
        {health}%
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" className="fill-muted-foreground" fontSize="12">
        System Health
      </text>
    </svg>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: 'ok' | 'warn' | 'fail'; label: string }) {
  const cfg = {
    ok: { icon: CheckCircle2, cls: 'text-neon-green bg-neon-green/15 border-neon-green/30' },
    warn: { icon: AlertTriangle, cls: 'text-neon-amber bg-neon-amber/15 border-neon-amber/30' },
    fail: { icon: XCircle, cls: 'text-neon-red bg-neon-red/15 border-neon-red/30' },
  }[status];
  const Icon = cfg.icon;
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium', cfg.cls)}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const overallBias = useMemo(() => {
    const avgParity = fairnessParityData.reduce((s, r) => s + r.parity, 0) / fairnessParityData.length;
    const avgEq = fairnessParityData.reduce((s, r) => s + r.equalizedOdds, 0) / fairnessParityData.length;
    return { parity: round(avgParity, 1), eq: round(avgEq, 1), score: round((avgParity + avgEq) / 2, 1) };
  }, []);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              <span className="gradient-text">{t('dashboard.title', 'Real-time Analytics')}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('dashboard.subtitle', 'Live metrics and insights across the fairness audit platform')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="ok" label={t('dashboard.accuracy', 'Accuracy') + ' 92.4%'} />
            <StatusBadge status="warn" label={`CLFI 0.782`} />
            <StatusBadge status="ok" label={`${t('dashboard.languagesAnalyzed', 'Languages')} 14`} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <motion.div variants={fadeInUp} className="lg:col-span-4">
          <GlassPanel
            title={t('dashboard.trainingAccuracy', 'Training vs Validation Accuracy')}
            description={t('dashboard.trainingAccuracyDesc', 'Model learning curves across training epochs')}
            icon={<Target className="w-4 h-4 text-neon-purple" />}
            right={
              <div className="flex gap-2">
                <Badge variant="success"><CheckCircle2 className="w-3 h-3" />Best Epoch 47</Badge>
              </div>
            }
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingCurves} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trainGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    <linearGradient id="valGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="epoch"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 10 }}
                    label={{ value: t('dashboard.epoch', 'Epoch'), position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 10 }}
                    domain={[50, 100]}
                    label={{ value: t('dashboard.accuracy', 'Accuracy (%)'), angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 10 }}
                    domain={[0, 2]}
                    label={{ value: 'Loss', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine yAxisId="left" y={95} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Target 95%', fill: '#10B981', fontSize: 10, position: 'right' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="trainAcc"
                    stroke="url(#trainGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    name={t('dashboard.training', 'Training') + ' Acc'}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="valAcc"
                    stroke="url(#valGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    name={t('dashboard.validation', 'Validation') + ' Acc'}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <GlassPanel
            title={t('dashboard.languageDistribution', 'Language Distribution')}
            description={t('dashboard.languageDistributionDesc', 'Request share by language')}
            icon={<Languages className="w-4 h-4 text-neon-cyan" />}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={langDistData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {langDistData.map((_, i) => (
                      <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-3">
          <GlassPanel
            title={t('dashboard.modelAccuracy', 'Model Performance')}
            description={t('dashboard.modelAccuracyDesc', 'Accuracy, Precision, Recall & F1 by model')}
            icon={<BarChart3 className="w-4 h-4 text-neon-blue" />}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelAccuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="model" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} domain={[75, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Acc" fill="#2563EB" radius={[4, 4, 0, 0]} name={t('dashboard.accuracy', 'Accuracy')} />
                  <Bar dataKey="Prec" fill="#7C3AED" radius={[4, 4, 0, 0]} name={t('dashboard.precision', 'Precision')} />
                  <Bar dataKey="Rec" fill="#06B6D4" radius={[4, 4, 0, 0]} name={t('dashboard.recall', 'Recall')} />
                  <Bar dataKey="F1" fill="#10B981" radius={[4, 4, 0, 0]} name={t('dashboard.f1', 'F1-Score')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-3">
          <GlassPanel
            title="Precision / Recall / F1 Radar"
            description="Model signature comparison across 4 metrics"
            icon={<Gauge className="w-4 h-4 text-neon-purple" />}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={modelRadarData} outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Radar name={t('dashboard.accuracy', 'Accuracy')} dataKey="Accuracy" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
                  <Radar name={t('dashboard.f1', 'F1-Score')} dataKey="F1" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-3">
          <GlassPanel
            title={t('dashboard.dailyUsage', 'Daily Usage')}
            description={t('dashboard.dailyUsageDesc', 'Requests & processing time over 30 days')}
            icon={<LineChartIcon className="w-4 h-4 text-neon-cyan" />}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyUsageData}>
                  <defs>
                    <linearGradient id="reqLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="requests" stroke="url(#reqLine)" strokeWidth={2.5} dot={false} name={t('dashboard.requests', 'Requests')} />
                  <Line yAxisId="right" type="monotone" dataKey="processingTime" stroke="#06B6D4" strokeWidth={2} dot={false} name={t('dashboard.procMs', 'Proc ms')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-3">
          <GlassPanel
            title={t('dashboard.processingLatency', 'Processing Latency')}
            description={t('dashboard.processingLatencyDesc', 'Min / Avg / Max by pipeline stage (ms)')}
            icon={<Activity className="w-4 h-4 text-neon-amber" />}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latencyData}>
                  <defs>
                    <linearGradient id="maxFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="minFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="stage" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="max" stroke="#EF4444" fill="url(#maxFill)" name="Max" />
                  <Area type="monotone" dataKey="avg" stroke="#7C3AED" fill="url(#avgFill)" name="Avg" />
                  <Area type="monotone" dataKey="min" stroke="#06B6D4" fill="url(#minFill)" name="Min" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp}>
        <GlassPanel
          title={t('dashboard.biasFairnessOverview', 'Bias & Fairness Overview')}
          description={t('dashboard.biasFairnessDesc', 'Demographic parity & performance by language group')}
          icon={<Scale className="w-4 h-4 text-neon-purple" />}
          right={
            <div className="flex gap-2">
              <Badge variant="info">Avg Parity: {overallBias.parity}%</Badge>
              <Badge variant="warning">Eq Odds: {overallBias.eq}%</Badge>
              <Badge variant="success">Score: {overallBias.score}</Badge>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-neon-cyan" />
                {t('dashboard.fairnessParity', 'Demographic Parity by Language')}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {t('dashboard.fairnessParityDesc', 'Equalized odds & selection rate parity across 10 language groups')}
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fairnessParityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="code" type="category" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} width={40} />
                    <Tooltip
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                      formatter={(v: any, n: any) => [`${v}%`, String(n).replace(/^([A-Z])/, (m: string) => m.toUpperCase())]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine x={80} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'Target 80%', fill: '#10B981', fontSize: 10 }} />
                    <Bar dataKey="accuracy" name={t('dashboard.accuracy', 'Accuracy')} radius={[0, 4, 4, 0]}>
                      {fairnessParityData.map((_, i) => (
                        <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} fillOpacity={0.9} />
                      ))}
                    </Bar>
                    <Bar dataKey="parity" name="Demographic Parity" radius={[0, 4, 4, 0]}>
                      {fairnessParityData.map((_, i) => (
                        <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} fillOpacity={0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
                <AlertOctagon className="w-3.5 h-3.5 text-neon-amber" />
                {t('dashboard.languagePerformanceGap', 'Language Performance Gap')}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {t('dashboard.languagePerformanceGapDesc', 'F1-score discrepancy vs English baseline')}
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={languagePerfGap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="lang" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 9, angle: -25, textAnchor: 'end' } as any} height={55} interval={0} />
                    <YAxis yAxisId="left" domain={[70, 95]} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine yAxisId="left" y={93.2} stroke="rgba(255,255,255,0.6)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'EN F1 93.2', fill: 'rgba(255,255,255,0.8)', fontSize: 10, position: 'right' }} />
                    <Bar yAxisId="left" dataKey="f1" name={t('dashboard.f1', 'F1-Score')} radius={[4, 4, 0, 0]}>
                      {languagePerfGap.map((_, i) => (
                        <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="gap" name="Gap %" radius={[4, 4, 0, 0]} fill="#EF4444" fillOpacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-neon-green" />
                Parity vs Equalized Odds (per language)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Bubble size = sample support · top-right quadrant = ideal</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      type="number"
                      dataKey="parity"
                      name="Demographic Parity"
                      domain={[60, 100]}
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Demographic Parity (%)', position: 'insideBottom', offset: -4, fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="equalizedOdds"
                      name="Equalized Odds"
                      domain={[60, 100]}
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Equalized Odds (%)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                    />
                    <ZAxis type="number" dataKey="size" range={[60, 300]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                      formatter={(v: any, n: any, p: any) => {
                        const d = p.payload as any;
                        return [[`${d.lang} · Parity ${d.parity}% · Eq.Odds ${d.equalizedOdds}%`, 'Value']];
                      }}
                    />
                    <ReferenceLine x={80} stroke="#10B981" strokeOpacity={0.5} strokeDasharray="4 4" />
                    <ReferenceLine y={80} stroke="#10B981" strokeOpacity={0.5} strokeDasharray="4 4" />
                    {parityScatter.map((p, i) => (
                      <Scatter key={i} data={[p]}>
                        <Cell fill={p.color} fillOpacity={0.65} stroke={p.color} strokeWidth={1.5} />
                      </Scatter>
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-neon-cyan" />
                Class-level P/R/F1 Breakdown
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Sentiment classes: Positive · Neutral · Negative</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prfByClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="cls" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" domain={[80, 100]} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="Precision" fill="#2563EB" radius={[4, 4, 0, 0]} name={t('dashboard.precision', 'Precision')} />
                    <Bar yAxisId="left" dataKey="Recall" fill="#7C3AED" radius={[4, 4, 0, 0]} name={t('dashboard.recall', 'Recall')} />
                    <Bar yAxisId="left" dataKey="F1" fill="#10B981" radius={[4, 4, 0, 0]} name={t('dashboard.f1', 'F1-Score')} />
                    <Line yAxisId="right" type="monotone" dataKey="Support" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B' }} name="Support" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <GlassPanel
            title={t('dashboard.systemHealth', 'System Health')}
            description={t('dashboard.systemHealthDesc', 'Infrastructure status')}
            icon={<Cpu className="w-4 h-4 text-neon-blue" />}
          >
            <SystemGauge health={92} />
            <div className="mt-2 space-y-3">
              <MiniBar label={t('dashboard.cpu', 'CPU')} value={67} color="#2563EB" />
              <MiniBar label={t('dashboard.ram', 'RAM')} value={54} color="#7C3AED" />
              <MiniBar label={t('dashboard.gpu', 'GPU')} value={78} color="#06B6D4" />
              <MiniBar label={t('dashboard.storage', 'Storage')} value={41} color="#10B981" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                { icon: Database, label: 'Mongo', status: 'ok' as const },
                { icon: HardDrive, label: 'Neo4j', status: 'ok' as const },
                { icon: Globe, label: 'Chroma', status: 'warn' as const },
                { icon: Sparkles, label: 'ML GW', status: 'ok' as const },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 py-2.5 px-1">
                  <s.icon className={cn('w-4 h-4 mx-auto mb-1', s.status === 'ok' ? 'text-neon-green' : 'text-neon-amber')} />
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp} className="lg:col-span-4">
          <GlassPanel
            title={t('dashboard.biasAlertsTrend', 'Bias Alerts Trend')}
            description={t('dashboard.biasAlertsDesc', 'Low / Medium / High severity alerts over 30 days')}
            icon={<AlertTriangle className="w-4 h-4 text-neon-amber" />}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={biasAlertsData}>
                  <defs>
                    <linearGradient id="lowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="medFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="highFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" stackId="1" dataKey={t('dashboard.low', 'Low') as any} stroke="#10B981" fill="url(#lowFill)" />
                  <Area type="monotone" stackId="1" dataKey={t('dashboard.medium', 'Medium') as any} stroke="#F59E0B" fill="url(#medFill)" />
                  <Area type="monotone" stackId="1" dataKey={t('dashboard.high', 'High') as any} stroke="#EF4444" fill="url(#highFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp}>
        <GlassPanel
          title={t('dashboard.liveFeed', 'Live Pipeline Events Feed')}
          description={t('dashboard.liveFeedDesc', 'Recent activity across the platform')}
        >
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 font-medium">{t('dashboard.timestamp', 'Timestamp')}</th>
                  <th className="px-3 py-3 font-medium">{t('dashboard.status', 'Status')}</th>
                  <th className="px-3 py-3 font-medium">{t('dashboard.event', 'Event')}</th>
                  <th className="px-3 py-3 font-medium">{t('dashboard.user', 'User')}</th>
                  <th className="px-3 py-3 font-medium">{t('dashboard.language', 'Language')}</th>
                </tr>
              </thead>
              <tbody>
                {liveFeedEvents.map((e) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: e.id * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(e.timestamp)}</td>
                    <td className="px-3 py-3">
                      <Badge
                        variant={
                          e.status === 'success'
                            ? 'success'
                            : e.status === 'warning'
                            ? 'warning'
                            : e.status === 'danger'
                            ? 'danger'
                            : 'info'
                        }
                      >
                        {e.status === 'success' && <Sparkles className="w-3 h-3" />}
                        {e.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                        {e.status === 'danger' && <AlertTriangle className="w-3 h-3" />}
                        {e.status === 'info' && <LineChartIcon className="w-3 h-3" />}
                        {e.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-sm font-medium">{e.event}</td>
                    <td className="px-3 py-3 text-sm">{e.user}</td>
                    <td className="px-3 py-3">
                      <span className="text-sm inline-flex items-center gap-1">
                        <span>{LANGUAGE_LABELS[e.language as keyof typeof LANGUAGE_LABELS]}</span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
