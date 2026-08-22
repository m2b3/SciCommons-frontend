import { useCallback, useEffect, useRef } from 'react';

type PendingResolve = (value: any) => void;
type PendingReject  = (reason?: any) => void;

interface Pending {
  resolve: PendingResolve;
  reject:  PendingReject;
}

/**
 * useAIWorker
 *
 * Spins up ai.worker.ts once per component mount and exposes two async helpers:
 *   generate(prompt, context, maxTokens) → string
 *   embed(texts[])                       → number[][]
 *
 * All heavy computation stays off the main thread — the UI never freezes.
 * setStatus receives human-readable progress strings from the worker.
 */
export function useAIWorker(setStatus: (msg: string) => void) {
  const workerRef  = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, Pending>>(new Map());
  const idCounter  = useRef(0);

  // ── Boot worker once ──────────────────────────────────────────────────────
  useEffect(() => {
    const worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (e: MessageEvent) => {
      const { id, type, msg, text, embeddings, message } = e.data;

      // Status updates have no id — forward to UI
      if (type === 'status') {
        setStatus(msg);
        return;
      }

      const pending = pendingRef.current.get(id);
      if (!pending) return;
      pendingRef.current.delete(id);

      if (type === 'error') {
        pending.reject(new Error(message));
      } else {
        // result: either text (generate) or embeddings (embed)
        pending.resolve(text !== undefined ? text : embeddings);
      }
    };

    worker.onerror = (err) => {
      console.error('[AIWorker]', err);
      // Reject all in-flight promises on a fatal worker crash
      pendingRef.current.forEach((p) => p.reject(err));
      pendingRef.current.clear();
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: post a message and await a response ───────────────────────────
  const call = useCallback(<T>(type: string, payload: object): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialised'));
        return;
      }
      const id = String(++idCounter.current);
      pendingRef.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ id, type, payload });
    });
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────
  const generate = useCallback(
    (prompt: string, context: string, maxTokens = 200) =>
      call<string>('generate', { prompt, context, maxTokens }),
    [call]
  );

  const embed = useCallback(
    (texts: string[]) =>
      call<number[][]>('embed', { texts }),
    [call]
  );

  /** Optional: eagerly load both models in the background */
  const preload = useCallback(() => call<string>('preload', {}), [call]);

  return { generate, embed, preload };
}