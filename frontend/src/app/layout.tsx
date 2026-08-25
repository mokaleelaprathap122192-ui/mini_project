import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { I18nProvider } from '@/providers/I18nProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Cross-Lingual Fairness Audit | Sentiment Models on Indian Languages',
  description:
    'An Explainable AI platform for multilingual sentiment analysis, fairness auditing, misinformation detection and fact verification across 14 Indian languages.',
  keywords: [
    'Cross-Lingual Fairness',
    'Sentiment Analysis',
    'Indian Languages',
    'Bias Detection',
    'XAI',
    'SHAP',
    'LIME',
    'IndicBERT',
    'XLM-RoBERTa',
    'MuRIL',
    'Knowledge Graph',
    'GraphRAG',
    'i18n',
    'IndicTrans2',
  ],
  authors: [
    { name: 'G.Vaishnavi' },
    { name: 'M.Surya Teja' },
    { name: 'M.Leela Prathap' },
  ],
  openGraph: {
    title: 'Cross-Lingual Fairness Audit Platform',
    description: 'Explainable AI for fair multilingual sentiment analysis across Indian languages.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-navy-950 text-foreground font-sans antialiased')}>
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
