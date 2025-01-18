import { getSession, signOut } from 'next-auth/react';

import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  expiresAt: null,

  initializeAuth: async () => {
    const session = await getSession();
    set({
      isAuthenticated: !!session?.accessToken,
      accessToken: session?.accessToken || null,
      expiresAt: null,
    });
  },

  logout: async () => {
    await signOut({ callbackUrl: '/auth/login' });
    set({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
    });
  },
}));
