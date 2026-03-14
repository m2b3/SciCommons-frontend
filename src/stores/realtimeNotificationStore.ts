import { create } from 'zustand';

/* Created by Claude on 2026-03-15
   What: Store for managing realtime notification toasts
   Why: Track incoming realtime notifications for display in toast UI
   How: Simple in-memory store with add/dismiss actions, no persistence needed */

export interface RealtimeNotification {
  id: string;
  notificationType: string;
  category: string;
  message: string;
  link: string | null;
  content: string | null;
  communityId: number | null;
  articleId: number | null;
  notificationIds: number[];
  timestamp: string;
  receivedAt: number;
}

interface RealtimeNotificationState {
  notifications: RealtimeNotification[];
  addNotification: (notification: Omit<RealtimeNotification, 'receivedAt'>) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const MAX_NOTIFICATIONS = 5;

export const useRealtimeNotificationStore = create<RealtimeNotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    set((state) => {
      const newNotification: RealtimeNotification = {
        ...notification,
        receivedAt: Date.now(),
      };

      const updated = [newNotification, ...state.notifications].slice(0, MAX_NOTIFICATIONS);
      return { notifications: updated };
    });
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));
