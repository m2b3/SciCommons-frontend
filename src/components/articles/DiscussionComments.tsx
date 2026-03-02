'use client';

import React, { useEffect, useState } from 'react';

import { ChevronsDown, ChevronsUp, Layers, SquareMinus, SquarePlus } from 'lucide-react';
import { toast } from 'sonner';

import {
  useArticlesDiscussionApiCreateComment,
  useArticlesDiscussionApiDeleteComment,
  useArticlesDiscussionApiListDiscussionComments,
  useArticlesDiscussionApiUpdateComment,
} from '@/api/discussions/discussions';
import { ContentTypeEnum, DiscussionCommentOut } from '@/api/schemas';
import CommentInput from '@/components/common/CommentInput';
import RenderComments from '@/components/common/RenderComments';
import { TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { convertToDiscussionCommentData } from '@/lib/converToCommentData';
import { captureMentionNotification } from '@/lib/mentionNotifications';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useRealtimeContextStore } from '@/stores/realtimeStore';

import InfiniteSpinnerAnimation from '../animations/InfiniteSpinnerAnimation';

interface DiscussionCommentsProps {
  discussionId: number;
  targetCommentId?: number | null;
  onTargetCommentHandled?: () => void;
  mentionCandidates?: string[];
  mentionContext?: {
    articleId: number;
    communityId?: number | null;
  };
  /** Article context for tracking read state */
  articleContext?: {
    communityId: number;
    articleId: number;
  };
}

const DiscussionComments: React.FC<DiscussionCommentsProps> = ({
  discussionId,
  targetCommentId = null,
  onTargetCommentHandled,
  mentionCandidates = [],
  mentionContext,
  articleContext,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(false);
  const [isCommentFormCollapsed, setIsCommentFormCollapsed] = useState<boolean>(true);

  // Mark realtime context for comment viewing
  useEffect(() => {
    const store = useRealtimeContextStore.getState();
    store.setViewingComments(true, discussionId);

    return () => {
      store.setViewingComments(false);
    };
  }, [discussionId]);
  const { data, refetch, isPending } = useArticlesDiscussionApiListDiscussionComments(
    discussionId,
    {},
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: TEN_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
      },
    }
  );

  const { mutate: createComment, isPending: isCreateCommentPending } =
    useArticlesDiscussionApiCreateComment({
      mutation: {
        onSuccess: () => {
          refetch();
          /* Fixed by Codex on 2026-02-09
             Problem: Add Comment form stays open after posting, cluttering sidebar flow
             Solution: Collapse the form on successful comment creation
             Result: UI returns to the "+" collapsed state after posting */
          setIsCommentFormCollapsed(true);
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  const { mutate: UpdateComment } = useArticlesDiscussionApiUpdateComment({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
        toast.success('Comment updated successfully.');
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });
  const { mutate: deleteComment } = useArticlesDiscussionApiDeleteComment({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
        toast.success('Comment deleted successfully.');
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const handleDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depth = parseInt(e.target.value);
    setMaxDepth(depth === 0 ? Infinity : depth);
  };

  const toggleAllComments = () => {
    setIsAllCollapsed(!isAllCollapsed);
  };

  const addNewComment = (content: string) => {
    createComment({ discussionId, data: { content } });
  };

  const addReply = (parentId: number, content: string) => {
    createComment({ discussionId, data: { content, parent_id: parentId } });
  };

  const updateComment = (commentId: number, updatedContent: string) => {
    UpdateComment({ commentId, data: { content: updatedContent } });
  };

  const deleteCommentbyId = (commentId: number) => {
    deleteComment({ commentId });
  };

  const comments = data?.data ?? [];
  const hasComments = comments.length > 0;
  const depthSelectId = `discussion-${discussionId}-depth-select`;

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Scan fetched discussion comment trees for `@username` mentions.
     Why: Mention notifications should be captured from initial backend comment payloads, not just realtime events.
     How: Recursively walk top-level comments and replies, then register matching mentions once in the shared store. */
  useEffect(() => {
    if (!mentionContext?.articleId) return;
    if (!Array.isArray(data?.data) || data.data.length === 0) return;

    const scanCommentTree = (comment: DiscussionCommentOut): void => {
      if (comment.id !== undefined) {
        captureMentionNotification({
          sourceType: 'comment',
          sourceId: Number(comment.id),
          discussionId,
          articleId: mentionContext.articleId,
          communityId: mentionContext.communityId ?? null,
          content: comment.content,
          authorUsername: comment.author?.username,
          createdAt: comment.created_at,
        });
      }

      if (Array.isArray(comment.replies) && comment.replies.length > 0) {
        comment.replies.forEach((reply) => scanCommentTree(reply));
      }
    };

    data.data.forEach((comment) => scanCommentTree(comment));
  }, [data?.data, discussionId, mentionContext?.articleId, mentionContext?.communityId]);

  return (
    <div className="mt-2 flex flex-col">
      {/* Fixed by Codex on 2026-02-17
          Who: Codex
          What: Consolidate comment controls into a single compact toolbar row.
          Why: The standalone "Comments:" heading and separate depth/expand row consumed vertical space in discussion panes.
          How: Keep "Add Comment" on the left and render depth + expand/collapse controls on the same row when comments exist. */}
      <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-tertiary">Add Comment:</span>
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Replace icon-only toggles with real buttons.
              Why: Clickable SVGs are not keyboard accessible or announced to screen readers.
              How: Wrap the icons in buttons with aria-labels and focus-visible styling. */}
          <button
            type="button"
            onClick={() => setIsCommentFormCollapsed(!isCommentFormCollapsed)}
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-blue"
            aria-label={isCommentFormCollapsed ? 'Add a comment' : 'Collapse comment form'}
            aria-expanded={!isCommentFormCollapsed}
          >
            {isCommentFormCollapsed ? (
              <SquarePlus size={14} className={cn('text-text-secondary')} aria-hidden="true" />
            ) : (
              <SquareMinus size={14} className={cn('text-text-secondary')} aria-hidden="true" />
            )}
          </button>
        </div>
        {hasComments && (
          <div className="ml-auto flex items-center gap-2">
            <label
              htmlFor={depthSelectId}
              className="flex items-center text-xxs font-medium text-text-secondary"
            >
              <Layers size={12} className="mr-1" />
              <span>Depth:</span>
            </label>
            <select
              id={depthSelectId}
              className="rounded border border-common-minimal bg-common-background p-1 text-[10px]"
              onChange={handleDepthChange}
              value={maxDepth === Infinity ? 0 : maxDepth}
            >
              <option value="0">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <button
              onClick={toggleAllComments}
              className="flex items-center text-xs text-functional-blue transition-colors duration-200 hover:text-functional-blueContrast"
            >
              {isAllCollapsed ? (
                <>
                  <ChevronsDown size={14} className="mr-1" />
                  <span>Expand All</span>
                </>
              ) : (
                <>
                  <ChevronsUp size={14} className="mr-1" />
                  <span>Collapse All</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {!isCommentFormCollapsed && (
        <CommentInput
          onSubmit={addNewComment}
          placeholder="Write a new comment..."
          buttonText="Post Comment"
          isPending={isCreateCommentPending}
          mentionCandidates={mentionCandidates}
        />
      )}
      {isPending && (
        <div className="mt-4 flex w-full animate-pulse items-center justify-center gap-2">
          <div className="w-5">
            <InfiniteSpinnerAnimation color="#737373" strokeWidth={16} />
          </div>
          <span className="text-xs text-text-secondary">Loading Comments</span>
        </div>
      )}
      {hasComments && (
        <div className="flex flex-col border-common-minimal">
          <RenderComments
            comments={comments.map((comment: DiscussionCommentOut) =>
              convertToDiscussionCommentData(comment)
            )}
            maxDepth={maxDepth}
            isAllCollapsed={isAllCollapsed}
            /* Fixed by Codex on 2026-02-16
               Who: Codex
               What: Enable unread-aware expansion in discussion threads.
               Why: Discussions use unread flags; auto-expansion should guide users to new replies.
               How: Pass unread auto-expand mode into the shared comment renderer. */
            autoExpandOnUnread={true}
            onAddReply={addReply}
            onUpdateComment={updateComment}
            onDeleteComment={deleteCommentbyId}
            contentType={ContentTypeEnum.articlesdiscussioncomment}
            articleContext={articleContext}
            mentionCandidates={mentionCandidates}
            /* Fixed by Codex on 2026-02-26
               Who: Codex
               What: Threaded comment-level deep-link target into recursive comment rendering.
               Why: Mention notifications for replies should auto-open and scroll to the exact comment.
               How: Pass the target comment id and a one-shot handled callback to shared comment renderer. */
            targetCommentId={targetCommentId}
            onTargetCommentHandled={onTargetCommentHandled}
          />
        </div>
      )}
    </div>
  );
};

export default DiscussionComments;
