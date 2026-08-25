'use client';

import { useEffect, ReactNode } from 'react';
import { useThemeStore } from '@/stores/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
}
