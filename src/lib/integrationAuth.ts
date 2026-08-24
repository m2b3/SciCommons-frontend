const ALLOWED_AUTH_REDIRECT_PATHS = ['/auth/integration', '/auth/extension', '/auth/device'];

// Backslashes and C0/DEL characters get rewritten or stripped when a browser resolves a URL.
const UNSAFE_CHARACTERS = /[\\\u0000-\u001f\u007f]/;
// The same characters arriving percent-encoded.
const UNSAFE_ENCODINGS = /%(5c|09|0a|0d|00)/i;

const PLACEHOLDER_ORIGIN = 'https://redirect-check.invalid';

const isAuthPath = (pathname: string) => pathname === '/auth' || pathname.startsWith('/auth/');

export const isSafePostLoginRedirect = (
  redirect: string | null | undefined
): redirect is string => {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return false;
  }

  if (UNSAFE_CHARACTERS.test(redirect) || UNSAFE_ENCODINGS.test(redirect)) {
    return false;
  }

  // `..` can climb out of an allowlisted prefix, so the allowlist cannot be trusted without this.
  if (redirect.split(/[?#]/, 1)[0].split('/').includes('..')) {
    return false;
  }

  let resolved: URL;
  try {
    resolved = new URL(redirect, PLACEHOLDER_ORIGIN);
  } catch {
    return false;
  }

  // Anything that changed origin while resolving was never a relative path.
  if (resolved.origin !== PLACEHOLDER_ORIGIN) {
    return false;
  }

  // A protocol-relative path survives resolution but is reinterpreted by router.replace.
  if (resolved.pathname.startsWith('//')) {
    return false;
  }

  if (!isAuthPath(resolved.pathname)) {
    return true;
  }

  return ALLOWED_AUTH_REDIRECT_PATHS.some(
    (path) => resolved.pathname === path || resolved.pathname.startsWith(`${path}/`)
  );
};
