import { render, screen } from '@testing-library/react';

import FeedList from '@/components/feed/FeedList';
import { getFeedTopics, normalizeFeedPage } from '@/lib/feed/handoffFeed';

const feedPage = normalizeFeedPage({
  feed: {
    id: 'feed-u1-main',
    slug: 'u1-main',
    display_name: 'main',
    privacy: 'public',
    configuration_version: 2,
    generation_status: 'ready',
  },
  status: 'ready',
  has_more: false,
  total: 2,
  items: [
    {
      id: 'pubmed:dev-002',
      paper_key: 'pubmed:dev-002',
      source: 'pubmed',
      title: 'Community health interventions and longitudinal outcomes',
      authors: ['Grace Sample'],
      abstract: 'A deterministic PubMed fixture about public health.',
      categories: ['public health', 'medicine'],
      published_date: '2026-08-19',
      url: 'https://example.invalid/pubmed/dev-002',
    },
    {
      id: 'pubmed:dev-004',
      paper_key: 'pubmed:dev-004',
      source: 'pubmed',
      title: 'Cell signaling in a synthetic biology model',
      authors: ['Charles Mock'],
      abstract: 'A development fixture about cellular biology.',
      categories: ['biology', 'cell signaling'],
      published_date: '2026-08-17',
      url: 'https://example.invalid/pubmed/dev-004',
    },
  ],
});

const renderFeedList = (topicId?: string | null, query?: string) => {
  const articles = feedPage.items;
  return render(
    <FeedList
      articles={articles}
      topics={getFeedTopics(articles)}
      topicId={topicId}
      query={query}
    />
  );
};

describe('FeedList with handoff articles', () => {
  it('renders normalized handoff feed articles', () => {
    renderFeedList();

    expect(screen.getByRole('heading', { name: 'All articles' })).toBeInTheDocument();
    expect(screen.getByText('2 articles')).toBeInTheDocument();
    expect(screen.getByText('Grace Sample')).toBeInTheDocument();
    expect(
      screen.getByText('Community health interventions and longitudinal outcomes')
    ).toBeInTheDocument();
  });

  it('renders a derived topic view', () => {
    renderFeedList('public-health');

    expect(screen.getByRole('heading', { name: 'public health' })).toBeInTheDocument();
    expect(screen.getByText('1 articles')).toBeInTheDocument();
    expect(
      screen.getByText('Community health interventions and longitudinal outcomes')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Cell signaling in a synthetic biology model')
    ).not.toBeInTheDocument();
  });

  it('filters the handoff feed by query text', () => {
    renderFeedList(null, 'cellular');

    expect(screen.getByText('1 articles')).toBeInTheDocument();
    expect(screen.getByText('Cell signaling in a synthetic biology model')).toBeInTheDocument();
    expect(
      screen.queryByText('Community health interventions and longitudinal outcomes')
    ).not.toBeInTheDocument();
  });
});
