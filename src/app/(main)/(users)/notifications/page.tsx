'use client';

import React, { useEffect } from 'react';

import { useUsersApiGetNotifications, useUsersApiMarkNotificationAsRead } from '@/api/users/users';
import { useAuthStore } from '@/stores/authStore';

const NotificationPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, isPending, refetch } = useUsersApiGetNotifications(
    {},
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { mutate, isSuccess } = useUsersApiMarkNotificationAsRead({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const markAsRead = (id: number) => {
    mutate({ notificationId: id });
  };

  //   const markAsRead = async (id: number) => {
  //     try {
  //       await axios.post(`/api/notifications/${id}/mark-as-read`);
  //       setNotifications(
  //         notifications.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
  //       );
  //     } catch (error) {
  //       console.error('Failed to mark notification as read:', error);
  //     }
  //   };

  // const markAsRead = (id: number) => {
  //   setNotifications(
  //     notifications.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
  //   );
  // };

  return (
    <div className="mx-auto min-h-screen max-w-4xl p-4">
      <h1 className="mb-4 text-center text-2xl font-bold">Notifications</h1>
      <ul>
        {isPending &&
          Array.from({ length: 2 }).map((_, index) => (
            <NotificationCardSkeletonLoader key={index} />
          ))}
        {data &&
          data.data.map((notif) => (
            <li
              key={notif.id}
              className={`mb-2 rounded p-4 ${notif.isRead ? 'bg-gray-200' : 'bg-white-secondary shadow-md'}`}
            >
              <p className={`font-medium ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                {notif.message}
              </p>
              <p className="text-sm text-gray-500">
                {notif.notificationType} - {new Date(notif.createdAt).toLocaleDateString()}
                {/* {new Date(notif.expiresAt).toLocaleDateString()} */}
              </p>
              {notif.content && <p className="text-sm text-gray-500">{notif.content}</p>}
              <div className="mt-2 flex items-center justify-between">
                {/* Display View only if the link is present */}
                {notif.link && (
                  <a href={notif.link} className="text-green-500 hover:text-green-700">
                    View
                  </a>
                )}
                {!notif.isRead && (
                  <button
                    className="rounded bg-green-500 px-2 py-1 text-sm text-white hover:bg-green-700"
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
        <p className="text-center text-gray-500">No notifications to show.</p>
      )}
    </div>
  );
};

export default NotificationPage;

const NotificationCardSkeletonLoader: React.FC = () => {
  return (
    <div className="mb-2 animate-pulse rounded bg-white-secondary p-4 shadow-lg">
      <div className="mb-2 h-4 w-1/2 bg-gray-200"></div>
      <div className="mb-2 h-4 w-1/4 bg-gray-200"></div>
      <div className="h-4 w-3/4 bg-gray-200"></div>
    </div>
  );
};
