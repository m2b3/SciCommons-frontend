'use client';

import React, { useEffect, useState } from 'react';

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
import { TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { convertToDiscussionCommentData } from '@/lib/converToCommentData';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import { useRealtimeContextStore } from '@/stores/realtimeStore';

import InfiniteSpinnerAnimation from '../animations/InfiniteSpinnerAnimation';

interface DiscussionCommentsProps {
  discussionId: number;
}

const DiscussionComments: React.FC<DiscussionCommentsProps> = ({ discussionId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [maxDepth, setMaxDepth] = useState<number>(Infinity);
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean>(false);

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

  return (
    <div className="mt-2 flex flex-col border-t border-common-contrast pt-4">
      <span className="mb-2 text-sm font-bold text-text-tertiary">Add Comment:</span>
      <CommentInput
        onSubmit={addNewComment}
        placeholder="Write a new comment..."
        buttonText="Post Comment"
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
      {data && data.data.length > 0 && (
        <div className="flex flex-col border-common-minimal">
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
        </div>
      )}
    </div>
  );
};

export default DiscussionComments;
