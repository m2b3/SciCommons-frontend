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
import convertToCommentData from '@/lib/convertPostcomment';

interface PostCommentsProps {
  postId: number;
}

// Todo 1: Fix the issue with highlighting new comments
// Todo 2: Add Generic Types for the comments
// Todo 3: Add ToolTip for depth select

const PostComments: React.FC<PostCommentsProps> = ({ postId }) => {
  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(false);
  const { data, refetch, isPending } = usePostsApiListPostComments(postId);

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
  });
  const { mutate: UpdateComment, data: updatedComment } = usePostsApiUpdateComment({
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

  return (
    <div className="mx-auto max-w-2xl">
      <CommentInput
        onSubmit={addNewComment}
        placeholder="Write a new comment..."
        buttonText="Post Comment"
      />
      {isPending &&
        Array.from({ length: 5 }).map((_, index) => (
          <div
            className="relative mb-4 h-20 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-800"
            key={index}
          ></div>
        ))}
      {data && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="depth-select"
                className="flex items-center text-sm font-medium text-gray-500"
              >
                <Layers size={16} className="mr-1" />
                <span>Depth:</span>
              </label>
              <select
                id="depth-select"
                className="rounded border p-1 text-sm text-gray-700 dark:text-gray-300"
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
            comments={data.data.map((comment: CommentOut) => convertToCommentData(comment))}
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
