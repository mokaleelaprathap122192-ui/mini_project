'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  Copy,
  Download,
  Languages,
  Check,
  Volume2,
  Globe2,
  ChevronDown,
  Loader2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/label';
import { fetchTranslation } from '@/lib/api';
import type { Language, TranslationResult } from '@/types';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES } from '@/types';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  value: Language;
  onChange: (l: Language) => void;
  side: 'source' | 'target';
  exclude?: Language;
}

function LanguageSelector({ value, onChange, side, exclude }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const options = exclude ? SUPPORTED_LANGUAGES.filter((l) => l !== exclude) : SUPPORTED_LANGUAGES;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 h-10 pl-2.5 pr-3 rounded-xl transition-all',
          'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20',
        )}
      >
        <span className="text-lg">{LANGUAGE_FLAGS[value]}</span>
        <span className="text-sm font-medium">{LANGUAGE_LABELS[value]}</span>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              className={cn(
                'absolute z-20 mt-2 w-60 max-h-72 overflow-y-auto p-1.5 rounded-2xl border border-white/10',
                'bg-navy-900/95 backdrop-blur-xl shadow-glow-purple/40',
                side === 'target' ? 'right-0' : 'left-0',
              )}
            >
              {options.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onChange(lang);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all',
                    value === lang
                      ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white'
                      : 'text-foreground/80 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
                  <span className="text-sm font-medium flex-1">{LANGUAGE_LABELS[lang]}</span>
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">
                    {lang}
                  </span>
                  {value === lang && <Check className="w-4 h-4 text-neon-cyan" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function EngineBadge({ engine }: { engine: TranslationResult['engine'] }) {
  const map: Record<TranslationResult['engine'], { label: string; color: string; icon?: string }> = {
    indictrans2: { label: 'IndicTrans2', color: '!bg-neon-green/20 !text-neon-green !border-neon-green/40' },
    google: { label: 'Google Translate', color: '!bg-neon-blue/20 !text-neon-blue !border-neon-blue/40' },
    gemini: { label: 'Gemini', color: '!bg-neon-purple/20 !text-neon-purple !border-neon-purple/40' },
    mock: { label: 'Mock', color: '!bg-red-500/20 !text-red-400 !border-red-400/40' },
    noop: { label: 'Same language', color: '!bg-white/10 !text-white/80 !border-white/20' },
  };
  const info = map[engine];
  return (
    <Badge variant="outline" className={cn('!text-[11px] !rounded-full', info.color)}>
      {info.label}
    </Badge>
  );
}

export function TranslatorPanel() {
  const [sourceLang, setSourceLang] = useState<Language>('en');
  const [targetLang, setTargetLang] = useState<Language>('hi');
  const [sourceText, setSourceText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<'source' | 'target' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSwap = () => {
    const prevSource = sourceLang;
    const prevText = sourceText;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    setSourceText(result?.translatedText || prevText);
    setResult(null);
    setError(null);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const tr = await fetchTranslation(sourceText, targetLang, { sourceLang });
      setResult(tr);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Translation failed.';
      if (message.includes('400') || message.includes('No translation API keys')) {
        setError(
          'backend/.env में कम से कम एक API key set करें: INDICTRANS2_API_KEY, GOOGLE_TRANSLATE_API_KEY, या GEMINI_API_KEY.',
        );
      } else if (message.includes('424')) {
        setError('सभी 3 engines विफल हुए. कृपया API keys की validity जाँचें और language pair दोबारा सेट करें.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (which: 'source' | 'target', text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1400);
  };

  const handleDownload = () => {
    if (!result) return;
    const content =
      `Source (${LANGUAGE_LABELS[result.sourceLanguage]}):\n${result.originalText}\n\n` +
      `Translation (${LANGUAGE_LABELS[result.targetLanguage]}) · Engine: ${result.engine}\n${result.translatedText}\n\n` +
      `Confidence: ${Math.round(result.confidence * 100)}%`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation_${result.sourceLanguage}_to_${result.targetLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <GlassPanel
          title="Source Text"
          description="Enter text to translate"
          padding="none"
          className="!bg-white/[0.03] h-full"
        >
          <div className="p-5 flex flex-col h-full min-h-[380px]">
            <div className="flex items-center justify-between mb-3">
              <LanguageSelector value={sourceLang} onChange={setSourceLang} side="source" />
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="!text-[10px]">
                  <Globe2 className="w-3 h-3 mr-1" />
                  {SUPPORTED_LANGUAGES.length} languages
                </Badge>
              </div>
            </div>
            <div className="relative flex-1">
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text in any Indian language or English..."
                className="h-full min-h-[220px] resize-none bg-white/[0.02] border-white/5 focus:border-neon-purple/40 text-base leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {sourceText.length} chars
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="w-8 h-8 !rounded-lg text-muted-foreground hover:text-white" title="Listen">
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 !rounded-lg text-muted-foreground hover:text-white"
                  title="Copy"
                  disabled={!sourceText}
                  onClick={() => handleCopy('source', sourceText)}
                >
                  {copied === 'source' ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={handleTranslate}
                disabled={!sourceText.trim() || loading}
                size="sm"
                className="min-w-[120px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Translating...' : 'Translate'}
              </Button>
            </div>
          </div>
        </GlassPanel>

        <div className="hidden lg:flex flex-col items-center justify-center py-4 relative">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <Button
              variant="glass"
              size="icon"
              onClick={handleSwap}
              className="w-12 h-12 !rounded-2xl shadow-glow-purple/40 group hover:rotate-180 transition-transform duration-500"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-5 h-5 group-hover:-rotate-90 transition-transform" />
            </Button>
            <Badge variant="outline" className="!text-[10px] !px-2 !py-0.5">Swap</Badge>
          </div>
        </div>

        <GlassPanel
          title="Translation"
          description="Target language output"
          padding="none"
          className="!bg-white/[0.03] h-full"
        >
          <div className="p-5 flex flex-col h-full min-h-[380px]">
            <div className="flex items-center justify-between mb-3">
              <LanguageSelector value={targetLang} onChange={setTargetLang} side="target" exclude={sourceLang} />
              {result && (
                <div className="flex items-center gap-2">
                  <EngineBadge engine={result.engine} />
                  <Badge
                    variant={result.confidence > 0.9 ? 'success' : result.confidence > 0.75 ? 'info' : 'warning'}
                    className="!text-[11px]"
                  >
                    {Math.round(result.confidence * 100)}%
                  </Badge>
                </div>
              )}
            </div>
            <div className="relative flex-1 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 flex items-center justify-center"
                    >
                      <Languages className="w-6 h-6 text-neon-cyan" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                      Translating to {LANGUAGE_LABELS[targetLang]}...
                    </p>
                    <div className="w-36 space-y-1.5">
                      <div className="h-1.5 rounded-full shimmer-line" />
                      <div className="h-1.5 rounded-full shimmer-line w-2/3" />
                      <div className="h-1.5 rounded-full shimmer-line w-1/2" />
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 p-5 overflow-y-auto"
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        {error.includes('API key') ? (
                          <KeyRound className="w-6 h-6 text-red-400" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <p className="text-[13px] text-red-300/90 leading-relaxed max-w-sm">{error}</p>
                      <p className="text-[11px] text-muted-foreground/80 max-w-xs leading-relaxed">
                        Translation engine priority — <span className="text-neon-green">IndicTrans2</span> →{' '}
                        <span className="text-neon-blue">Google</span> →{' '}
                        <span className="text-neon-purple">Gemini</span>
                      </p>
                    </div>
                  </motion.div>
                ) : result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 p-4 overflow-y-auto"
                  >
                    <p className="text-base leading-relaxed text-white/95 whitespace-pre-wrap">
                      {result.translatedText}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-3">
                      <Languages className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Translation will appear here</p>
                    <p className="text-xs text-muted-foreground/70 max-w-[260px]">
                      Write source text and click <span className="text-white font-medium">Translate</span>. Output is generated by one of: IndicTrans2 → Google → Gemini.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <div className="text-xs text-muted-foreground font-mono">
                {result
                  ? `${result.translatedText.length} chars · ${result.translatedText.split(/\s+/).filter(Boolean).length} words`
                  : '—'}
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="w-8 h-8 !rounded-lg text-muted-foreground hover:text-white" title="Listen" disabled={!result}>
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 !rounded-lg text-muted-foreground hover:text-white"
                  title="Download"
                  disabled={!result}
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 !rounded-lg text-muted-foreground hover:text-white"
                  title="Copy"
                  disabled={!result}
                  onClick={() => result && handleCopy('target', result.translatedText)}
                >
                  {copied === 'target' ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="lg:hidden flex justify-center -mt-2 mb-2">
        <Button variant="glass" size="icon" onClick={handleSwap} className="w-10 h-10 !rounded-xl shadow-glow-purple/30">
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
