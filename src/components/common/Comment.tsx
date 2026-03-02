import React, { useEffect, useMemo, useRef, useState } from 'react';

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

import { ContentTypeEnum, FlagType } from '@/api/schemas';
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from '@/api/users-common-api/users-common-api';
import { TEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { useMarkAsReadOnView } from '@/hooks/useMarkAsReadOnView';
import { hasUnreadFlag } from '@/hooks/useUnreadFlags';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useEphemeralUnreadStore } from '@/stores/ephemeralUnreadStore';

import { Button, ButtonTitle } from '../ui/button';
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
  // Flags from API (e.g., 'unread')
  flags?: FlagType[];
}

export interface CommentProps extends CommentData {
  depth: number;
  maxDepth: number;
  isAllCollapsed: boolean;
  autoExpandOnUnread?: boolean;
  mentionCandidates?: string[];
  targetCommentId?: number | null;
  onTargetCommentHandled?: () => void;
  onAddReply: (parentId: number, content: string, rating?: number) => void;
  onUpdateComment: (id: number, content: string, rating?: number) => void;
  onDeleteComment: (id: number) => void;
  contentType: ContentTypeEnum;
  flags?: FlagType[];
  /** Article context for tracking read state */
  articleContext?: {
    communityId: number;
    articleId: number;
  };
}

type Reaction = 'upvote' | 'downvote' | 'award';

const Comment: React.FC<CommentProps> = ({
  id,
  author,
  created_at,
  content,
  upvotes,
  replies,
  depth,
  maxDepth,
  isAllCollapsed,
  autoExpandOnUnread = false,
  mentionCandidates = [],
  targetCommentId = null,
  onTargetCommentHandled,
  is_author,
  is_deleted,
  rating,
  isReview = false,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  isNew,
  contentType,
  flags,
  articleContext,
}) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Restore lazy reaction-count query behavior.
     Why: Avoid eager N+1 reaction requests and keep tests aligned.
     How: Disable the query by default and rely on manual refetch after reactions. */
  const { data, refetch } = useUsersCommonApiGetReactionCount(contentType, Number(id), {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    query: {
      enabled: false,
      staleTime: TEN_MINUTES_IN_MS,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
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
  const [showConfirm, setShowConfirm] = useState(false);
  const commentDeleteDialogTitleId = React.useId();
  const commentDeleteDialogDescriptionId = React.useId();
  const [highlight, setHighlight] = useState(isNew);
  const hasReplies = replies && replies.length > 0;
  const commentRef = useRef<HTMLDivElement>(null);
  const wasUnreadInSubtreeRef = useRef(false);
  const hasInitializedUnreadAutoExpandRef = useRef(false);
  const hasAppliedTargetAutoExpandRef = useRef(false);
  const hasHandledTargetFocusRef = useRef(false);
  const wasAllCollapsedRef = useRef(isAllCollapsed);
  const isEphemeralUnread = useEphemeralUnreadStore((s) => s.isItemUnread);

  // Check if this comment has the unread flag from API response
  const hasUnread = hasUnreadFlag(flags);

  // Use the mark as read hook - tracks read state locally and syncs with backend
  const { showNewTag } = useMarkAsReadOnView(commentRef, {
    entityId: Number(id),
    entityType: depth === 0 ? 'comment' : 'reply',
    hasUnreadFlag: hasUnread,
    articleContext,
  });

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Detect unread activity anywhere in a comment subtree.
     Why: Users need parent-level cues before expanding deep reply chains.
     How: Recursively scan this node + descendants for unread flags. */
  const hasUnreadInSubtree = useMemo(() => {
    const hasUnreadBranch = (
      comment: Pick<CommentData, 'id' | 'flags' | 'replies'>,
      treeDepth: number
    ): boolean => {
      const unreadByFlag = hasUnreadFlag(comment.flags);
      const unreadByRealtime =
        comment.id !== undefined
          ? isEphemeralUnread(treeDepth === 0 ? 'comment' : 'reply', Number(comment.id))
          : false;
      if (unreadByFlag || unreadByRealtime) return true;
      return comment.replies?.some((reply) => hasUnreadBranch(reply, treeDepth + 1)) ?? false;
    };
    return hasUnreadBranch({ id, flags, replies }, depth);
  }, [id, flags, replies, depth, isEphemeralUnread]);
  const hasTargetInSubtree = useMemo(() => {
    if (targetCommentId === null) return false;

    const hasTargetBranch = (comment: Pick<CommentData, 'id' | 'replies'>): boolean => {
      if (comment.id === targetCommentId) return true;
      return comment.replies?.some((reply) => hasTargetBranch(reply)) ?? false;
    };

    return hasTargetBranch({ id, replies });
  }, [id, replies, targetCommentId]);
  const isTargetComment = targetCommentId !== null && id === targetCommentId;

  useEffect(() => {
    hasAppliedTargetAutoExpandRef.current = false;
    hasHandledTargetFocusRef.current = false;
  }, [targetCommentId]);

  useEffect(() => {
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Keep collapse state driven by depth/global controls only.
       Why: Continuous unread-driven rewrites made collapse behavior feel unreliable.
       How: Apply depth/all-collapsed rules here and handle unread auto-open in a separate transition effect. */
    if (isAllCollapsed) {
      setIsCollapsed(true);
      return;
    }
    setIsCollapsed(depth >= maxDepth);
  }, [depth, maxDepth, isAllCollapsed]);

  useEffect(() => {
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Expand unread branches on initial load and unread transitions.
       Why: Backend unread flags can lag while realtime unread is immediate; expansion should react once, not fight manual toggles.
       How: Merge backend+ephemeral unread subtree checks and only auto-open when unread first appears. */
    const wasAllCollapsed = wasAllCollapsedRef.current;

    if (!autoExpandOnUnread || isAllCollapsed) {
      wasUnreadInSubtreeRef.current = hasUnreadInSubtree;
      wasAllCollapsedRef.current = isAllCollapsed;
      return;
    }

    if (!hasInitializedUnreadAutoExpandRef.current) {
      hasInitializedUnreadAutoExpandRef.current = true;
      if (hasUnreadInSubtree) {
        setIsCollapsed(false);
      }
      wasUnreadInSubtreeRef.current = hasUnreadInSubtree;
      wasAllCollapsedRef.current = isAllCollapsed;
      return;
    }

    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Re-open unread branches after Collapse All is toggled off.
       Why: Users expect Expand All to reveal unread paths again without waiting for new events.
       How: Detect the `true -> false` transition of `isAllCollapsed` and expand unread branches immediately. */
    if (wasAllCollapsed && hasUnreadInSubtree) {
      setIsCollapsed(false);
    }

    if (!wasUnreadInSubtreeRef.current && hasUnreadInSubtree) {
      setIsCollapsed(false);
    }

    wasUnreadInSubtreeRef.current = hasUnreadInSubtree;
    wasAllCollapsedRef.current = isAllCollapsed;
  }, [autoExpandOnUnread, isAllCollapsed, hasUnreadInSubtree]);

  useEffect(() => {
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Auto-expanded only the branch containing a deep-linked target comment.
       Why: Mention links with `commentId` should land users at the exact reply even when ancestors start collapsed.
       How: Detect whether this node subtree contains the target id and open it once without overriding later manual toggles. */
    if (targetCommentId === null || isAllCollapsed) return;
    if (!hasTargetInSubtree) return;
    if (hasAppliedTargetAutoExpandRef.current) return;

    setIsCollapsed(false);
    hasAppliedTargetAutoExpandRef.current = true;
  }, [hasTargetInSubtree, isAllCollapsed, targetCommentId]);

  useEffect(() => {
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Added one-shot focus/scroll behavior for deep-linked target comments.
       Why: Users should be brought directly to the mentioned comment without scanning long threads manually.
       How: Scroll the target comment into view once when rendered, add temporary highlight, then clear target state via callback. */
    if (!isTargetComment || targetCommentId === null) return;
    if (hasHandledTargetFocusRef.current) return;

    hasHandledTargetFocusRef.current = true;
    setHighlight(true);

    const timeoutId = window.setTimeout(() => {
      commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onTargetCommentHandled?.();
    }, 75);

    const resetHighlightTimeoutId = window.setTimeout(() => setHighlight(false), 3000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(resetHighlightTimeoutId);
    };
  }, [isTargetComment, onTargetCommentHandled, targetCommentId]);

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
      setShowConfirm(true);
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
        /* Fixed by Codex on 2026-02-15
           Who: Codex
           What: Tokenize comment highlight and badge colors.
           Why: Keep highlight states consistent across UI skins.
           How: Swap yellow/white utilities for functional tokens. */
        highlight && 'bg-functional-yellowLight/30',
        showNewTag && !highlight && 'bg-functional-blue/5'
      )}
    >
      {/* NEW badge for unread comments - shown optimistically until 1s after viewing (2s visibility threshold) */}
      {/* Fixed by Codex on 2026-02-16
          Who: Codex
          What: Show NEW badges on replies as well as top-level comments.
          Why: Nested unread activity was hard to locate without per-level cues.
          How: Remove depth gating so each unread node can display a badge. */}
      {showNewTag && (
        <span className="absolute -left-1 -top-1 z-10 rounded bg-functional-blue px-1 text-[9px] font-semibold uppercase text-primary-foreground">
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
                type="button"
                aria-expanded={!isCollapsed}
                aria-controls={`comment-${id}-replies`}
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
              mentionCandidates={mentionCandidates}
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
            {/* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Add accessible labels and pressed state for reaction controls.
               Why: Icon-only buttons were not announced to screen readers.
               How: Move handlers to buttons and set aria-label/aria-pressed. */}
            <button
              type="button"
              aria-label="Upvote"
              aria-pressed={data?.data.user_reaction === 1}
              onClick={() => handleReaction('upvote')}
              className="flex items-center space-x-1"
            >
              {data?.data.user_reaction === 1 ? (
                <ThumbsUp size={16} className="text-functional-blue" />
              ) : (
                <ThumbsUp size={16} />
              )}
              {/* Fixed by Codex on 2026-02-15
                 Who: Codex
                 What: Restore reaction count fallback to initial upvotes.
                 Why: Avoid blank counts while the reaction query is loading or fails.
                 How: Render server likes with a fallback to the prop value. */}
              <span className="text-xs">{data?.data.likes ?? upvotes ?? 0}</span>
            </button>
            <button
              type="button"
              aria-label="Downvote"
              aria-pressed={data?.data.user_reaction === -1}
              onClick={() => handleReaction('downvote')}
              className="flex items-center space-x-1"
            >
              {data?.data.user_reaction === -1 ? (
                <ThumbsDown size={16} className="text-functional-red" />
              ) : (
                <ThumbsDown size={16} />
              )}
            </button>
            <button
              type="button"
              aria-expanded={isReplying}
              aria-controls={`comment-${id}-reply`}
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
                    type="button"
                    aria-label="Cancel edit"
                    className="text-text-tertiary hover:text-functional-blue"
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label="Edit comment"
                    className="text-text-tertiary hover:text-functional-blue"
                    onClick={() => setIsEditing((prev) => !prev)}
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Delete comment"
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
                  type="button"
                  aria-expanded={!isCollapsed}
                  aria-controls={`comment-${id}-replies`}
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
          <div className="mt-4" id={`comment-${id}-reply`}>
            <CommentInput
              onSubmit={handleAddReply}
              placeholder="Write your reply..."
              buttonText="Post Reply"
              isReview={isReview}
              isReply
              mentionCandidates={mentionCandidates}
            />
          </div>
        )}
        {hasReplies && !isCollapsed && (
          <div className="mt-4 pl-0" id={`comment-${id}-replies`}>
            <RenderComments
              comments={replies}
              depth={depth + 1}
              maxDepth={maxDepth}
              isAllCollapsed={isAllCollapsed}
              autoExpandOnUnread={autoExpandOnUnread}
              mentionCandidates={mentionCandidates}
              targetCommentId={targetCommentId}
              onTargetCommentHandled={onTargetCommentHandled}
              onAddReply={onAddReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              contentType={contentType}
              articleContext={articleContext}
            />
          </div>
        )}
        {hasReplies && isCollapsed && (
          <button
            type="button"
            aria-expanded={false}
            aria-controls={`comment-${id}-replies`}
            onClick={() => setIsCollapsed(false)}
            className="relative mt-4 pl-2 text-xs text-functional-blue hover:underline"
          >
            <div className="absolute -left-3.5 top-0 aspect-square h-6 w-6 rounded-bl-xl border-b-[1.5px] border-l-[1.5px] border-common-heavyContrast md:-left-4" />
            {replies.length} more {replies.length === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>
      {/* Fixed by Codex on 2026-02-24
          Who: Codex
          What: Normalized comment-delete confirmation modal semantics and styling.
          Why: The modal sat below fixed navigation on mobile and used non-tokenized raw buttons.
          How: Raised z-index above nav, added dialog ARIA attributes, and switched actions to shared Button variants. */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={commentDeleteDialogTitleId}
            aria-describedby={commentDeleteDialogDescriptionId}
            className="w-[320px] rounded-xl bg-common-cardBackground p-6"
          >
            <h3 id={commentDeleteDialogTitleId} className="mb-2 text-lg font-semibold">
              Delete comment?
            </h3>
            <p id={commentDeleteDialogDescriptionId} className="mb-4 text-sm text-text-secondary">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="gray" size="sm" type="button" onClick={() => setShowConfirm(false)}>
                <ButtonTitle>Cancel</ButtonTitle>
              </Button>

              <Button
                variant="danger"
                size="sm"
                type="button"
                onClick={() => {
                  if (id) onDeleteComment(id);
                  setShowConfirm(false);
                }}
              >
                <ButtonTitle>Delete</ButtonTitle>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;
