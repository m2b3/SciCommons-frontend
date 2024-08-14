'use client';

import React, { useState } from 'react';

import { ChevronsDown, ChevronsUp, Layers } from 'lucide-react';
import { toast } from 'sonner';

import {
  useArticlesReviewApiCreateComment,
  useArticlesReviewApiDeleteComment,
  useArticlesReviewApiListReviewComments,
  useArticlesReviewApiUpdateComment,
} from '@/api/reviews/reviews';
import { ContentTypeEnum, ReviewCommentOut } from '@/api/schemas';
import { CommentData } from '@/components/common/Comment';
import CommentInput from '@/components/common/CommentInput';
import RenderComments from '@/components/common/RenderComments';
import convertToCommentData from '@/lib/convertReviewCommentData';
import { useAuthStore } from '@/stores/authStore';

interface ReviewCommentsProps {
  reviewId: number;
  displayComments: boolean;
}

// Todo 1: Fix the issue with highlighting new comments
// Todo 2: Add Generic Types for the comments
// Todo 3: Add ToolTip for depth select

const ReviewComments: React.FC<ReviewCommentsProps> = ({ reviewId, displayComments }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(false);
  const { data, refetch, isPending } = useArticlesReviewApiListReviewComments(reviewId, {
    query: { enabled: displayComments },
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { mutate: createComment } = useArticlesReviewApiCreateComment({
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

  return (
    <div className="rounded-md bg-white-secondary p-4 text-gray-900">
      <CommentInput
        onSubmit={addNewComment}
        placeholder="Write a new comment..."
        buttonText="Post Comment"
        isReview
      />
      {isPending &&
        Array.from({ length: 5 }).map((_, index) => (
          <div
            className="relative mb-4 h-20 w-full animate-pulse rounded bg-gray-300"
            key={index}
          ></div>
        ))}
      {data && data.data.length > 0 && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label htmlFor="depth-select" className="flex items-center text-sm font-medium">
                <Layers size={16} className="mr-1" />
                <span>Depth:</span>
              </label>
              <select
                id="depth-select"
                className="rounded border bg-white-primary p-1 text-sm"
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
            <button
              onClick={toggleAllComments}
              className="flex items-center text-blue-500 transition-colors duration-200 hover:text-blue-600"
            >
              {isAllCollapsed ? (
                <>
                  <ChevronsDown size={16} className="mr-1" />
                  <span>Expand All</span>
                </>
              ) : (
                <>
                  <ChevronsUp size={16} className="mr-1" />
                  <span>Collapse All</span>
                </>
              )}
            </button>
          </div>
          <RenderComments
            comments={data.data.map((comment: ReviewCommentOut) => convertToCommentData(comment))}
            maxDepth={maxDepth}
            isAllCollapsed={isAllCollapsed}
            onAddReply={addReply}
            onUpdateComment={updateComment}
            onDeleteComment={deleteCommentbyId}
            contentType={ContentTypeEnum.articlesreviewcomment}
          />
        </>
      )}
    </div>
  );
};

export default ReviewComments;
