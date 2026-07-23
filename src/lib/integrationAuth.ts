const ALLOWED_AUTH_REDIRECT_PATHS = ['/auth/integration', '/auth/extension', '/auth/device'];

export const isSafePostLoginRedirect = (
  redirect: string | null | undefined
): redirect is string => {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return false;
  }

  if (!redirect.startsWith('/auth')) {
    return true;
  }

  return ALLOWED_AUTH_REDIRECT_PATHS.some(
    (path) =>
      redirect === path || redirect.startsWith(`${path}?`) || redirect.startsWith(`${path}/`)
  );
};
