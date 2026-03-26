'use client';

/* Created by Claude on 2026-03-15
   What: NotificationToast component for realtime notification alerts
   Why: Show animated bottom sheet when new notifications arrive via realtime
   How: Positioned below bell icon, auto-dismisses after 5 seconds with slide animation */
import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { Bell, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  RealtimeNotification,
  useRealtimeNotificationStore,
} from '@/stores/realtimeNotificationStore';

const TOAST_DURATION_MS = 5000;

interface NotificationToastItemProps {
  notification: RealtimeNotification;
  onDismiss: (id: string) => void;
}

const NotificationToastItem: React.FC<NotificationToastItemProps> = ({
  notification,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300);
    }, TOAST_DURATION_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [notification.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const handleClick = () => {
    handleDismiss();
  };

  const content = (
    <div
      className={cn(
        'relative flex w-72 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-common-contrast bg-common-cardBackground p-3 shadow-lg transition-all duration-300',
        isVisible && !isExiting ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-functional-green/10">
        <Bell size={16} className="text-functional-green" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-text-primary">{notification.message}</p>
        {notification.content && (
          <p className="mt-1 line-clamp-1 text-xs text-text-secondary">{notification.content}</p>
        )}
        <span className="mt-1 inline-block rounded-full bg-functional-green/10 px-2 py-0.5 text-[10px] font-medium capitalize text-functional-green">
          {notification.category}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDismiss();
        }}
        className="shrink-0 rounded p-0.5 text-text-tertiary hover:bg-common-minimal hover:text-text-secondary"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

const NotificationToast: React.FC = () => {
  const notifications = useRealtimeNotificationStore(
    (state: { notifications: RealtimeNotification[] }) => state.notifications
  );
  const dismissNotification = useRealtimeNotificationStore(
    (state: { dismissNotification: (id: string) => void }) => state.dismissNotification
  );

  if (notifications.length === 0) {
    return null;
  }

  /* Fixed by Claude on 2026-03-15
     What: Position toast to most right of window
     Why: Toast should align with dropdown positioning at window edge
     How: Use fixed positioning relative to viewport right edge */
  return (
    <div className="pointer-events-auto fixed right-4 top-16 z-50 flex flex-col gap-2">
      {notifications.slice(0, 3).map((notification: RealtimeNotification) => (
        <NotificationToastItem
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
};

export default NotificationToast;
