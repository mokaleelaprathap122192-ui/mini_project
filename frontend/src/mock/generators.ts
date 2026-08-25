import type {
  BiasDetectionResult,
  BiasDimension,
  EmotionResult,
  FactCheckResult,
  FairnessAuditResult,
  KnowledgeGraph,
  Language,
  LanguageDetection,
  MisinformationResult,
  RiskLevel,
  SentimentResult,
  XAIResult,
} from '@/types';
import { SUPPORTED_LANGUAGES as LANGS } from '@/types';
import { LANGUAGE_LABELS } from '@/types';
import { round } from '@/lib/utils';

export function generateSentiment(rest?: Partial<SentimentResult>): SentimentResult {
  const score = round((Math.random() * 2 - 1) * 0.8);
  const pos = Math.max(0, score);
  const neg = Math.max(0, -score);
  const neut = round(Math.max(0, 1 - Math.abs(score)) * (0.2 + 0.1));
  const total = pos + neg + neut;
  const positiveWords = [
    'excellent', 'amazing', 'great', 'love', 'fantastic', 'wonderful', 'best', 'beautiful',
  ];
  const negativeWords = ['terrible', 'bad', 'hate', 'worst', 'poor', 'disappointing', 'awful', 'ugly'];
  const wc = [...positiveWords, ...negativeWords, 'product', 'service', 'quality', 'price'].map((t) => ({
    text: t,
    value: 10 + Math.round(Math.random() * 90),
  }));
  return {
    label: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
    score,
    probabilities: {
      positive: round(pos / total),
      neutral: round(neut / total),
      negative: round(neg / total),
    },
    positiveWords: positiveWords.slice(0, 3 + Math.floor(Math.random() * 3)),
    negativeWords: negativeWords.slice(0, 2 + Math.floor(Math.random() * 3)),
    wordCloud: wc,
    ...rest,
  } as SentimentResult;
}

export function generateEmotion(): EmotionResult {
  const raw = {
    happy: Math.random(),
    sad: Math.random(),
    fear: Math.random(),
    surprise: Math.random(),
    anger: Math.random(),
    disgust: Math.random(),
  };
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const scores = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, round(v / total)])) as EmotionResult['scores'];
  const dominant = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as EmotionResult['dominant'];
  return { dominant, scores };
}

export function generateBias(): BiasDetectionResult {
  const dims: BiasDimension[] = ['gender', 'religion', 'region', 'caste', 'age'];
  const langs = LANGS;
  const heatmap = dims.map(() => langs.map(() => round(Math.random() * 0.8 + 0.05)));
  const metrics = dims.map((d, i) => {
    const score = round(heatmap[i].reduce((a, b) => a + b, 0) / langs.length);
    const level: RiskLevel = score > 0.55 ? 'high' : score > 0.3 ? 'medium' : 'low';
    return {
      dimension: d,
      score,
      level,
      recommendations: [
        `Augment training samples across demographic groups in low-resource languages to reduce ${d} disparity.`,
        'Test with curated stereotype-probing benchmarks tailored for Indian context.',
      ],
    };
  });
  const overall = round(metrics.map((m) => m.score).reduce((a, b) => a + b, 0) / dims.length);
  return {
    metrics,
    overallRisk: overall > 0.55 ? 'high' : overall > 0.3 ? 'medium' : 'low',
    overallScore: overall,
    heatmap,
    languages: langs,
    dimensions: dims,
  };
}

export function generateFairnessAudit(): FairnessAuditResult {
  const metrics = LANGS.map((lang) => {
    const base = 0.7 + Math.random() * 0.25;
    return {
      language: lang,
      accuracy: round(base),
      precision: round(base - 0.02 + Math.random() * 0.04),
      recall: round(base - 0.03 + Math.random() * 0.05),
      f1: round(base - 0.01 + Math.random() * 0.03),
      parity: round(0.6 + Math.random() * 0.35),
    };
  });
  const radarDatasets = metrics.slice(0, 5).map((m) => ({
    language: m.language,
    axes: [
      { axis: 'Accuracy', value: m.accuracy },
      { axis: 'Precision', value: m.precision },
      { axis: 'Recall', value: m.recall },
      { axis: 'F1', value: m.f1 },
      { axis: 'Parity', value: m.parity },
    ],
  }));
  const avgAcc = metrics.reduce((s, m) => s + m.accuracy, 0) / metrics.length;
  const avgPar = metrics.reduce((s, m) => s + m.parity, 0) / metrics.length;
  const clfiScore = Math.round(avgAcc * 60 + avgPar * 40);
  return {
    metrics,
    clfiScore,
    radarDatasets,
    alerts: [
      { severity: 'high', message: 'Statistically significant disparity detected for Gujarati on Recall metric (p<0.05).' },
      { severity: 'medium', message: 'Kannada F1 score deviates from the language mean by >5%.' },
      { severity: 'low', message: 'Sanskrit sample size below recommended threshold.' },
    ],
    recommendations: [
      'Upsample low-resource language training data with back-translations from high-resource languages.',
      'Apply adversarial debiasing on IndicBERT embeddings across all protected attributes.',
      'Tune decision thresholds per-language to equalize true positive rates.',
    ],
  };
}

export function generateFactCheck(claim = 'Bengaluru recorded the hottest summer on record in 2024.'): FactCheckResult {
  return {
    claim,
    verdict: Math.random() > 0.6 ? 'partial' : Math.random() > 0.5 ? 'true' : 'false',
    confidence: round(0.55 + Math.random() * 0.4),
    evidence: [
      {
        source: 'wikipedia',
        title: 'Climate of Bengaluru - Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Climate_of_Bengaluru',
        snippet: 'Bengaluru has a tropical savanna climate with distinct wet and dry seasons. Monthly averages range 18-33°C historically, with occasional heatwaves in March-May peaking above 38°C in recent years.',
        reliability: 0.92,
      },
      {
        source: 'government',
        title: 'IMD Annual Weather Summary 2024',
        url: 'https://mausam.imd.gov.in',
        snippet: 'India Meteorological Department reports above-average maximum temperatures across Karnataka for March-June 2024 with several new station records in Bengaluru urban.',
        reliability: 0.97,
      },
      {
        source: 'news',
        title: 'Bengaluru sizzles at record-breaking heatwave - The Hindu',
        url: 'https://www.thehindu.com',
        snippet: 'Maximum temperatures in Bengaluru breached previous decade averages by 2-3°C according to KSNDMC readings in April 2024, marking one of the hottest spells.',
        reliability: 0.83,
      },
    ],
  };
}

export function generateMisinformation(): MisinformationResult {
  const score = Math.random();
  return {
    risk: score > 0.66 ? 'high' : score > 0.33 ? 'medium' : 'low',
    score: round(score),
    reasons: [
      'Unverified claim without primary source link in original poster has low domain authority.',
      'Emotional language patterns (anger/sensationalism) detected in headline.',
      'Claim conflicts with peer-reviewed consensus (contradicted by 3 independent sources).',
    ],
    reliability: round(1 - score * 0.7),
    warnings: ['Cross-check claim with official government records before sharing.'],
  };
}

export function generateXAI(): XAIResult {
  const words = ['government', 'policy', 'excellent', 'terrible', 'economy', 'growth', 'people', 'country'];
  const shapValues = words.map((f, i) => ({
    feature: f,
    value: i / words.length,
    impact: round((Math.random() * 2 - 1) * 0.8),
  }));
  const limeExplanations = words.slice(0, 6).map((feature) => ({
    feature,
    weight: round(Math.random() * 2 - 1),
  })).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
  const featureImportance = words.map((word) => ({
    word,
    importance: round(Math.random() * 0.9 + 0.1),
  })).sort((a, b) => b.importance - a.importance);
  return {
    shapValues,
    limeExplanations,
    featureImportance,
    naturalExplanation:
      'The model classified this text as primarily driven by positive sentiment. Words like "excellent" and "growth" contributed most strongly to a positive classification, while "terrible" pulled negatively. The strongest contributor to the model decision was the adjective "excellent" (SHAP value +0.42), consistent with IndicBERT attention head 6-12 activation patterns.',
  };
}

export function generateKnowledgeGraph(): KnowledgeGraph {
  const labels = [
    'Bengaluru', 'IMD', 'Heatwave 2024', 'Karnataka', 'Summer 2024', 'The Hindu',
    'Rural Population', 'Telangana', 'Chennai', 'Climate Report', 'Monsoon', 'GDP Growth',
  ];
  const nodes = labels.map((label, i) => ({
    id: `n${i}`,
    label,
    type: (['entity', 'source', 'claim', 'entity', 'document', 'source'] as const)[i % 4],
  }));
  const edges: { id: string; source: string; target: string; type: string }[] = [];
  for (let i = 1; i < nodes.length; i++) {
    edges.push({
      id: `e${i}`,
      source: nodes[Math.max(0, i - 1 - Math.floor(Math.random() * 2))].id,
      target: nodes[i].id,
      type: ['MENTIONS', 'RELATES_TO', 'SUPPORTS', 'LOCATED_IN'][i % 4],
    });
  }
  return { nodes, edges };
}

export function generateLanguageDetection(_text?: { text?: string }): LanguageDetection {
  const lang = LANGS[Math.floor(Math.random() * LANGS.length)];
  return {
    language: lang,
    languageName: LANGUAGE_LABELS[lang],
    confidence: round(0.82 + Math.random() * 0.17),
    supported: LANGS,
  };
}

export { LANGS };
