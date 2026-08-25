import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'line' | 'circle';
  count?: number;
  className?: string;
  width?: string;
  height?: string;
}

export default function LoadingSkeleton({
  variant = 'line',
  count = 1,
  className,
  width,
  height,
}: LoadingSkeletonProps) {
  const base = cn('shimmer-line rounded-xl', className);

  if (variant === 'circle') {
    return (
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn('shimmer-line rounded-full', className)}
            style={{ width: width ?? '40px', height: height ?? '40px' }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass p-5 space-y-4">
            <div
              className={cn(
                base,
                'h-10 w-10 rounded-xl',
              )}
            />
            <div className={cn(base, 'h-5 w-3/4 rounded-lg')} />
            <div className={cn(base, 'h-4 w-full rounded-lg')} />
            <div className={cn(base, 'h-4 w-5/6 rounded-lg')} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(base, 'rounded-lg', className)}
          style={{
            width: width ?? (i === count - 1 ? '60%' : '100%'),
            height: height ?? (i === 0 ? '1.25rem' : '1rem'),
          }}
        />
      ))}
    </div>
  );
}
