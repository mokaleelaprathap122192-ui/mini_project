'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { Language } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

export const UI_LANGUAGES: Language[] = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as'];

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'fa_ui_lang',
      lookupCookie: 'fa_ui_lang',
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['common'],
    defaultNS: 'common',
    react: {
      useSuspense: false,
    },
  });

export default i18n;
