'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, FileText, Building2, Quote, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Separator } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { KGNode, KGNodeType, KnowledgeGraph } from '@/types';
import { cn } from '@/lib/utils';

interface NodeDetailPanelProps {
  node: KGNode | null;
  graph: KnowledgeGraph;
  onClose: () => void;
  onSelectNode: (id: string) => void;
}

const typeConfig: Record<KGNodeType, { label: string; Icon: typeof FileText; variant: 'info' | 'success' | 'warning' | 'default' }> = {
  entity: { label: 'Entity', Icon: Building2, variant: 'info' },
  source: { label: 'Source', Icon: Link2, variant: 'success' },
  claim: { label: 'Claim', Icon: Quote, variant: 'warning' },
  document: { label: 'Document', Icon: FileText, variant: 'default' },
};

const sampleMeta: Record<KGNodeType, Record<string, string>> = {
  entity: {
    Category: 'Geographic / Organization',
    'Data Source': 'Wikidata Q131148',
    Languages: 'en, hi, ta, te',
    Mentions: '4,218',
  },
  source: {
    Publisher: 'Verified Media Outlet',
    Credibility: '92/100',
    'Fact-Checked': 'Yes (IFCN signatory)',
    Domain: 'Government / Academic',
  },
  claim: {
    'Stance Score': '+0.42',
    'First Seen': '2024-04-12',
    'Verification Status': 'Cross-referenced',
    'Support Ratio': '3 : 1',
  },
  document: {
    Author: 'Multiple contributors',
    Published: '2024-03-28',
    Access: 'Open access',
    Citations: '312',
  },
};

export function NodeDetailPanel({ node, graph, onClose, onSelectNode }: NodeDetailPanelProps) {
  const connectedEdges = node
    ? graph.edges.filter((e) => e.source === node.id || e.target === node.id)
    : [];

  const connectedNodeIds = Array.from(
    new Set(
      connectedEdges.flatMap((e) =>
        e.source === node?.id ? [e.target] : e.target === node?.id ? [e.source] : [],
      ),
    ),
  );

  const connectedNodes = graph.nodes.filter((n) => connectedNodeIds.includes(n.id));

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="h-full"
        >
          <Card className="glass h-full flex flex-col overflow-hidden">
            <CardHeader className="pb-3 shrink-0 relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-4 w-8 h-8 rounded-lg hover:bg-white/10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const cfg = typeConfig[node.type];
                  const { Icon } = cfg;
                  return (
                    <Badge variant={cfg.variant as any} className="px-3 py-1 gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label.toUpperCase()}
                    </Badge>
                  );
                })()}
              </div>
              <CardTitle className="text-2xl leading-tight pr-8 font-display font-bold">
                {node.label}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                ID: {node.id}
              </p>
            </CardHeader>

            <CardContent className="pt-2 flex-1 overflow-y-auto space-y-5 pr-1">
              <div>
                <h4 className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Metadata
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(node.meta || sampleMeta[node.type] || {}).map(([k, v]) => (
                    <div
                      key={k}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        {k}
                      </p>
                      <p className="text-sm font-medium leading-tight">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Link2 className="w-3 h-3" />
                  Connected Nodes
                  <span className="ml-auto text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full">
                    {connectedNodes.length}
                  </span>
                </h4>
                <ul className="space-y-2">
                  {connectedNodes.length === 0 && (
                    <li className="text-sm text-muted-foreground p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center italic">
                      No connections yet.
                    </li>
                  )}
                  {connectedNodes.map((connectedNode) => {
                    const cfg = typeConfig[connectedNode.type];
                    const { Icon } = cfg;
                    const edge = connectedEdges.find(
                      (e) =>
                        (e.source === node.id && e.target === connectedNode.id) ||
                        (e.target === node.id && e.source === connectedNode.id),
                    );
                    const isSource = edge?.source === connectedNode.id;
                    return (
                      <li key={connectedNode.id}>
                        <button
                          onClick={() => onSelectNode(connectedNode.id)}
                          className={cn(
                            'w-full flex items-start gap-3 p-3 rounded-xl text-left',
                            'bg-white/[0.03] border border-white/5',
                            'hover:bg-white/[0.08] hover:border-neon-purple/30 transition-all group',
                          )}
                        >
                          <div
                            className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border',
                              connectedNode.type === 'entity' && 'bg-neon-blue/15 border-neon-blue/30',
                              connectedNode.type === 'source' && 'bg-neon-green/15 border-neon-green/30',
                              connectedNode.type === 'claim' && 'bg-neon-amber/15 border-neon-amber/30',
                              connectedNode.type === 'document' && 'bg-white/10 border-white/15',
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-4 h-4',
                                connectedNode.type === 'entity' && 'text-neon-blue',
                                connectedNode.type === 'source' && 'text-neon-green',
                                connectedNode.type === 'claim' && 'text-neon-amber',
                                connectedNode.type === 'document' && 'text-white/80',
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate group-hover:gradient-text">
                              {connectedNode.label}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                {connectedNode.type}
                              </span>
                              {edge && (
                                <>
                                  <span className="text-white/20">·</span>
                                  <span className="text-[10px] font-mono text-neon-cyan/80">
                                    {isSource ? '←' : '→'} {edge.type}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!node && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full"
        >
          <Card className="glass h-full">
            <CardContent className="h-full p-8 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-9 h-9 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl mb-1">Select a node</h3>
                <p className="text-sm text-muted-foreground max-w-[240px]">
                  Click any node in the knowledge graph to view its metadata, connections, and provenance info.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
