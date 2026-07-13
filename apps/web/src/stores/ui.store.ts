import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { Theme } from '@/types/common';
import type { Notification } from '@/types/notification';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme
  theme: Theme;

  // Page loading
  isPageLoading: boolean;

  // Command palette
  commandPaletteOpen: boolean;

  // Notifications
  notifications: Notification[];
  notificationsOpen: boolean;
  unreadCount: number;

  // Active modal (by name)
  activeModal: string | null;
  modalData: unknown;

  // Breadcrumb
  breadcrumbs: Array<{ label: string; href?: string }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
  setPageLoading: (loading: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
  setBreadcrumbs: (crumbs: Array<{ label: string; href?: string }>) => void;
}

// Demo notifications for F3 showcase
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'sale',
    title: 'New sale completed',
    body: 'Order #1042 — $284.00',
    href: '/sales',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'stock',
    title: 'Low stock alert',
    body: 'iPhone 15 Pro — 3 units remaining',
    href: '/inventory',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment received',
    body: 'Invoice #2198 — $1,200.00 paid',
    href: '/accounting',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'system',
    title: 'System update available',
    body: 'Enterprise POS v1.1.0 is ready',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: true,
        sidebarCollapsed: false,
        theme: 'system',
        isPageLoading: false,
        commandPaletteOpen: false,
        notifications: DEMO_NOTIFICATIONS,
        notificationsOpen: false,
        unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.isRead).length,
        activeModal: null,
        modalData: null,
        breadcrumbs: [],

        toggleSidebar: () =>
          set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'ui/toggleSidebar'),

        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

        toggleSidebarCollapsed: () =>
          set(
            (s) => ({ sidebarCollapsed: !s.sidebarCollapsed }),
            false,
            'ui/toggleSidebarCollapsed',
          ),

        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed'),

        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),

        setPageLoading: (loading) => set({ isPageLoading: loading }, false, 'ui/setPageLoading'),

        setCommandPaletteOpen: (open) =>
          set({ commandPaletteOpen: open }, false, 'ui/setCommandPaletteOpen'),

        setNotificationsOpen: (open) =>
          set({ notificationsOpen: open }, false, 'ui/setNotificationsOpen'),

        addNotification: (n) =>
          set(
            (s) => ({
              notifications: [n, ...s.notifications],
              unreadCount: s.unreadCount + (n.isRead ? 0 : 1),
            }),
            false,
            'ui/addNotification',
          ),

        markRead: (id) =>
          set(
            (s) => {
              const notifications = s.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n,
              );
              return {
                notifications,
                unreadCount: notifications.filter((n) => !n.isRead).length,
              };
            },
            false,
            'ui/markRead',
          ),

        markAllRead: () =>
          set(
            (s) => ({
              notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
              unreadCount: 0,
            }),
            false,
            'ui/markAllRead',
          ),

        removeNotification: (id) =>
          set(
            (s) => {
              const notifications = s.notifications.filter((n) => n.id !== id);
              return {
                notifications,
                unreadCount: notifications.filter((n) => !n.isRead).length,
              };
            },
            false,
            'ui/removeNotification',
          ),

        clearNotifications: () =>
          set({ notifications: [], unreadCount: 0 }, false, 'ui/clearNotifications'),

        openModal: (name, data) =>
          set({ activeModal: name, modalData: data ?? null }, false, 'ui/openModal'),

        closeModal: () => set({ activeModal: null, modalData: null }, false, 'ui/closeModal'),

        setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }, false, 'ui/setBreadcrumbs'),
      }),
      {
        name: 'epos_ui',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);
