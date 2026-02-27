import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import ArticleContentView from '@/components/articles/ArticleContentView';

const mockUseAuthStore = jest.fn();
const mockUseArticlesApiGetArticle = jest.fn();
const mockUseArticlesReviewApiListReviews = jest.fn();

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: { accessToken: string | null }) => unknown) =>
    mockUseAuthStore(selector),
}));

jest.mock('@/api/articles/articles', () => ({
  useArticlesApiGetArticle: (...args: unknown[]) => mockUseArticlesApiGetArticle(...args),
}));

jest.mock('@/api/reviews/reviews', () => ({
  useArticlesReviewApiListReviews: (...args: unknown[]) =>
    mockUseArticlesReviewApiListReviews(...args),
}));

jest.mock('@/components/articles/DisplayArticle', () => ({
  __esModule: true,
  default: ({ article }: { article: { title?: string } }) => (
    <div data-testid="display-article">{article?.title ?? 'Article'}</div>
  ),
  DisplayArticleSkeleton: () => <div data-testid="display-article-skeleton">Loading article</div>,
}));

jest.mock('@/components/articles/DiscussionForum', () => ({
  __esModule: true,
  default: () => <div data-testid="discussion-forum">Discussion forum</div>,
}));

jest.mock('@/components/articles/ReviewCard', () => ({
  __esModule: true,
  default: () => <div data-testid="review-card">Review card</div>,
  ReviewCardSkeleton: () => <div data-testid="review-card-skeleton">Loading review</div>,
}));

jest.mock('@/components/articles/ReviewForm', () => ({
  __esModule: true,
  default: ({ articleId }: { articleId: number }) => (
    <div data-testid="review-form">Review form article {articleId}</div>
  ),
}));

describe('ArticleContentView', () => {
  beforeEach(() => {
    mockUseAuthStore.mockImplementation(
      (selector: (state: { accessToken: string | null }) => unknown) =>
        selector({ accessToken: 'test-token' })
    );

    mockUseArticlesApiGetArticle.mockReturnValue({
      data: {
        data: {
          id: 101,
          title: 'Preview article',
          is_submitter: false,
          community_article: { id: 12, community: { id: 8 } },
        },
      },
      error: null,
      isPending: false,
    });

    mockUseArticlesReviewApiListReviews.mockReturnValue({
      data: { data: { items: [] } },
      error: null,
      isPending: false,
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows and opens review form in preview mode without external toggle props', () => {
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Added regression coverage for review submission in right-panel preview contexts.
       Why: Preview usage of ArticleContentView can omit parent form-toggle props.
       How: Assert the Add review control exists and opens the embedded ReviewForm when clicked. */
    render(<ArticleContentView articleSlug="preview-article" articleId={101} />);

    const addReviewButton = screen.getByRole('button', { name: 'Add review' });
    expect(addReviewButton).toBeInTheDocument();

    fireEvent.click(addReviewButton);

    expect(screen.getByTestId('review-form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('requests reviews with community scope when community context is provided', () => {
    render(<ArticleContentView articleSlug="preview-article" articleId={101} communityId={8} />);

    expect(mockUseArticlesReviewApiListReviews).toHaveBeenCalled();
    const firstCallArgs = mockUseArticlesReviewApiListReviews.mock.calls[0];
    expect(firstCallArgs[0]).toBe(101);
    expect(firstCallArgs[1]).toEqual({ community_id: 8 });
  });
});
