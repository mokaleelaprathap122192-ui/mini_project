'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Headphones,
  Video,
  Link2,
  FileUp,
  X,
  File,
  Youtube,
  Newspaper,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/label';
import { useUploadStore } from '@/stores/upload';
import type { InputType } from '@/types';
import { cn, formatFileSize } from '@/lib/utils';

interface FileTypeChip {
  type: InputType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accept?: string;
}

const FILE_TYPES: FileTypeChip[] = [
  { type: 'pdf', label: 'PDF', icon: FileText, accept: '.pdf' },
  { type: 'docx', label: 'DOCX', icon: FileText, accept: '.docx,.doc' },
  { type: 'txt', label: 'TXT', icon: FileText, accept: '.txt' },
  { type: 'mp3', label: 'MP3', icon: Headphones, accept: '.mp3' },
  { type: 'wav', label: 'WAV', icon: Headphones, accept: '.wav' },
  { type: 'mp4', label: 'MP4', icon: Video, accept: '.mp4' },
  { type: 'youtube', label: 'YouTube', icon: Youtube },
  { type: 'news_url', label: 'News URL', icon: Newspaper },
];

export function DropZone() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setDragging = useUploadStore((s) => s.setDragging);
  const addFile = useUploadStore((s) => s.addFile);
  const simulateUpload = useUploadStore((s) => s.simulateUpload);
  const isDragging = useUploadStore((s) => s.isDragging);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [activeType, setActiveType] = useState<InputType | null>(null);
  const [urlType, setUrlType] = useState<'youtube' | 'news_url'>('youtube');

  const processFiles = useCallback(
    async (files: File[]) => {
      setSelectedFiles((prev) => [...prev, ...files]);
      for (const f of files) {
        const ext = f.name.split('.').pop()?.toLowerCase() || '';
        let type: InputType = 'txt';
        if (ext === 'pdf') type = 'pdf';
        else if (ext === 'docx' || ext === 'doc') type = 'docx';
        else if (ext === 'txt') type = 'txt';
        else if (ext === 'mp3') type = 'mp3';
        else if (ext === 'wav') type = 'wav';
        else if (ext === 'mp4') type = 'mp4';
        const added = await addFile(f.name, type, f.size);
        simulateUpload(added.id);
      }
    },
    [addFile, simulateUpload],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, [setDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragging(false);
  }, [setDragging]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length === 0) return;
      await processFiles(dropped);
    },
    [setDragging, processFiles],
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) await processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChipClick = (chip: FileTypeChip) => {
    if (chip.type === 'youtube' || chip.type === 'news_url') {
      setActiveTab('url');
      setUrlType(chip.type);
      setActiveType(chip.type);
    } else {
      setActiveTab('file');
      setActiveType(chip.type);
      const attr = chip.accept || '';
      if (fileInputRef.current) {
        fileInputRef.current.accept = attr;
        fileInputRef.current.click();
      }
    }
  };

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    const type = urlType;
    const name = type === 'youtube' ? `YouTube: ${url.slice(0, 40)}...` : `News: ${url.slice(0, 40)}...`;
    const added = await addFile(name, type, 0);
    simulateUpload(added.id);
    setUrl('');
  };

  const removeSelected = (i: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILE_TYPES.map((chip) => {
          const Icon = chip.icon;
          const isActive = activeType === chip.type;
          return (
            <button
              key={chip.type}
              onClick={() => handleChipClick(chip)}
              className={cn(
                'inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium transition-all border',
                isActive
                  ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white border-neon-purple/50 shadow-glow-purple/30'
                  : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {chip.label}
            </button>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto">
          <TabsTrigger value="file">
            <FileUp className="w-4 h-4 mr-1.5" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link2 className="w-4 h-4 mr-1.5" />
            URL Input
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <motion.div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative mx-auto cursor-pointer select-none overflow-hidden rounded-2xl transition-all duration-300',
              'w-full max-w-[600px] h-[240px] flex flex-col items-center justify-center',
              'border-2 border-dashed',
              isDragging
                ? 'border-transparent bg-gradient-to-br from-neon-blue/15 via-neon-purple/15 to-neon-cyan/15 shadow-glow-purple scale-[1.01]'
                : 'border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]',
            )}
            style={
              isDragging
                ? {
                    borderImage:
                      'linear-gradient(135deg, #2563EB, #7C3AED, #06B6D4) 1',
                  }
                : undefined
            }
          >
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-neon-purple/5 to-neon-cyan/5"
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={isDragging ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative z-10 flex flex-col items-center px-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 flex items-center justify-center mb-4 shadow-glow-purple/50">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <p className="font-display font-semibold text-lg text-white mb-1">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or <span className="text-neon-cyan font-medium">browse</span> from your computer
              </p>
              <Badge variant="outline" className="!text-[11px] !py-1">
                Supports PDF, DOCX, TXT, MP3, WAV, MP4 · Max 100MB
              </Badge>
            </motion.div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.mp3,.wav,.mp4"
            />
          </motion.div>

          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-2 max-w-[600px] mx-auto"
            >
              {selectedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue/15 to-neon-purple/15 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(f.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelected(i);
                    }}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-neon-red hover:bg-neon-red/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="url">
          <div className="mx-auto w-full max-w-[600px] p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => {
                  setUrlType('youtube');
                  setActiveType('youtube');
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-all border',
                  urlType === 'youtube'
                    ? 'bg-neon-red/15 text-neon-red border-neon-red/30'
                    : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white',
                )}
              >
                <Youtube className="w-4 h-4" /> YouTube
              </button>
              <button
                onClick={() => {
                  setUrlType('news_url');
                  setActiveType('news_url');
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-all border',
                  urlType === 'news_url'
                    ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30'
                    : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white',
                )}
              >
                <Newspaper className="w-4 h-4" /> News Article
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/80">
                {urlType === 'youtube' ? 'YouTube Video URL' : 'News Article URL'}
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  placeholder={
                    urlType === 'youtube'
                      ? 'https://youtube.com/watch?v=...'
                      : 'https://news-site.com/article/...'
                  }
                  className="pl-10"
                />
              </div>
              <Button onClick={handleUrlSubmit} disabled={!url.trim()} className="w-full">
                <Upload className="w-4 h-4" />
                Import from URL
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll automatically transcribe audio and extract article text.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
