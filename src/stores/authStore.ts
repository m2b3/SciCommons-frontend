import Cookies from 'js-cookie';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  setAccessToken: (token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  isTokenExpired: () => boolean;
}

const AUTH_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRATION_TIME = 3 * 60 * 60 * 1000; // 3 hours

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      setAccessToken: (token: string) => {
        const expiresAt = Date.now() + TOKEN_EXPIRATION_TIME;
        Cookies.set(AUTH_COOKIE_NAME, token, { secure: true, sameSite: 'strict' });
        Cookies.set('expiresAt', expiresAt.toString(), { secure: true, sameSite: 'strict' });
        set(() => ({
          isAuthenticated: true,
          accessToken: token,
          expiresAt,
        }));
      },
      logout: () => {
        Cookies.remove(AUTH_COOKIE_NAME);
        Cookies.remove('expiresAt');
        set(() => ({
          isAuthenticated: false,
          accessToken: null,
          expiresAt: null,
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
            });
          } else {
            // No valid token found
            set({
              isAuthenticated: false,
              accessToken: null,
              expiresAt: null,
            });
          }
        }
      },
      isTokenExpired: () => {
        const { expiresAt } = get();
        return expiresAt ? Date.now() >= expiresAt : true;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
