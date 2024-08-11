import Cookies from 'js-cookie';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

const AUTH_COOKIE_NAME = 'auth_token';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      setAccessToken: (token: string) => {
        Cookies.set(AUTH_COOKIE_NAME, token, { secure: true, sameSite: 'strict' });
        set(() => ({
          isAuthenticated: true,
          accessToken: token,
        }));
      },
      logout: () => {
        Cookies.remove(AUTH_COOKIE_NAME);
        set(() => ({
          isAuthenticated: false,
          accessToken: null,
        }));
      },
      initializeAuth: async () => {
        const cookieToken = Cookies.get(AUTH_COOKIE_NAME);
        if (cookieToken) {
          // Optionally validate the token here
          set({
            isAuthenticated: true,
            accessToken: cookieToken,
          });
        } else {
          // If no cookie, check localStorage as fallback
          const { state } = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          if (state && state.accessToken) {
            // Move token from localStorage to cookie
            Cookies.set(AUTH_COOKIE_NAME, state.accessToken, { secure: true, sameSite: 'strict' });
            set({
              isAuthenticated: true,
              accessToken: state.accessToken,
            });
          } else {
            // No valid token found
            set({
              isAuthenticated: false,
              accessToken: null,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
