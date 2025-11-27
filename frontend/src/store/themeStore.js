import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') || 'light';
  }
  return 'light';
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          return { theme: newTheme };
        });
      },

      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
