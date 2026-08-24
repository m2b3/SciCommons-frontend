'use client';

import React, { useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

const backendBaseUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '') || '';

export default function DeviceAuthorizePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { accessToken, initializeAuth, isAuthenticated, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [userCode, setUserCode] = useState(searchParams?.get('code') || '');
  const [isApproving, setIsApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      await initializeAuth();
      setIsInitializing(false);
    };
    run();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitializing || isAuthenticated) {
      return;
    }
    const queryString = searchParams?.toString();
    const redirectTarget = `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`);
  }, [isInitializing, isAuthenticated, pathname, router, searchParams]);

  const approve = async () => {
    setError(null);
    setMessage(null);
    if (!userCode.trim()) {
      setError('Enter the code shown in Zotero.');
      return;
    }
    if (!backendBaseUrl()) {
      setError('NEXT_PUBLIC_BACKEND_URL is not configured.');
      return;
    }

    setIsApproving(true);
    try {
      const response = await fetch(`${backendBaseUrl()}/api/integrations/auth/device/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_code: userCode.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message || `Approval failed (${response.status}).`);
      }
      setMessage(payload?.message || 'SciCommons access approved. You can return to Zotero.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setIsApproving(false);
    }
  };

  if (isInitializing || (!isAuthenticated && !error)) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-common-background p-6 text-text-primary">
        <div className="text-sm text-text-secondary">Checking your SciCommons session...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-common-background p-6 text-text-primary">
      <section className="w-full max-w-md rounded-lg border border-common-minimal bg-common-cardBackground p-8 shadow-common">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-functional-green text-lg font-bold text-functional-green">
            SC
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Connect Zotero</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Signed in as {user?.username || user?.email}
            </p>
          </div>
        </div>

        <label className="block text-sm font-medium text-text-secondary" htmlFor="device-code">
          Zotero code
        </label>
        <input
          id="device-code"
          value={userCode}
          onChange={(event) => setUserCode(event.target.value.toUpperCase())}
          className="mt-2 w-full rounded-md border border-common-minimal bg-common-background px-3 py-3 text-text-primary outline-none focus:border-functional-green"
          placeholder="ABCD-1234"
        />

        {message ? (
          <div className="mt-5 rounded-md border border-functional-green/50 bg-functional-green/10 p-3 text-sm text-functional-green">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-md border border-functional-red/50 bg-functional-red/10 p-3 text-sm text-functional-red">
            {error}
          </div>
        ) : null}

        <Button type="button" className="mt-8 w-full" disabled={isApproving} onClick={approve}>
          {isApproving ? 'Approving...' : 'Approve Zotero'}
        </Button>
      </section>
    </main>
  );
}
