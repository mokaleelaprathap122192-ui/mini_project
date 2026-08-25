import type { Language, RiskLevel, SentimentResult } from '@/types';

const BACKEND_HOST = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/u, '') || 'http://localhost:8000';
const API_BASE = `${BACKEND_HOST}/api`;

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${cleanPath}`;
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  env: string;
}

export interface AuditMetric {
  language: Language;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  parity: number;
}

export interface AuditRadarDataset {
  language: Language;
  axes: { axis: string; value: number }[];
}

export interface AuditResponse {
  metrics: AuditMetric[];
  clfiScore: number;
  radarDatasets: AuditRadarDataset[];
  alerts: { severity: RiskLevel; message: string }[];
  recommendations: string[];
}

export interface TranslationResponse {
  sourceLanguage: Language;
  targetLanguage: Language;
  originalText: string;
  translatedText: string;
  confidence: number;
  engine: 'indictrans2' | 'google' | 'gemini' | 'mock' | 'noop';
}

export interface ExplainTranslationResponse {
  explanation: string;
  engine: 'gemini' | 'mock';
}

export interface SummarizeResponse {
  summary: string;
  engine: 'gemini' | 'mock';
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${BACKEND_HOST}/health`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

export async function fetchFairnessAudit(): Promise<AuditResponse> {
  return backendRequest<AuditResponse>('/audit/fairness', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function fetchSentiment(text: string, language: Language = 'en'): Promise<SentimentResult> {
  return backendRequest<SentimentResult>('/nlp/sentiment', {
    method: 'POST',
    body: JSON.stringify({ text, language }),
  });
}

export async function fetchTranslation(
  text: string,
  targetLang: Language,
  opts?: { sourceLang?: Language; context?: string },
): Promise<TranslationResponse> {
  return backendRequest<TranslationResponse>('/nlp/translate', {
    method: 'POST',
    body: JSON.stringify({
      text,
      targetLang,
      sourceLang: opts?.sourceLang,
      context: opts?.context,
    }),
  });
}

export async function fetchExplainTranslation(params: {
  originalText: string;
  translatedText: string;
  sourceLang: Language;
  targetLang: Language;
}): Promise<ExplainTranslationResponse> {
  return backendRequest<ExplainTranslationResponse>('/nlp/translate/explain', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchSummarize(
  text: string,
  opts?: { targetLang?: Language; sentences?: number },
): Promise<SummarizeResponse> {
  return backendRequest<SummarizeResponse>('/nlp/summarize', {
    method: 'POST',
    body: JSON.stringify({
      text,
      targetLang: opts?.targetLang ?? 'en',
      sentences: opts?.sentences ?? 3,
    }),
  });
}

export async function fetchEmotion(text: string, language: Language = 'en'): Promise<any> {
  return backendRequest<any>('/nlp/emotion', {
    method: 'POST',
    body: JSON.stringify({ text, language }),
  });
}

export async function fetchLanguageDetection(text: string): Promise<any> {
  return backendRequest<any>('/nlp/language-detect', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

