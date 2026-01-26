import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react';

import { ContentTypeEnum } from '@/api/schemas';
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from '@/api/users-common-api/users-common-api';
import { TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { useMarkAsReadOnViewSimple } from '@/hooks/useMarkAsReadOnView';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUnreadNotificationsStore } from '@/stores/unreadNotificationsStore';

import { Ratings } from '../ui/ratings';
import CommentInput from './CommentInput';
import RenderComments from './RenderComments';
import RenderParsedHTML from './RenderParsedHTML';

export interface UserData {
  id: number;
  username: string;
  profile_pic_url: string | null;
}

export interface CommentData {
  id: number;
  author: UserData;
  created_at: string;
  content: string;
  upvotes: number;
  replies: CommentData[];
  is_author?: boolean;
  // Review specific
  rating?: number;
  isReview?: boolean;
  review_version?: boolean;
  isNew?: boolean;
  is_deleted?: boolean;
}

export interface CommentProps extends CommentData {
  depth: number;
  maxDepth: number;
  isAllCollapsed: boolean;
  onAddReply: (parentId: number, content: string, rating?: number) => void;
  onUpdateComment: (id: number, content: string, rating?: number) => void;
  onDeleteComment: (id: number) => void;
  contentType: ContentTypeEnum;
}

type Reaction = 'upvote' | 'downvote' | 'award';

const Comment: React.FC<CommentProps> = ({
  id,
  author,
  created_at,
  content,
  replies,
  depth,
  maxDepth,
  isAllCollapsed,
  is_author,
  is_deleted,
  rating,
  isReview = false,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  isNew,
  contentType,
}) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Todo: Too many requests
  const { data, refetch } = useUsersCommonApiGetReactionCount(contentType, Number(id), {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    query: {
      enabled: !!accessToken && !!id,
      staleTime: TEN_MINUTES_IN_MS,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  });

  const { mutate } = useUsersCommonApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        console.error(error);
      },
    },
  });

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [highlight, setHighlight] = useState(isNew);
  const hasReplies = replies && replies.length > 0;
  const commentRef = useRef<HTMLDivElement>(null);

  // Check if this comment is unread in the store (for realtime updates)
  const isUnreadInStore = useUnreadNotificationsStore((state) =>
    state.isItemUnread(Number(id), depth === 0 ? 'comment' : 'reply')
  );

  // Combined unread state: either from prop (isNew) or from store
  const isUnread = isNew || isUnreadInStore;

  // Get the function to mark items as read - we need to find which article this belongs to
  const articleUnreads = useUnreadNotificationsStore((state) => state.articleUnreads);

  // Find the article context for this comment
  const findArticleContext = useCallback(() => {
    for (const [key, article] of Object.entries(articleUnreads)) {
      const hasItem = article.items.some(
        (item) => item.id === Number(id) && (item.type === 'comment' || item.type === 'reply')
      );
      if (hasItem) {
        return { communityId: article.communityId, articleId: article.articleId };
      }
    }
    return null;
  }, [articleUnreads, id]);

  const markItemRead = useUnreadNotificationsStore((state) => state.markItemRead);

  // Mark as read when visible for 2 seconds
  const handleMarkRead = useCallback(() => {
    const context = findArticleContext();
    if (context) {
      markItemRead(
        context.communityId,
        context.articleId,
        Number(id),
        depth === 0 ? 'comment' : 'reply'
      );
    }
  }, [findArticleContext, markItemRead, id, depth]);

  useMarkAsReadOnViewSimple(commentRef, {
    itemId: Number(id),
    type: depth === 0 ? 'comment' : 'reply',
    enabled: isUnreadInStore,
    delay: 2000,
    onMarkRead: handleMarkRead,
  });

  useEffect(() => {
    setIsCollapsed(depth >= maxDepth || isAllCollapsed);
  }, [depth, maxDepth, isAllCollapsed]);

  useEffect(() => {
    if (isNew) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const handleAddReply = (replyContent: string, rating?: number) => {
    if (id) {
      onAddReply(id, replyContent, rating);
      setIsReplying(false);
    }
  };

  const handleUpdateComment = (updatedContent: string, rating?: number) => {
    if (id) {
      onUpdateComment(id, updatedContent, rating);
      setIsEditing(false);
    }
  };

  const handleDeleteComment = () => {
    if (id) {
      if (window.confirm('Are you sure you want to delete this comment?')) {
        onDeleteComment(id);
      }
    }
  };

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote' && id)
      mutate({ data: { content_type: contentType, object_id: id, vote: 1 } });
    else if (reaction === 'downvote' && id)
      mutate({ data: { content_type: contentType, object_id: id, vote: -1 } });
  };

  return (
    <div
      ref={commentRef}
      className={cn(
        'relative mb-4 flex space-x-0 rounded-xl border-common-minimal transition-colors duration-500',
        highlight && 'bg-yellow-100 dark:bg-yellow-900',
        isUnreadInStore && !highlight && 'bg-functional-blue/5'
      )}
    >
      {/* NEW badge for unread comments */}
      {isUnread && depth === 0 && (
        <span className="absolute -left-1 -top-1 z-10 rounded bg-functional-blue px-1 text-[9px] font-semibold uppercase text-white">
          New
        </span>
      )}
      <div className="aspect-square h-7 w-7 flex-shrink-0 rounded-full bg-common-minimal md:h-8 md:w-8">
        {hasReplies && (
          <div className="absolute bottom-1 left-3.5 top-10 w-[1px] bg-common-heavyContrast md:left-4" />
        )}
        <Image
          src={
            author.profile_pic_url
              ? author.profile_pic_url.startsWith('http')
                ? author.profile_pic_url
                : `data:image/png;base64,${author.profile_pic_url}`
              : `/images/assets/user-icon.webp`
          }
          alt={author.username}
          width={32}
          height={32}
          className="aspect-square h-7 w-7 rounded-full object-cover md:h-8 md:w-8"
          quality={75}
          sizes="32px"
          unoptimized={!author.profile_pic_url}
        />
      </div>
      <div className="flex-grow res-text-sm">
        <div className="flex items-center justify-between pl-2">
          <div>
            <div className="flex flex-wrap items-center">
              <span className="mr-2 text-sm font-semibold text-text-secondary">
                {author.username}
                {is_author && (
                  <span className="ml-1 text-xs font-normal text-text-tertiary">(You)</span>
                )}
              </span>
              <span className="text-xxs text-text-tertiary">• {dayjs(created_at).fromNow()}</span>
            </div>
            {!is_deleted && depth == 0 && (rating != undefined || rating != null) && !isEditing && (
              <div className="mt-1">
                <Ratings rating={rating} size={12} variant="yellow" readonly />
              </div>
            )}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {hasReplies && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center gap-1 text-xs text-functional-blue hover:text-functional-blueContrast"
              >
                {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                {isCollapsed ? 'Show' : 'Hide'} Replies
              </button>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="mt-2 pl-2">
            <CommentInput
              onSubmit={handleUpdateComment}
              placeholder="Edit your comment..."
              buttonText="Update"
              initialContent={content}
              initialRating={rating}
              isReview={isReview}
            />
          </div>
        ) : (
          <div className="pl-2">
            <RenderParsedHTML
              rawContent={content}
              isShrinked={true}
              supportMarkdown={true}
              supportLatex={true}
              contentClassName="text-xs sm:text-sm"
              containerClassName="mb-0"
            />
          </div>
        )}
        {!is_deleted && (
          <div className="mt-2 flex flex-wrap items-center gap-4 pl-2 text-text-secondary">
            <button className="flex items-center space-x-1">
              {data?.data.user_reaction === 1 ? (
                <ThumbsUp
                  size={16}
                  className="text-functional-blue"
                  onClick={() => handleReaction('upvote')}
                />
              ) : (
                <ThumbsUp size={16} onClick={() => handleReaction('upvote')} />
              )}
              <span className="text-xs">{data?.data.likes}</span>
            </button>
            <button className="flex items-center space-x-1">
              {data?.data.user_reaction === -1 ? (
                <ThumbsDown
                  size={16}
                  className="text-functional-red"
                  onClick={() => handleReaction('downvote')}
                />
              ) : (
                <ThumbsDown size={16} onClick={() => handleReaction('downvote')} />
              )}
            </button>
            <button
              className="flex items-center space-x-1"
              onClick={() => setIsReplying((prev) => !prev)}
            >
              {isReplying ? <X size={16} /> : <MessageSquare size={16} />}
              <span className="text-xs">Reply</span>
            </button>
            {is_author && (
              <>
                {' '}
                {isEditing ? (
                  <button
                    className="text-text-tertiary hover:text-functional-blue"
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    className="text-text-tertiary hover:text-functional-blue"
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  className="text-text-tertiary hover:text-functional-red"
                  onClick={handleDeleteComment}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
            <div className="flex items-center space-x-2 sm:hidden">
              {hasReplies && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center gap-1 text-xs text-functional-blue hover:text-functional-blueContrast"
                >
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  {isCollapsed ? 'Show' : 'Hide'} Replies
                </button>
              )}
            </div>
            {/* <button className="flex items-center space-x-1">
            <Award size={16} />
            <span className="text-xs">Award</span>
          </button>
          <button className="flex items-center space-x-1">
            <Share2 size={16} />
            <span className="text-xs">Share</span>
          </button>
          <button>
            <MoreHorizontal size={16} />
          </button> */}
          </div>
        )}
        {isReplying && (
          <div className="mt-4">
            <CommentInput
              onSubmit={handleAddReply}
              placeholder="Write your reply..."
              buttonText="Post Reply"
              isReview={isReview}
              isReply
            />
          </div>
        )}
        {hasReplies && !isCollapsed && (
          <div className="mt-4 pl-0">
            <RenderComments
              comments={replies}
              depth={depth + 1}
              maxDepth={maxDepth}
              isAllCollapsed={isAllCollapsed}
              onAddReply={onAddReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              contentType={contentType}
            />
          </div>
        )}
        {hasReplies && isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="relative mt-4 pl-2 text-xs text-functional-blue hover:underline"
          >
            <div className="absolute -left-3.5 top-0 aspect-square h-6 w-6 rounded-bl-xl border-b-[1.5px] border-l-[1.5px] border-common-heavyContrast md:-left-4" />
            {replies.length} more {replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Comment;
