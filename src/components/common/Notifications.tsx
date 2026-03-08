'use client';

import React, { useEffect } from 'react';

import Link from 'next/link';

import { useUsersApiGetNotifications, useUsersApiMarkNotificationAsRead } from '@/api/users/users';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { getSafeNavigableUrl } from '@/lib/safeUrl';
import { useAuthStore } from '@/stores/authStore';

interface NotificationsProps {
  article_slug?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ article_slug }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authHeaders = useAuthHeaders();

  const query_params = article_slug ? { article_slug } : {};

  const { data, isPending, refetch } = useUsersApiGetNotifications(query_params, {
    request: authHeaders,
    query: {
      enabled: isAuthenticated,
    },
  });

  const { mutate, isSuccess } = useUsersApiMarkNotificationAsRead({
    request: authHeaders,
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const markAsRead = (id: number) => {
    mutate(
      { notificationId: id },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  /* Fixed by Codex on 2026-02-15
     Problem: Notification UI used fixed grays/greens that prevented easy skin swaps.
     Solution: Replace hard-coded colors with semantic tokens for text, surfaces, and actions.
     Result: Notifications now inherit the active skin without layout changes. */
  return (
    <div className="mx-auto min-h-screen max-w-4xl p-4 text-text-primary">
      <h1 className="mb-4 text-center font-bold res-heading-sm">Notifications</h1>
      <ul>
        {isPending &&
          Array.from({ length: 5 }).map((_, index) => (
            <NotificationCardSkeletonLoader key={index} />
          ))}
        {data &&
          data.data.map((notif) => {
            /* Fixed by Codex on 2026-02-25
               Who: Codex
               What: Normalize notification links into safe internal/external targets.
               Why: Relative notification paths should navigate within the app instead of dead-linking to a wrong host.
               How: Resolve with shared safe URL helper and branch to Next `Link` for internal paths. */
            const safeLink = getSafeNavigableUrl(notif.link);
            return (
              <li
                key={notif.id}
                className={`mb-2 rounded p-4 ${
                  notif.isRead ? 'bg-common-contrast' : 'bg-common-cardBackground shadow-md'
                }`}
              >
                <p
                  className={`font-medium res-text-base ${
                    notif.isRead ? 'text-text-secondary' : 'text-text-primary'
                  }`}
                >
                  {notif.message}
                </p>
                <p className="text-text-tertiary res-text-xs">
                  {notif.notificationType} - {new Date(notif.createdAt).toLocaleDateString()}
                </p>
                {notif.content && <p className="text-text-tertiary res-text-xs">{notif.content}</p>}
                <div className="mt-2 flex items-center justify-between">
                  {safeLink &&
                    (safeLink.isExternal ? (
                      <a
                        href={safeLink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-functional-green hover:text-functional-greenContrast"
                      >
                        View
                      </a>
                    ) : (
                      <Link
                        href={safeLink.href}
                        className="text-functional-green hover:text-functional-greenContrast"
                      >
                        View
                      </Link>
                    ))}
                  {!notif.isRead && (
                    <button
                      className="rounded bg-functional-green px-2 py-1 text-primary-foreground res-text-xs hover:bg-functional-greenContrast"
                      onClick={() => markAsRead(notif.id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </li>
            );
          })}
      </ul>
      {data?.data.length === 0 && (
        <p className="text-center text-text-tertiary res-text-base">No notifications to show.</p>
      )}
    </div>
  );
};

export default Notifications;

const NotificationCardSkeletonLoader: React.FC = () => {
  return (
    <div className="mb-2 animate-pulse rounded bg-common-cardBackground p-4 shadow-lg">
      <div className="mb-2 h-4 w-1/2 bg-common-contrast"></div>
      <div className="mb-2 h-4 w-1/4 bg-common-contrast"></div>
      <div className="h-4 w-3/4 bg-common-contrast"></div>
    </div>
  );
};
