'use client';

import { useEffect, useRef } from 'react';

import { useUnreadNotificationsStore } from '@/stores/unreadNotificationsStore';

/**
 * Hook that updates the browser tab title to show unread notification count.
 * Format: "(5) Original Title" when there are unreads, "Original Title" when none.
 *
 * Should be used once at the app root level (e.g., in a layout or provider).
 */
export function useTabTitleNotification(): void {
  const totalUnread = useUnreadNotificationsStore((s) => s.getTotalUnreadCount());
  const originalTitleRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Only run on client side
    if (typeof document === 'undefined') return;

    // Capture the original title on first run (strip any existing count prefix)
    if (!isInitializedRef.current) {
      originalTitleRef.current = document.title.replace(/^\(\d+\)\s*/, '');
      isInitializedRef.current = true;
    }

    // Update title based on unread count
    if (totalUnread > 0) {
      const countDisplay = totalUnread > 99 ? '99+' : totalUnread;
      document.title = `(${countDisplay}) ${originalTitleRef.current}`;
    } else {
      document.title = originalTitleRef.current;
    }

    // Cleanup: restore original title when component unmounts
    return () => {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [totalUnread]);
}

/**
 * Hook that flashes the tab title when new notifications arrive while tab is hidden.
 * This provides additional visual feedback for background tabs.
 */
export function useTabTitleFlash(): void {
  const totalUnread = useUnreadNotificationsStore((s) => s.getTotalUnreadCount());
  const prevUnreadRef = useRef(totalUnread);
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
    const hasNewUnreads = totalUnread > prevUnreadRef.current;
    prevUnreadRef.current = totalUnread;

    if (hasNewUnreads && document.hidden && totalUnread > 0) {
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
  }, [totalUnread]);
}
