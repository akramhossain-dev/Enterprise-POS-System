import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { Theme } from '@/types/common';

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
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
  setBreadcrumbs: (crumbs: Array<{ label: string; href?: string }>) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        sidebarCollapsed: false,
        theme: 'system',
        isPageLoading: false,
        commandPaletteOpen: false,
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
