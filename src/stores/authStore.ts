import Cookies from 'js-cookie';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clearRegisteredQueryCache } from '@/api/queryClientRegistry';

import { useReadItemsStore } from './readItemsStore';
import { useSubscriptionUnreadStore } from './subscriptionUnreadStore';
import { useUserSettingsStore } from './userSettingsStore';

// NOTE(bsureshkrishna, 2026-02-07): Auth bootstrap was hardened vs baseline 5271498.
// We now migrate persisted auth -> cookies, validate expiry, probe server session once,
// and clear caches/unread state on logout to avoid stale UI.
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

// Fixed by Claude Sonnet 4.5 on 2026-02-08
// Issue 3: Server-based token validation - Track last server validation to trigger revalidation
// Client-side timestamps alone are vulnerable to clock manipulation
const SERVER_VALIDATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastServerValidation: number | null = null;

// Fixed by Claude Sonnet 4.5 on 2026-02-08
// Issue 1: Auth initialization lock - Prevents race conditions from parallel calls
// React Strict Mode and multiple component mounts can cause concurrent initialization
let initializationPromise: Promise<void> | null = null;
let isInitializing = false;

/* Fixed by Codex on 2026-02-27
   Who: Codex
   What: Added a tiny development-only auth debug logger for QA.
   Why: Make revalidation and expiry decisions observable without affecting production users.
   How: Emit scoped console info only in browser development mode. */
const logAuthDebug = (event: string, details?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  console.info(`[AuthDebug] ${event}`, details ?? {});
};

const getCookieOptions = () => ({
  secure:
    typeof window === 'undefined'
      ? process.env.NODE_ENV === 'production'
      : location.protocol === 'https:',
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

// Fixed by Claude Sonnet 4.5 on 2026-02-08
// Issue 2: Return status code to distinguish network errors from auth failures
const probeServerSession = async (): Promise<{
  ok: boolean;
  user: AuthenticatedUserType | null;
  statusCode?: number;
  isNetworkError?: boolean;
}> => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) return { ok: false, user: null };

  try {
    const response = await fetch(`${backendUrl}/api/users/me`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const statusCode = response.status;

    if (!response.ok) {
      // Return status code to allow caller to distinguish auth errors (401/403) from other errors
      return { ok: false, user: null, statusCode };
    }

    const payload = (await response.json()) as MeResponse;

    // Fixed by Claude Sonnet 4.5 on 2026-02-08
    // Issue 3: Update server validation timestamp on successful validation
    lastServerValidation = Date.now();

    return { ok: true, user: normalizeUser(payload?.data ?? null), statusCode };
  } catch (error) {
    // Network errors (no response from server) - keep session for offline tolerance
    // Fixed by Claude Sonnet 4.5 on 2026-02-08
    // Issue 2: Mark network errors separately to avoid force logout
    return { ok: false, user: null, isNetworkError: true };
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

        // Fixed by Claude Sonnet 4.5 on 2026-02-08
        // Issue 3: Reset server validation timestamp when new token is set
        lastServerValidation = Date.now();

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
        // Clear read items and subscription unread state on logout
        useReadItemsStore.getState().reset();
        useSubscriptionUnreadStore.getState().reset();
        // NOTE(Codex for bsureshkrishna, 2026-02-09): Clear persisted settings
        // to avoid showing a prior user's preferences after logout.
        useUserSettingsStore.getState().clearSettings();

        // Fixed by Claude Sonnet 4.5 on 2026-02-08
        // Issue 3: Clear server validation timestamp on logout
        lastServerValidation = null;

        set(() => ({
          isAuthenticated: false,
          isAuthInitialized: true,
          accessToken: null,
          expiresAt: null,
          user: null,
        }));
      },
      initializeAuth: async () => {
        // Fixed by Claude Sonnet 4.5 on 2026-02-08
        // Issue 1: Check if initialization is already in progress
        // If another call is running, return the existing promise to prevent race conditions
        if (isInitializing && initializationPromise) {
          return initializationPromise;
        }

        // Mark as initializing and create the promise
        isInitializing = true;
        initializationPromise = (async () => {
          try {
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

            /* Fixed by Codex on 2026-02-27
               Who: Codex
               What: Split hard-expiry checks from periodic server revalidation.
               Why: `withAuthRedirect` treats `isTokenExpired()` as a hard logout trigger.
               How: Keep hard-expiry handling here, then run stale-session validation as a
                    separate branch that only logs out on auth failures (401/403). */
            const needsPeriodicServerValidation =
              lastServerValidation !== null &&
              Date.now() - lastServerValidation > SERVER_VALIDATION_INTERVAL_MS;

            // For invalid/expired local expiry, let server decide once.
            if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) {
              logAuthDebug('hard_expiry_validation_started', {
                hasFiniteExpiry: Number.isFinite(expiresAt),
                hasToken: !!token,
              });
              const session = await probeServerSession();

              // Fixed by Claude Sonnet 4.5 on 2026-02-08
              // Issue 2: Only logout on auth failures (401/403), keep session on network errors
              if (!session.ok) {
                // Network error - keep session for offline tolerance
                if (session.isNetworkError) {
                  logAuthDebug('hard_expiry_validation_network_error', {
                    action: 'keep_session_with_fallback_ttl',
                  });
                  expiresAt = Date.now() + SERVER_SESSION_FALLBACK_TTL_MS;
                  // Continue with existing token, don't logout
                } else if (session.statusCode === 401 || session.statusCode === 403) {
                  logAuthDebug('hard_expiry_validation_auth_failure', {
                    statusCode: session.statusCode ?? null,
                    action: 'logout',
                  });
                  // Auth failure - clear session
                  clearCookies();
                  set({
                    isAuthenticated: false,
                    isAuthInitialized: true,
                    accessToken: null,
                    expiresAt: null,
                    user: null,
                  });
                  return;
                } else {
                  // Other server error - keep session but extend expiry minimally
                  logAuthDebug('hard_expiry_validation_server_error', {
                    statusCode: session.statusCode ?? null,
                    action: 'keep_session_with_fallback_ttl',
                  });
                  expiresAt = Date.now() + SERVER_SESSION_FALLBACK_TTL_MS;
                }
              } else {
                logAuthDebug('hard_expiry_validation_success', {
                  action: 'refresh_local_expiry',
                });
                // Session is valid
                expiresAt = Date.now() + SERVER_SESSION_FALLBACK_TTL_MS;
                Cookies.set('expiresAt', String(expiresAt), getCookieOptions());
                user = session.user ?? user ?? null;
              }
            } else if (needsPeriodicServerValidation) {
              logAuthDebug('periodic_revalidation_started', {
                lastServerValidation,
                intervalMs: SERVER_VALIDATION_INTERVAL_MS,
              });
              const session = await probeServerSession();

              if (!session.ok) {
                // Only hard-auth failures should force logout in periodic revalidation.
                if (session.statusCode === 401 || session.statusCode === 403) {
                  logAuthDebug('periodic_revalidation_auth_failure', {
                    statusCode: session.statusCode ?? null,
                    action: 'logout',
                  });
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
                logAuthDebug('periodic_revalidation_non_auth_failure', {
                  statusCode: session.statusCode ?? null,
                  isNetworkError: !!session.isNetworkError,
                  action: 'keep_session',
                });
              } else {
                logAuthDebug('periodic_revalidation_success', {
                  action: 'keep_session_and_refresh_user_if_available',
                });
                user = session.user ?? user ?? null;
              }
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
          } finally {
            // Fixed by Claude Sonnet 4.5 on 2026-02-08
            // Issue 1: Reset initialization lock after completion
            isInitializing = false;
            initializationPromise = null;
          }
        })();

        return initializationPromise;
      },
      isTokenExpired: () => {
        const { expiresAt } = get();

        /* Fixed by Codex on 2026-02-27
           Who: Codex
           What: Restrict `isTokenExpired()` to hard-expiry only.
           Why: Returning `true` for revalidation windows caused false session-expired logouts.
           How: Move periodic server revalidation into `initializeAuth` and keep this predicate
                strictly tied to cookie/JWT expiry. */
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
