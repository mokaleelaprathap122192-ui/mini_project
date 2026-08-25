'use client';

import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '@/types';
import { LANGUAGE_NATIVE_NAMES, LANGUAGE_FLAGS, SUPPORTED_LANGUAGES } from '@/types';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';

const UI_LANGS: Language[] = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as'];

interface I18nCtx {
  lang: Language;
  setLang: (l: Language) => void;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  dir: 'ltr',
});

export const RTL_LANGS: Language[] = ['ur'];

export function I18nProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [lang, setLangState] = useState<Language>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('fa_ui_lang') : null;
    const initial: Language =
      (stored && SUPPORTED_LANGUAGES.includes(stored as Language) ? (stored as Language) : 'en') || 'en';
    setLangState(initial);
    if (i18n.language !== initial) {
      void i18n.changeLanguage(initial);
    }
    setReady(true);
  }, [i18n]);

  const setLang = (l: Language) => {
    setLangState(l);
    void i18n.changeLanguage(l);
    try {
      window.localStorage.setItem('fa_ui_lang', l);
    } catch {}
    const d = document.documentElement;
    d.lang = l;
    d.dir = RTL_LANGS.includes(l) ? 'rtl' : 'ltr';
  };

  const dir: 'ltr' | 'rtl' = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';

  useEffect(() => {
    if (!ready) return;
    const d = document.documentElement;
    d.lang = lang;
    d.dir = dir;
  }, [lang, dir, ready]);

  return <I18nContext.Provider value={{ lang, setLang, dir }}>{children}</I18nContext.Provider>;
}

export function useI18nCtx() {
  return useContext(I18nContext);
}

export { UI_LANGS, LANGUAGE_NATIVE_NAMES, LANGUAGE_FLAGS };
