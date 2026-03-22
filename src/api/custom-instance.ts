import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// NOTE(bsureshkrishna, 2026-02-07): Normalize Authorization headers so we never send
// "Bearer null/undefined" (previously caused noisy 401s and blocked requests).
const clearAuthHeader = (headers: AxiosRequestConfig['headers']) => {
  if (!headers) return;

  if (typeof (headers as { delete?: (name: string) => void }).delete === 'function') {
    (headers as { delete: (name: string) => void }).delete('Authorization');
    (headers as { delete: (name: string) => void }).delete('authorization');
    return;
  }

  delete (headers as Record<string, unknown>).Authorization;
  delete (headers as Record<string, unknown>).authorization;
};

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const headers = config.headers as
    | (Record<string, unknown> & { Authorization?: unknown; authorization?: unknown })
    | undefined;
  const authHeader = headers?.Authorization ?? headers?.authorization;

  if (typeof authHeader === 'string') {
    const normalized = authHeader.trim().toLowerCase();
    if (
      normalized === 'bearer null' ||
      normalized === 'bearer undefined' ||
      normalized === 'bearer'
    ) {
      clearAuthHeader(config.headers);
    }
  }

  return config;
});

/* Fixed by Claude Sonnet 4.5 on 2026-02-09
   Problem: Global 403 handler was too aggressive - logged out users on permission errors
   Original: Caught 401 AND 403, logged out on both
   Issue: 403 means "no permission" not "not authenticated" - shouldn't logout!
   Examples: Private community access, admin-only actions, etc.
   Solution: Only logout on 401 (session expired), let components handle 403 gracefully
   Result: Users stay logged in when accessing restricted resources */
let isHandlingAuthFailure = false; // Prevent logout loops

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    // ONLY handle 401 (Unauthorized - session expired) globally
    // 403 (Forbidden - no permission) should be handled by individual components
    if (status === 401 && !isHandlingAuthFailure) {
      if (typeof window !== 'undefined' && window.location.pathname === '/auth/login') {
        return Promise.reject(error);
      }

      isHandlingAuthFailure = true;

      try {
        // Dynamically import to avoid circular dependencies
        const { toast } = await import('sonner');
        const { useAuthStore } = await import('@/stores/authStore');

        // Show user-friendly message
        toast.error('Your session has expired. Please log in again.');

        // Log out user and clear state
        const logout = useAuthStore.getState().logout;
        logout();

        // Redirect to login page
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          // Only redirect if not already on login page
          if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
            window.location.href = '/auth/login';
          }
        }
      } catch (importError) {
        console.error('[Auth Interceptor] Failed to handle auth error:', importError);
      } finally {
        // Reset flag after a short delay to allow for redirect
        setTimeout(() => {
          isHandlingAuthFailure = false;
        }, 1000);
      }
    }

    // Re-throw error for local error handlers (including 403 for components to handle)
    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  });

  // @ts-expect-error Missing type definition for 'cancel' property
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
