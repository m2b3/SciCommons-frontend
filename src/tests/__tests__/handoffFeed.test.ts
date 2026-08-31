import { customInstance } from '@/api/custom-instance';
import {
  articleKey,
  fetchMainFeedPage,
  filterFeedArticles,
  getArticleByKey,
  getFeedTopics,
  getSimilarArticles,
  getTopicCounts,
  normalizeAuthors,
  normalizeFeedPage,
} from '@/lib/feed/handoffFeed';

jest.mock('@/api/custom-instance', () => ({
  customInstance: jest.fn(),
}));

const mockedCustomInstance = customInstance as jest.Mock;

const rawPage = {
  feed: {
    id: 'feed-u1-main',
    slug: 'u1-main',
    display_name: 'main',
    privacy: 'public',
    configuration_version: 2,
    generation_status: 'ready',
  },
  generation: 1,
  status: 'ready',
  counts: { all: 2, pubmed: 1, arxiv: 1 },
  items: [
    {
      id: 'pubmed:dev-002',
      paper_key: 'pubmed:dev-002',
      source: 'pubmed',
      title: 'Community health interventions',
      authors: ['Grace Sample'],
      abstract: 'A deterministic PubMed fixture about public health.',
      tags: ['Health'],
      categories: ['public health', 'medicine'],
      external_id: 'dev-002',
      published_date: '2026-08-19',
      url: 'https://example.invalid/pubmed/dev-002',
      unexpected_extension: 'kept on raw',
    },
    {
      id: 'arxiv:1234.5678',
      source: 'arxiv',
      title: 'Synthetic biology model',
      authors: 'Charles Mock; Dana Example',
      abstract: 'A development fixture about cellular biology.',
      tags: [],
      categories: ['biology', 'cell signaling'],
      available_date: '2026-08-20',
      matched_interest: 'biology',
      url: 'https://example.invalid/arxiv/1234.5678',
    },
  ],
  next_cursor: null,
  has_more: false,
  total: 2,
  artifact_version: 'legacy',
};

describe('feed handoff normalization', () => {
  beforeEach(() => {
    mockedCustomInstance.mockReset();
  });

  it('uses paper_key before id for article identity', () => {
    expect(articleKey({ id: 'fallback', paper_key: 'primary' })).toBe('primary');
    expect(articleKey({ id: 'fallback' })).toBe('fallback');
  });

  it('normalizes both supported author formats', () => {
    expect(normalizeAuthors(['Grace Sample'])).toEqual(['Grace Sample']);
    expect(normalizeAuthors('Charles Mock; Dana Example')).toEqual([
      'Charles Mock',
      'Dana Example',
    ]);
  });

  it('normalizes a feed page while preserving handoff extensions on raw articles', () => {
    const page = normalizeFeedPage(rawPage);

    expect(page.generation).toBe(1);
    expect(page.counts.pubmed).toBe(1);
    expect(page.items).toHaveLength(2);
    expect(page.items[0]).toMatchObject({
      key: 'pubmed:dev-002',
      pmid: 'pubmed:dev-002',
      externalId: 'dev-002',
      pubDate: '2026-08-19',
      tags: ['Health', 'public health', 'medicine'],
    });
    expect(page.items[0].raw.unexpected_extension).toBe('kept on raw');
  });

  it('derives topics and counts from categories, tags, and matched interests', () => {
    const articles = normalizeFeedPage(rawPage).items;

    expect(getFeedTopics(articles).map((topic) => topic.id)).toEqual([
      'biology',
      'cell-signaling',
      'health',
      'medicine',
      'public-health',
    ]);
    expect(getTopicCounts(articles)).toMatchObject({
      biology: 1,
      'public-health': 1,
      medicine: 1,
    });
  });

  it('filters articles by derived topic and text query', () => {
    const articles = normalizeFeedPage(rawPage).items;

    expect(
      filterFeedArticles(articles, { topicId: 'public-health' }).map((item) => item.key)
    ).toEqual(['pubmed:dev-002']);
    expect(filterFeedArticles(articles, { query: 'cellular' }).map((item) => item.key)).toEqual([
      'arxiv:1234.5678',
    ]);
  });

  it('finds and ranks similar feed articles by normalized article key', () => {
    const articles = normalizeFeedPage(rawPage).items;

    expect(getArticleByKey(articles, 'pubmed:dev-002')?.title).toBe(
      'Community health interventions'
    );
    expect(getSimilarArticles(articles, 'pubmed:dev-002')).toHaveLength(1);
  });

  it('rejects malformed feed pages', () => {
    expect(() => normalizeFeedPage({})).toThrow('Feed response must contain feed');
    expect(() =>
      normalizeFeedPage({
        feed: rawPage.feed,
        status: 'ready',
        has_more: false,
        total: 1,
        items: {},
      })
    ).toThrow('items must be an array');
  });

  it('fetches the static backend feed endpoint with feed-service query params', async () => {
    mockedCustomInstance.mockResolvedValue({ data: rawPage });

    const page = await fetchMainFeedPage({ source: 'pubmed', limit: 1, cursor: 'static:1' });

    expect(mockedCustomInstance).toHaveBeenCalledWith({
      url: '/api/feeds/main/items',
      method: 'GET',
      params: {
        source: 'pubmed',
        limit: 1,
        cursor: 'static:1',
      },
      signal: undefined,
    });
    expect(page.items[0].key).toBe('pubmed:dev-002');
  });
});
