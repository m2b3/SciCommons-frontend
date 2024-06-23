'use client';

import React, { useState } from 'react';

type ArticleNotification = {
  id: number;
  message: string;
  isRead: boolean;
  link: string;
  notificationType: string;
  expiresAt: string;
};

const mockNotifications: ArticleNotification[] = [
  {
    id: 1,
    message: 'Your request to join the Science Community has been approved!',
    isRead: false,
    link: '/community/science',
    notificationType: 'Join Request Approved',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
  },
  {
    id: 2,
    message: 'New comment on your post "Latest Research on Neural Networks"',
    isRead: true,
    link: '/posts/neural-networks',
    notificationType: 'New Comment',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
  },
  {
    id: 3,
    message: 'Jane Doe replied to your comment on "Quantum Computing Advances"',
    isRead: false,
    link: '/articles/quantum-computing',
    notificationType: 'Comment Reply',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
  },
];

const ArticleNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<ArticleNotification[]>(mockNotifications);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-center text-2xl font-bold">Notifications</h1>
      <ul>
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`mb-2 rounded p-4 ${notif.isRead ? 'bg-gray-200' : 'bg-white shadow-md'}`}
          >
            <p className={`font-medium ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
              {notif.message}
            </p>
            <p className="text-sm text-gray-500">
              {notif.notificationType} - Expires on:{' '}
              {new Date(notif.expiresAt).toLocaleDateString()}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <a href={notif.link} className="text-green-500 hover:text-green-700">
                View
              </a>
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
      {notifications.length === 0 && (
        <p className="text-center text-gray-500">No notifications to show.</p>
      )}
    </div>
  );
};

export default ArticleNotifications;
