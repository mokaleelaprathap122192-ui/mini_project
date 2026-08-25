"use client";

import { useRouter } from 'next/navigation';
import { usePipelineStore } from '@/stores/pipeline';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/layout/GlassPanel';

export default function PipelineIndexPage() {
  const router = useRouter();
  const initPipeline = usePipelineStore((s) => s.initPipeline);

  const handleStart = () => {
    initPipeline();
    const runId = (Math.random() + 1).toString(36).slice(2, 9); // temporary id until store sets uid
    // prefer to read the store runId, but navigate after a small delay so store updates
    setTimeout(() => {
      const stateRunId = (usePipelineStore.getState().runId as string) || runId;
      router.push(`/dashboard/pipeline/${stateRunId}`);
    }, 50);
  };

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <GlassPanel title="Pipeline Runs" description="Start a new pipeline run or open an existing run">
        <div className="py-6">
          <p className="text-sm text-muted-foreground mb-4">
            This page lists pipeline runs. You can start a new run below — after starting you will
            be redirected to the run detail view.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleStart}>Start New Run</Button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
