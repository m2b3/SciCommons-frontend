'use client';

import React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useAuthStore } from '@/stores/authStore';

type BridgeStatus = 'initializing' | 'redirecting' | 'authorizing' | 'error';

type AuthorizeResponse = {
  code: string;
  state: string;
  redirect_uri: string;
  expires_in: number;
};

const requiredParams = ['client_id', 'redirect_uri', 'state', 'code_challenge'] as const;

const normalizeBackendUrl = (value?: string) => (value || '').replace(/\/+$/, '');

const appendAuthCodeToRedirect = (redirectUri: string, code: string, state: string) => {
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set('code', code);
  callbackUrl.searchParams.set('state', state);
  return callbackUrl.toString();
};

const ExtensionAuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const [status, setStatus] = React.useState<BridgeStatus>('initializing');
  const [message, setMessage] = React.useState('Preparing SciCommons extension login...');
  const hasStartedRef = React.useRef(false);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  React.useEffect(() => {
    if (!isAuthInitialized || hasStartedRef.current) return;

    const missingParam = requiredParams.find((name) => !searchParams?.get(name));
    if (missingParam) {
      setStatus('error');
      setMessage(`Missing required extension parameter: ${missingParam}.`);
      return;
    }

    if (!isAuthenticated || !accessToken) {
      setStatus('redirecting');
      setMessage('Sign in to connect the SciCommons extension.');
      const currentPath = `/auth/extension?${searchParams?.toString() || ''}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const backendUrl = normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
    if (!backendUrl) {
      setStatus('error');
      setMessage('NEXT_PUBLIC_BACKEND_URL is not configured.');
      return;
    }

    hasStartedRef.current = true;
    setStatus('authorizing');
    setMessage('Connecting the SciCommons extension...');

    const authorize = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/integrations/extension/authorize`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: searchParams?.get('client_id'),
            redirect_uri: searchParams?.get('redirect_uri'),
            state: searchParams?.get('state'),
            code_challenge: searchParams?.get('code_challenge'),
            code_challenge_method: searchParams?.get('code_challenge_method') || 'S256',
          }),
        });

        const payload = (await response.json()) as Partial<AuthorizeResponse> & {
          message?: string;
        };

        if (!response.ok || !payload.code || !payload.redirect_uri || !payload.state) {
          throw new Error(payload.message || 'Unable to create extension authorization code.');
        }

        window.location.assign(
          appendAuthCodeToRedirect(payload.redirect_uri, payload.code, payload.state)
        );
      } catch (error) {
        hasStartedRef.current = false;
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Extension authorization failed.');
      }
    };

    authorize();
  }, [accessToken, initializeAuth, isAuthInitialized, isAuthenticated, router, searchParams]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-common-background px-4">
      <section className="w-full max-w-md rounded-lg border border-common-border bg-common-cardBackground p-6 shadow-common">
        <p className="text-sm font-medium uppercase text-text-tertiary">
          SciCommons Extension
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          Connect your browser
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{message}</p>
        {status === 'error' ? (
          <button
            type="button"
            className={[
              'mt-6 rounded-md bg-functional-green px-4 py-2 text-sm font-medium',
              'text-primary-foreground hover:bg-functional-greenContrast',
            ].join(' ')}
            onClick={() => router.push('/')}
          >
            Go to SciCommons
          </button>
        ) : null}
      </section>
    </main>
  );
};

export default ExtensionAuthPage;
