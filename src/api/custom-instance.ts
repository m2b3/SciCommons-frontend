import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { useAuthStore } from '@/stores/authStore';

const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const part of cookies) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
};

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const authHeader = config.headers?.Authorization || config.headers?.authorization;
  const cookieToken = getCookieValue('auth_token');

  if (cookieToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${cookieToken}`;
    return config;
  }

  if (typeof authHeader === 'string') {
    const normalized = authHeader.trim().toLowerCase();
    if (
      normalized === 'bearer null' ||
      normalized === 'bearer undefined' ||
      normalized === 'bearer'
    ) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  }
  return config;
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      useAuthStore.getState().logout();
    }
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
