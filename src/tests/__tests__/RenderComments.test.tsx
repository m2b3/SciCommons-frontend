import React from 'react';

import { render, screen } from '@testing-library/react';

import { CommentData } from '@/components/common/Comment';
import RenderComments from '@/components/common/RenderComments';

const mockRenderedComment = jest.fn();

jest.mock('@/components/common/Comment', () => {
  const actual = jest.requireActual<typeof import('@/components/common/Comment')>(
    '@/components/common/Comment'
  );
  const MockComment = (props: { id: number }) => {
    mockRenderedComment(props.id);
    return <div data-testid={`comment-${props.id}`} />;
  };
  MockComment.displayName = 'MockComment';
  return { ...actual, __esModule: true, default: MockComment };
});

/* Fixed by Codex on 2026-08-24
   Who: Codex
   What: Added direct regression coverage for deleted-node filtering in RenderComments.
   Why: The existing Comment test rendered a tombstone directly and did not prove that the parent
        renderer would retain a deleted node carrying live replies.
   How: Render live, leaf-deleted, and deleted-with-reply nodes together and assert which IDs reach
        the Comment boundary. */
const buildComment = (overrides: Partial<CommentData> = {}): CommentData => ({
  id: 1,
  author: { id: 7, username: 'alice', profile_pic_url: null },
  created_at: '2026-08-24T10:00:00.000Z',
  content: 'Visible comment',
  upvotes: 0,
  replies: [],
  ...overrides,
});

describe('RenderComments deleted-node filtering', () => {
  beforeEach(() => {
    mockRenderedComment.mockClear();
  });

  it('drops deleted leaves but retains a deleted parent that anchors live replies', () => {
    const liveReply = buildComment({ id: 4, content: 'A surviving reply' });

    render(
      <RenderComments
        comments={[
          buildComment({ id: 1 }),
          buildComment({ id: 2, content: '', is_deleted: true }),
          buildComment({ id: 3, content: '', is_deleted: true, replies: [liveReply] }),
        ]}
        maxDepth={2}
        isAllCollapsed={false}
        onAddReply={jest.fn()}
        onUpdateComment={jest.fn()}
        onDeleteComment={jest.fn()}
        contentType="articles.discussioncomment"
      />
    );

    expect(screen.getByTestId('comment-1')).toBeInTheDocument();
    expect(screen.queryByTestId('comment-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('comment-3')).toBeInTheDocument();
    expect(mockRenderedComment.mock.calls.map(([id]) => id)).toEqual([1, 3]);
  });
});
