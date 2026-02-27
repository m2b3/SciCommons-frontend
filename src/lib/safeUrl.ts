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
