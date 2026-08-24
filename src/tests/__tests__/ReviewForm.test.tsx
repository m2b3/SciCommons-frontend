import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import ReviewForm from '@/components/articles/ReviewForm';

/* Added by Claude on 2026-08-22
   What: Coverage for the canDelete gate on the review edit form.
   Why: The review of PR #361 asked for ReviewForm tests; canDelete now decides whether an
        author can destroy a review at all, so it needs both branches pinned down.
   How: Stub the review mutations and the markdown editor, then render the form in edit mode. */

const mockDeleteReview = jest.fn();

jest.mock('@/api/reviews/reviews', () => ({
  useArticlesReviewApiCreateReview: () => ({ mutate: jest.fn(), isPending: false }),
  useArticlesReviewApiUpdateReview: () => ({ mutate: jest.fn(), isPending: false }),
  useArticlesReviewApiDeleteReview: () => ({ mutate: mockDeleteReview, isPending: false }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn(), setQueriesData: jest.fn() }),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: { accessToken: string }) => unknown) =>
    selector({ accessToken: 'token-1' }),
}));

jest.mock('@/components/common/MarkdownEditor/ForwardRefEditor', () => {
  const actualReact = jest.requireActual<typeof import('react')>('react');
  /* Fixed by Codex on 2026-08-24
     Who: Codex
     What: Made the markdown-editor test double accept ReviewForm's imperative ref.
     Why: A plain function mock produced a React ref warning on every ReviewForm render.
     How: Mirror the production component's forwardRef boundary while keeping the mock lightweight. */
  const MockForwardRefEditor = actualReact.forwardRef(() => <div>MarkdownEditor</div>);
  MockForwardRefEditor.displayName = 'MockForwardRefEditor';
  return { ForwardRefEditor: MockForwardRefEditor };
});

// ReviewForm imports ReviewCardSkeleton from ReviewCard; stubbing it keeps that tree out.
jest.mock('@/components/articles/ReviewCard', () => ({
  ReviewCardSkeleton: () => <div>ReviewCardSkeleton</div>,
}));

const renderEditForm = (canDelete: boolean) =>
  render(
    <ReviewForm
      articleId={1}
      reviewId={5}
      edit
      setEdit={jest.fn()}
      title="Solid methodology"
      content="The controls are convincing."
      rating={4}
      canDelete={canDelete}
    />
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ReviewForm delete gating', () => {
  it('offers Delete while the author is inside the delete window', () => {
    renderEditForm(true);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('withholds Delete once the window has closed', () => {
    renderEditForm(false);

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('keeps Update and Cancel available either way', () => {
    renderEditForm(false);

    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('reaches the confirmation dialog only when deletion is allowed', () => {
    renderEditForm(true);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete this review?')).toBeInTheDocument();
    // Opening the dialog must not delete anything on its own.
    expect(mockDeleteReview).not.toHaveBeenCalled();
  });

  it('defaults to withholding Delete when canDelete is not supplied', () => {
    render(
      <ReviewForm
        articleId={1}
        reviewId={5}
        edit
        setEdit={jest.fn()}
        title="Solid methodology"
        content="The controls are convincing."
        rating={4}
      />
    );

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
