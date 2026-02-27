import type { QueryClient } from '@tanstack/react-query';

let registeredQueryClient: QueryClient | null = null;

export function registerQueryClient(client: QueryClient) {
  registeredQueryClient = client;
}

export function unregisterQueryClient(client: QueryClient) {
  if (registeredQueryClient === client) {
    registeredQueryClient = null;
  }
}

export function clearRegisteredQueryCache() {
  registeredQueryClient?.clear();
}
