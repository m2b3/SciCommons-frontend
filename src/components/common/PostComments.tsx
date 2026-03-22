'use client';

import React, { useState } from 'react';

import { ChevronsDown, ChevronsUp, Layers } from 'lucide-react';
import { toast } from 'sonner';

import {
  usePostsApiCreateComment,
  usePostsApiDeleteComment,
  usePostsApiListPostComments,
  usePostsApiUpdateComment,
} from '@/api/posts/posts';
import { CommentOut, ContentTypeEnum } from '@/api/schemas';
import { CommentData } from '@/components/common/Comment';
import CommentInput from '@/components/common/CommentInput';
import RenderComments from '@/components/common/RenderComments';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import convertToCommentData from '@/lib/convertPostcomment';
import { useAuthStore } from '@/stores/authStore';

interface PostCommentsProps {
  postId: number;
}

// Todo 1: Fix the issue with highlighting new comments
// Todo 2: Add Generic Types for the comments
// Todo 3: Add ToolTip for depth select

const PostComments: React.FC<PostCommentsProps> = ({ postId }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authHeaders = useAuthHeaders();

  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(false);
  const { data, refetch, isPending } = usePostsApiListPostComments(postId, {
    request: authHeaders,
    query: {
      enabled: isAuthenticated && !!postId,
    },
  });

  // useEffect(() => {
  //   if (accessToken) {
  //     refetch();
  //   }
  // }, [accessToken, refetch]);

  const { mutate: createComment } = usePostsApiCreateComment({
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
    request: authHeaders,
  });
  const { mutate: UpdateComment, data: updatedComment } = usePostsApiUpdateComment({
    request: authHeaders,
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
  const { mutate: deleteComment } = usePostsApiDeleteComment({
    request: authHeaders,
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
      return data.data.map((comment: CommentOut) => convertToCommentData(comment));
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

  const addNewComment = (content: string) => {
    createComment({ postId, data: { content } });
  };

  const addReply = (parentId: number, content: string) => {
    createComment({ postId, data: { content, parent_id: parentId } });

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

  const updateComment = (commentId: number, updatedContent: string) => {
    UpdateComment({ commentId, data: { content: updatedContent } });

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

  const postComments = data?.data ?? [];
  const hasComments = postComments.length > 0;
  const depthSelectId = `post-${postId}-depth-select`;

  /* Fixed by Codex on 2026-02-15
     Problem: Post comments used hard-coded gray/blue utilities that blocked skin swapping.
     Solution: Replace fixed colors with semantic theme tokens for backgrounds, text, and accents.
     Result: Comment controls and loading states now adapt to the active skin. */
  return (
    <div className="mx-auto max-w-2xl">
      {/* Fixed by Codex on 2026-02-17
          Who: Codex
          What: Align post-comment depth and expand controls with the add-comment toolbar row.
          Why: Stacking controls in a separate row wastes space and feels inconsistent with discussion/review threads.
          How: Add a compact toolbar with "Add Comment" on the left and depth + expand/collapse controls on the right when comments exist. */}
      <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-text-tertiary">Add Comment:</span>
        {hasComments && (
          <div className="ml-auto flex items-center gap-2">
            <label
              htmlFor={depthSelectId}
              className="flex items-center text-sm font-medium text-text-tertiary"
            >
              <Layers size={16} className="mr-1" />
              <span>Depth:</span>
            </label>
            <select
              id={depthSelectId}
              className="rounded border border-common-contrast bg-common-cardBackground p-1 text-sm text-text-primary"
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
              className="flex items-center text-functional-blue transition-colors duration-200 hover:text-functional-blueContrast"
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
        )}
      </div>
      <CommentInput
        onSubmit={addNewComment}
        placeholder="Write a new comment..."
        buttonText="Post Comment"
      />
      {isPending &&
        Array.from({ length: 5 }).map((_, index) => (
          <div
            className="relative mb-4 h-20 w-full animate-pulse rounded bg-common-contrast"
            key={index}
          ></div>
        ))}
      {hasComments && (
        <>
          <RenderComments
            comments={postComments.map((comment: CommentOut) => convertToCommentData(comment))}
            maxDepth={maxDepth}
            isAllCollapsed={isAllCollapsed}
            onAddReply={addReply}
            onUpdateComment={updateComment}
            onDeleteComment={deleteCommentbyId}
            contentType={ContentTypeEnum.postscomment}
          />
        </>
      )}
    </div>
  );
};

export default PostComments;
