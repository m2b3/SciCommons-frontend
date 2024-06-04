import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

// Todo: access tokens via cookies

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      setAccessToken: (token: string) =>
        set(() => ({
          isAuthenticated: true,
          accessToken: token,
        })),
      logout: () =>
        set(() => ({
          isAuthenticated: false,
          accessToken: null,
        })),
    }),
    {
      name: 'auth-storage', // Name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Specify the storage medium
    }
  )
);
