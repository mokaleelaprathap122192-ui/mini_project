import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  eyebrow,
  align = 'center',
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3 py-1 text-xs font-medium text-neon-purple tracking-wider uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-purple shadow-glow-purple" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
        <span className="gradient-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          'mt-2 h-0.5 w-24 rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan shadow-glow-purple',
          align === 'center' ? 'mx-auto' : '',
        )}
      />
    </div>
  );
}
