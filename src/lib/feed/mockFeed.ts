
import rawFeed from '@/data/pubmedFeed.json';

export interface FeedTopic {
  id: string;
  name: string;
}

export interface FeedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi: string;
  tags: string[];
  /** Bare PMC id ('PMC13370164') when open-access full text exists; '' otherwise. */
  pmcid: string;
  /** PMC landing page when open-access full text exists; '' otherwise. */
  pmcUrl: string;
  /** Topic filter this article is tagged with. Not a backend community. */
  topic: string;
  topicName: string;
  /** Feed source. Only 'pubmed' today; groundwork for RSS/blog/social (see Possibilities.md). */
  source: string;
}

interface FeedPayload {
  topics: FeedTopic[];
  articles: FeedArticle[];
}

const feed = rawFeed as FeedPayload;

/** All topic filters used by the left sidebar. */
export const getTopics = (): FeedTopic[] => feed.topics;

/** Article count per topic id, for sidebar badges. */
export const getTopicCounts = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const a of feed.articles) {
    counts[a.topic] = (counts[a.topic] ?? 0) + 1;
  }
  return counts;
};

/**
 * Feed articles, optionally narrowed by topic id and a free-text query.
 * Passing no topicId (or 'all') returns the global feed -- which is the default view.
 */
export const getFeed = (topicId?: string | null, query?: string): FeedArticle[] => {
  let items = feed.articles;
  if (topicId && topicId !== 'all') {
    items = items.filter((a) => a.topic === topicId);
  }
  const q = query?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.abstract.toLowerCase().includes(q) ||
        a.authors.some((au) => au.toLowerCase().includes(q)) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return items;
};

export const getArticle = (pmid: string): FeedArticle | undefined =>
  feed.articles.find((a) => a.pmid === pmid);

/**
 * Naive "similar" ranking: same topic first, then shared-tag overlap.
 * Stands in for the vector/keyword similarity the real backend will provide.
 */
export const getSimilar = (pmid: string, limit = 6): FeedArticle[] => {
  const target = getArticle(pmid);
  if (!target) return [];
  const targetTags = new Set(target.tags.map((t) => t.toLowerCase()));
  return feed.articles
    .filter((a) => a.pmid !== pmid)
    .map((a) => {
      const overlap = a.tags.filter((t) => targetTags.has(t.toLowerCase())).length;
      const sameTopic = a.topic === target.topic ? 1 : 0;
      return { a, score: overlap * 2 + sameTopic };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a);
};

export const getTotalCount = (): number => feed.articles.length;
