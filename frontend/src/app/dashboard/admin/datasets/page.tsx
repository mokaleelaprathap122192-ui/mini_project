'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  ShieldAlert,
  UploadCloud,
  Download,
  Trash2,
  Eye,
  Gauge,
  Languages,
  Clock,
  Search,
  Filter,
  RefreshCw,
  FileText,
  HardDrive,
  Grid3x3,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, Separator } from '@/components/ui/label';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, Language, SUPPORTED_LANGUAGES } from '@/types';
import { cn, formatDate, formatFileSize } from '@/lib/utils';

interface Dataset {
  id: string;
  name: string;
  description: string;
  languages: Language[];
  records: number;
  size: number;
  updated: string;
  author: string;
  tags: string[];
  license: string;
  verified: boolean;
  benchmark?: number;
}

const DATASETS: Dataset[] = [
  {
    id: 'd1',
    name: 'IndicSentiment v3.0',
    description: 'Large-scale sentiment-annotated corpus covering 10 Indian languages. Curated reviews, news, and social media posts with 3-way labels.',
    languages: ['hi', 'ta', 'te', 'gu', 'kn', 'ml', 'mr', 'bn', 'sa', 'en'],
    records: 1_284_932,
    size: 4_832_000_000,
    updated: '2025-07-20',
    author: 'IIT Bombay KReSIT',
    tags: ['sentiment', 'gold-standard', '3-way'],
    license: 'CC-BY-NC-SA 4.0',
    verified: true,
    benchmark: 92.4,
  },
  {
    id: 'd2',
    name: 'GenderBias-India Corpus',
    description: 'Occupation-by-gender balanced dataset for measuring demographic bias in embeddings. Covers 2,800 stereotype prompts.',
    languages: ['hi', 'en', 'mr', 'bn'],
    records: 42_810,
    size: 128_400_000,
    updated: '2025-07-14',
    author: 'Microsoft Research India',
    tags: ['bias', 'evaluation', 'occupations'],
    license: 'MIT',
    verified: true,
    benchmark: 88.1,
  },
  {
    id: 'd3',
    name: 'ParallelCorp-IndicMT',
    description: 'High-quality parallel sentence pairs for 10 Indic languages × English. Filtered via BLEU threshold and human audit.',
    languages: ['en', 'hi', 'ta', 'te', 'gu', 'kn', 'ml', 'mr', 'bn'],
    records: 9_421_000,
    size: 18_900_000_000,
    updated: '2025-06-28',
    author: 'AI4Bharat',
    tags: ['translation', 'parallel', 'bitext'],
    license: 'CC-BY-4.0',
    verified: true,
    benchmark: 95.7,
  },
  {
    id: 'd4',
    name: 'Kannada YouTube Captions',
    description: 'Raw captions scraped from 2.4k Kannada educational YouTube channels. Useful for unsupervised LM training.',
    languages: ['kn'],
    records: 6_210_000,
    size: 3_200_000_000,
    updated: '2025-07-22',
    author: 'Community Contributed',
    tags: ['unsupervised', 'raw', 'kannada'],
    license: 'Public Domain',
    verified: false,
  },
  {
    id: 'd5',
    name: 'XAI-LIME Baseline Prompts',
    description: '1,200 curated prompt templates for evaluating LIME / SHAP explanations across sentiment and fairness tasks.',
    languages: ['hi', 'ta', 'te', 'en'],
    records: 1_200,
    size: 8_400_000,
    updated: '2025-07-01',
    author: 'IISC XAI Lab',
    tags: ['xai', 'explainability', 'benchmark'],
    license: 'CC-BY-4.0',
    verified: true,
    benchmark: 81.3,
  },
  {
    id: 'd6',
    name: 'Malayalam Film Reviews',
    description: 'Crowd-sourced 5-star annotated film reviews from Malayalam film forums. 40k+ entries with metadata.',
    languages: ['ml'],
    records: 40_912,
    size: 218_300_000,
    updated: '2025-06-15',
    author: 'Kerala NLP Collective',
    tags: ['sentiment', 'film', '5-star'],
    license: 'CC-BY-NC 4.0',
    verified: false,
  },
];

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function AdminDatasetsPage() {
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | Language>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [benchmarking, setBenchmarking] = useState<string | null>(null);

  const filtered = DATASETS.filter((d) => {
    if (langFilter !== 'all' && !d.languages.includes(langFilter)) return false;
    const q = search.toLowerCase();
    if (q && !d.name.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q) && !d.tags.some((t) => t.includes(q))) return false;
    return true;
  });

  const runBenchmark = (id: string) => {
    setBenchmarking(id);
    setTimeout(() => setBenchmarking(null), 2400);
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <div className="rounded-2xl p-4 mb-6 bg-gradient-to-r from-neon-red/15 via-neon-amber/10 to-neon-purple/10 border border-neon-amber/30 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/20 to-neon-red/20 border border-neon-amber/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-neon-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-neon-amber mb-0.5">ADMIN ONLY · Dataset Management</h2>
            <p className="text-sm text-muted-foreground">Curate training and benchmark corpora. Deletions are permanent and invalidate downstream caches.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
              <Database className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-0.5">
                <span className="gradient-text">Dataset Management</span>
              </h1>
              <p className="text-muted-foreground text-sm">Upload, version, and benchmark training & evaluation datasets</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); }}
          className={cn(
            'rounded-2xl border-2 border-dashed p-8 md:p-10 transition-all',
            dragging ? 'border-neon-purple bg-neon-purple/10 shadow-glow-purple' : 'border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]',
          )}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 md:gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/25 via-neon-purple/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center shrink-0">
                <UploadCloud className="w-8 h-8 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-1">Upload New Dataset</h3>
                <p className="text-sm text-muted-foreground max-w-lg">Drag-and-drop JSONL / CSV / Parquet / TSV. Max 20GB per file. We auto-detect schema, languages and compute basic stats.</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {['JSONL', 'CSV', 'Parquet', 'TSV', 'Arrow', 'Zip'].map((f) => (
                    <Badge key={f} variant="outline" className="!text-[10px] !px-2 !py-0.5 font-mono">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button className="neon-btn !rounded-xl shrink-0" onClick={() => {}}>
              <Sparkles className="w-4 h-4" />Browse Files
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <GlassPanel title={`Datasets Library · ${filtered.length}`} description="Filter, preview and benchmark available corpora">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="!pl-10" placeholder="Search by name, tag, description…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="neon-input sm:w-48" value={langFilter} onChange={(e) => setLangFilter(e.target.value as any)}>
              <option value="all">All languages</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}</option>
              ))}
            </select>
            <Button variant="glass" size="sm"><RefreshCw className="w-4 h-4" />Refresh</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedId(d.id)}
                className={cn(
                  'glass p-5 h-full flex flex-col cursor-pointer transition-all',
                  selectedId === d.id && 'ring-2 ring-neon-purple/50 shadow-glow-purple',
                  d.verified && 'gradient-border',
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/25 to-neon-purple/15 border border-white/10 flex items-center justify-center shrink-0">
                      <Grid3x3 className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <h3 className="font-display font-semibold leading-tight truncate">{d.name}</h3>
                        {d.verified && (
                          <Badge variant="success" className="!text-[9px] !px-1.5 !py-0 shrink-0">✓ Verified</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{d.author}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-3">{d.description}</p>

                <div className="flex flex-wrap items-center gap-1 mb-4">
                  {d.languages.slice(0, 6).map((l) => (
                    <Badge key={l} variant="outline" className="!text-[10px] !px-1.5 !py-0.5" title={LANGUAGE_LABELS[l]}>
                      <span className="mr-0.5">{LANGUAGE_FLAGS[l]}</span>{l.toUpperCase()}
                    </Badge>
                  ))}
                  {d.languages.length > 6 && (
                    <Badge variant="outline" className="!text-[10px] !px-1.5 !py-0.5">+{d.languages.length - 6}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Records</p>
                    <p className="text-sm font-display font-bold mt-0.5">{(d.records / (d.records >= 1e6 ? 1e6 : 1e3)).toFixed(d.records >= 1e6 ? 1 : 0)}<span className="text-[10px] font-medium text-muted-foreground ml-0.5">{d.records >= 1e6 ? 'M' : 'K'}</span></p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Size</p>
                    <p className="text-sm font-display font-bold mt-0.5 flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-neon-purple" />
                      {formatFileSize(d.size).split(' ')[0]}<span className="text-[10px] font-medium text-muted-foreground ml-0.5">{formatFileSize(d.size).split(' ')[1]}</span>
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2.5">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Updated</p>
                    <p className="text-xs font-mono mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neon-blue" />
                      {d.updated.slice(5)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {d.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-white/10 text-foreground/85 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between pt-3 mt-auto">
                  <Badge variant="outline" className="!text-[9px] !py-0 font-mono truncate max-w-[120px]">{d.license}</Badge>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-cyan transition-colors" title="Preview" onClick={(e) => { e.stopPropagation(); }}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-green transition-colors" title="Download" onClick={(e) => { e.stopPropagation(); }}>
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className={cn(
                        'h-8 px-2.5 rounded-lg text-[11px] flex items-center gap-1 transition-all',
                        benchmarking === d.id ? 'bg-white/10 text-muted-foreground' : 'hover:bg-neon-purple/15 text-muted-foreground hover:text-neon-purple',
                      )}
                      title="Benchmark"
                      onClick={(e) => { e.stopPropagation(); runBenchmark(d.id); }}
                      disabled={benchmarking === d.id}
                    >
                      {benchmarking === d.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gauge className="w-3.5 h-3.5" />}
                      {benchmarking === d.id ? 'Running…' : 'Bench'}
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-neon-red/10 flex items-center justify-center text-muted-foreground hover:text-neon-red transition-colors" title="Delete" onClick={(e) => { e.stopPropagation(); }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
