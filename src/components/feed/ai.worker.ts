/// <reference lib="webworker" />

import { pipeline, env } from '@xenova/transformers';

// ── WASM config ──────────────────────────────────────────────────────────────
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

// TinyLlama is English-only → zero Chinese/CJK bleed-through
// ~260 MB quantized, fast on CPU, fits all modern browsers
const CHAT_MODEL  = 'Xenova/TinyLlama-1.1B-Chat-v1.0';
const EMBED_MODEL = 'Xenova/all-MiniLM-L6-v2'; // 23 MB

let generator: any = null;
let embedder: any  = null;

// ── Utils ─────────────────────────────────────────────────────────────────────

function postStatus(msg: string) {
  self.postMessage({ type: 'status', msg });
}

/** Strip every non-English artifact the model might emit */
function cleanOutput(raw: string): string {
  return raw
    // Chat template tokens (TinyLlama / Llama-2 style)
    .replace(/<\|.*?\|>/g, '')
    .replace(/\[INST\]|\[\/INST\]|<<SYS>>|<\/SYS>>/g, '')
    .replace(/<\/s>|<s>/g, '')
    // CJK Unified Ideographs + Hiragana/Katakana + Hangul
    .replace(/[\u3000-\u9FFF\uF900-\uFAFF\u3040-\u30FF\uAC00-\uD7AF]/g, '')
    // Arabic, Hebrew, Devanagari
    .replace(/[\u0600-\u06FF\u0590-\u05FF\u0900-\u097F]/g, '')
    // Collapse blank lines / extra spaces left behind
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// ── Model loaders (singletons) ────────────────────────────────────────────────

async function loadGenerator() {
  if (generator) return generator;
  generator = await pipeline('text-generation', CHAT_MODEL, {
    quantized: true,
    progress_callback: (x: any) => {
      if (x.status === 'downloading')
        postStatus(`Downloading AI model… ${Math.round(x.progress ?? 0)}%`);
      if (x.status === 'initiate') postStatus('Initializing model…');
      if (x.status === 'ready')    postStatus('Model ready ✓');
    },
  });
  return generator;
}

async function loadEmbedder() {
  if (embedder) return embedder;
  embedder = await pipeline('feature-extraction', EMBED_MODEL, {
    quantized: true,
    progress_callback: (x: any) => {
      if (x.status === 'downloading')
        postStatus(`Downloading embedder… ${Math.round(x.progress ?? 0)}%`);
    },
  });
  return embedder;
}

// ── Core inference ────────────────────────────────────────────────────────────

async function generate(prompt: string, context: string, maxTokens: number): Promise<string> {
  const gen = await loadGenerator();

  // TinyLlama uses Llama-2 chat template
  const fullPrompt =
    `<|system|>\nYou are a concise English-only academic assistant. ` +
    `Answer ONLY using the provided context. Never output non-English characters.\n` +
    `Context:\n${context.slice(0, 1100)}\n</s>\n` +
    `<|user|>\n${prompt}\n</s>\n` +
    `<|assistant|>\n`;

  postStatus('Generating…');

  const out = await gen(fullPrompt, {
    max_new_tokens:     maxTokens,
    do_sample:          false,   // greedy decoding — no randomness, no hallucination
    repetition_penalty: 1.3,
    return_full_text:   false,
    use_cache:          false,   // prevents WASM OOM crashes
  });

  return cleanOutput(out[0].generated_text);
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const emb = await loadEmbedder();
  const results: number[][] = [];
  for (const t of texts) {
    const out = await emb(t, { pooling: 'mean', normalize: true });
    results.push(Array.from(out.data as Float32Array));
  }
  return results;
}

// ── Message bus ───────────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;
  try {
    if (type === 'generate') {
      const text = await generate(payload.prompt, payload.context, payload.maxTokens);
      self.postMessage({ id, type: 'result', text });

    } else if (type === 'embed') {
      const embeddings = await embedBatch(payload.texts);
      self.postMessage({ id, type: 'result', embeddings });

    } else if (type === 'preload') {
      // Warm both models without running inference (optional eager load)
      await loadGenerator();
      await loadEmbedder();
      self.postMessage({ id, type: 'result', text: 'preloaded' });
    }
  } catch (err: any) {
    self.postMessage({ id, type: 'error', message: err?.message ?? 'Worker error' });
  }
};