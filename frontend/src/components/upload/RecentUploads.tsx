'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  Headphones,
  Video,
  Youtube,
  Newspaper,
  Trash2,
  Eye,
  Play,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/label';
import { useUploadStore } from '@/stores/upload';
import { usePipelineStore } from '@/stores/pipeline';
import { useRouter } from 'next/navigation';
import type { InputType, UploadedFile, UploadStatus } from '@/types';
import { cn, formatDate, formatFileSize } from '@/lib/utils';

const TYPE_ICON: Record<InputType, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  docx: FileText,
  txt: FileText,
  mp3: Headphones,
  wav: Headphones,
  mp4: Video,
  youtube: Youtube,
  news_url: Newspaper,
  text: FileText,
};

const STATUS_BADGE: Record<UploadStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  completed: 'success',
  processing: 'warning',
  uploading: 'info',
  failed: 'danger',
};

const STATUS_ICON: Record<UploadStatus, React.ComponentType<{ className?: string }>> = {
  completed: CheckCircle2,
  processing: Loader2,
  uploading: UploadCloud,
  failed: XCircle,
};

export function RecentUploads() {
  const router = useRouter();
  const files = useUploadStore((s) => s.files);
  const removeFile = useUploadStore((s) => s.removeFile);
  const initPipeline = usePipelineStore((s) => s.initPipeline);

  const handleRunPipeline = (file: UploadedFile) => {
    initPipeline(file);
    const pid = usePipelineStore.getState().runId;
    if (pid) router.push(`/dashboard/pipeline/${pid}`);
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <UploadCloud className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-1">No uploads yet</h3>
        <p className="text-muted-foreground/70 mb-4 max-w-sm">
          Upload documents, audio files to get started with cross-lingual fairness analysis.
        </p>
        <Button asChild>
          <Link href="/dashboard/upload">
          <UploadCloud className="w-4 h-4" /> Upload a file
        </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] overflow-x-auto">
      <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10 bg-white/[0.02]">
          <th className="text-left font-medium text-muted-foreground/80 font-semibold px-4 py-3 pl-6">File</th>
          <th className="text-left font-medium text-muted-foreground/80 font-semibold px-4 py-3">Type</th>
          <th className="text-left font-medium text-muted-foreground/80 font-semibold px-4 py-3">Size</th>
          <th className="text-left font-medium text-muted-foreground/80 font-semibold px-4 py-3">Status</th>
          <th className="text-left font-medium text-muted-foreground/80 font-semibold px-4 py-3 w-48">Progress</th>
          <th className="text-left font-medium text-muted-foreground/80 font-semibold px-4 py-3">Uploaded</th>
          <th className="text-right font-medium text-muted-foreground/80 font-semibold px-4 py-3 pr-6">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        <AnimatePresence>
          {files.map((f, i) => {
          const Icon = TYPE_ICON[f.type];
          const StatusIcon = STATUS_ICON[f.status];
          return (
            <motion.tr
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group hover:bg-white/[0.03] transition-colors"
            >
              <td className="px-4 py-3 pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue/15 to-neon-purple/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <span className="font-medium truncate max-w-[240px]">{f.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="uppercase !text-[10px]">
                  {f.type}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {f.size > 0 ? formatFileSize(f.size) : '—'}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_BADGE[f.status]} className="!text-[11px]">
                  <StatusIcon className={cn('w-3 h-3 mr-1', (f.status === 'uploading' || f.status === 'processing') && 'animate-spin')} />
                  {f.status}
                </Badge>
              </td>
              <td className="px-4 py-3 w-48">
                <div className="flex items-center gap-2">
                  <Progress value={f.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground tabular-nums w-9">
                    {f.progress}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatDate(f.uploadedAt)}
              </td>
              <td className="px-4 py-3 pr-6">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 !rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 !rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-neon-cyan hover:text-neon-cyan"
                    title="Run Pipeline"
                    disabled={f.status !== 'completed'}
                    onClick={() => handleRunPipeline(f)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 !rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-neon-red hover:text-neon-red hover:!bg-neon-red/10"
                    title="Delete"
                    onClick={() => removeFile(f.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </motion.tr>
          );
        })}
        </AnimatePresence>
      </tbody>
    </table>
    </div>
  );
}
