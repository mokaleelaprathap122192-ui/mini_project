'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { LanguageDetector } from '@/components/nlp/LanguageDetector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { generateLanguageDetection } from '@/mock/generators';
import { fetchLanguageDetection } from '@/lib/api';
import type { LanguageDetection } from '@/types';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '@/types';
import { sleep } from '@/lib/utils';

const SAMPLE_TEXTS = [
  { label: 'Hindi', text: 'भारत एक विविधतापूर्ण देश है जहाँ अनेक भाषाएँ बोली जाती हैं। यहाँ की संस्कृति और परंपराएँ विश्व प्रसिद्ध हैं।' },
  { label: 'Tamil', text: 'இந்தியா ஒரு பன்முக நாடு. பல்வேறு மொழிகள், பண்பாடுகள் இங்கு வாழ்கின்றன. தமிழ் மொழி மிகவும் பழமையான ஒன்று.' },
  { label: 'English', text: 'India is a diverse country with rich cultural heritage. Twenty-two official languages are recognized across its twenty-eight states.' },
  { label: 'Bengali', text: 'বাংলা একটি ইন্দো-আর্য ভাষা, যা প্রধানত বাংলাদেশ ও ভারতের পশ্চিমবঙ্গে বলা হয়। এটি বিশ্বের ষষ্ঠ সবচেয়ে বেশি বলা ভাষা।' },
];

export default function LanguageDetectPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<LanguageDetection | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const detected = await fetchLanguageDetection(text);
      setResult(detected);
    } catch (err) {
      console.error(err);
      setResult(generateLanguageDetection({ text }));
    } finally {
      setLoading(false);
    }
  };

  const handleSample = (sample: string) => {
    setText(sample);
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Tabs defaultValue="detect">
        <TabsList className="!bg-white/[0.04] !border !border-white/10 !p-1.5 !rounded-2xl">
          <TabsTrigger
            value="detect"
            className="!rounded-xl !px-5 !py-2.5 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-neon-blue/30 data-[state=active]:!to-neon-purple/30 data-[state=active]:!text-white"
          >
            <Search className="w-4.5 h-4.5 mr-2" />
            Detect
          </TabsTrigger>
          <TabsTrigger
            value="samples"
            className="!rounded-xl !px-5 !py-2.5 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-neon-blue/30 data-[state=active]:!to-neon-purple/30 data-[state=active]:!text-white"
          >
            <Sparkles className="w-4.5 h-4.5 mr-2" />
            Sample Texts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detect">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <GlassPanel
              title="Enter Text"
              description="Type or paste any tex..."
              className="lg:col-span-2"
            >
              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text in any Indian language..."
                    className="min-h-[220px] text-base leading-relaxed !bg-white/[0.03] !border-white/10"
                  />
                  <div className="absolute bottom-3 right-3 text-[11px] text-muted-foreground font-mono">
                    {text.length} chars
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_LANGUAGES.slice(0, 6).map((l) => (
                      <button
                        key={l}
                        type="button"
                        className="px-3.5 py-2 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/25 transition-all text-sm text-foreground/90 hover:text-white"
                      >
                        {LANGUAGE_LABELS[l]}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="px-3.5 py-2 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/25 transition-all text-sm text-foreground/90 hover:text-white"
                    >
                      +{SUPPORTED_LANGUAGES.length - 6} more
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        setText('');
                        setResult(null);
                      }}
                      disabled={!text && !result}
                      className="!rounded-xl !px-5 !py-2"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleDetect}
                      disabled={!text.trim() || loading}
                      size="icon"
                      className="w-11 h-11 rounded-xl"
                    >
                      {loading ? (
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      ) : (
                        <Globe className="w-4.5 h-4.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </GlassPanel>

            <div className="lg:col-span-3">
              <LanguageDetector result={result} loading={loading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="samples">
          <GlassPanel title="Sample Texts" description="Click to load a pre-written sample in various Indian languages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_TEXTS.map((sample, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -2 }}
                  onClick={() => handleSample(sample.text)}
                  className="p-5 rounded-2xl text-left bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-neon-purple/30 transition-all group"
                >
                  <Badge variant="outline" className="mb-3 !text-[10px]">
                    {sample.label}
                  </Badge>
                  <p className="text-sm leading-relaxed text-foreground/85 group-hover:text-white transition-colors line-clamp-4">
                    {sample.text}
                  </p>
                  <p className="mt-3 text-xs text-neon-cyan inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Load sample →
                  </p>
                </motion.button>
              ))}
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
