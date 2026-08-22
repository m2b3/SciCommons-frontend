import { isSafePostLoginRedirect } from '@/lib/integrationAuth';

/* Added by Claude on 2026-08-22
   What: Coverage for the post-login redirect allowlist.
   Why: The review of PR #363 called this flow security-sensitive and untested, and found that
        `/\evil.example` was accepted even though it resolves to https://evil.example/.
   How: Table-driven cases, with the resolved URL recorded next to each attack so the reason a
        string is dangerous stays visible to the next reader. */

describe('isSafePostLoginRedirect accepts internal destinations', () => {
  it.each([
    ['a plain app path', '/myprofile'],
    ['a nested app path', '/community/foo/articles/bar'],
    ['a path with a query', '/discussions?tab=mine'],
    ['a path with a fragment', '/about#team'],
    ['an allowlisted auth path', '/auth/extension'],
    ['an allowlisted auth path with a query', '/auth/extension?client_id=scicommons-zotero'],
    ['an allowlisted auth path with a subpath', '/auth/integration/callback'],
    ['the device authorization path', '/auth/device'],
  ])('accepts %s', (_label, redirect) => {
    expect(isSafePostLoginRedirect(redirect)).toBe(true);
  });
});

describe('isSafePostLoginRedirect refuses auth pages that are not authorization endpoints', () => {
  it.each([
    ['the login page itself, which would loop', '/auth/login'],
    ['the auth root', '/auth'],
    ['registration', '/auth/register'],
    ['password reset', '/auth/resetpassword/some-token'],
  ])('refuses %s', (_label, redirect) => {
    expect(isSafePostLoginRedirect(redirect)).toBe(false);
  });
});

describe('isSafePostLoginRedirect refuses escapes to another origin', () => {
  // Each string is followed by what `new URL(value, origin)` turns it into.
  it.each([
    ['protocol-relative', '//evil.example', 'https://evil.example/'],
    ['an absolute URL', 'https://evil.example', 'https://evil.example/'],
    ['a backslash, which browsers rewrite', '/\\evil.example', 'https://evil.example/'],
    ['a double backslash', '/\\\\evil.example', 'https://evil.example/'],
    ['an encoded backslash', '/%5Cevil.example', 'stays encoded, refused anyway'],
    ['a tab, which browsers strip', '/\t/evil.example', 'https://evil.example/'],
    ['a newline, which browsers strip', '/\n//evil.example', 'https://evil.example/'],
    ['a carriage return', '/\r//evil.example', 'https://evil.example/'],
    ['an encoded tab', '/%09/evil.example', 'stays encoded, refused anyway'],
    // These clear the raw allowlist prefix and then climb out of it.
    [
      'dot segments out of an allowlisted path',
      '/auth/extension/../../\\evil.example',
      '//evil.example',
    ],
    ['dot segments to protocol-relative', '/auth/extension/../..//evil.example', '//evil.example'],
    ['a dot segment plus a backslash', '/./\\evil.example', '//evil.example'],
  ])('refuses %s', (_label, redirect) => {
    expect(isSafePostLoginRedirect(redirect)).toBe(false);
  });
});

describe('isSafePostLoginRedirect refuses values that are not paths', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
    ['a bare word', 'myprofile'],
    ['a scheme-relative host', 'evil.example/path'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['a data URL', 'data:text/html,<script>alert(1)</script>'],
  ])('refuses %s', (_label, redirect) => {
    expect(isSafePostLoginRedirect(redirect as string | null | undefined)).toBe(false);
  });
});
