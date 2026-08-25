import { create } from 'zustand';
import type {
  PipelineStage,
  PipelineStageId,
  PIPELINE_STAGES as STAGES,
  UploadedFile,
} from '@/types';
import { PIPELINE_STAGES } from '@/types';
import { uid } from '@/lib/utils';

interface PipelineState {
  runId: string | null;
  stages: PipelineStage[];
  activeIndex: number;
  overallProgress: number;
  running: boolean;
  currentFile: UploadedFile | null;
  initPipeline: (file?: UploadedFile) => void;
  start: () => void;
  setStageStatus: (id: PipelineStageId, status: PipelineStage['status'], progress?: number) => void;
  reset: () => void;
  simulateRun: () => Promise<void>;
}

function freshStages(): PipelineStage[] {
  return PIPELINE_STAGES.map((s) => ({
    id: s.id,
    label: s.label,
    status: 'pending',
    progress: 0,
  }));
}

export const usePipelineStore = create<PipelineState>()((set, get) => ({
  runId: null,
  stages: freshStages(),
  activeIndex: -1,
  overallProgress: 0,
  running: false,
  currentFile: null,
  initPipeline: (file) =>
    set({
      runId: uid('run'),
      stages: freshStages(),
      activeIndex: -1,
      overallProgress: 0,
      running: false,
      currentFile: file ?? null,
    }),
  start: () => set({ running: true }),
  setStageStatus: (id, status, progress) =>
    set((s) => {
      const stages = s.stages.map((st) =>
        st.id === id
          ? {
              ...st,
              status,
              progress: progress ?? st.progress,
              startedAt: status === 'active' ? new Date().toISOString() : st.startedAt,
              finishedAt: ['completed', 'error', 'skipped'].includes(status)
                ? new Date().toISOString()
                : st.finishedAt,
            }
          : st,
      );
      const idx = stages.findIndex((st) => st.id === id);
      const done = stages.filter((st) => st.status === 'completed').length;
      const overall = Math.round((done / stages.length) * 100);
      return {
        stages,
        activeIndex: idx,
        overallProgress: Math.max(s.overallProgress, overall),
      };
    }),
  reset: () => set({ stages: freshStages(), activeIndex: -1, overallProgress: 0, running: false }),
  simulateRun: async () => {
    const state = get();
    if (state.running) return;
    set({ running: true, overallProgress: 0, activeIndex: 0 });
    const stages = get().stages;
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      set((st) => ({
        stages: st.stages.map((x, idx) =>
          idx === i ? { ...x, status: 'active' as const, startedAt: new Date().toISOString() } : x,
        ),
        activeIndex: i,
      }));
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 180));
        set((st) => ({
          stages: st.stages.map((x, idx) =>
            idx === i ? { ...x, progress: p } : x,
          ),
          overallProgress: Math.round(((i + p / 100) / stages.length) * 100),
        }));
      }
      set((st) => ({
        stages: st.stages.map((x, idx) =>
          idx === i
            ? { ...x, status: 'completed' as const, progress: 100, finishedAt: new Date().toISOString() }
            : x,
        ),
        overallProgress: Math.round(((i + 1) / stages.length) * 100),
      }));
    }
    set({ running: false, activeIndex: -1 });
  },
}));

export type { STAGES };
