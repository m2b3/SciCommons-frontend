import React from 'react';

import { render, screen } from '@testing-library/react';

import Comment from '@/components/common/Comment';

const mockGetReactionCount = jest.fn();
const mockPostReaction = jest.fn();

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

describe('Comment reaction query behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReactionCount.mockReturnValue({
      data: undefined,
      refetch: jest.fn(),
    });
    mockPostReaction.mockReturnValue({
      mutate: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('disables eager reaction-count query and falls back to upvotes', () => {
    render(
      <Comment
        id={10}
        author={{ id: 1, username: 'alice', profile_pic_url: null }}
        created_at={new Date().toISOString()}
        content="hello"
        upvotes={7}
        replies={[]}
        depth={0}
        maxDepth={2}
        isAllCollapsed={false}
        onAddReply={jest.fn()}
        onUpdateComment={jest.fn()}
        onDeleteComment={jest.fn()}
        contentType="articles.discussioncomment"
      />
    );

    const hookArgs = mockGetReactionCount.mock.calls[0];
    expect(hookArgs[2].query.enabled).toBe(false);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows author delete action inside the five-minute window', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-07-14T10:04:00.000Z').getTime());

    render(
      <Comment
        id={11}
        author={{ id: 1, username: 'alice', profile_pic_url: null }}
        created_at="2026-07-14T10:00:00.000Z"
        content="fresh"
        upvotes={0}
        replies={[]}
        depth={0}
        maxDepth={2}
        isAllCollapsed={false}
        is_author
        onAddReply={jest.fn()}
        onUpdateComment={jest.fn()}
        onDeleteComment={jest.fn()}
        contentType="articles.discussioncomment"
      />
    );

    expect(screen.getByLabelText('Delete comment')).toBeInTheDocument();
  });

  it('hides author delete action after the five-minute window', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-07-14T10:06:00.000Z').getTime());

    render(
      <Comment
        id={12}
        author={{ id: 1, username: 'alice', profile_pic_url: null }}
        created_at="2026-07-14T10:00:00.000Z"
        content="old"
        upvotes={0}
        replies={[]}
        depth={0}
        maxDepth={2}
        isAllCollapsed={false}
        is_author
        onAddReply={jest.fn()}
        onUpdateComment={jest.fn()}
        onDeleteComment={jest.fn()}
        contentType="articles.discussioncomment"
      />
    );

    expect(screen.queryByLabelText('Delete comment')).not.toBeInTheDocument();
  });

  it('does not render deleted comment content or mutation controls', () => {
    render(
      <Comment
        id={13}
        author={{ id: 1, username: 'alice', profile_pic_url: null }}
        created_at="2026-07-14T10:00:00.000Z"
        content="[deleted]"
        upvotes={0}
        replies={[]}
        depth={0}
        maxDepth={2}
        isAllCollapsed={false}
        is_author
        is_deleted
        onAddReply={jest.fn()}
        onUpdateComment={jest.fn()}
        onDeleteComment={jest.fn()}
        contentType="articles.discussioncomment"
      />
    );

    expect(screen.queryByText('[deleted]')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Edit comment')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete comment')).not.toBeInTheDocument();
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });

  it('treats cleared comment content as deleted even without is_deleted flag', () => {
    render(
      <Comment
        id={14}
        author={{ id: 1, username: 'alice', profile_pic_url: null }}
        created_at="2026-07-14T10:00:00.000Z"
        content=""
        upvotes={0}
        replies={[]}
        depth={0}
        maxDepth={2}
        isAllCollapsed={false}
        is_author
        onAddReply={jest.fn()}
        onUpdateComment={jest.fn()}
        onDeleteComment={jest.fn()}
        contentType="articles.discussioncomment"
      />
    );

    expect(screen.queryByLabelText('Edit comment')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete comment')).not.toBeInTheDocument();
    expect(screen.queryByText('Reply')).not.toBeInTheDocument();
  });
});
