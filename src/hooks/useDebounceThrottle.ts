import { useCallback, useEffect, useRef, useState } from 'react';

// Debounce Value Hook
export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Debounce Function Hook
export function useDebounceFunction<F extends (...args: any[]) => any>(fn: F, delay: number): F {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<F>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  ) as F;
}

// Throttle Value Hook
export function useThrottleValue<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
}

// Throttle Function Hook
export function useThrottleFunction<F extends (...args: any[]) => any>(fn: F, limit: number): F {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<F>) => {
      const now = Date.now();
      const remainingTime = limit - (now - lastRan.current);

      if (remainingTime <= 0) {
        lastRan.current = now;
        fn(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastRan.current = Date.now();
          fn(...args);
          timeoutRef.current = null;
        }, remainingTime);
      }
    },
    [fn, limit]
  ) as F;
}
