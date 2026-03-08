'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { useSubscriptionUnreadStore } from '@/stores/subscriptionUnreadStore';

const UNREAD_COUNT_PREFIX_REGEX = /^\(\d+\+?\)\s*/;

/**
 * Hook that updates the browser tab title to show unread notification count.
 * Format: "(5) Original Title" when there are unreads, "Original Title" when none.
 *
 * Should be used once at the app root level (e.g., in a layout or provider).
 */
export function useTabTitleNotification(): void {
  const newEventsCount = useSubscriptionUnreadStore((s) => s.getNewEventsCount());
  const pathname = usePathname();
  const baseTitleRef = useRef<string>('');
  const syncTimeoutRef = useRef<number | null>(null);

  /* Fixed by Codex on 2026-03-08
     Who: Codex
     What: Reworked tab-title sync to follow route metadata instead of pinning first-load titles.
     Why: Navigation between pages (for example Home -> Communities -> Home, and Bookmarks tabs) could keep stale titles.
     How: On unread-count and path changes, refresh the base title from current document metadata, then apply the unread prefix without forcing stale cleanup titles. */
  /* Fixed by Codex on 2026-03-08
     Who: Codex
     What: Removed `useSearchParams` dependency from the global navbar title hook.
     Why: Using `useSearchParams` in this globally mounted hook forced Next.js Suspense boundaries for many prerendered routes and broke static export.
     How: Keep title resync keyed to path + unread-count changes, which still tracks route transitions without CSR-bailout constraints. */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const syncTitle = () => {
      const currentRouteTitle = document.title.replace(UNREAD_COUNT_PREFIX_REGEX, '').trim();

      if (currentRouteTitle) {
        baseTitleRef.current = currentRouteTitle;
      }

      if (!baseTitleRef.current) {
        return;
      }

      if (newEventsCount > 0) {
        const countDisplay = newEventsCount > 99 ? '99+' : newEventsCount;
        document.title = `(${countDisplay}) ${baseTitleRef.current}`;
      } else {
        document.title = baseTitleRef.current;
      }
    };

    if (syncTimeoutRef.current !== null) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      syncTitle();
      syncTimeoutRef.current = null;
    }, 0);

    return () => {
      if (syncTimeoutRef.current !== null) {
        window.clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [newEventsCount, pathname]);
}

/**
 * Hook that flashes the tab title when new notifications arrive while tab is hidden.
 * This provides additional visual feedback for background tabs.
 */
export function useTabTitleFlash(): void {
  const newEventsCount = useSubscriptionUnreadStore((s) => s.getNewEventsCount());
  const prevUnreadRef = useRef(newEventsCount);
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalTitleRef = useRef<string>('');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      // Stop flashing when tab becomes visible
      if (!document.hidden && flashIntervalRef.current) {
        clearInterval(flashIntervalRef.current);
        flashIntervalRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (flashIntervalRef.current) {
        clearInterval(flashIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Check if new unreads arrived while tab is hidden
    const hasNewUnreads = newEventsCount > prevUnreadRef.current;
    prevUnreadRef.current = newEventsCount;

    if (hasNewUnreads && document.hidden && newEventsCount > 0) {
      // Store current title for flashing
      originalTitleRef.current = document.title;

      // Clear any existing flash interval
      if (flashIntervalRef.current) {
        clearInterval(flashIntervalRef.current);
      }

      // Flash between notification message and original title
      let isFlashed = false;
      flashIntervalRef.current = setInterval(() => {
        if (document.hidden) {
          document.title = isFlashed
            ? originalTitleRef.current
            : `🔔 New notification! - ${originalTitleRef.current}`;
          isFlashed = !isFlashed;
        } else {
          // Stop flashing if tab becomes visible
          if (flashIntervalRef.current) {
            clearInterval(flashIntervalRef.current);
            flashIntervalRef.current = null;
          }
          document.title = originalTitleRef.current;
        }
      }, 1000);
    }
  }, [newEventsCount]);
}
