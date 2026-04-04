import {
  ARTICLE_SOURCE_FORMATS,
  ArticleSourceFormat,
  DEFAULT_EXTERNAL_SOURCE_FORMAT,
  SOURCE_URL_PATTERNS,
  UPLOADED_ARTICLE_FORMAT,
} from '@/constants/articleSourceFormats';

/**
 * Detects the source name from an article link URL.
 */
function detectSourceFromLink(articleLink: string): string | null {
  const normalizedLink = articleLink.toLowerCase();
  for (const [source, pattern] of Object.entries(SOURCE_URL_PATTERNS)) {
    if (normalizedLink.includes(pattern)) {
      return source;
    }
  }
  return null;
}

/**
 * Determines the abstract rendering format based on the article link.
 *
 * - No link (null/empty) → markdown (user-uploaded content)
 * - Link present → match against known sources, default to latex
 * - Link data unavailable (linkKnown=false) → latex
 *
 * | Link format                           | Source  | LaTeX | Markdown |
 * |---------------------------------------|---------|-------|----------|
 * | https://doi.org/...                   | doi     | ✓     | ✗        |
 * | https://pubmed.ncbi.nlm.nih.gov/...   | pubmed  | ✓     | ✗        |
 * | https://arxiv.org/...                 | arxiv   | ✓     | ✗        |
 * | any other URL                         | (none)  | ✓     | ✗        |
 * | null / empty                          | (upload)| ✗     | ✓        |
 */
export function getArticleSourceFormat(
  articleLink: string | null | undefined,
  linkKnown: boolean = true
): ArticleSourceFormat {
  if (!linkKnown) {
    return DEFAULT_EXTERNAL_SOURCE_FORMAT;
  }

  if (!articleLink || articleLink.trim() === '') {
    return UPLOADED_ARTICLE_FORMAT;
  }

  const source = detectSourceFromLink(articleLink);
  if (source && ARTICLE_SOURCE_FORMATS[source]) {
    return ARTICLE_SOURCE_FORMATS[source];
  }

  return DEFAULT_EXTERNAL_SOURCE_FORMAT;
}
