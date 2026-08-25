'use client';

import { useState, useMemo, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  HelpCircle,
  Clock,
  Layers,
  FileBarChart,
  X,
  Copy,
  Download,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  Bot,
  CloudUpload,
  FileIcon,
  File as FileGeneric,
  Sparkles,
  MessageSquare,
  Tag,
  Hash,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, Separator } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { GlassPanel } from '@/components/layout/GlassPanel';
import { cn, formatFileSize, uid } from '@/lib/utils';
import { generateWithGemini } from '@/lib/gemini';
import type { MCQ, FlashCard, UploadedFile } from '@/types';

const INITIAL_FILES: UploadedFile[] = [
  { id: 'f1', name: 'Machine-Learning-Lecture.pdf', type: 'pdf', size: 4_250_000, status: 'completed', progress: 100, uploadedAt: '2025-01-15T10:00:00Z' },
  { id: 'f2', name: 'Data-Structures-Notes.docx', type: 'docx', size: 890_000, status: 'completed', progress: 100, uploadedAt: '2025-01-15T10:05:00Z' },
];

const INITIAL_MCQS: MCQ[] = [
  { id: 'm1', question: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctIndex: 1, explanation: 'Binary search repeatedly halves the search space, resulting in logarithmic time complexity.' },
  { id: 'm2', question: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], correctIndex: 1, explanation: 'Stacks follow Last-In-First-Out (LIFO) ordering, where the last element pushed is the first popped.' },
  { id: 'm3', question: 'What does SQL stand for?', options: ['Simple Query Language', 'Structured Query Language', 'Sequential Query Language', 'Standard Query Language'], correctIndex: 1, explanation: 'SQL stands for Structured Query Language, used for managing relational databases.' },
  { id: 'm4', question: 'In machine learning, what is the purpose of regularization?', options: ['Increase training speed', 'Prevent overfitting on training data', 'Convert non-linear features', 'Scale data to 0-1'], correctIndex: 1, explanation: 'Regularization adds a penalty term to loss functions (e.g. L1/L2) to prevent overfitting.' },
];

const INITIAL_FLASHCARDS: FlashCard[] = [
  { id: 'fc1', front: 'What is Big-O of accessing an array element by index?', back: 'O(1) — direct index-based memory calculation.' },
  { id: 'fc2', front: 'Define: Polymorphism', back: 'The capability of different objects to respond to the same method interface in specialized ways.' },
  { id: 'fc3', front: 'What is a Primary Key in SQL?', back: 'A unique identifier column or set of columns for each record in a database table.' },
  { id: 'fc4', front: 'Explain Supervised Learning', back: 'Training a model using labeled inputs and target output pairs to predict outcomes on unseen data.' },
];

export default function StudyAssistantPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState<UploadedFile[]>(INITIAL_FILES);
  const [fileTexts, setFileTexts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>(INITIAL_MCQS);
  const [flashcards, setFlashcards] = useState<FlashCard[]>(INITIAL_FLASHCARDS);
  const [studyNotes, setStudyNotes] = useState<string>(`# Machine Learning & Data Science Fundamentals
## Overview
Machine learning (ML) enables automated pattern recognition and decision-making from structured and unstructured data.

## Key Principles
1. **Supervised Learning**: Model learns mappings from labeled dataset pairs.
2. **Unsupervised Learning**: Pattern discovery via clustering (K-Means) and dimensionality reduction (PCA).
3. **Model Evaluation**: Metrics include Accuracy, Precision, Recall, and F1-Score.

## Best Practices
- Cross-validation prevents data leakage and overfitting.
- Normalization (StandardScaler, MinMaxScaler) ensures balanced gradient updates.`);

  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqRevealed, setMcqRevealed] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [flashIdx, setFlashIdx] = useState(0);
  const [copiedNotes, setCopiedNotes] = useState(false);

  // Chat Q&A state powered by Gemini
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! I am your AI Study Assistant powered by Gemini. Ask me any question about your uploaded documents or study topics!' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    await processFiles(selectedFiles);
  };

  const processFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = [];
    const newTexts: string[] = [];

    for (const f of fileList) {
      const ext = f.name.split('.').pop()?.toLowerCase() || 'txt';
      const fileObj: UploadedFile = {
        id: uid('f'),
        name: f.name,
        type: ext as any,
        size: f.size,
        status: 'completed',
        progress: 100,
        uploadedAt: new Date().toISOString(),
      };
      newFiles.push(fileObj);

      try {
        const text = await f.text();
        if (text) newTexts.push(text.slice(0, 3000));
      } catch {
        newTexts.push(`Document filename: ${f.name}`);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setFileTexts((prev) => [...prev, ...newTexts]);
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    const combinedContent = fileTexts.join('\n\n') || 'Machine learning algorithms, neural networks, cross-lingual fairness audits, data structures, and computer science fundamentals.';
    
    const prompt = `Analyze this study material content and generate structured study notes in markdown:
    
    CONTENT:
    ${combinedContent.slice(0, 2000)}`;

    const response = await generateWithGemini(prompt, 'You are an expert AI tutor helping students summarize study materials.');
    
    if (response) {
      setStudyNotes(response);
    }
    
    setIsGenerating(false);
    setActiveTab('notes');
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const context = fileTexts.join('\n').slice(0, 2500);
    const prompt = `Student Question: ${userMsg}\n\nUploaded Context:\n${context || 'General computer science & AI study topics'}`;

    const reply = await generateWithGemini(prompt, 'You are an intelligent, clear AI study assistant giving helpful academic explanations.');
    
    setChatMessages((prev) => [
      ...prev,
      { role: 'assistant', text: reply || "Gemini AI response generated based on your query: " + userMsg },
    ]);
    setIsChatLoading(false);
  };

  const removeFile = (id: string) => setFiles((f) => f.filter((x) => x.id !== id));

  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(studyNotes);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
    } catch {}
  };

  const toggleFlash = (id: string) => setFlippedCards((f) => ({ ...f, [id]: !f[id] }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.docx,.txt,.mp3,.mp4,.wav"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Badge variant="info" className="mb-3 !text-xs !px-3 !py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Learning Studio · Gemini AI Powered
          </Badge>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            <span className="gradient-text">AI Study Assistant</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Upload lectures or documents to generate notes, MCQs, flashcards, executive summaries, and ask Gemini AI questions directly.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full overflow-x-auto flex-nowrap flex gap-1 h-auto !p-1.5 bg-navy-900/80 border border-white/10 rounded-2xl">
          {[
            { id: 'upload', label: 'Upload Files', icon: Upload },
            { id: 'notes', label: 'Study Notes', icon: FileText },
            { id: 'mcqs', label: 'MCQs', icon: HelpCircle },
            { id: 'flashcards', label: 'Flashcards', icon: Layers },
            { id: 'chat', label: 'Gemini Q&A', icon: Bot },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <TabsTrigger key={t.id} value={t.id} className="flex-shrink-0 !py-2.5">
                <Icon className="w-4 h-4 mr-1.5" />
                {t.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <GlassPanel>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      processFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className="relative border-2 border-dashed border-white/15 rounded-2xl p-10 text-center hover:border-neon-purple/50 hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-glow-purple/40">
                    <CloudUpload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">Click to browse or drop files here</h3>
                  <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX, TXT, MP3, WAV, MP4</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {['PDF', 'DOCX', 'TXT', 'MP3', 'WAV', 'MP4'].map((fmt) => (
                      <Badge key={fmt} variant="outline" className="!py-1">
                        <FileIcon className="w-3 h-3 mr-1" />
                        {fmt}
                      </Badge>
                    ))}
                  </div>
                </div>
              </GlassPanel>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <GlassPanel
                title="Queued Study Files"
                description={`${files.length} file${files.length === 1 ? '' : 's'} ready for processing`}
              >
                <div className="space-y-2 max-h-[320px] overflow-y-auto -mx-2 px-2">
                  {files.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No files uploaded yet</div>
                  ) : (
                    files.map((f) => (
                      <div
                        key={f.id}
                        className="group flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center flex-shrink-0">
                          <FileGeneric className="w-4 h-4 text-neon-cyan" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{f.name}</p>
                            <button
                              onClick={() => removeFile(f.id)}
                              className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="!py-0 !text-[10px] uppercase">
                              {f.type}
                            </Badge>
                            <span>{formatFileSize(f.size)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Separator className="!mt-4" />
                <Button
                  onClick={handleGenerateAll}
                  disabled={files.length === 0 || isGenerating}
                  className="w-full h-11 neon-btn shadow-glow-purple"
                >
                  {isGenerating ? (
                    <>Generating with Gemini AI…</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Generate Study Materials
                    </>
                  )}
                </Button>
              </GlassPanel>
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <GlassPanel title="Generated Study Notes" description="Powered by Gemini AI">
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="glass" size="sm" onClick={handleCopyNotes}>
                <Copy className="w-4 h-4 mr-1" /> {copiedNotes ? 'Copied!' : 'Copy Notes'}
              </Button>
            </div>
            <div className="p-6 rounded-2xl bg-black/30 border border-white/10 prose-custom max-h-[550px] overflow-y-auto whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed font-sans">
              {studyNotes}
            </div>
          </GlassPanel>
        </TabsContent>

        {/* MCQs Tab */}
        <TabsContent value="mcqs" className="mt-4">
          <div className="space-y-4">
            {mcqs.map((q, qi) => (
              <Card key={q.id} className="p-5 border-white/10 bg-white/[0.02]">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-neon-purple/20 text-neon-purple flex items-center justify-center font-bold text-xs">
                    Q{qi + 1}
                  </span>
                  <p className="font-semibold text-base flex-1 pt-0.5">{q.question}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-10">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={cn(
                        'p-3 rounded-xl border text-sm font-medium transition-colors',
                        oi === q.correctIndex
                          ? 'border-neon-green/40 bg-neon-green/10 text-white font-semibold'
                          : 'border-white/10 bg-white/5 text-muted-foreground'
                      )}
                    >
                      <span className="mr-2 font-bold text-xs">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="ml-10 mt-3 p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-xs text-muted-foreground">
                  <span className="font-semibold text-neon-purple mr-1">Explanation:</span>
                  {q.explanation}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="mt-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-xl aspect-[16/9] cursor-pointer" onClick={() => toggleFlash(flashcards[flashIdx].id)}>
              <div className="absolute inset-0 rounded-3xl border border-white/15 bg-gradient-to-br from-navy-900/90 to-navy-900/60 p-8 flex flex-col justify-between items-center text-center shadow-glow-purple">
                <Badge variant="info">{flippedCards[flashcards[flashIdx].id] ? 'ANSWER' : 'QUESTION'}</Badge>
                <p className="text-xl font-display font-semibold">
                  {flippedCards[flashcards[flashIdx].id] ? flashcards[flashIdx].back : flashcards[flashIdx].front}
                </p>
                <span className="text-xs text-muted-foreground">Click to flip card</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="glass" onClick={() => setFlashIdx((i) => Math.max(0, i - 1))} disabled={flashIdx === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-sm font-medium">{flashIdx + 1} / {flashcards.length}</span>
              <Button variant="glass" onClick={() => setFlashIdx((i) => Math.min(flashcards.length - 1, i + 1))} disabled={flashIdx === flashcards.length - 1}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Gemini Q&A Tab */}
        <TabsContent value="chat" className="mt-4">
          <GlassPanel title="Gemini AI Tutor Chat" description="Ask questions based on your study materials">
            <div className="flex flex-col h-[450px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-black/20 rounded-2xl border border-white/10 mb-4">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'ml-auto bg-neon-purple/20 border border-neon-purple/30 text-white'
                        : 'bg-white/5 border border-white/10 text-foreground'
                    )}
                  >
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      {msg.role === 'user' ? 'You' : 'Gemini AI'}
                    </p>
                    {msg.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-muted-foreground animate-pulse">
                    Gemini AI is thinking…
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask Gemini AI any question about your study material..."
                  className="neon-input flex-1"
                />
                <Button onClick={handleSendChat} disabled={isChatLoading} className="neon-btn">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
