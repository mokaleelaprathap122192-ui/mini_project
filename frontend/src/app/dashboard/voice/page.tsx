'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Mic,
  Play,
  Pause,
  SkipBack,
  Download,
  Loader2,
  Sparkles,
  VolumeX,
  Languages,
  Gauge,
  User,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Textarea, Input } from '@/components/ui/input';
import { Badge, Separator } from '@/components/ui/label';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES, Language } from '@/types';
import { cn, sleep } from '@/lib/utils';

interface VoicePreset {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Neutral';
  language: Language;
  accent: string;
  pitch: 'Low' | 'Medium' | 'High';
  selected?: boolean;
}

const VOICE_PRESETS: VoicePreset[] = [
  { id: 'v1', name: 'Aarav', gender: 'Male', language: 'hi', accent: 'North Indian', pitch: 'Medium' },
  { id: 'v2', name: 'Priya', gender: 'Female', language: 'hi', accent: 'Delhi', pitch: 'High' },
  { id: 'v3', name: 'Karthik', gender: 'Male', language: 'ta', accent: 'Chennai', pitch: 'Low' },
  { id: 'v4', name: 'Ananya', gender: 'Female', language: 'te', accent: 'Hyderabad', pitch: 'Medium' },
  { id: 'v5', name: 'Rohan', gender: 'Male', language: 'mr', accent: 'Mumbai', pitch: 'Medium' },
  { id: 'v6', name: 'Divya', gender: 'Female', language: 'bn', accent: 'Kolkata', pitch: 'High' },
  { id: 'v7', name: 'Aditya', gender: 'Male', language: 'gu', accent: 'Ahmedabad', pitch: 'Low' },
  { id: 'v8', name: 'Meera', gender: 'Female', language: 'ml', accent: 'Kerala', pitch: 'Medium' },
  { id: 'v9', name: 'Arjun', gender: 'Male', language: 'kn', accent: 'Bangalore', pitch: 'Medium' },
  { id: 'v10', name: 'Elara', gender: 'Female', language: 'en', accent: 'British', pitch: 'High' },
];

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function VoicePage() {
  const [lang, setLang] = useState<Language>('en');
  const [preset, setPreset] = useState<string>('v10');
  const [text, setText] = useState('Hello! Welcome to the Cross-Lingual Fairness Audit platform. Experience natural text-to-speech across 10 Indian languages with human-like intonation.');
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState(false);

  const filteredPresets = VOICE_PRESETS.filter((v) => v.language === lang);
  const displayPresets = filteredPresets.length > 0 ? filteredPresets : VOICE_PRESETS.slice(0, 10);

  const handleGenerate = async () => {
    setLoading(true);
    setPlaying(false);
    setProgress(0);
    setGenerated(false);
    await sleep(1800);
    setLoading(false);
    setGenerated(true);
  };

  const togglePlay = () => {
    if (!generated) return;
    setPlaying(!playing);
    if (!playing) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setPlaying(false);
            return 100;
          }
          return p + (0.5 * speed);
        });
      }, 100);
    }
  };

  const reset = () => {
    setPlaying(false);
    setProgress(0);
  };

  const handleDownload = () => {
    const blob = new Blob(['FAKE_AUDIO_DATA'], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice_${preset}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (pct: number, totalSec = 22) => {
    const s = Math.round((pct / 100) * totalSec);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Badge variant="info" className="mb-3 !text-xs !px-3 !py-1">
            <Volume2 className="w-3.5 h-3.5 mr-1" />
            NLP Pipeline · Speech Stage
          </Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            <span className="gradient-text">Voice / TTS Generator</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Natural multilingual text-to-speech with expressive presets. Generate studio-quality audio
            in 10 Indian languages plus English, with speed control and MP3 export.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <motion.div variants={fadeInUp} className="xl:col-span-2 space-y-4">
          <GlassPanel title="Language & Voice" description="Choose output language and voice preset">
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2 flex items-center gap-2"><Languages className="w-4 h-4 text-neon-cyan" />Output Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="neon-input"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l} value={l}>{LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}</option>
                ))}
              </select>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium block mb-3 flex items-center gap-2"><User className="w-4 h-4 text-neon-purple" />Voice Presets</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {displayPresets.map((v) => {
                  const active = preset === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setPreset(v.id)}
                      className={cn(
                        'text-left rounded-xl p-3 transition-all border',
                        active
                          ? 'bg-gradient-to-br from-neon-blue/15 to-neon-purple/15 border-neon-purple/40 shadow-glow-purple'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20',
                      )}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <p className="font-semibold text-sm">{v.name}</p>
                          <p className="text-[10px] text-muted-foreground">{LANGUAGE_FLAGS[v.language]} {LANGUAGE_LABELS[v.language]} · {v.accent}</p>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-white/5 hover:bg-neon-purple/20 border border-white/10 flex items-center justify-center shrink-0 text-muted-foreground hover:text-white transition-colors">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={v.gender === 'Female' ? 'info' : v.gender === 'Male' ? 'default' : 'outline'} className="!text-[10px] !px-2 !py-0.5">{v.gender}</Badge>
                        <Badge variant="outline" className="!text-[10px] !px-2 !py-0.5">{v.pitch} Pitch</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div variants={fadeInUp} className="xl:col-span-3 space-y-4">
          <GlassPanel title="Input Text" description={`${text.length} characters · ${Math.ceil(text.split(/\s+/).length)} words`}>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste the text you want to synthesize into speech…"
              className="min-h-[160px] !text-base leading-relaxed"
            />

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Gauge className="w-4 h-4 text-neon-blue" />Playback Speed</span>
                  <Badge variant="info" className="!text-xs !px-2.5">{speed.toFixed(1)}x</Badge>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full bg-white/10 appearance-none cursor-pointer accent-neon-purple"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>0.5x</span><span>1.0x</span><span>1.5x</span><span>2.0x</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">{volume > 0 ? <Volume2 className="w-4 h-4 text-neon-cyan" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}Volume</span>
                  <Badge variant="outline" className="!text-xs !px-2.5">{Math.round(volume * 100)}%</Badge>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full bg-white/10 appearance-none cursor-pointer accent-neon-cyan"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Mute</span><span>50%</span><span>Max</span>
                </div>
              </div>
            </div>

            <Button
              className="neon-btn w-full mt-6 !rounded-xl"
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Synthesizing audio…' : 'Generate Voice'}
            </Button>
          </GlassPanel>

          <GlassPanel title="Audio Preview" description={generated ? `Voice: ${VOICE_PRESETS.find((v) => v.id === preset)?.name || '—'}` : 'Generate audio first'}>
            {!generated && !loading && (
              <div className="py-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center mb-4">
                  <Mic className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">No audio yet</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">Enter text and click Generate to synthesize speech.</p>
              </div>
            )}

            {loading && (
              <div className="py-12 space-y-4">
                <div className="h-12 w-full rounded-xl shimmer-line" />
                <div className="grid grid-cols-5 gap-2 h-24">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="rounded shimmer-line animate-pulse" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 40}ms`, alignSelf: 'end' }} />
                  ))}
                </div>
                <div className="h-10 w-48 mx-auto rounded-full shimmer-line" />
              </div>
            )}

            {generated && (
              <div className="space-y-5">
                <div className="grid grid-cols-5 gap-1.5 h-28 items-end">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const base = (Math.sin(i * 0.4) + 1) * 35 + Math.random() * 25;
                    const activated = (i / 40) * 100 < progress;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'rounded-t transition-all duration-150',
                          activated
                            ? 'bg-gradient-to-t from-neon-purple to-neon-cyan shadow-glow-cyan'
                            : 'bg-white/10',
                        )}
                        style={{ height: `${base}%` }}
                      />
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={reset}
                      className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      disabled={!generated}
                      className="w-16 h-16 rounded-full neon-btn !p-0 !rounded-full flex items-center justify-center shrink-0"
                    >
                      {playing ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                    </button>
                    <div className="flex-1 space-y-1">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.1}
                        value={progress}
                        onChange={(e) => setProgress(parseFloat(e.target.value))}
                        className="w-full h-2 rounded-full bg-white/10 appearance-none cursor-pointer accent-neon-purple"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>{formatTime(progress)}</span>
                        <span>0:22</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="success" className="!text-xs">MP3 · 128 kbps</Badge>
                    <span>324 KB</span>
                  </div>
                  <Button onClick={handleDownload} variant="glass" size="sm"><Download className="w-4 h-4" />Download MP3</Button>
                </div>
              </div>
            )}
          </GlassPanel>
        </motion.div>
      </div>
    </motion.div>
  );
}
