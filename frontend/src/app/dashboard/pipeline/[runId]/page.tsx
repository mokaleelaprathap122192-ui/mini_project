// Placeholder pipeline run page — restored to avoid broken imports and routing.
// Replace with the original implementation if you have a backup.

import Link from 'next/link';

interface Props {
  params: { runId: string };
}

export default function Page({ params }: Props) {
  const { runId } = params;

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <h1 className="text-2xl font-display font-bold">Pipeline run: {runId}</h1>
      <p className="mt-3 text-muted-foreground">
        This pipeline run page was restored as a placeholder. If you have the original
        implementation, paste it here and I&apos;ll restore it exactly.
      </p>

      <div className="mt-6">
        <Link href="/dashboard" className="text-neon-cyan underline">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
