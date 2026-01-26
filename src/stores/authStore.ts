import Cookies from 'js-cookie';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { useUnreadNotificationsStore } from './unreadNotificationsStore';

export interface AuthenticatedUserType {
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  user: AuthenticatedUserType | null;
  setAccessToken: (token: string, user: AuthenticatedUserType) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  isTokenExpired: () => boolean;
  getUser: () => AuthenticatedUserType | null;
}

const AUTH_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 1 day

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      user: null,
      setAccessToken: (token: string, user: AuthenticatedUserType) => {
        const expiresAt = Date.now() + TOKEN_EXPIRATION_TIME;
        Cookies.set(AUTH_COOKIE_NAME, token, { secure: true, sameSite: 'strict' });
        Cookies.set('expiresAt', expiresAt.toString(), { secure: true, sameSite: 'strict' });
        set(() => ({
          isAuthenticated: true,
          accessToken: token,
          expiresAt,
          user,
        }));
      },
      logout: () => {
        Cookies.remove(AUTH_COOKIE_NAME);
        Cookies.remove('expiresAt');
        // Clear unread notifications on logout
        useUnreadNotificationsStore.getState().clearAll();
        set(() => ({
          isAuthenticated: false,
          accessToken: null,
          expiresAt: null,
          user: null,
        }));
      },
      initializeAuth: async () => {
        const cookieToken = Cookies.get(AUTH_COOKIE_NAME);
        const cookieExpiresAt = Cookies.get('expiresAt');
        if (cookieToken && cookieExpiresAt) {
          const expiresAt = parseInt(cookieExpiresAt, 10);
          set({
            isAuthenticated: true,
            accessToken: cookieToken,
            expiresAt,
          });
        } else {
          // If no cookie, check localStorage as fallback
          const { state } = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          if (state && state.accessToken && state.expiresAt) {
            // Move token from localStorage to cookie
            Cookies.set(AUTH_COOKIE_NAME, state.accessToken, { secure: true, sameSite: 'strict' });
            Cookies.set('expiresAt', state.expiresAt.toString(), {
              secure: true,
              sameSite: 'strict',
            });
            set({
              isAuthenticated: true,
              accessToken: state.accessToken,
              expiresAt: state.expiresAt,
              user: state.user,
            });
          } else {
            // No valid token found
            set({
              isAuthenticated: false,
              accessToken: null,
              expiresAt: null,
              user: null,
            });
          }
        }
      },
      isTokenExpired: () => {
        const { expiresAt } = get();
        return expiresAt ? Date.now() >= expiresAt : true;
      },
      getUser: () => get().user,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
