import { RefObject, useEffect, useRef } from 'react';

import { useUnreadNotificationsStore } from '@/stores/unreadNotificationsStore';

interface UseMarkAsReadOnViewOptions {
  communityId: number;
  articleId: number;
  itemId: number;
  type: 'discussion' | 'comment' | 'reply';
  enabled: boolean;
  delay?: number; // Default 2000ms
}

/**
 * Hook that uses Intersection Observer to mark an item as read
 * after it has been visible in the viewport for a specified duration.
 *
 * @param ref - React ref to the DOM element to observe
 * @param options - Configuration options including item identifiers and delay
 */
export function useMarkAsReadOnView(
  ref: RefObject<HTMLElement | null>,
  options: UseMarkAsReadOnViewOptions
): void {
  const { communityId, articleId, itemId, type, enabled, delay = 2000 } = options;
  const markItemRead = useUnreadNotificationsStore((s) => s.markItemRead);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    // Reset hasMarked when enabled changes to true (new unread item)
    if (enabled) {
      hasMarkedRef.current = false;
    }
  }, [enabled, itemId]);

  useEffect(() => {
    if (!enabled || !ref.current || hasMarkedRef.current) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasMarkedRef.current) {
          // Start timer when element becomes visible
          timeoutRef.current = setTimeout(() => {
            if (!hasMarkedRef.current) {
              hasMarkedRef.current = true;
              markItemRead(communityId, articleId, itemId, type);
            }
          }, delay);
        } else {
          // Clear timer if element leaves viewport before delay completes
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      {
        threshold: 0.5, // Element must be at least 50% visible
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [ref, communityId, articleId, itemId, type, enabled, delay, markItemRead]);
}

/**
 * Simplified hook for marking items as read without needing article context.
 * Useful when the item context is not readily available (e.g., in Comment component).
 */
export function useMarkAsReadOnViewSimple(
  ref: RefObject<HTMLElement | null>,
  options: {
    itemId: number;
    type: 'discussion' | 'comment' | 'reply';
    enabled: boolean;
    delay?: number;
    onMarkRead?: () => void;
  }
): void {
  const { itemId, type, enabled, delay = 2000, onMarkRead } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (enabled) {
      hasMarkedRef.current = false;
    }
  }, [enabled, itemId]);

  useEffect(() => {
    if (!enabled || !ref.current || hasMarkedRef.current) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasMarkedRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (!hasMarkedRef.current) {
              hasMarkedRef.current = true;
              onMarkRead?.();
            }
          }, delay);
        } else {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [ref, itemId, type, enabled, delay, onMarkRead]);
}
