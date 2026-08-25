'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle,
  CalendarDays,
  Building,
  ShieldCheck,
  Gauge,
  FileText,
  Languages,
  Activity,
  Sparkles,
  Edit3,
  ChevronRight,
  Award,
  Heart,
  History,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge, Separator } from '@/components/ui/label';
import { LANGUAGE_FLAGS, LANGUAGE_LABELS, Language } from '@/types';
import { cn, formatDate } from '@/lib/utils';

const USER = {
  name: 'Dr. Ananya Sharma',
  role: 'researcher' as const,
  org: 'Indian Institute of Science · NLP Lab',
  email: 'ananya.sharma@iisc.ac.in',
  joined: '2024-03-15T09:30:00',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya&backgroundColor=1e293b',
  bio: 'Computational linguist focusing on cross-lingual fairness for low-resource Indian languages. I build benchmarks that matter.',
  languages: ['hi', 'en', 'ta', 'te', 'bn'] as Language[],
  tags: ['Sentiment Analysis', 'Bias Mitigation', 'IndicNLP', 'XAI', 'Knowledge Graphs'],
};

const STATS = [
  { label: 'Audits Run', value: '147', delta: '+12', icon: Gauge, color: '#2563EB', grad: 'from-neon-blue/20 to-neon-purple/10' },
  { label: 'Reports Generated', value: '62', delta: '+5', icon: FileText, color: '#7C3AED', grad: 'from-neon-purple/20 to-neon-cyan/10' },
  { label: 'Languages Used', value: '9', delta: '+1', icon: Languages, color: '#06B6D4', grad: 'from-neon-cyan/20 to-neon-blue/10' },
  { label: 'Platform Uptime', value: '99.8%', delta: 'stable', icon: Activity, color: '#22C55E', grad: 'from-neon-green/20 to-neon-cyan/10' },
];

const RECENT = [
  { id: 1, title: 'CLFI Cross-Lingual Audit', lang: 'hi' as Language, date: '2025-07-28T10:24:00', score: '0.821', type: 'audit' },
  { id: 2, title: 'Hindi Sentiment Calibration', lang: 'hi' as Language, date: '2025-07-26T14:08:00', score: '92.4%', type: 'run' },
  { id: 3, title: 'Tamil Gender Bias Heatmap', lang: 'ta' as Language, date: '2025-07-22T09:45:00', score: 'Medium', type: 'alert' },
  { id: 4, title: 'Telugu Translation QA', lang: 'te' as Language, date: '2025-07-20T16:32:00', score: '96.1%', type: 'run' },
  { id: 5, title: 'Benchmark IndicBERT vs MuRIL', lang: 'en' as Language, date: '2025-07-18T11:02:00', score: 'Won IndicBERT', type: 'compare' },
];

const CONTRIBUTIONS = [
  { id: 'c1', title: 'Added Bengali test corpus · 3,420 sentences', status: 'Merged', repo: 'indic-corpus', lines: '+2,312 / -84', date: '2025-07-25' },
  { id: 'c2', title: 'Fixed: Parity calculation in CLFI formula', status: 'Merged', repo: 'core-metrics', lines: '+128 / -47', date: '2025-07-20' },
  { id: 'c3', title: 'New: XAI SHAP baseline models', status: 'Review', repo: 'xai-pipeline', lines: '+1,890 / -210', date: '2025-07-17' },
  { id: 'c4', title: 'Improved Indic language tokenizer', status: 'Merged', repo: 'nlp-pipeline', lines: '+412 / -32', date: '2025-07-11' },
];

const FAVORITES = [
  { id: 'f1', title: 'CLFI 0.9+ Template Audit', type: 'Saved Audit', lang: 'hi', updated: '3 days ago' },
  { id: 'f2', title: 'South Asian Language Cluster', type: 'Dataset', lang: 'ta', updated: '1 week ago' },
  { id: 'f3', title: 'Gender Bias Benchmark Suite', type: 'Benchmark', lang: 'en', updated: '2 weeks ago' },
  { id: 'f4', title: 'Ananya&apos;s TTS Voice Pack', type: 'Preset', lang: 'bn', updated: '3 weeks ago' },
];

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function Avatar({ src, name, size = 128, ring = true }: { src: string; name: string; size?: number; ring?: boolean }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div className={cn('relative inline-block shrink-0', ring && 'p-1 rounded-full bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan shadow-glow-purple')}>
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="rounded-full object-cover bg-navy-900"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="rounded-full bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center font-display font-bold text-white border-2 border-white/10"
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState('activity');

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-navy-900/80 via-navy-900/60 to-navy-900/40 backdrop-blur-xl">
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 15% 0%, rgba(124,58,237,0.3), transparent 55%), radial-gradient(ellipse at 85% 100%, rgba(6,182,212,0.28), transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.12), transparent 60%)',
            }}
          />
          <div className="grid-bg absolute inset-0 opacity-30" />
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
            <Avatar src={USER.avatar} name={USER.name} size={128} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white truncate">{USER.name}</h1>
                    <Badge variant="info" className="!text-xs !px-3"><ShieldCheck className="w-3 h-3" />Verified Researcher</Badge>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5"><Building className="w-4 h-4" />{USER.org}</span>
                    <span className="opacity-40">·</span>
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />Joined {formatDate(USER.joined).split(',')[0]}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">{USER.bio}</p>
                </div>
                <Button variant="default" size="sm" className="neon-btn !rounded-xl" onClick={() => (window.location.href = '/dashboard/settings')}>
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {USER.languages.map((l) => (
                  <Badge key={l} variant="outline" title={LANGUAGE_LABELS[l]} className="!px-2 !py-1 !text-xs">
                    <span className="mr-1">{LANGUAGE_FLAGS[l]}</span>{LANGUAGE_LABELS[l]}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {USER.tags.map((t) => (
                  <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-white/10 text-foreground/85">
                    <Sparkles className="w-3 h-3 inline mr-1 opacity-70" />{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <GlassPanel padding="sm" className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} border border-white/10 flex items-center justify-center`}>
                      <Icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    <Badge variant={s.delta.startsWith('+') ? 'success' : s.delta === 'stable' ? 'outline' : 'danger'} className="!text-[10px] !px-2">{s.delta}</Badge>
                  </div>
                  <div className="text-2xl font-display font-bold mb-1">{s.value}</div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <GlassPanel>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full grid grid-cols-3 max-w-md">
              <TabsTrigger value="activity" className="gap-1.5"><History className="w-4 h-4" />Recent Activity</TabsTrigger>
              <TabsTrigger value="contribs" className="gap-1.5"><Award className="w-4 h-4" />Contributions</TabsTrigger>
              <TabsTrigger value="favs" className="gap-1.5"><Heart className="w-4 h-4" />Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <div className="relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-neon-blue/40 via-neon-purple/40 to-neon-cyan/40" />
                <div className="space-y-4">
                  {RECENT.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="relative pl-12"
                    >
                      <div className="absolute left-2 top-3 w-4 h-4 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple shadow-glow-purple flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="rounded-xl p-4 bg-white/[0.03] border border-white/10 hover:border-neon-purple/30 hover:bg-white/[0.05] transition-all group">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                          <div>
                            <p className="font-medium text-sm flex items-center gap-2">
                              {r.title}
                              <Badge variant="outline" className="!text-[10px] !px-2"><span className="mr-0.5">{LANGUAGE_FLAGS[r.lang as Language]}</span>{LANGUAGE_LABELS[r.lang as Language]}</Badge>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.date)}</p>
                          </div>
                          <Badge variant={r.type === 'alert' ? 'warning' : r.type === 'audit' ? 'info' : 'success'} className="!text-xs shrink-0">{r.score}</Badge>
                        </div>
                        <div className="flex items-center justify-end">
                          <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-neon-cyan transition-colors">
                            View details <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contribs" className="mt-6">
              <div className="space-y-3">
                {CONTRIBUTIONS.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl p-4 bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4 text-neon-amber" />
                          {c.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          repo:{c.repo} · {c.date}
                        </p>
                      </div>
                      <Badge variant={c.status === 'Merged' ? 'success' : 'warning'} className="!text-xs shrink-0">{c.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-neon-green">+{c.lines.split(' / ')[0].slice(1)}</span>
                      <span className="text-neon-red">{c.lines.split(' / ')[1]}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favs" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FAVORITES.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl p-4 bg-gradient-to-br from-neon-purple/[0.06] to-neon-cyan/[0.04] border border-white/10 hover:border-neon-purple/40 hover:shadow-glow-purple transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="!text-[10px] !px-2">{f.type}</Badge>
                      <Heart className="w-4 h-4 text-neon-red fill-neon-red/40" />
                    </div>
                    <p className="font-medium text-sm mb-1.5 flex items-center gap-1.5">
                      <span>{LANGUAGE_FLAGS[f.lang as Language]}</span>
                      {f.title}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Updated {f.updated}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-neon-cyan" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
