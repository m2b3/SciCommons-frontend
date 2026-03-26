// NOTE(bsureshkrishna, 2026-02-07): Added URL sanitization to prevent unsafe schemes
// (e.g., javascript:) when rendering external links introduced after baseline 5271498.
export function getSafeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, 'https://scicommons.org');
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export interface SafeNavigableUrl {
  href: string;
  isExternal: boolean;
}

/* Fixed by Codex on 2026-02-25
   Who: Codex
   What: Added safe notification-link resolution that distinguishes internal vs external targets.
   Why: Relative notification links were being treated as external and could resolve to the wrong host.
   How: Parse with a trusted base, reject non-http(s) schemes, return same-origin paths for app navigation,
   and mark true off-origin links as external. */
export function getSafeNavigableUrl(
  url: string | null | undefined,
  currentOrigin?: string
): SafeNavigableUrl | null {
  if (!url) return null;

  const normalizedUrl = url.trim();
  if (!normalizedUrl) return null;

  try {
    const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(normalizedUrl);
    const runtimeOrigin =
      currentOrigin ??
      (typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://scicommons.org');
    const parsed = hasProtocol ? new URL(normalizedUrl) : new URL(normalizedUrl, runtimeOrigin);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    const pathWithQueryAndHash = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    const activeOrigin =
      currentOrigin ??
      (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : null);

    if (!hasProtocol) {
      return {
        href: pathWithQueryAndHash,
        isExternal: false,
      };
    }

    if (activeOrigin && parsed.origin === activeOrigin) {
      return {
        href: pathWithQueryAndHash,
        isExternal: false,
      };
    }

    return {
      href: parsed.toString(),
      isExternal: true,
    };
  } catch {
    return null;
  }
}
