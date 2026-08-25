export type UserRole = 'admin' | 'researcher' | 'student' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  createdAt: string;
  lastLogin?: string;
}

export type InputType = 'text' | 'pdf' | 'docx' | 'txt' | 'mp3' | 'wav' | 'mp4' | 'youtube' | 'news_url';

export type UploadStatus = 'uploading' | 'processing' | 'completed' | 'failed';

export interface UploadedFile {
  id: string;
  name: string;
  type: InputType;
  size: number;
  status: UploadStatus;
  progress: number;
  uploadedAt: string;
  previewUrl?: string;
}

export type Language = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'ur' | 'gu' | 'kn' | 'ml' | 'or' | 'pa' | 'as' | 'sa';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  bn: 'বাংলা (Bengali)',
  te: 'తెలుగు (Telugu)',
  mr: 'मराठी (Marathi)',
  ta: 'தமிழ் (Tamil)',
  ur: 'اردو (Urdu)',
  gu: 'ગુજરાતી (Gujarati)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
  or: 'ଓଡ଼ିଆ (Odia)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  as: 'অসমীয়া (Assamese)',
  sa: 'संस्कृतम् (Sanskrit)',
};

export const LANGUAGE_NATIVE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  te: 'తెలుగు',
  mr: 'मराठी',
  ta: 'தமிழ்',
  ur: 'اردو',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  or: 'ଓଡ଼ିଆ',
  pa: 'ਪੰਜਾਬੀ',
  as: 'অসমীয়া',
  sa: 'संस्कृतम्',
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  hi: '🇮🇳',
  bn: '🇧🇩',
  te: '🟨',
  mr: '🟫',
  ta: '🟧',
  ur: '🇵🇰',
  gu: '🟥',
  kn: '🟩',
  ml: '🟦',
  or: '🟧',
  pa: '🟨',
  as: '🟢',
  sa: '🕉️',
};

export const LANGUAGE_GLYPHS: Record<Language, string> = {
  en: 'I',
  hi: 'ह',
  bn: 'ব',
  te: 'త',
  mr: 'म',
  ta: 'த',
  ur: 'ا',
  gu: 'ગ',
  kn: 'ಕ',
  ml: 'മ',
  or: 'ଓ',
  pa: 'ਪ',
  as: 'অ',
  sa: 'स',
};

export const LANGUAGE_CODES: Record<Language, string> = {
  en: 'eng',
  hi: 'hin_Deva',
  bn: 'ben_Beng',
  te: 'tel_Telu',
  mr: 'mar_Deva',
  ta: 'tam_Taml',
  ur: 'urd_Arab',
  gu: 'guj_Gujr',
  kn: 'kan_Knda',
  ml: 'mal_Mlym',
  or: 'ory_Orya',
  pa: 'pan_Guru',
  as: 'asm_Beng',
  sa: 'san_Deva',
};

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'sa'];

export interface LanguageDetection {
  language: Language;
  languageName: string;
  confidence: number;
  supported: Language[];
}

export interface TranslationResult {
  sourceLanguage: Language;
  targetLanguage: Language;
  originalText: string;
  translatedText: string;
  confidence: number;
  engine: 'indictrans2' | 'google' | 'gemini' | 'mock' | 'noop';
}

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
  probabilities: { positive: number; neutral: number; negative: number };
  positiveWords: string[];
  negativeWords: string[];
  wordCloud: { text: string; value: number }[];
}

export type EmotionKey = 'happy' | 'sad' | 'fear' | 'surprise' | 'anger' | 'disgust';

export const EMOTION_EMOJI: Record<EmotionKey, string> = {
  happy: '😊',
  sad: '😢',
  fear: '😨',
  surprise: '😮',
  anger: '😠',
  disgust: '🤢',
};

export const EMOTION_LABELS: Record<EmotionKey, string> = {
  happy: 'Happy',
  sad: 'Sad',
  fear: 'Fear',
  surprise: 'Surprise',
  anger: 'Anger',
  disgust: 'Disgust',
};

export interface EmotionResult {
  dominant: EmotionKey;
  scores: Record<EmotionKey, number>;
}

export type BiasDimension = 'gender' | 'religion' | 'region' | 'caste' | 'age';

export const BIAS_LABELS: Record<BiasDimension, string> = {
  gender: 'Gender Bias',
  religion: 'Religion Bias',
  region: 'Region Bias',
  caste: 'Caste Bias',
  age: 'Age Bias',
};

export type RiskLevel = 'low' | 'medium' | 'high';

export interface BiasMetric {
  dimension: BiasDimension;
  score: number;
  level: RiskLevel;
  recommendations: string[];
}

export interface BiasDetectionResult {
  metrics: BiasMetric[];
  overallRisk: RiskLevel;
  overallScore: number;
  heatmap: number[][];
  languages: Language[];
  dimensions: BiasDimension[];
}

export interface FairnessMetric {
  language: Language;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  parity: number;
}

export interface FairnessAuditResult {
  metrics: FairnessMetric[];
  clfiScore: number;
  radarDatasets: { language: Language; axes: { axis: string; value: number }[] }[];
  alerts: { severity: RiskLevel; message: string }[];
  recommendations: string[];
}

export type Verdict = 'true' | 'false' | 'partial';

export type FactSource = 'wikipedia' | 'government' | 'news';

export interface FactEvidence {
  source: FactSource;
  title: string;
  url: string;
  snippet: string;
  reliability: number;
}

export interface FactCheckResult {
  claim: string;
  verdict: Verdict;
  confidence: number;
  evidence: FactEvidence[];
}

export interface MisinformationResult {
  risk: RiskLevel;
  score: number;
  reasons: string[];
  reliability: number;
  warnings: string[];
}

export interface XAIResult {
  shapValues: { feature: string; value: number; impact: number }[];
  limeExplanations: { feature: string; weight: number }[];
  featureImportance: { word: string; importance: number }[];
  naturalExplanation: string;
}

export type KGNodeType = 'entity' | 'document' | 'claim' | 'source';

export interface KGNode {
  id: string;
  label: string;
  type: KGNodeType;
  x?: number;
  y?: number;
  meta?: Record<string, any>;
}

export interface KGEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface KnowledgeGraph {
  nodes: KGNode[];
  edges: KGEdge[];
}

export interface GraphRAGMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: FactEvidence[];
  createdAt: string;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface FlashCard {
  id: string;
  front: string;
  back: string;
}

export type PipelineStageId =
  | 'upload'
  | 'language_detect'
  | 'speech_recognition'
  | 'translation'
  | 'sentiment'
  | 'emotion'
  | 'bias'
  | 'fairness'
  | 'fact'
  | 'kg'
  | 'graphrag'
  | 'xai'
  | 'dashboard';

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'error';
  progress: number;
  startedAt?: string;
  finishedAt?: string;
}

export const PIPELINE_STAGES: { id: PipelineStageId; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'language_detect', label: 'Language Detection' },
  { id: 'speech_recognition', label: 'Speech Recognition' },
  { id: 'translation', label: 'Translation' },
  { id: 'sentiment', label: 'Sentiment Analysis' },
  { id: 'emotion', label: 'Emotion Detection' },
  { id: 'bias', label: 'Bias Detection' },
  { id: 'fairness', label: 'Fairness Audit' },
  { id: 'fact', label: 'Fact Verification' },
  { id: 'xai', label: 'Explainable AI' },
  { id: 'kg', label: 'Knowledge Graph' },
  { id: 'graphrag', label: 'GraphRAG' },
  { id: 'dashboard', label: 'Dashboard' },
];
