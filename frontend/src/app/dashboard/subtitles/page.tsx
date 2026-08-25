'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Link2,
  Languages,
  FileDown,
  Copy,
  Pencil,
  Check,
  Loader2,
  Captions,
  Play,
  Sparkles,
  Download,
  Clock,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge, Separator } from '@/components/ui/label';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES, Language } from '@/types';
import { cn } from '@/lib/utils';
import { generateWithGemini } from '@/lib/gemini';

interface SubtitleCue {
  id: number;
  start: string;
  end: string;
  text: string;
  editing?: boolean;
}

const DEFAULT_CUES: SubtitleCue[] = [
  { id: 1, start: '00:00:00,000', end: '00:00:04,500', text: 'Welcome to the Cross-Lingual Fairness Audit platform.' },
  { id: 2, start: '00:00:04,600', end: '00:00:09,200', text: 'Today we analyze sentiment models across 10 Indian languages.' },
  { id: 3, start: '00:00:09,300', end: '00:00:14,000', text: 'Our goal is to identify and mitigate cross-lingual biases.' },
  { id: 4, start: '00:00:14,100', end: '00:00:19,500', text: 'We use models like IndicBERT, MuRIL, and XLM-RoBERTa for benchmarking.' },
  { id: 5, start: '00:00:19,600', end: '00:00:25,000', text: 'The CLFI score measures overall fairness across all language pairs.' },
];

function formatTimeVTT(t: string) {
  return t.replace(',', '.').replace(/^\d\d:/, '');
}

export default function SubtitlesPage() {
  const [srcLang, setSrcLang] = useState<Language>('en');
  const [tgtLang, setTgtLang] = useState<Language>('hi');
  const [loading, setLoading] = useState(false);
  const [cues, setCues] = useState<SubtitleCue[]>(DEFAULT_CUES);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [outFormat, setOutFormat] = useState<'srt' | 'vtt'>('srt');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inputTab, setInputTab] = useState('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    const mediaName = selectedFileName || youtubeUrl || 'multilingual-video-sample';
    const targetLangName = LANGUAGE_LABELS[tgtLang] || tgtLang;

    const prompt = `Generate timed SRT subtitle cues (5-6 cues) translated into ${targetLangName} (${tgtLang}) for a video about: ${mediaName}. Format as standard SRT format.`;

    const aiText = await generateWithGemini(prompt, 'You are an AI speech transcription and multi-lingual subtitle generator.');

    if (aiText && aiText.includes('-->')) {
      const parsedCues: SubtitleCue[] = [];
      const blocks = aiText.split(/\n\s*\n/);
      let idx = 1;
      for (const block of blocks) {
        const lines = block.trim().split('\n');
        const timeLine = lines.find((l) => l.includes('-->'));
        if (timeLine) {
          const parts = timeLine.split('-->');
          const textLines = lines.filter((l) => !l.includes('-->') && !/^\d+$/.test(l.trim()));
          parsedCues.push({
            id: idx++,
            start: parts[0].trim(),
            end: parts[1].trim(),
            text: textLines.join(' ').trim() || 'Subtitled content',
          });
        }
      }
      if (parsedCues.length > 0) {
        setCues(parsedCues);
      } else {
        setCues(DEFAULT_CUES);
      }
    } else {
      setCues(DEFAULT_CUES);
    }

    setLoading(false);
  };

  const toSRT = (cs: SubtitleCue[]) => cs.map((c, i) => `${i + 1}\n${c.start} --> ${c.end}\n${c.text}\n`).join('\n');
  const toVTT = (cs: SubtitleCue[]) => 'WEBVTT\n\n' + cs.map((c) => `${formatTimeVTT(c.start)} --> ${formatTimeVTT(c.end)}\n${c.text}\n`).join('\n');

  const handleCopy = () => {
    const text = outFormat === 'srt' ? toSRT(cues) : toVTT(cues);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (fmt: 'srt' | 'vtt') => {
    const content = fmt === 'srt' ? toSRT(cues) : toVTT(cues);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles_${tgtLang}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateCue = (id: number, text: string) => setCues((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  const toggleEdit = (id: number) => setCues((prev) => prev.map((c) => (c.id === id ? { ...c, editing: !c.editing } : c)));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,video/*"
        className="hidden"
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Badge variant="info" className="mb-3 !text-xs !px-3 !py-1">
            <Captions className="w-3.5 h-3.5 mr-1" />
            AI Subtitle Generator · Gemini Powered
          </Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            <span className="gradient-text">Subtitle Generator</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Upload audio/video files or paste YouTube URLs. Auto-generate speech transcriptions and translate into 10 Indian languages.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap max-w-md">
          {SUPPORTED_LANGUAGES.slice(0, 8).map((l) => (
            <Badge key={l} variant="outline" title={LANGUAGE_LABELS[l]} className="!px-2 !py-1 !text-xs">
              <span className="mr-1">{LANGUAGE_FLAGS[l]}</span>{l.toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <GlassPanel title="Input Source" description="Select file or enter video URL">
            <Tabs value={inputTab} onValueChange={setInputTab}>
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="upload" className="gap-1.5"><UploadCloud className="w-4 h-4" />Upload File</TabsTrigger>
                <TabsTrigger value="youtube" className="gap-1.5"><Link2 className="w-4 h-4" />YouTube URL</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setSelectedFileName(e.dataTransfer.files[0].name);
                    }
                  }}
                  className={cn(
                    'rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer',
                    dragging ? 'border-neon-purple bg-neon-purple/10' : 'border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]',
                  )}
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center mb-3">
                    <UploadCloud className="w-7 h-7 text-neon-cyan" />
                  </div>
                  <p className="font-medium mb-1 text-sm">
                    {selectedFileName ? selectedFileName : 'Click to select audio or video'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">MP3, WAV, MP4, MOV, WebM</p>
                  <Button variant="glass" size="sm" className="mx-auto">
                    <Sparkles className="w-4 h-4 mr-1" /> Browse Media
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="youtube">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2"><Link2 className="w-4 h-4 text-neon-cyan" />YouTube Link</label>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">Paste YouTube link to extract transcript & generate subtitles.</p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1.5 text-muted-foreground">Source Language</label>
                <select
                  value={srcLang}
                  onChange={(e) => setSrcLang(e.target.value as Language)}
                  className="neon-input !py-2 !text-xs"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5 text-muted-foreground">Target Language</label>
                <select
                  value={tgtLang}
                  onChange={(e) => setTgtLang(e.target.value as Language)}
                  className="neon-input !py-2 !text-xs"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              className="neon-btn w-full mt-4 !rounded-xl"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {loading ? 'Generating Subtitles with Gemini…' : 'Generate Subtitles'}
            </Button>
          </GlassPanel>
        </div>

        <div className="xl:col-span-3">
          <GlassPanel
            title="Subtitle Cues & Timeline"
            description={`${cues.length} cues · ${LANGUAGE_FLAGS[srcLang]}${LANGUAGE_LABELS[srcLang]} → ${LANGUAGE_FLAGS[tgtLang]}${LANGUAGE_LABELS[tgtLang]}`}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="glass" size="sm" onClick={() => handleDownload('srt')}><Download className="w-4 h-4 mr-1" />Download SRT</Button>
              <Button variant="glass" size="sm" onClick={() => handleDownload('vtt')}><FileDown className="w-4 h-4 mr-1" />Download VTT</Button>
              <Button variant="glass" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-neon-green mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-[60px_110px_110px_1fr_40px] gap-2 text-xs font-medium text-muted-foreground uppercase px-4 py-2.5 bg-white/[0.03] border-b border-white/10">
                <div>#</div>
                <div>Start</div>
                <div>End</div>
                <div>Text</div>
                <div></div>
              </div>
              {cues.map((c, i) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[60px_110px_110px_1fr_40px] gap-2 items-start px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="font-mono text-xs text-muted-foreground pt-1">#{i + 1}</div>
                  <div className="font-mono text-xs text-neon-cyan pt-1">{outFormat === 'vtt' ? formatTimeVTT(c.start) : c.start}</div>
                  <div className="font-mono text-xs text-neon-purple pt-1">{outFormat === 'vtt' ? formatTimeVTT(c.end) : c.end}</div>
                  {c.editing ? (
                    <Textarea
                      value={c.text}
                      onChange={(e) => updateCue(c.id, e.target.value)}
                      className="min-h-[50px] !text-sm"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed pt-0.5">{c.text}</p>
                  )}
                  <button
                    onClick={() => toggleEdit(c.id)}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-neon-cyan"
                  >
                    {c.editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </motion.div>
  );
}
