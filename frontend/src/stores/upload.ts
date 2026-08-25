import { create } from 'zustand';
import type { InputType, UploadedFile } from '@/types';
import { uid, sleep } from '@/lib/utils';

interface UploadStore {
  files: UploadedFile[];
  isDragging: boolean;
  setDragging: (v: boolean) => void;
  addFile: (name: string, type: InputType, size: number) => Promise<UploadedFile>;
  simulateUpload: (id: string) => Promise<void>;
  removeFile: (id: string) => void;
  updateFile: (id: string, patch: Partial<UploadedFile>) => void;
}

const SEED: UploadedFile[] = [
  {
    id: 'upl_seed_1',
    name: 'hindi_sentiment_review.txt',
    type: 'txt',
    size: 18432,
    status: 'completed',
    progress: 100,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'upl_seed_2',
    name: 'tamil_news_article.pdf',
    type: 'pdf',
    size: 542000,
    status: 'completed',
    progress: 100,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'upl_seed_3',
    name: 'bengali_podcast.mp3',
    type: 'mp3',
    size: 12400000,
    status: 'completed',
    progress: 100,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: 'upl_seed_4',
    name: 'tamil_news_article.pdf',
    type: 'pdf',
    size: 542000,
    status: 'completed',
    progress: 100,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
];

export const useUploadStore = create<UploadStore>()((set, get) => ({
  files: SEED,
  isDragging: false,
  setDragging: (v) => set({ isDragging: v }),
  addFile: async (name, type, size) => {
    const id = uid('upl');
    const file: UploadedFile = {
      id,
      name,
      type,
      size,
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date().toISOString(),
    };
    set((s) => ({ files: [file, ...s.files] }));
    return file;
  },
  simulateUpload: async (id) => {
    for (let p = 0; p <= 100; p += 10) {
      await sleep(80);
      set((s) => ({
        files: s.files.map((f) => (f.id === id ? { ...f, progress: p } : f)),
      }));
    }
    set((s) => ({
      files: s.files.map((f) =>
        f.id === id ? { ...f, status: 'processing', progress: 100 } : f,
      ),
    }));
    await sleep(700);
    set((s) => ({
      files: s.files.map((f) => (f.id === id ? { ...f, status: 'completed' } : f)),
    }));
  },
  removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  updateFile: (id, patch) =>
    set((s) => ({ files: s.files.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
}));
