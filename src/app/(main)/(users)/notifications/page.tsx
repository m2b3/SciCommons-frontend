'use client';

import React, { useEffect } from 'react';

import { Check, CheckCheck, SquareArrowOutUpRight } from 'lucide-react';

import { useUsersApiGetNotifications, useUsersApiMarkNotificationAsRead } from '@/api/users/users';
import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
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
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-center text-4xl font-bold text-text-primary sm:my-6">
        Notifications
      </h1>
      <ul className="flex w-full flex-col items-center gap-4">
        {isPending && <NotificationCardSkeletonLoader />}
        {data &&
          data.data.map((notif) => (
            <li
              key={notif.id}
              className={`w-full rounded-xl border p-4 ${notif.isRead ? 'border-common-minimal bg-common-background' : 'border-common-contrast bg-common-cardBackground'}`}
            >
              <p
                className={`text-base font-medium ${notif.isRead ? 'text-text-secondary' : 'text-text-primary'}`}
              >
                {notif.message}
              </p>
              <p className="text-sm text-text-tertiary">
                {notif.notificationType} - {new Date(notif.createdAt).toLocaleDateString()}
                {/* {new Date(notif.expiresAt).toLocaleDateString()} */}
              </p>
              {notif.content && <p className="mt-2 text-sm text-text-secondary">{notif.content}</p>}
              <div className="mt-2 flex items-center justify-between">
                {/* Display View only if the link is present */}
                {notif.link && (
                  <a
                    href={notif.link}
                    className="flex items-center gap-1 text-sm text-functional-green hover:text-functional-greenContrast"
                  >
                    View
                    <SquareArrowOutUpRight size={12} className="inline" />
                  </a>
                )}
                {!notif.isRead ? (
                  <Button onClick={() => markAsRead(notif.id)} className="px-3 py-1.5">
                    <ButtonIcon>
                      <Check size={14} />
                    </ButtonIcon>
                    <ButtonTitle className="sm:text-xs">Mark as Read</ButtonTitle>
                  </Button>
                ) : (
                  <Button
                    className="px-3 py-1.5 text-text-tertiary hover:bg-transparent"
                    variant={'outline'}
                  >
                    <ButtonIcon>
                      <CheckCheck size={14} />
                    </ButtonIcon>
                    <ButtonTitle className="sm:text-xs">Read</ButtonTitle>
                  </Button>
                )}
              </div>
            </li>
          ))}
      </ul>
      {data?.data.length === 0 && (
        <p className="text-center text-text-tertiary">No notifications to show.</p>
      )}
    </div>
  );
};

export default NotificationPage;

const NotificationCardSkeletonLoader: React.FC = () => {
  return (
    <Skeleton className="w-full gap-4">
      <BlockSkeleton className="h-28 rounded-xl" />
      <BlockSkeleton className="h-28 rounded-xl" />
      <BlockSkeleton className="h-28 rounded-xl" />
    </Skeleton>
  );
};
