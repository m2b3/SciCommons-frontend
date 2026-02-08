import Axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const AXIOS_INSTANCE: AxiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

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
