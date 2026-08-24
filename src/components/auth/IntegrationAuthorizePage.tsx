'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

type AuthorizeResponse = {
  code: string;
  state?: string | null;
  redirect_uri: string;
};

const clientNames: Record<string, string> = {
  'scicommons-clipper': 'SciCommons Clipper',
  'scicommons-zotero': 'SciCommons Zotero',
};

const backendBaseUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, '') || '';

const appendCodeToRedirect = (redirectUri: string, code: string, state?: string | null) => {
  const url = new URL(redirectUri);
  url.searchParams.set('code', code);
  if (state) {
    url.searchParams.set('state', state);
  }
  return url.toString();
};

export default function IntegrationAuthorizePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { accessToken, initializeAuth, isAuthenticated, user } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      clientId: searchParams?.get('client_id') || '',
      redirectUri: searchParams?.get('redirect_uri') || '',
      state: searchParams?.get('state'),
      codeChallenge: searchParams?.get('code_challenge') || '',
      codeChallengeMethod: searchParams?.get('code_challenge_method') || 'S256',
    }),
    [searchParams]
  );

  const clientName = clientNames[params.clientId] || params.clientId || 'An integration';

  /* Added by Claude on 2026-08-22
     What: Identify which required authorization parameter is absent.
     Why: #362's extension page named the missing parameter before doing anything else; this
          rewrite only reported a generic message, and only after the user clicked Allow on a
          request that could never succeed.
     How: Check the parameters the backend requires - `state` stays optional, matching
          IntegrationAuthorizeIn - and surface the first one missing. */
  const missingParam = useMemo(() => {
    const required: [string, string][] = [
      ['client_id', params.clientId],
      ['redirect_uri', params.redirectUri],
      ['code_challenge', params.codeChallenge],
    ];
    return required.find(([, value]) => !value)?.[0] ?? null;
  }, [params]);

  useEffect(() => {
    const run = async () => {
      await initializeAuth();
      setIsInitializing(false);
    };
    run();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitializing || isAuthenticated || missingParam) {
      return;
    }
    const queryString = searchParams?.toString();
    const redirectTarget = `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`);
  }, [isInitializing, isAuthenticated, missingParam, pathname, router, searchParams]);

  const approve = async () => {
    setError(null);
    if (missingParam) {
      setError(`Missing required authorization parameter: ${missingParam}.`);
      return;
    }
    if (!backendBaseUrl()) {
      setError('NEXT_PUBLIC_BACKEND_URL is not configured.');
      return;
    }

    setIsApproving(true);
    try {
      const response = await fetch(`${backendBaseUrl()}/api/integrations/auth/authorize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: params.clientId,
          redirect_uri: params.redirectUri,
          state: params.state,
          code_challenge: params.codeChallenge,
          code_challenge_method: params.codeChallengeMethod,
        }),
      });
      const payload = (await response.json().catch(() => null)) as AuthorizeResponse & {
        message?: string;
      };
      if (!response.ok || !payload?.code) {
        throw new Error(payload?.message || `Authorization failed (${response.status}).`);
      }
      window.location.assign(
        appendCodeToRedirect(payload.redirect_uri, payload.code, payload.state)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed.');
      setIsApproving(false);
    }
  };

  if (isInitializing) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-common-background p-6 text-text-primary">
        <div className="text-sm text-text-secondary">Checking your SciCommons session...</div>
      </main>
    );
  }

  /* Added by Claude on 2026-08-22
     What: Report a malformed authorization request instead of a consent card.
     Why: Naming the absent parameter is what #362's page did, and asking someone to approve a
          request that cannot succeed - or bouncing them through login first - is worse.
     How: Render the named error with a way out, before any authentication branch. */
  if (missingParam) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-common-background p-6 text-text-primary">
        <section className="w-full max-w-md rounded-lg border border-common-minimal bg-common-cardBackground p-8 shadow-common">
          <h1 className="text-2xl font-semibold">Connect {clientName}</h1>
          <div className="mt-5 rounded-md border border-functional-red/50 bg-functional-red/10 p-3 text-sm text-functional-red">
            Missing required authorization parameter: {missingParam}.
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-8 w-full"
            onClick={() => router.push('/')}
          >
            Go to SciCommons
          </Button>
        </section>
      </main>
    );
  }

  if (!isAuthenticated && !error) {
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
            <h1 className="text-2xl font-semibold">Connect {clientName}</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Signed in as {user?.username || user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-text-secondary">
          <p>{clientName} will be able to save papers to your SciCommons account.</p>
          <p className="break-all rounded-md border border-common-minimal bg-common-background p-3">
            {params.redirectUri || 'Missing redirect URI'}
          </p>
        </div>

        {error ? (
          <div className="mt-5 rounded-md border border-functional-red/50 bg-functional-red/10 p-3 text-sm text-functional-red">
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          <Button type="button" className="flex-1" disabled={isApproving} onClick={approve}>
            {isApproving ? 'Connecting...' : 'Allow Access'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/')}
          >
            Cancel
          </Button>
        </div>
      </section>
    </main>
  );
}
