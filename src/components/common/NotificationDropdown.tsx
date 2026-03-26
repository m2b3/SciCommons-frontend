'use client';

/* Created by Claude on 2026-03-15
   What: NotificationDropdown component for navbar bell icon
   Why: Users requested dropdown panel instead of direct navigation to notifications page
   How: Receives notifications from parent, filters to show unread (up to 50), with mark-as-read functionality */
import React, { useCallback, useMemo, useState } from 'react';

import Link from 'next/link';

import { useQueryClient } from '@tanstack/react-query';
import { Check, CheckCheck, ExternalLink } from 'lucide-react';

import { useUsersApiBulkMarkNotificationsAsRead } from '@/api/users/users';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { getSafeNavigableUrl } from '@/lib/safeUrl';

const NOTIFICATION_PARSING_BASE = 'https://scicommons.org';
const MAX_UNREAD_NOTIFICATIONS = 50;

interface NotificationItem {
  id: number;
  message: string;
  isRead: boolean;
  notificationType: string;
  createdAt: string;
  content: string | null;
  link: string | null;
  category: string;
}

interface NotificationDropdownContentProps {
  onClose: () => void;
  onNotificationClick: () => void;
  notifications: NotificationItem[];
}

const formatNotificationTime = (timestamp: string): string => {
  const parsedTimestamp = Date.parse(timestamp);
  if (Number.isNaN(parsedTimestamp)) return '';

  const now = Date.now();
  const diff = now - parsedTimestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(parsedTimestamp).toLocaleDateString();
};

const NotificationDropdownContent: React.FC<NotificationDropdownContentProps> = ({
  onClose,
  onNotificationClick,
  notifications: allNotifications,
}) => {
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();
  const [optimisticReadIds, setOptimisticReadIds] = useState<Set<number>>(new Set());
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);

  /* Fixed by Claude on 2026-03-15
     What: Use bulk mark notifications as read API
     Why: Single API call instead of multiple calls for each notification
     How: Use useUsersApiBulkMarkNotificationsAsRead with notification_ids array */
  const { mutateAsync: bulkMarkAsRead } = useUsersApiBulkMarkNotificationsAsRead({
    request: authHeaders,
  });

  const notifications = useMemo(() => {
    return allNotifications
      .filter((n) => !n.isRead && !optimisticReadIds.has(n.id))
      .slice(0, MAX_UNREAD_NOTIFICATIONS);
  }, [allNotifications, optimisticReadIds]);

  const invalidateNotifications = useCallback(() => {
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const keyStr = JSON.stringify(query.queryKey);
        return keyStr.includes('/api/users/notifications');
      },
    });
  }, [queryClient]);

  const handleMarkAsRead = useCallback(
    async (notificationId: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setOptimisticReadIds((prev) => new Set([...prev, notificationId]));

      try {
        await bulkMarkAsRead({ data: { notification_ids: [notificationId] } });
        invalidateNotifications();
      } catch {
        setOptimisticReadIds((prev) => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
      }
    },
    [bulkMarkAsRead, invalidateNotifications]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (isMarkingAllAsRead || notifications.length === 0) return;

    setIsMarkingAllAsRead(true);
    const ids = notifications.map((n) => n.id);
    setOptimisticReadIds((prev) => new Set([...prev, ...ids]));

    try {
      await bulkMarkAsRead({ data: { notification_ids: ids } });
      invalidateNotifications();
    } catch {
      setOptimisticReadIds(new Set());
    } finally {
      setIsMarkingAllAsRead(false);
    }
  }, [isMarkingAllAsRead, bulkMarkAsRead, notifications, invalidateNotifications]);

  const renderNotificationItem = (notification: NotificationItem) => {
    const safeLink = getSafeNavigableUrl(notification.link, NOTIFICATION_PARSING_BASE);

    const content = (
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 flex-1 text-sm font-medium text-text-primary">
            {notification.message}
          </p>
          <Button
            type="button"
            variant="transparent"
            size="sm"
            className="h-6 w-6 shrink-0 p-0"
            onClick={(e) => handleMarkAsRead(notification.id, e)}
            title="Mark as read"
          >
            <Check size={14} className="text-text-tertiary hover:text-functional-green" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary">
            {formatNotificationTime(notification.createdAt)}
          </span>
          <span className="rounded-full bg-functional-green/10 px-2 py-0.5 text-[10px] font-medium text-functional-green">
            {notification.category}
          </span>
        </div>
      </div>
    );

    if (safeLink) {
      const linkProps = safeLink.isExternal
        ? { href: safeLink.href, target: '_blank', rel: 'noopener noreferrer' }
        : { href: safeLink.href };

      return (
        <DropdownMenuItem key={notification.id} asChild className="cursor-pointer p-0">
          <Link
            {...linkProps}
            onClick={() => {
              onNotificationClick();
              void handleMarkAsRead(notification.id, {
                preventDefault: () => {},
                stopPropagation: () => {},
              } as React.MouseEvent);
            }}
            className="block w-full px-3 py-2.5 hover:bg-common-minimal/50"
          >
            {content}
          </Link>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem key={notification.id} className="cursor-default px-3 py-2.5">
        {content}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenuContent
      sideOffset={20}
      align="end"
      alignOffset={-100}
      className="w-[420px] max-w-[calc(100vw-1rem)]"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold text-text-primary">Unread Notifications</h3>
        {notifications.length > 0 && (
          <Button
            type="button"
            variant="transparent"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead}
          >
            <ButtonIcon>
              <CheckCheck size={12} />
            </ButtonIcon>
            <ButtonTitle>{isMarkingAllAsRead ? 'Marking...' : 'Mark all read'}</ButtonTitle>
          </Button>
        )}
      </div>

      <DropdownMenuSeparator />

      <div className="max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-text-tertiary">No unread notifications</p>
          </div>
        ) : (
          <div className="py-1">{notifications.map(renderNotificationItem)}</div>
        )}
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild className="cursor-pointer">
        <Link
          href="/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-functional-green hover:text-functional-greenContrast"
        >
          View all notifications
          <ExternalLink size={14} />
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

export default NotificationDropdownContent;
