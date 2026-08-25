'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileSpreadsheet,
  Braces,
  Share2,
  Download,
  Trash2,
  Search,
  Mail,
  Link as LinkIcon,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge, Separator } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn, formatDate, formatFileSize } from '@/lib/utils';

type ReportType = 'pdf' | 'csv' | 'json';
type ReportFilter = 'all' | ReportType;

interface Report {
  id: string;
  name: string;
  date: string;
  user: string;
  type: ReportType;
  size: number;
  auditId: string;
}

const REPORTS: Report[] = [
  { id: 'r1', name: 'CLFI Cross-Lingual Fairness Report — Q3 2025', date: '2025-07-28T10:24:00', user: 'Dr. Ananya Sharma', type: 'pdf', size: 4_832_120, auditId: 'AUD-2025-0789' },
  { id: 'r2', name: 'IndicBERT vs MuRIL Benchmark Results', date: '2025-07-26T16:08:00', user: 'Karthik Menon', type: 'csv', size: 512_340, auditId: 'AUD-2025-0771' },
  { id: 'r3', name: 'Gender Bias Heatmap Raw Data', date: '2025-07-25T08:42:00', user: 'Priya Desai', type: 'json', size: 2_108_000, auditId: 'AUD-2025-0763' },
  { id: 'r4', name: 'Hindi Sentiment Calibration Study', date: '2025-07-22T14:15:00', user: 'Rohan Kulkarni', type: 'pdf', size: 3_204_180, auditId: 'AUD-2025-0745' },
  { id: 'r5', name: 'Regional Language Accuracy Matrix', date: '2025-07-20T11:55:00', user: 'Divya Banerjee', type: 'csv', size: 287_960, auditId: 'AUD-2025-0731' },
  { id: 'r6', name: 'Knowledge Graph Triples Export', date: '2025-07-18T19:30:00', user: 'Aditya Patel', type: 'json', size: 8_456_000, auditId: 'AUD-2025-0719' },
  { id: 'r7', name: 'Bias Mitigation Recommendations', date: '2025-07-15T09:12:00', user: 'Meera Nair', type: 'pdf', size: 1_984_000, auditId: 'AUD-2025-0704' },
  { id: 'r8', name: 'Endpoint Performance Logs', date: '2025-07-12T22:04:00', user: 'Arjun Rao', type: 'json', size: 1_345_720, auditId: 'AUD-2025-0692' },
];

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function TypeBadge({ t }: { t: ReportType }) {
  const map: Record<ReportType, { label: string; variant: 'info' | 'success' | 'default' }> = {
    pdf: { label: 'PDF', variant: 'danger' as any },
    csv: { label: 'CSV', variant: 'success' },
    json: { label: 'JSON', variant: 'info' },
  };
  return (
    <Badge variant={map[t].variant as any} className="!text-xs !px-2.5 font-mono">{map[t].label}</Badge>
  );
}

export default function ReportsPage() {
  const [filter, setFilter] = useState<ReportFilter>('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const filtered = REPORTS.filter((r) => {
    const matchesF = filter === 'all' || r.type === filter;
    const matchesS = r.name.toLowerCase().includes(search.toLowerCase()) || r.user.toLowerCase().includes(search.toLowerCase());
    return matchesF && matchesS;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://audit.example.com/share/aud-2025-0789?tok=eyJhbGciOiJIUzI1NiJ9');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAction = (type: ReportType) => {
    const blob = new Blob([`mock-${type}-data`], { type: type === 'pdf' ? 'application/pdf' : type === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Badge variant="info" className="mb-3 !text-xs !px-3 !py-1">
            <FileText className="w-3.5 h-3.5 mr-1" />
            Export Center
          </Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            <span className="gradient-text">Reports Export Center</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Generate, share, and export fairness audit reports in multiple formats. Track the history of all reports produced by your team.
          </p>
        </div>
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogTrigger asChild>
            <Button className="neon-btn !rounded-xl" onClick={() => setShareOpen(true)}>
              <Share2 className="w-4 h-4" />
              Share Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-neon-purple" />
                Share Audit Report
              </DialogTitle>
              <DialogDescription>Send a secure, time-limited link to collaborators or post it to your social channels.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div>
                <Label>Email Addresses</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="colleague@research.in"
                    className="flex-1"
                  />
                  <Button variant="default" size="sm"><Mail className="w-4 h-4" />Send</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Separate multiple emails with commas. Link expires in 7 days.</p>
              </div>
              <div>
                <Label>Shareable Link</Label>
                <div className="mt-2 flex gap-2">
                  <div className="flex-1 neon-input !py-2.5 truncate text-xs text-muted-foreground font-mono">
                    https://audit.example.com/share/aud-2025-0789?tok=eyJhbGciOiJIUzI1NiJ9
                  </div>
                  <Button variant="glass" size="sm" onClick={handleCopyLink}>
                    {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="mb-3 block">Or Share via</Label>
                <div className="flex gap-3">
                  <button className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#1DA1F2]/40 text-[#1DA1F2] flex items-center justify-center gap-2 text-sm font-medium transition-all"><Twitter className="w-4 h-4" />Twitter</button>
                  <button className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#4267B2]/40 text-[#4267B2] flex items-center justify-center gap-2 text-sm font-medium transition-all"><Facebook className="w-4 h-4" />Facebook</button>
                  <button className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0A66C2]/40 text-[#0A66C2] flex items-center justify-center gap-2 text-sm font-medium transition-all"><Linkedin className="w-4 h-4" />LinkedIn</button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="glass" onClick={() => setShareOpen(false)}>Close</Button>
              <Button onClick={() => setShareOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              title: 'PDF Report',
              desc: 'Full audit summary with charts, CLFI score, bias heatmap, and recommendations. Best for stakeholders and print.',
              color: '#EF4444',
              grad: 'from-neon-red/20 to-neon-amber/10',
              type: 'pdf' as const,
              size: '4.6 MB · 12 pages',
            },
            {
              icon: FileSpreadsheet,
              title: 'CSV Export',
              desc: 'Per-language metrics in tabular format. Import into Excel, Google Sheets, or pandas for custom analysis.',
              color: '#22C55E',
              grad: 'from-neon-green/20 to-neon-cyan/10',
              type: 'csv' as const,
              size: '312 KB · 10 sheets',
            },
            {
              icon: Braces,
              title: 'JSON Dump',
              desc: 'Raw structured output for programmatic use. Includes full radar data, per-metric scores, and alerts.',
              color: '#06B6D4',
              grad: 'from-neon-cyan/20 to-neon-blue/10',
              type: 'json' as const,
              size: '1.8 MB · nested objects',
            },
          ].map((ex, i) => {
            const Icon = ex.icon;
            return (
              <motion.div
                key={ex.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="gradient-border"
              >
                <div className="glass p-6 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ex.grad} border border-white/10 flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" style={{ color: ex.color }} />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-1">{ex.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex-1 leading-relaxed">{ex.desc}</p>
                  <Badge variant="outline" className="w-fit mb-4 !text-[11px] !px-2.5">{ex.size}</Badge>
                  <Button variant="default" size="sm" className="w-full" onClick={() => exportAction(ex.type)}>
                    <Sparkles className="w-4 h-4" />
                    Export {ex.type.toUpperCase()}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <GlassPanel
          title="Reports History"
          description={`${filtered.length} of ${REPORTS.length} reports`}
        >
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by report name or user…"
                className="!pl-10"
              />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as ReportFilter)}>
              <TabsList>
                <TabsTrigger value="all" className="gap-1.5"><Filter className="w-3.5 h-3.5" />All</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="glass" size="sm"><RefreshCw className="w-4 h-4" />Refresh</Button>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 font-medium">Report</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">User</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Size</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-3 py-3.5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-cyan/10 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <ChevronRight className="w-4 h-4 text-neon-cyan" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-md">{r.name}</p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.auditId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="text-sm font-mono whitespace-nowrap flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {formatDate(r.date).split(',')[0]}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-sm whitespace-nowrap">{r.user}</td>
                      <td className="px-3 py-3.5"><TypeBadge t={r.type} /></td>
                      <td className="px-3 py-3.5 text-sm font-mono text-muted-foreground whitespace-nowrap">{formatFileSize(r.size)}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-cyan transition-colors" title="Preview">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-green transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-purple transition-colors" title="Share" onClick={() => setShareOpen(true)}>
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-neon-red/10 flex items-center justify-center text-muted-foreground hover:text-neon-red transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}
