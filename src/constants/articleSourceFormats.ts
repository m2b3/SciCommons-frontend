/* Mirrors the SupportConfig union from RenderParsedHTML so values
   can be spread directly without type narrowing at the call site. */
export type ArticleSourceFormat =
  | { supportLatex: true; supportMarkdown?: boolean }
  | { supportMarkdown: true; supportLatex?: boolean };

/**
 * Maps article source names to their supported abstract formats.
 *
 * Currently supported sources (from SearchComponent):
 * - DOI (via CrossRef API)
 * - arXiv
 * - PubMed
 */
export const ARTICLE_SOURCE_FORMATS: Record<string, ArticleSourceFormat> = {
  arxiv: { supportLatex: true, supportMarkdown: false },
  pubmed: { supportLatex: true, supportMarkdown: false },
  doi: { supportLatex: true, supportMarkdown: false },
};

/**
 * Maps source names to URL patterns for detection.
 */
export const SOURCE_URL_PATTERNS: Record<string, string> = {
  arxiv: 'arxiv.org',
  pubmed: 'pubmed.ncbi.nlm.nih.gov',
  doi: 'doi.org',
};

/** Default format when article has a link but doesn't match any known source. */
export const DEFAULT_EXTERNAL_SOURCE_FORMAT: ArticleSourceFormat = {
  supportLatex: true,
  supportMarkdown: false,
};

/** Format for user-uploaded articles (no article_link). */
export const UPLOADED_ARTICLE_FORMAT: ArticleSourceFormat = {
  supportLatex: false,
  supportMarkdown: true,
};
