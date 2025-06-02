'use client';

import React, { useMemo, useState } from 'react';

import { ChevronsDown, ChevronsUp, Layers } from 'lucide-react';
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
import { useAuthStore } from '@/stores/authStore';

import InfiniteSpinnerAnimation from '../animations/InfiniteSpinnerAnimation';

interface ReviewCommentsProps {
  reviewId: number;
  displayComments: boolean;
  isAuthor?: boolean;
}

const ReviewComments: React.FC<ReviewCommentsProps> = ({
  reviewId,
  displayComments,
  isAuthor = false,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(true);

  // --- NEW: Review order state (was sortOption)
  const [reviewOrder, setReviewOrder] = useState<'latest' | 'oldest'>('latest');

  const { data, refetch, isPending } = useArticlesReviewApiListReviewComments(reviewId, {
    query: { enabled: displayComments },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: ratings,
    isPending: isRatingsLoading,
    isError: isRatingsError,
  } = useArticlesReviewApiGetRating(reviewId, {
    query: { enabled: displayComments && !isAuthor, retry: 5 },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { mutate: createComment, isPending: isCreateCommentPending } =
    useArticlesReviewApiCreateComment({
      mutation: {
        onSuccess: () => {
          refetch();
          setReviewOrder('latest'); // Force show latest after add
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
  const { mutate: UpdateComment } = useArticlesReviewApiUpdateComment({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
        setReviewOrder('latest'); // Force "Latest" after edit
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
  };

  const updateComment = (commentId: number, updatedContent: string, rating?: number) => {
    UpdateComment({ commentId, data: { content: updatedContent, rating: rating || 0 } });
    // No need to setReviewOrder here; mutation.onSuccess will handle it
  };

  const deleteCommentbyId = (commentId: number) => {
    deleteComment({ commentId });
  };

  // --- NEW: Sort comments according to the selected review order ---
  const sortedComments = useMemo<CommentData[]>(() => {
    if (!data?.data) return [];
    const arr = data.data.map((comment: ReviewCommentOut) => convertToCommentData(comment));
    if (reviewOrder === 'latest') {
      return [...arr].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      return [...arr].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
  }, [data, reviewOrder]);

  return (
    <div className="flex flex-col border-t border-common-contrast pt-4">
      <span className="mb-2 text-sm font-bold text-text-tertiary">Add Comment:</span>
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
      {isPending && (
        <div className="mt-4 flex w-full animate-pulse items-center justify-center gap-2">
          <div className="w-5">
            <InfiniteSpinnerAnimation color="#737373" strokeWidth={16} />
          </div>
          <span className="text-xs text-text-secondary">Loading Comments</span>
        </div>
      )}
      {sortedComments && sortedComments.length > 0 && (
        <div className="flex flex-col border-common-minimal pt-4">
          <span className="mb-2 text-sm font-bold text-text-tertiary">Comments:</span>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="depth-select"
                className="flex items-center text-sm font-medium text-text-secondary"
              >
                <Layers size={16} className="mr-1" />
                <span>Depth:</span>
              </label>
              <select
                id="depth-select"
                className="rounded border bg-common-background p-1 text-sm"
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
            </div>
            <div className="flex items-center space-x-2">
              {/* --- Review order select --- */}
              <select
                value={reviewOrder}
                onChange={(e) => setReviewOrder(e.target.value as 'latest' | 'oldest')}
                className="rounded border bg-common-background p-1 text-sm"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
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
          </div>
          <RenderComments
            comments={sortedComments}
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
