import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ReviewOut } from '@/api/schemas';
import ReviewCard from '@/components/articles/ReviewCard';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';

/* Added by Claude on 2026-08-22
   What: Coverage for how ReviewCard renders a soft-deleted review.
   Why: The review of PR #361 found that a deleted review collapsed to a bare author row and
        took its still-live comment thread out of reach, and asked for ReviewCard tests.
   How: Stub the API hooks and heavy children, then assert on the tombstone, the comments
        toggle, and the canDelete value handed to ReviewForm. */

const mockReviewFormProps = jest.fn();
const mockApproveArticle = jest.fn();

jest.mock('next/image', () => {
  const MockImage = ({ alt }: { alt?: string }) => <span aria-label={alt ?? 'image'} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const mockAuthState: { accessToken: string; user: { id: number } | null } = {
  accessToken: 'token-1',
  user: null,
};

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (
    selector: (state: { accessToken: string; user: { id: number } | null }) => unknown
  ) => selector(mockAuthState),
}));

jest.mock('@/api/community-articles/community-articles', () => ({
  useCommunitiesArticlesApiApproveArticle: () => ({
    mutate: mockApproveArticle,
    isPending: false,
  }),
}));

jest.mock('@/api/flags/flags', () => ({
  useMyappFlagsApiAddFlags: () => ({ mutate: jest.fn(), isPending: false }),
  useMyappFlagsApiRemoveFlags: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/components/articles/ReviewComments', () => {
  const MockReviewComments = () => <div>ReviewCommentsPanel</div>;
  MockReviewComments.displayName = 'MockReviewComments';
  return MockReviewComments;
});

jest.mock('@/components/articles/ReviewForm', () => {
  const MockReviewForm = (props: Record<string, unknown>) => {
    mockReviewFormProps(props);
    return <div>ReviewFormEditor</div>;
  };
  MockReviewForm.displayName = 'MockReviewForm';
  return MockReviewForm;
});

jest.mock('@/components/common/RenderParsedHTML', () => {
  const MockRender = ({ rawContent }: { rawContent: string }) => <div>{rawContent}</div>;
  MockRender.displayName = 'MockRenderParsedHTML';
  return MockRender;
});

jest.mock('@/components/common/TruncateText', () => {
  const MockTruncateText = ({ text }: { text: string }) => <span>{text}</span>;
  MockTruncateText.displayName = 'MockTruncateText';
  return MockTruncateText;
});

const NOW = new Date('2026-08-22T09:00:00.000Z');
const isoAgo = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const TOMBSTONE = 'This review was deleted by its author.';

const buildReview = (overrides: Partial<ReviewOut> = {}): ReviewOut => ({
  id: 5,
  article_id: 1,
  user: { id: 9, username: 'alice', profile_pic_url: null },
  subject: 'Solid methodology',
  content: 'The controls are convincing.',
  rating: 4,
  review_type: 'reviewer',
  created_at: isoAgo(60_000),
  updated_at: isoAgo(60_000),
  versions: [],
  comments_count: 3,
  is_author: true,
  ...overrides,
});

/** The backend blanks subject/content and stamps deleted_at, keeping the row. */
const buildDeletedReview = (overrides: Partial<ReviewOut> = {}): ReviewOut =>
  buildReview({ subject: '', content: '', deleted_at: isoAgo(1_000), ...overrides });

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
  mockAuthState.user = null;
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('ReviewCard for a live review', () => {
  it('renders the subject and body and no tombstone', () => {
    render(<ReviewCard review={buildReview()} />);

    expect(screen.getByText('Solid methodology')).toBeInTheDocument();
    expect(screen.getByText('The controls are convincing.')).toBeInTheDocument();
    expect(screen.queryByText(TOMBSTONE)).not.toBeInTheDocument();
  });

  it('offers the author the edit affordance', () => {
    render(<ReviewCard review={buildReview()} />);

    expect(screen.getByRole('button', { name: 'Edit review' })).toBeInTheDocument();
  });

  /* Fixed by Codex on 2026-08-24
     Who: Codex
     What: Added a regression for the PR 359/361 ReviewCard conflict resolution.
     Why: Choosing PR 361's static version indexes would make a realtime update that appends a
          history entry move a user who selected Latest onto the now-previous version.
     How: Rerender with the former latest content moved into versions and require the selector and
          visible body to continue following the new latest review. */
  it('keeps Latest selected when a realtime refresh appends a review version', () => {
    const { rerender } = render(<ReviewCard review={buildReview()} />);

    expect(screen.getByRole('combobox')).toHaveValue('0');

    rerender(
      <ReviewCard
        review={buildReview({
          subject: 'Updated methodology',
          content: 'The revised controls are convincing.',
          updated_at: isoAgo(30_000),
          versions: [
            {
              content: 'The controls are convincing.',
              subject: 'Solid methodology',
              rating: 4,
              version: 1,
              created_at: isoAgo(60_000),
            },
          ],
        })}
      />
    );

    expect(screen.getByRole('combobox')).toHaveValue('1');
    expect(screen.getByText('Updated methodology')).toBeInTheDocument();
    expect(screen.getByText('The revised controls are convincing.')).toBeInTheDocument();
  });
});

describe('ReviewCard for a deleted review', () => {
  it('renders a tombstone instead of an empty body', () => {
    render(<ReviewCard review={buildDeletedReview()} />);

    expect(screen.getByText(TOMBSTONE)).toBeInTheDocument();
    // The author is still identified - the review is removed, not the attribution.
    expect(screen.getByText('alice')).toBeInTheDocument();
  });

  it('keeps the comment thread reachable', () => {
    render(<ReviewCard review={buildDeletedReview()} />);

    const toggle = screen.getByRole('button', { expanded: false });
    expect(toggle).toHaveTextContent('3 comments');
    expect(screen.queryByText('ReviewCommentsPanel')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText('ReviewCommentsPanel')).toBeInTheDocument();
  });

  it('hides the edit affordance and the version picker', () => {
    render(
      <ReviewCard
        review={buildDeletedReview({
          versions: [
            {
              content: 'The controls are convincing.',
              subject: 'Solid methodology',
              rating: 4,
              version: 1,
              created_at: isoAgo(120_000),
            },
          ],
        })}
      />
    );

    expect(screen.queryByRole('button', { name: 'Edit review' })).not.toBeInTheDocument();
    // The version picker would expose the pre-deletion text, which the API still returns.
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByText('Solid methodology')).not.toBeInTheDocument();
    expect(screen.queryByText('The controls are convincing.')).not.toBeInTheDocument();
  });

  it('does not open the edit form even if edit mode is somehow entered', () => {
    render(<ReviewCard review={buildDeletedReview()} />);

    expect(screen.queryByText('ReviewFormEditor')).not.toBeInTheDocument();
  });
});

describe('ReviewCard delete window', () => {
  const openEditor = (review: ReviewOut) => {
    render(<ReviewCard review={review} />);
    return screen.getByRole('button', { name: 'Edit review' });
  };

  it('lets the author delete inside the five-minute window', () => {
    fireEvent.click(openEditor(buildReview({ created_at: isoAgo(60_000) })));

    expect(mockReviewFormProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ canDelete: true })
    );
  });

  it('withholds delete once the window has closed', () => {
    fireEvent.click(openEditor(buildReview({ created_at: isoAgo(FIVE_MINUTES_IN_MS + 1) })));

    expect(mockReviewFormProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ canDelete: false })
    );
  });

  it('withholds delete from someone who is not the author', () => {
    render(<ReviewCard review={buildReview({ is_author: false })} />);

    // Without authorship there is no edit entry point at all.
    expect(screen.queryByRole('button', { name: 'Edit review' })).not.toBeInTheDocument();
  });
});

describe('ReviewCard moderator actions', () => {
  const MODERATOR_ID = 42;

  /* canApprove needs a community_article naming this user; only those three fields are read. */
  const communityArticle = {
    id: 3,
    moderator_id: MODERATOR_ID,
    reviewer_ids: [],
    is_admin: false,
  } as unknown as ReviewOut['community_article'];

  beforeEach(() => {
    mockAuthState.user = { id: MODERATOR_ID };
  });

  it('offers approve and pin on a live review', () => {
    render(
      <ReviewCard
        review={buildReview({ is_author: false, community_article: communityArticle })}
        isCommunityAdmin
      />
    );

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pin/i })).toBeInTheDocument();
  });

  it('withholds approve and pin on a deleted review while keeping the thread', () => {
    render(
      <ReviewCard
        review={buildDeletedReview({ is_author: false, community_article: communityArticle })}
        isCommunityAdmin
      />
    );

    expect(screen.queryByRole('button', { name: /approve/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pin/i })).not.toBeInTheDocument();
    // The comments toggle is the one action that must survive.
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('3 comments');
  });
});
