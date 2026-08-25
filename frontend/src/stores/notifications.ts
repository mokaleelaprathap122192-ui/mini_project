'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'audit' | 'system' | 'bias' | 'success';
}

interface NotificationsState {
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Cross-Lingual Fairness Audit Complete',
    message: 'Hindi & Tamil sentiment model disparity audit finished with 94.2% score.',
    timestamp: '10 mins ago',
    read: false,
    type: 'audit',
  },
  {
    id: 'n2',
    title: 'High Disparity Warning',
    message: 'Bengali dialect sentiment model showed 14% higher bias variance.',
    timestamp: '45 mins ago',
    read: false,
    type: 'bias',
  },
  {
    id: 'n3',
    title: 'Gemini AI Model Sync',
    message: 'Contextual translation & explanation pipeline updated successfully.',
    timestamp: '2 hours ago',
    read: false,
    type: 'success',
  },
  {
    id: 'n4',
    title: 'System Alert',
    message: 'Database backup completed. 13 Indian languages dataset loaded.',
    timestamp: '1 day ago',
    read: true,
    type: 'system',
  },
];

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      markAsRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearAll: () => set({ notifications: [] }),
      addNotification: (item) =>
        set((state) => ({
          notifications: [
            {
              ...item,
              id: 'n_' + Date.now(),
              read: false,
              timestamp: 'Just now',
            },
            ...state.notifications,
          ],
        })),
    }),
    {
      name: 'fa_notifications',
    }
  )
);
