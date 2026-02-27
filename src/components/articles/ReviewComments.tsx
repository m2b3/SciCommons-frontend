'use client';

import React, { useState } from 'react';

import { ChevronsDown, ChevronsUp, Layers, SquareMinus, SquarePlus } from 'lucide-react';
import { toast } from 'sonner';

import {
  useArticlesReviewApiCreateComment,
  useArticlesReviewApiDeleteComment,
  useArticlesReviewApiGetRating,
  useArticlesReviewApiListReviewComments,
  useArticlesReviewApiUpdateComment,
} from '@/api/reviews/reviews';
import { ContentTypeEnum, ReviewCommentOut } from '@/api/schemas';
import { CommentData } from '@/components/common/Comment';
import CommentInput from '@/components/common/CommentInput';
import RenderComments from '@/components/common/RenderComments';
import convertToCommentData from '@/lib/convertReviewCommentData';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import InfiniteSpinnerAnimation from '../animations/InfiniteSpinnerAnimation';

interface ReviewCommentsProps {
  reviewId: number;
  displayComments: boolean;
  isAuthor?: boolean;
}

// Todo 1: Fix the issue with highlighting new comments
// Todo 2: Add Generic Types for the comments
// Todo 3: Add ToolTip for depth select

const ReviewComments: React.FC<ReviewCommentsProps> = ({
  reviewId,
  displayComments,
  isAuthor = false,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(true);
  const [isCommentFormCollapsed, setIsCommentFormCollapsed] = useState<boolean>(true);

  const { data, refetch, isPending } = useArticlesReviewApiListReviewComments(reviewId, {
    query: { enabled: displayComments && !!accessToken },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: ratings,
    isPending: isRatingsLoading,
    isError: isRatingsError,
  } = useArticlesReviewApiGetRating(reviewId, {
    query: { enabled: displayComments && !isAuthor && !!accessToken, retry: 5 },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { mutate: createComment, isPending: isCreateCommentPending } =
    useArticlesReviewApiCreateComment({
      mutation: {
        onSuccess: () => {
          refetch();
        },
        onError: (error) => {
          console.error(error);
          toast.error(
            (error.response?.data as { message?: string })?.message ||
              'An error occurred while creating the comment.'
          );
        },
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  const { mutate: UpdateComment, data: updatedComment } = useArticlesReviewApiUpdateComment({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
        toast.success('Comment updated successfully.');
      },
      onError: (error) => {
        toast.error(
          (error.response?.data as { message?: string })?.message ||
            'An error occurred while updating the comment.'
        );
      },
    },
  });
  const { mutate: deleteComment } = useArticlesReviewApiDeleteComment({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
        toast.success('Comment deleted successfully.');
      },
      onError: (error) => {
        toast.error(
          (error.response?.data as { message?: string })?.message ||
            'An error occurred while deleting the comment.'
        );
      },
    },
  });

  const [comments, setComments] = useState<CommentData[]>(() => {
    if (Array.isArray(data?.data)) {
      return data.data.map((comment: ReviewCommentOut) => convertToCommentData(comment));
    }
    return [];
  });

  const handleDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depth = parseInt(e.target.value);
    setMaxDepth(depth === 0 ? Infinity : depth);
  };

  const toggleAllComments = () => {
    setIsAllCollapsed(!isAllCollapsed);
  };

  const addNewComment = (content: string, rating?: number) => {
    createComment({ reviewId, data: { content, rating: rating || 0 } });
  };

  const addReply = (parentId: number, content: string, rating?: number) => {
    createComment({ reviewId, data: { content, rating: rating || 0, parent_id: parentId } });

    // const addReplyToComment = (comment: CommentData): CommentData => {
    //   if (comment.id === parentId && newComment) {
    //     return { ...comment, replies: [newComment.data, ...comment.replies] };
    //   }
    //   if (comment.replies) {
    //     return { ...comment, replies: comment.replies.map(addReplyToComment) };
    //   }
    //   return comment;
    // };

    // setComments(comments.map(addReplyToComment));
  };

  const updateComment = (commentId: number, updatedContent: string, rating?: number) => {
    UpdateComment({ commentId, data: { content: updatedContent, rating: rating || 0 } });

    const updateCommentInPlace = (comment: CommentData): CommentData => {
      if (comment.id === commentId) {
        return { ...comment, ...updatedComment, isNew: true };
      }
      if (comment.replies) {
        return { ...comment, replies: comment.replies.map(updateCommentInPlace) };
      }
      return comment;
    };

    setComments(comments.map(updateCommentInPlace));
  };

  const deleteCommentbyId = (commentId: number) => {
    deleteComment({ commentId });

    // const removeComment = (comment: CommentData): CommentData => {
    //   if (comment.id === commentId) {
    //     return {
    //       id: 0,
    //       author: { username: 'Deleted User', profile_pic_url: null, id: 0 },
    //       created_at: '',
    //       content: '',
    //       upvotes: 0,
    //       replies: [],
    //     };
    //   }
    //   if (comment.replies) {
    //     return { ...comment, replies: comment.replies.filter(Boolean).map(removeComment) };
    //   }
    //   return comment;
    // };

    // setComments(comments.filter(Boolean).map(removeComment));
  };

  const reviewComments = data?.data ?? [];
  const hasComments = reviewComments.length > 0;
  const depthSelectId = `review-${reviewId}-depth-select`;

  return (
    <div className="flex flex-col">
      {/* Fixed by Codex on 2026-02-17
          Who: Codex
          What: Compact review-comment controls into a single toolbar row.
          Why: A standalone "Comments:" line and second controls row added unnecessary vertical space.
          How: Keep "Add Comment" on the left and place depth + expand/collapse controls on the same row when comments exist. */}
      <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-tertiary">Add Comment:</span>
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Replace icon-only comment form toggles with buttons.
              Why: SVG click targets are not keyboard accessible or announced.
              How: Wrap icons in a button with aria-labels and focus-visible rings. */}
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
              className="flex items-center text-[10px] text-functional-blue transition-colors duration-200 hover:text-functional-blueContrast"
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
          isReview={true}
          initialRating={ratings?.data.rating || 0}
          isRatingsLoading={isRatingsLoading}
          isRatingsError={isRatingsError}
          isAuthor={isAuthor}
          isPending={isCreateCommentPending}
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
            comments={reviewComments.map((comment: ReviewCommentOut) =>
              convertToCommentData(comment)
            )}
            maxDepth={maxDepth}
            isAllCollapsed={isAllCollapsed}
            onAddReply={addReply}
            onUpdateComment={updateComment}
            onDeleteComment={deleteCommentbyId}
            contentType={ContentTypeEnum.articlesreviewcomment}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewComments;
