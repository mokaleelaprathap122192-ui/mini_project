'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18nCtx, UI_LANGS, LANGUAGE_NATIVE_NAMES, LANGUAGE_FLAGS } from '@/providers/I18nProvider';
import type { Language } from '@/types';

export function LanguageSelector() {
  const { lang, setLang } = useI18nCtx();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all shrink-0 group"
          title={`${LANGUAGE_NATIVE_NAMES[lang]} · ${lang.toUpperCase()}`}
        >
          <Globe2 className="w-5 h-5 group-hover:text-neon-purple transition-colors" />
          <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold px-1 rounded bg-navy-900 border border-white/10 text-neon-cyan">
            {lang.toUpperCase()}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 mt-2 w-64 max-h-[420px] overflow-y-auto rounded-2xl border border-white/10',
            'bg-navy-900/95 backdrop-blur-xl p-1.5 shadow-glow-purple/40',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
          )}
          sideOffset={8}
          align="end"
        >
          <div className="px-2.5 py-2 mb-1 border-b border-white/10">
            <p className="text-xs font-semibold text-white">Select Language</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">भाषा चुनें / ভাষা নির্বাচন করুন</p>
          </div>
          {UI_LANGS.map((code: Language) => {
            const active = code === lang;
            return (
              <DropdownMenu.Item
                key={code}
                onSelect={() => setLang(code)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2 py-2 rounded-xl text-sm outline-none cursor-pointer transition-colors',
                  active
                    ? 'bg-neon-purple/15 text-white border border-neon-purple/30'
                    : 'text-muted-foreground hover:text-white hover:bg-white/10',
                )}
              >
                <span className="text-base w-6 text-center shrink-0">{LANGUAGE_FLAGS[code]}</span>
                <span className="flex-1 truncate">{LANGUAGE_NATIVE_NAMES[code]}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 shrink-0 w-8 text-right">
                  {code}
                </span>
                {active && <Check className="w-3.5 h-3.5 text-neon-purple shrink-0" />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
