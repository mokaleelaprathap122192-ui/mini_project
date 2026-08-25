'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { KGNode, KGEdge, KnowledgeGraph, KGNodeType } from '@/types';
import { cn, uid } from '@/lib/utils';

interface GraphCanvasProps {
  graph: KnowledgeGraph;
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
}

interface LayoutNode extends KGNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const typeStyles: Record<KGNodeType, { fillA: string; fillB: string; stroke: string; radius: number }> = {
  entity: { fillA: '#2563EB', fillB: '#06B6D4', stroke: '#60A5FA', radius: 22 },
  source: { fillA: '#22C55E', fillB: '#06B6D4', stroke: '#86EFAC', radius: 19 },
  claim: { fillA: '#7C3AED', fillB: '#C026D3', stroke: '#C4B5FD', radius: 26 },
  document: { fillA: '#F59E0B', fillB: '#EF4444', stroke: '#FCD34D', radius: 20 },
};

function springLayout(graph: KnowledgeGraph, width: number, height: number): LayoutNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const n = graph.nodes.length;
  const nodes: LayoutNode[] = graph.nodes.map((nd, i) => {
    const a = (i / Math.max(1, n)) * Math.PI * 2;
    const r = 120 + (i % 3) * 30;
    return {
      ...nd,
      x: cx + Math.cos(a) * r + (Math.random() - 0.5) * 40,
      y: cy + Math.sin(a) * r + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: 0,
    };
  });
  const idMap = new Map(nodes.map((n) => [n.id, n]));

  for (let step = 0; step < 160; step++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = Math.max(0.1, dx * dx + dy * dy);
        const d = Math.sqrt(d2);
        const rep = 9500 / d2;
        const fx = (dx / d) * rep;
        const fy = (dy / d) * rep;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    for (const e of graph.edges) {
      const s = idMap.get(e.source);
      const t = idMap.get(e.target);
      if (!s || !t) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const target = 100;
      const diff = (d - target) * 0.04;
      const fx = (dx / d) * diff;
      const fy = (dy / d) * diff;
      s.vx += fx;
      s.vy += fy;
      t.vx -= fx;
      t.vy -= fy;
    }

    for (const nd of nodes) {
      nd.vx += (cx - nd.x) * 0.004;
      nd.vy += (cy - nd.y) * 0.004;
      nd.vx *= 0.82;
      nd.vy *= 0.82;
      nd.x += nd.vx;
      nd.y += nd.vy;
      nd.x = Math.max(60, Math.min(width - 60, nd.x));
      nd.y = Math.max(60, Math.min(height - 60, nd.y));
    }
  }
  return nodes;
}

export function GraphCanvas({ graph, selectedId, onSelect }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewSize, setViewSize] = useState({ w: 900, h: 600 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<LayoutNode[]>([]);
  const dragRef = useRef<{ id: string | null; offX: number; offY: number; pan: boolean; startX: number; startY: number; startPanX: number; startPanY: number }>({
    id: null,
    offX: 0,
    offY: 0,
    pan: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const [hoverId, setHoverId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewSize({ w: Math.max(500, rect.width), h: Math.max(400, rect.height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!graph.nodes.length) return;
    const laid = springLayout(graph, viewSize.w, viewSize.h);
    setNodes(laid);
  }, [graph, viewSize.w, viewSize.h]);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const clientToGraph = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left) / zoom - pan.x;
    const y = (clientY - rect.top) / zoom - pan.y;
    return { x, y };
  };

  const onNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const nd = nodeMap.get(id);
    const p = clientToGraph(e.clientX, e.clientY);
    dragRef.current = {
      id,
      offX: nd ? p.x - nd.x : 0,
      offY: nd ? p.y - nd.y : 0,
      pan: false,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
    onSelect(id);
  };

  const onBgPointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      id: null,
      offX: 0,
      offY: 0,
      pan: true,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.id) {
      const p = clientToGraph(e.clientX, e.clientY);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === d.id
            ? {
                ...n,
                x: Math.max(30, Math.min(viewSize.w - 30, p.x - d.offX)),
                y: Math.max(30, Math.min(viewSize.h - 30, p.y - d.offY)),
              }
            : n,
        ),
      );
    } else if (d.pan) {
      const dx = (e.clientX - d.startX) / zoom;
      const dy = (e.clientY - d.startY) / zoom;
      setPan({ x: d.startPanX + dx, y: d.startPanY + dy });
    }
  };

  const onPointerUp = () => {
    dragRef.current = { id: null, offX: 0, offY: 0, pan: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 };
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    const laid = springLayout(graph, viewSize.w, viewSize.h);
    setNodes(laid);
  };

  const w = viewSize.w;
  const h = viewSize.h;

  return (
    <Card className="glass h-full flex flex-col">
      <CardContent className="p-3 flex-1 flex flex-col gap-3">
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[480px] rounded-xl overflow-hidden bg-white/[0.02] border border-white/5"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(rgba(124,58,237,0.18) 1px, transparent 1px), radial-gradient(rgba(37,99,235,0.12) 1px, transparent 1px)',
              backgroundSize: '36px 36px, 36px 36px',
              backgroundPosition: '0 0, 18px 18px',
            }}
          />

          <svg
            ref={svgRef}
            viewBox={`0 0 ${w} ${h}`}
            className="absolute inset-0 w-full h-full touch-none"
            onPointerDown={onBgPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => onSelect(null)}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {graph.edges.map((edge, idx) => {
                const s = nodeMap.get(edge.source);
                const t = nodeMap.get(edge.target);
                if (!s || !t) return null;
                const mx = (s.x + t.x) / 2;
                const my = (s.y + t.y) / 2;
                const selected = selectedId === s.id || selectedId === t.id;
                return (
                  <g key={edge.id || idx} style={{ pointerEvents: 'none' }}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={selected ? '#7C3AED' : 'rgba(255,255,255,0.18)'}
                      strokeWidth={selected ? 2 : 1}
                      strokeDasharray={selected ? '0' : '4 5'}
                      style={{
                        filter: selected ? 'drop-shadow(0 0 6px rgba(124,58,237,0.7))' : 'none',
                      }}
                    />
                    <g transform={`translate(${mx}, ${my})`}>
                      <rect
                        x={-edge.type.length * 3.2 - 6}
                        y={-9}
                        width={edge.type.length * 6.4 + 12}
                        height="18"
                        rx="9"
                        fill="rgba(15,23,42,0.75)"
                        stroke="rgba(255,255,255,0.12)"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.75)"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="var(--font-space-grotesk), sans-serif"
                        letterSpacing="1"
                      >
                        {edge.type}
                      </text>
                    </g>
                  </g>
                );
              })}

              {nodes.map((nd) => {
                const s = typeStyles[nd.type];
                const isSelected = selectedId === nd.id;
                const isHover = hoverId === nd.id;
                const highlight = isSelected || isHover;
                return (
                  <g
                    key={nd.id}
                    transform={`translate(${nd.x}, ${nd.y})`}
                    style={{ cursor: 'grab' }}
                    onPointerDown={(e) => onNodePointerDown(e, nd.id)}
                    onMouseEnter={() => setHoverId(nd.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <defs>
                      <radialGradient id={`ng-${nd.id}`} cx="30%" cy="30%" r="80%">
                        <stop offset="0%" stopColor={s.fillA} stopOpacity="1" />
                        <stop offset="100%" stopColor={s.fillB} stopOpacity="0.85" />
                      </radialGradient>
                    </defs>

                    {(isSelected || isHover) && (
                      <motion.circle
                        initial={{ r: s.radius, opacity: 0.7 }}
                        animate={{
                          r: [s.radius + 6, s.radius + 18, s.radius + 6],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        fill={s.fillA}
                        fillOpacity="0.15"
                      />
                    )}

                    <circle
                      r={s.radius + 3}
                      fill="none"
                      stroke={isSelected ? '#fff' : s.stroke}
                      strokeOpacity={highlight ? 0.9 : 0.4}
                      strokeWidth={isSelected ? 2.5 : 1}
                    />
                    <circle
                      r={s.radius}
                      fill={`url(#ng-${nd.id})`}
                      stroke={s.stroke}
                      strokeOpacity="0.5"
                      style={{
                        filter: highlight
                          ? `drop-shadow(0 0 12px ${s.fillA})`
                          : `drop-shadow(0 2px 6px rgba(0,0,0,0.5))`,
                      }}
                    />

                    <text
                      y={4}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={Math.max(9, Math.min(13, 16 - Math.max(0, nd.label.length - 6)))}
                      fontWeight="700"
                      fontFamily="var(--font-space-grotesk), sans-serif"
                    >
                      {nd.label.length > 9 ? nd.label.slice(0, 8) + '…' : nd.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-1 p-1.5 rounded-xl bg-navy-950/70 backdrop-blur-xl border border-white/10 shadow-xl"
            >
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded-lg hover:bg-white/10"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded-lg hover:bg-white/10"
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="h-px w-full bg-white/10 my-0.5" />
              <Button
                size="icon"
                variant="ghost"
                className="w-8 h-8 rounded-lg hover:bg-white/10"
                onClick={resetView}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg bg-navy-950/70 backdrop-blur-xl border border-white/10 px-2.5 py-1 text-[10px] font-mono text-white/70 text-center"
            >
              {Math.round(zoom * 100)}%
            </motion.div>
          </div>

          <div className="absolute bottom-3 left-3 z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-navy-950/70 backdrop-blur-xl border border-white/10"
            >
              {(Object.keys(typeStyles) as KGNodeType[]).map((t) => {
                const s = typeStyles[t];
                return (
                  <div key={t} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03]">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: `linear-gradient(135deg, ${s.fillA}, ${s.fillB})` }}
                    />
                    <span className="text-[11px] capitalize text-white/80 font-medium">{t}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
