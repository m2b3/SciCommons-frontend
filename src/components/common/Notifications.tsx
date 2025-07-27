'use client';

import React, { useEffect } from 'react';

import { useUsersApiGetNotifications, useUsersApiMarkNotificationAsRead } from '@/api/users/users';
import { useAuthStore } from '@/stores/authStore';

interface NotificationsProps {
  article_slug?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ article_slug }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query_params = article_slug ? { article_slug } : {};

  const { data, isPending, refetch } = useUsersApiGetNotifications(query_params, {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    query: {
      enabled: !!accessToken,
    },
  });

  const { mutate, isSuccess } = useUsersApiMarkNotificationAsRead({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
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

  return (
    <div className="mx-auto min-h-screen max-w-4xl p-4 text-gray-900">
      <h1 className="mb-4 text-center font-bold res-heading-sm">Notifications</h1>
      <ul>
        {isPending &&
          Array.from({ length: 5 }).map((_, index) => (
            <NotificationCardSkeletonLoader key={index} />
          ))}
        {data &&
          data.data.map((notif) => (
            <li
              key={notif.id}
              className={`mb-2 rounded p-4 ${
                notif.isRead ? 'bg-gray-200' : 'bg-white-secondary shadow-md'
              }`}
            >
              <p
                className={`font-medium res-text-base ${
                  notif.isRead ? 'text-gray-600' : 'text-gray-900'
                }`}
              >
                {notif.message}
              </p>
              <p className="text-gray-500 res-text-xs">
                {notif.notificationType} - {new Date(notif.createdAt).toLocaleDateString()}
              </p>
              {notif.content && <p className="text-gray-500 res-text-xs">{notif.content}</p>}
              <div className="mt-2 flex items-center justify-between">
                {notif.link && (
                  <a href={notif.link} className="text-green-500 hover:text-green-700">
                    View
                  </a>
                )}
                {!notif.isRead && (
                  <button
                    className="rounded bg-green-500 px-2 py-1 text-white res-text-xs hover:bg-green-700"
                    onClick={() => markAsRead(notif.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </li>
          ))}
      </ul>
      {data?.data.length === 0 && (
        <p className="text-center text-gray-500 res-text-base">No notifications to show.</p>
      )}
    </div>
  );
};

export default Notifications;

const NotificationCardSkeletonLoader: React.FC = () => {
  return (
    <div className="mb-2 animate-pulse rounded bg-white-secondary p-4 shadow-lg">
      <div className="mb-2 h-4 w-1/2 bg-gray-200"></div>
      <div className="mb-2 h-4 w-1/4 bg-gray-200"></div>
      <div className="h-4 w-3/4 bg-gray-200"></div>
    </div>
  );
};
