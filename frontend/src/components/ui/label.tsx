import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/90',
        className,
      )}
      {...props}
    />
  );
}

export { Label };

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}) {
  const variants: Record<string, string> = {
    default: 'bg-white/10 text-foreground border border-white/10',
    success: 'bg-neon-green/15 text-neon-green border border-neon-green/30',
    warning: 'bg-neon-amber/15 text-neon-amber border border-neon-amber/30',
    danger: 'bg-neon-red/15 text-neon-red border border-neon-red/30',
    info: 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30',
    outline: 'border border-white/20 text-foreground',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('h-px w-full bg-white/10 my-4', className)} {...props} />
  );
}
