import React from 'react';

import { render, screen } from '@testing-library/react';

import { ContentTypeEnum, FlagType } from '@/api/schemas';
import Comment from '@/components/common/Comment';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';

/* Added by Claude on 2026-08-22
   What: Coverage for the content-type gate that decides which comments get persisted NEW retention.
   Why: The review of PR #360 asked for proof that discussion comments opt in with the right key
        and window, and that every other entity type keeps its previous behavior.
   How: Stub useMarkAsReadOnView and assert the options Comment passes to it. */

const mockUseMarkAsReadOnView = jest.fn();
const mockGetReactionCount = jest.fn();
const mockPostReaction = jest.fn();

jest.mock('@/hooks/useMarkAsReadOnView', () => ({
  useMarkAsReadOnView: (...args: unknown[]) => mockUseMarkAsReadOnView(...args),
}));

jest.mock('next/image', () => {
  const MockImage = ({ alt }: { alt?: string }) => <span aria-label={alt ?? 'image'} />;
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: { accessToken: string }) => unknown) =>
    selector({ accessToken: 'token-1' }),
}));

jest.mock('@/components/common/RenderParsedHTML', () => {
  const MockRender = ({ rawContent }: { rawContent: string }) => <div>{rawContent}</div>;
  MockRender.displayName = 'MockRenderParsedHTML';
  return MockRender;
});

jest.mock('@/components/common/CommentInput', () => {
  const MockCommentInput = () => <div>CommentInput</div>;
  MockCommentInput.displayName = 'MockCommentInput';
  return MockCommentInput;
});

jest.mock('@/components/common/RenderComments', () => {
  const MockRenderComments = () => <div>RenderComments</div>;
  MockRenderComments.displayName = 'MockRenderComments';
  return MockRenderComments;
});

jest.mock('@/components/ui/ratings', () => ({
  Ratings: () => <div>Ratings</div>,
}));

jest.mock('@/api/users-common-api/users-common-api', () => ({
  useUsersCommonApiGetReactionCount: (...args: unknown[]) => mockGetReactionCount(...args),
  useUsersCommonApiPostReaction: (...args: unknown[]) => mockPostReaction(...args),
}));

interface RenderOverrides {
  id?: number;
  depth?: number;
  contentType?: ContentTypeEnum;
  flags?: FlagType[];
}

const renderComment = ({
  id = 10,
  depth = 0,
  contentType = ContentTypeEnum.articlesdiscussioncomment,
  flags = [FlagType.unread],
}: RenderOverrides = {}) =>
  render(
    <Comment
      id={id}
      author={{ id: 1, username: 'alice', profile_pic_url: null }}
      created_at="2026-08-22T09:00:00.000Z"
      content="hello"
      upvotes={0}
      replies={[]}
      depth={depth}
      maxDepth={2}
      isAllCollapsed={false}
      onAddReply={jest.fn()}
      onUpdateComment={jest.fn()}
      onDeleteComment={jest.fn()}
      contentType={contentType}
      flags={flags}
    />
  );

const markAsReadOptions = () => mockUseMarkAsReadOnView.mock.calls[0][1];

describe('Comment NEW badge retention wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMarkAsReadOnView.mockReturnValue({ showNewTag: false });
    mockGetReactionCount.mockReturnValue({ data: undefined, refetch: jest.fn() });
    mockPostReaction.mockReturnValue({ mutate: jest.fn() });
  });

  it('opts a top-level discussion comment into five-minute persisted retention', () => {
    renderComment({ id: 10, depth: 0 });

    expect(markAsReadOptions()).toMatchObject({
      entityId: 10,
      entityType: 'comment',
      hasUnreadFlag: true,
      newTagRemovalDelayMs: FIVE_MINUTES_IN_MS,
      newTagRetentionKey: 'discussion-comment:10',
    });
  });

  it('scopes the retention key to replies by depth', () => {
    renderComment({ id: 11, depth: 1 });

    expect(markAsReadOptions()).toMatchObject({
      entityId: 11,
      entityType: 'reply',
      newTagRemovalDelayMs: FIVE_MINUTES_IN_MS,
      newTagRetentionKey: 'discussion-reply:11',
    });
  });

  it('leaves review comments on the previous non-persisted behavior', () => {
    renderComment({ id: 12, contentType: ContentTypeEnum.articlesreviewcomment });

    const options = markAsReadOptions();
    expect(options.newTagRetentionKey).toBeUndefined();
    expect(options.newTagRemovalDelayMs).toBeUndefined();
  });

  it('leaves post comments on the previous non-persisted behavior', () => {
    renderComment({ id: 13, contentType: ContentTypeEnum.postscomment });

    const options = markAsReadOptions();
    expect(options.newTagRetentionKey).toBeUndefined();
    expect(options.newTagRemovalDelayMs).toBeUndefined();
  });

  it('renders the NEW badge only while the hook reports it', () => {
    mockUseMarkAsReadOnView.mockReturnValue({ showNewTag: true });
    const { unmount } = renderComment();
    expect(screen.getByText('New')).toBeInTheDocument();
    unmount();

    mockUseMarkAsReadOnView.mockReturnValue({ showNewTag: false });
    renderComment();
    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });
});
