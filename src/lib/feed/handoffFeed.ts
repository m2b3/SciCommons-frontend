import { useQuery } from '@tanstack/react-query';

import { customInstance } from '@/api/custom-instance';

export type FeedPrivacy = 'private' | 'unlisted' | 'public';
export type FeedGenerationStatus = 'pending' | 'running' | 'ready' | 'failed';
export type FeedSource = 'all' | 'arxiv' | 'pubmed';
export type FeedFeedback = 'like' | 'dislike' | '';

export interface RawFeedArticle {
  id?: string | null;
  paper_key?: string | null;
  source?: string;
  title?: string;
  authors?: string | string[];
  abstract?: string;
  tags?: string[];
  url?: string;
  score?: number;
  rank?: number;
  categories?: string[];
  external_id?: string;
  available_date?: string | null;
  published_date?: string | null;
  fetched_at?: string | null;
  pdf_url?: string;
  doi?: string;
  journal?: string;
  matched_interest?: string;
  feedback?: FeedFeedback;
  [key: string]: unknown;
}

export interface FeedDescription {
  id: string;
  slug: string;
  display_name: string;
  privacy: FeedPrivacy;
  configuration_version: number;
  generation_status: FeedGenerationStatus;
  interests?: string[];
  authors?: string[];
  user_id?: string;
  feed_slug?: string;
  follower_count?: number;
  created_at?: string;
  updated_at?: string;
  can_edit?: boolean;
  links?: {
    public?: string;
    rss?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RawFeedPageResponse {
  feed: FeedDescription;
  generation?: number | null;
  status: string;
  counts?: Record<string, number>;
  items?: RawFeedArticle[];
  next_cursor?: string | null;
  has_more: boolean;
  total: number;
  artifact_version?: string;
  completed_at?: string | null;
  [key: string]: unknown;
}

export interface FeedArticle {
  key: string;
  /** Backward-compatible route/store key used by the existing feed UI. */
  pmid: string;
  source: string;
  title: string;
  authors: string[];
  abstract: string;
  tags: string[];
  categories: string[];
  externalId: string;
  url: string;
  pdfUrl: string;
  pubDate: string;
  doi: string;
  journal: string;
  pmcid: string;
  pmcUrl: string;
  matchedInterest: string;
  raw: RawFeedArticle;
}

export interface FeedPageResponse extends Omit<RawFeedPageResponse, 'items'> {
  generation: number | null;
  counts: Record<string, number>;
  items: FeedArticle[];
  next_cursor: string | null;
}

export interface FeedTopic {
  id: string;
  name: string;
}

export interface FeedPageOptions {
  source?: FeedSource;
  limit?: number;
  cursor?: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const stringValue = (value: unknown): string => (typeof value === 'string' ? value : '');

const optionalStringValue = (value: unknown): string =>
  typeof value === 'string' && value.trim() ? value.trim() : '';

const normalizeStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const uniqueStrings = (values: string[]): string[] => {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const rawValue of values) {
    const value = rawValue.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    unique.push(value);
  }

  return unique;
};

export const articleKey = (article: RawFeedArticle | null | undefined): string =>
  article?.paper_key || article?.id || '';

export const normalizeAuthors = (authors: RawFeedArticle['authors']): string[] => {
  if (Array.isArray(authors)) return authors.filter((value) => typeof value === 'string');
  if (typeof authors === 'string' && authors.trim()) {
    return authors.split(/\s*[,;]\s*/).filter(Boolean);
  }
  return [];
};

const externalIdFromKey = (source: string, key: string): string => {
  const prefix = `${source}:`;
  return key.startsWith(prefix) ? key.slice(prefix.length) : key;
};

const normalizePmcid = (article: RawFeedArticle): string => {
  const explicit = optionalStringValue(article.pmcid) || optionalStringValue(article.pmc_id);
  if (!explicit) return '';
  return explicit.toUpperCase().startsWith('PMC') ? explicit : `PMC${explicit}`;
};

export const normalizeFeedArticle = (article: RawFeedArticle): FeedArticle | null => {
  const source = optionalStringValue(article.source) || 'unknown';
  const title = stringValue(article.title);
  const key =
    articleKey(article) || `${source}:${optionalStringValue(article.external_id) || title}`;

  if (!key) return null;

  const categories = uniqueStrings(normalizeStringList(article.categories));
  const matchedInterest = optionalStringValue(article.matched_interest);
  const tags = uniqueStrings([
    ...normalizeStringList(article.tags),
    ...categories,
    matchedInterest,
  ]);
  const externalId = optionalStringValue(article.external_id) || externalIdFromKey(source, key);
  const pmcid = normalizePmcid(article);
  const pmcUrl =
    optionalStringValue(article.pmc_url) ||
    (pmcid ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}/` : '');

  return {
    key,
    pmid: key,
    source,
    title,
    authors: normalizeAuthors(article.authors),
    abstract: stringValue(article.abstract),
    tags,
    categories,
    externalId,
    url: stringValue(article.url),
    pdfUrl: stringValue(article.pdf_url),
    pubDate:
      optionalStringValue(article.published_date) ||
      optionalStringValue(article.available_date) ||
      optionalStringValue(article.fetched_at),
    doi: optionalStringValue(article.doi),
    journal: optionalStringValue(article.journal),
    pmcid,
    pmcUrl,
    matchedInterest,
    raw: article,
  };
};

export const normalizeFeedPage = (value: unknown): FeedPageResponse => {
  if (!isObject(value)) throw new TypeError('Feed response must be an object');
  if (!isObject(value.feed)) throw new TypeError('Feed response must contain feed');
  if (typeof value.status !== 'string') throw new TypeError('status must be a string');
  if (typeof value.has_more !== 'boolean') throw new TypeError('has_more must be boolean');
  if (!Number.isInteger(value.total)) throw new TypeError('total must be an integer');
  if (value.items !== undefined && !Array.isArray(value.items)) {
    throw new TypeError('items must be an array when present');
  }

  const rawItems = Array.isArray(value.items)
    ? value.items.filter((item): item is RawFeedArticle => isObject(item))
    : [];

  return {
    ...(value as RawFeedPageResponse),
    generation: typeof value.generation === 'number' ? value.generation : null,
    counts: isObject(value.counts) ? (value.counts as Record<string, number>) : {},
    items: rawItems.map(normalizeFeedArticle).filter((item): item is FeedArticle => item !== null),
    next_cursor: typeof value.next_cursor === 'string' ? value.next_cursor : null,
  };
};

const queryOptionsWithDefaults = (options: FeedPageOptions = {}) => ({
  source: options.source ?? 'all',
  limit: options.limit ?? 40,
  cursor: options.cursor ?? '',
});

export const fetchMainFeedPage = async (
  options: FeedPageOptions = {},
  signal?: AbortSignal
): Promise<FeedPageResponse> => {
  const { source, limit, cursor } = queryOptionsWithDefaults(options);
  const response = await customInstance<RawFeedPageResponse>({
    url: '/api/feeds/main/items',
    method: 'GET',
    params: {
      source,
      limit,
      ...(cursor ? { cursor } : {}),
    },
    signal,
  });

  return normalizeFeedPage(response.data);
};

export const useMainFeedPage = (options: FeedPageOptions = {}) => {
  const { source, limit, cursor } = queryOptionsWithDefaults(options);

  return useQuery({
    queryKey: ['feeds', 'main', source, limit, cursor],
    queryFn: ({ signal }) => fetchMainFeedPage({ source, limit, cursor }, signal),
  });
};

const slugifyTopic = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const topicNamesForArticle = (article: FeedArticle): string[] =>
  uniqueStrings([...article.categories, ...article.tags, article.matchedInterest]);

export const getFeedTopics = (articles: FeedArticle[]): FeedTopic[] => {
  const byId = new Map<string, FeedTopic>();

  for (const article of articles) {
    for (const name of topicNamesForArticle(article)) {
      const id = slugifyTopic(name);
      if (!id || byId.has(id)) continue;
      byId.set(id, { id, name });
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const getTopicCounts = (articles: FeedArticle[]): Record<string, number> => {
  const counts: Record<string, number> = {};

  for (const article of articles) {
    const topicIds = new Set(topicNamesForArticle(article).map(slugifyTopic).filter(Boolean));
    for (const topicId of topicIds) {
      counts[topicId] = (counts[topicId] ?? 0) + 1;
    }
  }

  return counts;
};

export const filterFeedArticles = (
  articles: FeedArticle[],
  { topicId, query }: { topicId?: string | null; query?: string }
): FeedArticle[] => {
  let items = articles;

  if (topicId && topicId !== 'all') {
    items = items.filter((article) =>
      topicNamesForArticle(article).map(slugifyTopic).includes(topicId)
    );
  }

  const q = query?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        article.abstract.toLowerCase().includes(q) ||
        article.authors.some((author) => author.toLowerCase().includes(q)) ||
        article.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return items;
};

export const getArticleByKey = (
  articles: FeedArticle[],
  key: string | null | undefined
): FeedArticle | undefined => {
  if (!key) return undefined;
  return articles.find((article) => article.key === key || article.pmid === key);
};

export const getSimilarArticles = (
  articles: FeedArticle[],
  key: string,
  limit = 6
): FeedArticle[] => {
  const target = getArticleByKey(articles, key);
  if (!target) return [];

  const targetTags = new Set(topicNamesForArticle(target).map((tag) => tag.toLowerCase()));

  return articles
    .filter((article) => article.key !== target.key)
    .map((article) => {
      const overlap = topicNamesForArticle(article).filter((tag) =>
        targetTags.has(tag.toLowerCase())
      ).length;
      const sameSource = article.source === target.source ? 1 : 0;
      return { article, score: overlap * 2 + sameSource };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
};
