'use client';

import React, { useState } from 'react';

import { ChevronsDown, ChevronsUp, Layers } from 'lucide-react';
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
import { convertToDiscussionCommentData } from '@/lib/converToCommentData';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface DiscussionCommentsProps {
  discussionId: number;
}

const DiscussionComments: React.FC<DiscussionCommentsProps> = ({ discussionId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(false);
  const { data, refetch, isPending } = useArticlesDiscussionApiListDiscussionComments(
    discussionId,
    {},
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { mutate: createComment } = useArticlesDiscussionApiCreateComment({
    mutation: {
      onSuccess: () => {
        refetch();
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
        toast.success('Comment updated successfully.', {
          duration: 2000,
          position: 'top-right',
        });
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
        toast.success('Comment deleted successfully.', {
          duration: 2000,
          position: 'top-right',
        });
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

  return (
    <div className="rounded-md bg-white-secondary text-gray-900">
      <CommentInput
        onSubmit={addNewComment}
        placeholder="Write a new comment..."
        buttonText="Post Comment"
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
                className="rounded border bg-white-primary p-1 text-sm text-gray-900"
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
            comments={data.data.map((comment: DiscussionCommentOut) =>
              convertToDiscussionCommentData(comment)
            )}
            maxDepth={maxDepth}
            isAllCollapsed={isAllCollapsed}
            onAddReply={addReply}
            onUpdateComment={updateComment}
            onDeleteComment={deleteCommentbyId}
            contentType={ContentTypeEnum.articlesdiscussioncomment}
          />
        </>
      )}
    </div>
  );
};

export default DiscussionComments;
