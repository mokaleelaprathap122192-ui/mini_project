'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/label';
import type { GraphRAGMessage } from '@/types';
import { cn, formatDate } from '@/lib/utils';

interface ChatWindowProps {
  messages: GraphRAGMessage[];
  onSend: (text: string) => void;
  streaming?: boolean;
}

function useTypewriter(text: string, speed = 16, enabled = true): string {
  const [out, setOut] = useState(enabled ? '' : text);
  useEffect(() => {
    if (!enabled) {
      setOut(text);
      return;
    }
    setOut('');
    let i = 0;
    const id = window.setInterval(() => {
      i += Math.max(1, Math.round(speed / 8));
      setOut(text.slice(0, Math.min(text.length, i)));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, enabled]);
  return enabled ? out : text;
}

export function ChatWindow({ messages, onSend, streaming }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  const typewritten = useTypewriter(
    last?.role === 'assistant' && streaming ? last.content : '',
    14,
    !!(last?.role === 'assistant' && streaming),
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typewritten]);

  const send = () => {
    const v = input.trim();
    if (!v) return;
    onSend(v);
    setInput('');
  };

  return (
    <Card className="glass h-full flex flex-col overflow-hidden">
      <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan flex items-center justify-center shadow-glow-purple">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-neon-green border-2 border-navy-950" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base leading-tight">
              GraphRAG <span className="gradient-text">Assistant</span>
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-neon-green animate-ping opacity-60" />
                <span className="relative rounded-full w-1.5 h-1.5 bg-neon-green" />
              </span>
              Grounded in knowledge graph · 10 Indian languages
            </p>
          </div>
        </div>
        <Badge variant="info" className="px-3 py-1 gap-1.5">
          <Sparkles className="w-3 h-3" />
          v3 RAG
        </Badge>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center gap-4 py-14"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center">
              <Bot className="w-10 h-10 text-neon-cyan" />
            </div>
            <div>
              <h3 className="font-display font-bold text-2xl mb-2">
                Ask anything.
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your assistant is grounded in the cross-lingual knowledge graph. Ask about claims, evidence, entities, or fairness findings.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full mt-4">
              {[
                'Summarize the evidence on Bengaluru summer 2024 heatwave.',
                'Compare sentiment parity between Hindi and Tamil models.',
                'What is the risk of misinformation in the latest claim?',
                'List top features explaining the last prediction.',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className={cn(
                    'text-left text-sm p-3.5 rounded-xl',
                    'bg-white/[0.03] border border-white/5',
                    'hover:bg-white/[0.07] hover:border-neon-purple/30 transition-all',
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            const isLast = i === messages.length - 1;
            const display =
              isLast && isUser === false && streaming ? typewritten : m.content;
            const stillTyping =
              isLast && !isUser && streaming && display.length < m.content.length;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3 max-w-[92%]', isUser ? 'ml-auto flex-row-reverse' : '')}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border',
                    isUser
                      ? 'bg-gradient-to-br from-neon-blue to-neon-purple border-white/15 shadow-glow-purple'
                      : 'bg-white/5 border-white/10',
                  )}
                >
                  {isUser ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-neon-cyan" />
                  )}
                </div>

                <div className={cn('flex flex-col gap-1.5 min-w-0', isUser ? 'items-end' : 'items-start')}>
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                      isUser
                        ? 'bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan text-white shadow-glow-purple rounded-tr-sm'
                        : 'glass rounded-tl-sm',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{display}</p>
                    {stillTyping && !display && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        <span className="w-1.5 h-1.5 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                        <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                      </span>
                    )}
                    {stillTyping && display && (
                      <span className="inline-block w-0.5 h-4 bg-neon-cyan/80 align-middle ml-0.5 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono px-1">
                    <span>{formatDate(m.createdAt)}</span>
                    {!isUser && m.sources && (
                      <span className="badge bg-neon-purple/15 text-neon-purple border border-neon-purple/30 !text-[10px]">
                        {m.sources.length} sources
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="p-4 pt-3 border-t border-white/10 shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about evidence, claims, bias, or fairness findings…"
              className="min-h-[54px] max-h-40 resize-none pr-14 text-base py-3.5"
            />
          </div>
          <Button
            onClick={send}
            disabled={!input.trim() || streaming}
            size="lg"
            className="neon-btn !h-[54px] !py-3 !px-5 shrink-0"
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1.5 px-1">
          <Sparkles className="w-3 h-3 text-neon-purple" />
          Responses are generated using RAG over the curated knowledge graph. Always verify critical claims.
        </p>
      </div>
    </Card>
  );
}
