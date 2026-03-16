'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';

export default function AuthBootstrap() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    /* Fixed by Codex on 2026-03-16
       Who: Codex
       What: Added global auth bootstrap initialization at app mount.
       Why: Ensure stale-token server validation starts immediately, reducing page flash before login redirects.
       How: Call initializeAuth once from layout scope; route-level guards then consume already-resolved auth state. */
    void initializeAuth();
  }, [initializeAuth]);

  return null;
}
