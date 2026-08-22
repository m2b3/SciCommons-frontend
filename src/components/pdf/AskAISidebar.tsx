'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { pipeline, env, AutoTokenizer, AutoModel } from '@xenova/transformers';
import {
  Bot,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileSearch,
  FlaskConical,
  Lightbulb,
  Loader2,
  MessageSquare,
  Network,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

// ─── WASM / env config ──────────────────────────────────────────────────────
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
// Use quantized (int8 / q4) models only — smaller download, same quality on CPU
const CHAT_MODEL = 'Xenova/Qwen1.5-0.5B-Chat';          // ~300 MB quantized
const EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2';           // ~23 MB quantized

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = 'user' | 'ai' | 'system';
type FeatureTab = 'chat' | 'rag' | 'summary' | 'concepts' | 'critique';

interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  sources?: string[];  // RAG chunk snippets
}

interface RAGChunk {
  text: string;
  embedding: number[];
  index: number;
}

interface AskAISidebarProps {
  articleSlug: string;
  articleText: string;
  articleTitle?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function cosineSim(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

function chunkText(text: string, chunkSize = 300, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
    i += chunkSize - overlap;
  }
  return chunks.filter(Boolean);
}

// ─── Singleton pipeline cache ─────────────────────────────────────────────
let _generator: any = null;
let _embedder: any = null;

async function getGenerator(onProgress: (msg: string) => void) {
  if (_generator) return _generator;
  _generator = await pipeline('text-generation', CHAT_MODEL, {
    quantized: true,
    progress_callback: (x: any) => {
      if (x.status === 'downloading')
        onProgress(`Downloading Chat Model… ${Math.round(x.progress || 0)}%`);
      if (x.status === 'ready') onProgress('Chat model ready ✓');
    },
  });
  return _generator;
}

async function getEmbedder(onProgress: (msg: string) => void) {
  if (_embedder) return _embedder;
  _embedder = await pipeline('feature-extraction', EMBED_MODEL, {
    quantized: true,
    progress_callback: (x: any) => {
      if (x.status === 'downloading')
        onProgress(`Downloading Embedder… ${Math.round(x.progress || 0)}%`);
    },
  });
  return _embedder;
}

async function embed(embedder: any, text: string): Promise<number[]> {
  const out = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data as Float32Array);
}

// ─── Pre-built prompts per tab ────────────────────────────────────────────
const CHAT_PROMPTS = [
  'What problem does this paper solve?',
  'Explain the methodology simply',
  'What datasets were used?',
  'Who would benefit from this work?',
];

const CONCEPT_PROMPTS = [
  'List 5 key technical terms with one-line definitions',
  'What prior work does this paper build on?',
  'What equations or formulas are central?',
];

// ─── Feature tab config ───────────────────────────────────────────────────
const TABS: { id: FeatureTab; label: string; icon: React.ReactNode }[] = [
  { id: 'chat',     label: 'Chat',     icon: <MessageSquare size={13} /> },
  { id: 'rag',      label: 'RAG',      icon: <Network size={13} /> },
  { id: 'summary',  label: 'Summary',  icon: <BookOpen size={13} /> },
  { id: 'concepts', label: 'Concepts', icon: <Tag size={13} /> },
  { id: 'critique', label: 'Critique', icon: <FlaskConical size={13} /> },
];

// ─── Component ───────────────────────────────────────────────────────────────
const AskAISidebar: React.FC<AskAISidebarProps> = ({
  articleSlug,
  articleText,
  articleTitle = 'this paper',
}) => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [ragChunks, setRagChunks] = useState<RAGChunk[]>([]);
  const [ragReady, setRagReady] = useState(false);
  const [ragBuilding, setRagBuilding] = useState(false);
  const [oneShot, setOneShot] = useState<Record<FeatureTab, string | null>>({
    chat: null, rag: null, summary: null, concepts: null, critique: null,
  });
  const [expandedSources, setExpandedSources] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // ── Core LLM call ──────────────────────────────────────────────────────
  const callLLM = useCallback(
    async (userPrompt: string, context: string, maxTokens = 200): Promise<string> => {
      const gen = await getGenerator(setStatusMsg);
      const safeCtx = context.slice(0, 1200);
      const sysPrompt = `<|im_start|>system\nYou are a concise academic assistant. Answer ONLY using the provided context. Never hallucinate.\nContext: ${safeCtx}<|im_end|>\n<|im_start|>user\n${userPrompt}<|im_end|>\n<|im_start|>assistant\n`;
      const result = await gen(sysPrompt, {
        max_new_tokens: maxTokens,
        do_sample: false,
        repetition_penalty: 1.15,
        return_full_text: false,
        use_cache: false,
      });
      return result[0].generated_text.trim().replace(/<\|im_end\|>$/, '').trim();
    },
    []
  );

  // ── Build RAG index ────────────────────────────────────────────────────
  const buildRAGIndex = useCallback(async () => {
    if (ragReady || ragBuilding) return;
    setRagBuilding(true);
    setStatusMsg('Building RAG index…');
    try {
      const embedder = await getEmbedder(setStatusMsg);
      const chunks = chunkText(articleText, 280, 40);
      const ragData: RAGChunk[] = [];
      for (let i = 0; i < chunks.length; i++) {
        setStatusMsg(`Embedding chunk ${i + 1}/${chunks.length}…`);
        const emb = await embed(embedder, chunks[i]);
        ragData.push({ text: chunks[i], embedding: emb, index: i });
      }
      setRagChunks(ragData);
      setRagReady(true);
      setStatusMsg('');
      toast.success('RAG index built — semantic search ready!');
    } catch (e) {
      toast.error('Failed to build RAG index.');
    } finally {
      setRagBuilding(false);
    }
  }, [ragReady, ragBuilding, articleText]);

  // ── RAG retrieve ───────────────────────────────────────────────────────
  const ragRetrieve = useCallback(
    async (query: string, topK = 3): Promise<RAGChunk[]> => {
      const embedder = await getEmbedder(setStatusMsg);
      const qEmb = await embed(embedder, query);
      return [...ragChunks]
        .map((c) => ({ ...c, score: cosineSim(qEmb, c.embedding) }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, topK);
    },
    [ragChunks]
  );

  // ── One-shot feature generators ────────────────────────────────────────
  const runSummary = useCallback(async () => {
    setIsProcessing(true);
    setStatusMsg('Summarizing…');
    try {
      const ctx = articleText.slice(0, 1500);
      const result = await callLLM(
        `Summarize "${articleTitle}" in exactly 5 bullet points. Start each with •.`,
        ctx,
        220
      );
      setOneShot((p) => ({ ...p, summary: result }));
    } catch {
      toast.error('Summary failed.');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  }, [articleText, articleTitle, callLLM]);

  const runConcepts = useCallback(async () => {
    setIsProcessing(true);
    setStatusMsg('Extracting concepts…');
    try {
      const ctx = articleText.slice(0, 1500);
      const result = await callLLM(
        'List 6 key technical concepts from this paper. Format: TERM: one-line definition. One per line.',
        ctx,
        250
      );
      setOneShot((p) => ({ ...p, concepts: result }));
    } catch {
      toast.error('Concept extraction failed.');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  }, [articleText, callLLM]);

  const runCritique = useCallback(async () => {
    setIsProcessing(true);
    setStatusMsg('Generating critique…');
    try {
      const ctx = articleText.slice(0, 1500);
      const result = await callLLM(
        'Provide a structured academic critique: Strengths (2 points), Weaknesses (2 points), Open Questions (2 points). Use bullet points.',
        ctx,
        280
      );
      setOneShot((p) => ({ ...p, critique: result }));
    } catch {
      toast.error('Critique failed.');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  }, [articleText, callLLM]);

  // ── Chat send ──────────────────────────────────────────────────────────
  const handleChatSend = useCallback(
    async (text: string = input) => {
      if (!text.trim() || !articleText) return;
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
      setMessages((p) => [...p, userMsg]);
      setInput('');
      setIsProcessing(true);
      setStatusMsg('Loading model…');
      try {
        const ctx = articleText.slice(0, 1200);
        const aiText = await callLLM(text, ctx, 180);
        setMessages((p) => [...p, { id: Date.now().toString(), role: 'ai', text: aiText }]);
      } catch {
        toast.error('AI failed. Try refreshing (Cmd+Shift+R).');
      } finally {
        setIsProcessing(false);
        setStatusMsg('');
      }
    },
    [input, articleText, callLLM]
  );

  // ── RAG chat send ──────────────────────────────────────────────────────
  const handleRAGSend = useCallback(
    async (text: string = input) => {
      if (!text.trim() || !articleText) return;
      if (!ragReady) {
        toast.info('Building RAG index first…');
        await buildRAGIndex();
      }
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
      setMessages((p) => [...p, userMsg]);
      setInput('');
      setIsProcessing(true);
      setStatusMsg('Retrieving relevant passages…');
      try {
        const chunks = await ragRetrieve(text, 3);
        const ctx = chunks.map((c) => c.text).join('\n\n');
        setStatusMsg('Generating answer…');
        const aiText = await callLLM(text, ctx, 200);
        const aiMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'ai',
          text: aiText,
          sources: chunks.map((c) => c.text.slice(0, 100) + '…'),
        };
        setMessages((p) => [...p, aiMsg]);
      } catch {
        toast.error('RAG query failed.');
      } finally {
        setIsProcessing(false);
        setStatusMsg('');
      }
    },
    [input, articleText, ragReady, buildRAGIndex, ragRetrieve, callLLM]
  );

  // ─── Render helpers ─────────────────────────────────────────────────────
  const renderMessages = (prompts: string[], sendFn: (t: string) => void) => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
          <Sparkles size={36} className="text-common-minimal" />
          <p className="text-sm font-medium text-text-secondary">Ask anything about this paper</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => sendFn(p)}
                disabled={isProcessing}
                className="rounded-full border border-common-minimal bg-common-cardBackground px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-functional-blue hover:text-functional-blue disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] rounded-lg p-3 text-sm ${
                  msg.role === 'user'
                    ? 'rounded-tr-none bg-functional-blue text-white'
                    : 'rounded-tl-none border border-common-minimal bg-common-cardBackground text-text-primary whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 ml-1 w-full max-w-[88%]">
                  <button
                    onClick={() => setExpandedSources(expandedSources === msg.id ? null : msg.id)}
                    className="flex items-center gap-1 text-xxs text-text-tertiary hover:text-functional-blue transition-colors"
                  >
                    {expandedSources === msg.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    {msg.sources.length} source passages used
                  </button>
                  {expandedSources === msg.id && (
                    <div className="mt-1 space-y-1">
                      {msg.sources.map((s, i) => (
                        <div key={i} className="rounded border border-common-minimal bg-common-background p-2 text-xxs text-text-tertiary italic">
                          "{s}"
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Loader2 size={13} className="animate-spin text-functional-blue" />
              <span>{statusMsg || 'Processing…'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );

  const renderInput = (sendFn: (t: string) => void) => (
    <div className="border-t border-common-minimal bg-common-background p-3">
      <div className="relative flex items-center">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFn(); }
          }}
          placeholder="Ask a question…"
          disabled={isProcessing}
          className="w-full resize-none rounded-lg border border-common-minimal bg-common-cardBackground py-2.5 pl-3 pr-10 text-sm text-text-primary focus:border-functional-blue focus:outline-none disabled:opacity-50"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
        <Button
          variant="transparent"
          size="sm"
          disabled={!input.trim() || isProcessing}
          onClick={() => sendFn()}
          className="absolute bottom-1 right-1 h-8 w-8 p-0 text-functional-blue hover:bg-functional-blue/10 disabled:text-text-tertiary"
        >
          <Send size={15} />
        </Button>
      </div>
    </div>
  );

  const renderOneShotTab = (
    tabKey: FeatureTab,
    icon: React.ReactNode,
    title: string,
    description: string,
    buttonLabel: string,
    runFn: () => void
  ) => (
    <div className="flex flex-1 flex-col p-4 gap-3 overflow-y-auto">
      {!oneShot[tabKey] ? (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
          <div className="rounded-xl border border-common-minimal bg-common-cardBackground p-4">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="text-xs text-text-tertiary mt-1 max-w-[220px] mx-auto">{description}</p>
          </div>
          <button
            onClick={runFn}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-lg bg-functional-blue px-4 py-2 text-sm font-medium text-white hover:bg-functional-blue/90 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {isProcessing ? statusMsg || 'Running…' : buttonLabel}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{title}</p>
            <button
              onClick={() => setOneShot((p) => ({ ...p, [tabKey]: null }))}
              className="text-text-tertiary hover:text-text-primary"
            >
              <X size={13} />
            </button>
          </div>
          <div className="rounded-lg border border-common-minimal bg-common-cardBackground p-3 text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
            {oneShot[tabKey]}
          </div>
          <button
            onClick={runFn}
            disabled={isProcessing}
            className="text-xs text-functional-blue hover:underline disabled:opacity-50"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col bg-common-background text-text-primary overflow-hidden">

      {/* Header */}
      <div className="border-b border-common-minimal px-3 pt-3 pb-0">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={16} className="text-functional-blue" />
          <h3 className="text-sm font-semibold">Edge AI Assistant</h3>
          <div className="ml-auto flex items-center gap-1 text-xxs text-text-tertiary">
            <ShieldCheck size={11} className="text-functional-green" />
            <span>100% local</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto pb-0 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setMessages([]); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-common-cardBackground border border-b-0 border-common-minimal text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Chat */}
      {activeTab === 'chat' && (
        <>
          {renderMessages(CHAT_PROMPTS, handleChatSend)}
          {renderInput(handleChatSend)}
        </>
      )}

      {/* Tab: RAG */}
      {activeTab === 'rag' && (
        <>
          <div className="px-3 pt-2 pb-1">
            {!ragReady ? (
              <button
                onClick={buildRAGIndex}
                disabled={ragBuilding}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-functional-blue/40 bg-functional-blue/5 py-2 text-xs text-functional-blue hover:bg-functional-blue/10 disabled:opacity-60 transition-colors"
              >
                {ragBuilding
                  ? <><Loader2 size={12} className="animate-spin" />{statusMsg || 'Building index…'}</>
                  : <><FileSearch size={12} />Build Semantic Index (RAG)</>}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xxs text-functional-green">
                <Cpu size={11} />
                <span>RAG index ready · {ragChunks.length} chunks indexed</span>
              </div>
            )}
          </div>
          {renderMessages(
            ['What are the main contributions?', 'Find passages about the dataset', 'Evidence for main claims?'],
            handleRAGSend
          )}
          {renderInput(handleRAGSend)}
        </>
      )}

      {/* Tab: Summary */}
      {activeTab === 'summary' && renderOneShotTab(
        'summary',
        <BookOpen size={28} className="text-functional-blue" />,
        'Auto Summary',
        'Generate a structured 5-point summary of this paper using the local model.',
        'Summarize Paper',
        runSummary
      )}

      {/* Tab: Concepts */}
      {activeTab === 'concepts' && renderOneShotTab(
        'concepts',
        <Lightbulb size={28} className="text-functional-yellow" />,
        'Key Concepts',
        'Extract and define the core technical terms and concepts from this paper.',
        'Extract Concepts',
        runConcepts
      )}

      {/* Tab: Critique */}
      {activeTab === 'critique' && renderOneShotTab(
        'critique',
        <FlaskConical size={28} className="text-functional-purple" />,
        'Academic Critique',
        'Get an AI-generated structured critique: strengths, weaknesses, and open questions.',
        'Critique Paper',
        runCritique
      )}
    </div>
  );
};

export default AskAISidebar;