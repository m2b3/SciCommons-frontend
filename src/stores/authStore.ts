import Cookies from 'js-cookie';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clearRegisteredQueryCache } from '@/api/queryClientRegistry';

export interface AuthenticatedUserType {
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
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
const SERVER_SESSION_FALLBACK_TTL_MS = 60 * 60 * 1000; // 1 hour
const AUTH_STORAGE_KEY = 'auth-storage';
const getCookieOptions = () => ({
  secure:
    typeof window === 'undefined' ? process.env.NODE_ENV === 'production' : location.protocol === 'https:',
  sameSite: 'strict' as const,
});

type StoredAuthState = {
  accessToken?: string;
  expiresAt?: number;
  user?: AuthenticatedUserType | null;
};

type MeResponse = {
  data?: {
    email?: string;
    first_name?: string;
    id?: number;
    last_name?: string;
    username?: string;
  };
};

const normalizeUser = (candidate: unknown): AuthenticatedUserType | null => {
  if (!candidate || typeof candidate !== 'object') return null;
  const user = candidate as Record<string, unknown>;
  if (
    typeof user.id !== 'number' ||
    typeof user.email !== 'string' ||
    typeof user.username !== 'string' ||
    typeof user.first_name !== 'string' ||
    typeof user.last_name !== 'string'
  ) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
  };
};

const getExpiresAtFromToken = (token: string): number | null => {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.exp || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const readStoredAuthState = (): StoredAuthState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: StoredAuthState };
    return parsed?.state ?? null;
  } catch {
    return null;
  }
};

const probeServerSession = async (): Promise<{
  ok: boolean;
  user: AuthenticatedUserType | null;
}> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return { ok: false, user: null };

  try {
    const response = await fetch(`${backendUrl}/api/users/me`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return { ok: false, user: null };

    const payload = (await response.json()) as MeResponse;
    return { ok: true, user: normalizeUser(payload?.data ?? null) };
  } catch {
    return { ok: false, user: null };
  }
};

const clearCookies = () => {
  const cookieOptions = getCookieOptions();
  Cookies.remove(AUTH_COOKIE_NAME, cookieOptions);
  Cookies.remove('expiresAt', cookieOptions);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isAuthInitialized: false,
      accessToken: null,
      expiresAt: null,
      user: null,
      setAccessToken: (token: string, user: AuthenticatedUserType) => {
        const expiresAt = getExpiresAtFromToken(token) ?? Date.now() + TOKEN_EXPIRATION_TIME;
        const cookieOptions = getCookieOptions();
        Cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
        Cookies.set('expiresAt', expiresAt.toString(), cookieOptions);

        set(() => ({
          isAuthenticated: true,
          isAuthInitialized: true,
          accessToken: token,
          expiresAt,
          user,
        }));
      },
      logout: () => {
        clearCookies();
        clearRegisteredQueryCache();
        set(() => ({
          isAuthenticated: false,
          isAuthInitialized: true,
          accessToken: null,
          expiresAt: null,
          user: null,
        }));
      },
      initializeAuth: async () => {
        const cookieToken = Cookies.get(AUTH_COOKIE_NAME);
        const cookieExpiresAt = Cookies.get('expiresAt');
        let token = cookieToken ?? null;
        let expiresAt = cookieExpiresAt ? Number.parseInt(cookieExpiresAt, 10) : NaN;
        let user = get().user;

        // Migrate from persisted storage when cookie is missing.
        if (!token) {
          const stored = readStoredAuthState();
          if (stored?.accessToken) {
            token = stored.accessToken;
            expiresAt =
              typeof stored.expiresAt === 'number'
                ? stored.expiresAt
                : (getExpiresAtFromToken(token) ?? NaN);
            user = stored.user ?? user;

            const cookieOptions = getCookieOptions();
            Cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
            if (Number.isFinite(expiresAt)) {
              Cookies.set('expiresAt', String(expiresAt), cookieOptions);
            }
          }
        }

        if (!token) {
          set({
            isAuthenticated: false,
            isAuthInitialized: true,
            accessToken: null,
            expiresAt: null,
            user: null,
          });
          return;
        }

        if (!Number.isFinite(expiresAt)) {
          expiresAt = getExpiresAtFromToken(token) ?? NaN;
        }

        // For invalid/expired local expiry, let server decide once.
        if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
          const session = await probeServerSession();
          if (!session.ok) {
            clearCookies();
            set({
              isAuthenticated: false,
              isAuthInitialized: true,
              accessToken: null,
              expiresAt: null,
              user: null,
            });
            return;
          }

          expiresAt = Date.now() + SERVER_SESSION_FALLBACK_TTL_MS;
          Cookies.set('expiresAt', String(expiresAt), getCookieOptions());
          user = session.user ?? user ?? null;
        } else if (!user) {
          // If auth looks valid but user is missing, try to hydrate once.
          const session = await probeServerSession();
          if (session.ok && session.user) {
            user = session.user;
          }
        }

        set({
          isAuthenticated: true,
          isAuthInitialized: true,
          accessToken: token,
          expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
          user: user ?? null,
        });
      },
      isTokenExpired: () => {
        const { expiresAt } = get();
        return expiresAt ? Date.now() >= expiresAt : true;
      },
      getUser: () => get().user,
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
    }
  )
);
