import { redirect } from 'next/navigation';

interface LoginAliasPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const LoginAliasPage = ({ searchParams = {} }: LoginAliasPageProps) => {
  /* Fixed by Codex on 2026-02-24
     Who: Codex
     What: Added `/login` compatibility redirect to the canonical auth route.
     Why: Expired-session flows from stale clients/links can still hit `/login`, which 404s.
     How: Convert incoming query params and forward users to `/auth/login` with the same query string. */
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string') {
          params.append(key, item);
        }
      });
      return;
    }

    if (typeof value === 'string') {
      params.append(key, value);
    }
  });

  const suffix = params.toString();
  redirect(suffix ? `/auth/login?${suffix}` : '/auth/login');
};

export default LoginAliasPage;
