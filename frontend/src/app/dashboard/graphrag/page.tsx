'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Sparkles, Network, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/label';
import { ChatWindow } from '@/components/graphrag/ChatWindow';
import { SourceCard } from '@/components/graphrag/SourceCard';
import { generateKnowledgeGraph } from '@/mock/generators';
import type { GraphRAGMessage, FactEvidence, KnowledgeGraph } from '@/types';
import { uid } from '@/lib/utils';

const mockSources: FactEvidence[] = [
  {
    source: 'government',
    title: 'IMD Annual Weather Summary 2024',
    url: 'https://mausam.imd.gov.in',
    snippet: 'India Meteorological Department reports above-average max temperatures across Karnataka.',
    reliability: 0.97,
  },
  {
    source: 'wikipedia',
    title: 'Climate of Bengaluru - Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Climate_of_Bengaluru',
    snippet: 'Bengaluru has a tropical savanna climate with occasional heatwaves March–May.',
    reliability: 0.92,
  },
  {
    source: 'news',
    title: 'Bengaluru sizzles at record heatwave - The Hindu',
    url: 'https://www.thehindu.com',
    snippet: 'Temperatures breached previous decade averages by 2-3°C in April 2024.',
    reliability: 0.83,
  },
  {
    source: 'government',
    title: 'MoSPI GDP Estimates Q4 2024',
    url: 'https://mospi.gov.in',
    snippet: 'Provisional GDP growth estimated at 7.8% for FY 2023-24 across all sectors.',
    reliability: 0.96,
  },
];

const mockResponses: Record<string, { content: string; sources: FactEvidence[] }> = {
  default: {
    content:
      'Based on the cross-lingual knowledge graph and retrieved evidence, here is a grounded answer:\n\nThe 2024 summer season across the Deccan plateau — especially Bengaluru urban — showed temperatures 2–3°C above the 10-year climatological mean for March–June (IMD 2024; The Hindu Apr 2024). While Wikipedia notes a historical range of 18–33°C for the city, several new station records above 38°C were logged. Confidence in this reading is high because two independent authoritative sources (government + peer-reviewed journalism) agree on direction and magnitude.\n\nIf you need a specific language translation, regional breakdown, or want this exported as a fairness report, just say the word.',
    sources: mockSources.slice(0, 3),
  },
  fairness: {
    content:
      'Crossing the fairness module now… Parity analysis across the 10 audited Indian languages shows IndicBERT has the smallest F1 gap (≈2.1%) between Hindi and Marathi, while Gujarati and Sanskrit show the largest deviations in true-positive rate. Recommended steps: (1) upsample low-resource training splits with back-translation; (2) tune per-language decision thresholds; (3) run IAA across two native annotators before the next release.',
    sources: mockSources.slice(2, 4),
  },
};

export default function GraphRAGPage() {
  const [messages, setMessages] = useState<GraphRAGMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [graph] = useState<KnowledgeGraph>(() => generateKnowledgeGraph());

  const latestSources: FactEvidence[] = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].sources?.length) {
        return messages[i].sources ?? [];
      }
    }
    return mockSources;
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMsg: GraphRAGMessage = {
      id: uid('msg'),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setStreaming(true);

    await new Promise((r) => setTimeout(r, 550));

    const isFairness = /fairness|bias|parity|language/i.test(text);
    const response = isFairness ? mockResponses.fairness : mockResponses.default;
    const assistantMsg: GraphRAGMessage = {
      id: uid('msg'),
      role: 'assistant',
      content: response.content,
      sources: response.sources,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, assistantMsg]);

    const totalChars = response.content.length;
    const msPerChar = 12;
    await new Promise((r) => setTimeout(r, Math.min(3500, totalChars * msPerChar)));
    setStreaming(false);
  };

  useEffect(() => {
    return () => setStreaming(false);
  }, []);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="warning" className="px-3 py-1">
              <Database className="w-3.5 h-3.5" />
              Graph-RAG Module
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            <span className="gradient-text">GraphRAG</span> Assistant
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Natural-language Q&amp;A grounded in the cross-lingual knowledge graph. Every answer cites sources, retrieves entities, and links back to the evidence graph.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0"
      >
        <div className="lg:col-span-2 min-h-0">
          <ChatWindow messages={messages} onSend={handleSend} streaming={streaming} />
        </div>

        <div className="space-y-5 min-h-0 overflow-y-auto pr-1">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-amber" />
                Latest Evidence
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Cited sources from the most recent assistant response.
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {latestSources.map((s, i) => (
                <SourceCard key={s.title + i} evidence={s} index={i} compact />
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Network className="w-4 h-4 text-neon-purple" />
                Knowledge Graph
              </CardTitle>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground -mt-1">
                <span className="flex items-center gap-1">
                  <Network className="w-3 h-3" />
                  <span className="font-mono text-white/80 tabular-nums">{graph.nodes.length}</span> nodes
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  <span className="font-mono text-white/80 tabular-nums">{graph.edges.length}</span> edges
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniGraph graph={graph} />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

function MiniGraph({ graph }: { graph: KnowledgeGraph }) {
  const W = 360;
  const H = 200;
  const cx = W / 2;
  const cy = H / 2;
  const R = 72;

  const positions = graph.nodes.map((n, i) => {
    const a = (i / Math.max(1, graph.nodes.length)) * Math.PI * 2;
    return { id: n.id, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * (R * 0.75), type: n.type, label: n.label };
  });
  const idMap = new Map(positions.map((p) => [p.id, p]));

  const nodeColor = (t: string) => {
    switch (t) {
      case 'entity':
        return '#2563EB';
      case 'source':
        return '#22C55E';
      case 'claim':
        return '#7C3AED';
      default:
        return '#F59E0B';
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-white/[0.02] border border-white/5">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(rgba(124,58,237,0.15) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto relative">
        {graph.edges.map((e, i) => {
          const s = idMap.get(e.source);
          const t = idMap.get(e.target);
          if (!s || !t) return null;
          return (
            <line
              key={i}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="3 4"
              strokeWidth="1"
            />
          );
        })}
        {positions.map((p, i) => (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === 0 ? 9 : 7}
              fill={nodeColor(p.type)}
              fillOpacity="0.9"
              stroke="#fff"
              strokeOpacity="0.25"
              style={{
                filter: `drop-shadow(0 0 6px ${nodeColor(p.type)}aa)`,
              }}
            />
            <text
              x={p.x}
              y={p.y + (p.y < cy ? -12 : 18)}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="8.5"
              fontWeight="700"
              fontFamily="var(--font-space-grotesk), sans-serif"
            >
              {p.label.length > 8 ? p.label.slice(0, 7) + '…' : p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
