import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface GlassPanelProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
  gradientBorder?: boolean;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}

export function GlassPanel({
  title,
  description,
  children,
  className,
  padding = 'default',
  gradientBorder = false,
  icon,
  right,
}: GlassPanelProps) {
  return (
    <div className={cn(gradientBorder && 'gradient-border')}>
      <Card
        className={cn(
          padding === 'none' ? '!p-0' : '',
          className,
        )}
      >
        {(title || description || icon || right) && (
          <CardHeader className={cn(padding === 'sm' && '!p-4')}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
                <div className="min-w-0">
                  {title && <CardTitle className="truncate">{title}</CardTitle>}
                  {description && <CardDescription className="truncate">{description}</CardDescription>}
                </div>
              </div>
              {right && <div className="shrink-0 flex items-center gap-2">{right}</div>}
            </div>
          </CardHeader>
        )}
        <CardContent
          className={cn(
            padding === 'none' && '!p-0',
            padding === 'sm' && '!px-4 !pb-4',
          )}
        >
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
