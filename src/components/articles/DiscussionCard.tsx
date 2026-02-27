import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Check, ChevronDown, ChevronUp, MessageCircle, MoreVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useArticlesDiscussionApiToggleDiscussionResolved,
  useArticlesDiscussionApiUpdateDiscussion,
} from '@/api/discussions/discussions';
import { DiscussionOut, EntityType } from '@/api/schemas';
import { useMarkAsReadOnView } from '@/hooks/useMarkAsReadOnView';
import { useSubmitOnCtrlEnter } from '@/hooks/useSubmitOnCtrlEnter';
import { hasUnreadFlag } from '@/hooks/useUnreadFlags';
import { decodeHtmlEntities } from '@/lib/htmlEntities';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useReadItemsStore } from '@/stores/readItemsStore';
import { useSubscriptionUnreadStore } from '@/stores/subscriptionUnreadStore';

import FormInput from '../common/FormInput';
import RenderParsedHTML from '../common/RenderParsedHTML';
import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';
import { Button, ButtonTitle } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import DiscussionComments from './DiscussionComments';

// NOTE(bsureshkrishna, 2026-02-07): Discussion cards now integrate unread tracking,
// mark-as-read-on-view, and admin resolve toggles compared to baseline 5271498.
interface DiscussionCardProps {
  discussion: DiscussionOut;
  handleDiscussionClick: (id: number) => void;
  isAdmin?: boolean;
  isCommunityArticle?: boolean;
  refetch?: () => void;
  articleId?: number;
  communityId?: number | null;
}

interface DiscussionEditFormValues {
  topic: string;
  content: string;
}

const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  handleDiscussionClick,
  isAdmin = false,
  isCommunityArticle = false,
  refetch,
  articleId,
  communityId,
}) => {
  dayjs.extend(relativeTime);

  const accessToken = useAuthStore((state) => state.accessToken);
  const markItemRead = useReadItemsStore((state) => state.markItemRead);
  const clearNewEvent = useSubscriptionUnreadStore((state) => state.clearNewEvent);
  const [displayComments, setDisplayComments] = useState<boolean>(false);
  const [isResolved, setIsResolved] = useState<boolean>(discussion.is_resolved || false);
  const [isEditing, setIsEditing] = useState(false);
  const hasAutoExpandedCommentsRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Allow editing discussions directly from the list card.
     Why: Authors could edit comments but not their own discussion without opening the thread.
     How: Add an inline edit form with update mutation and reset state from card data. */
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiscussionEditFormValues>({
    defaultValues: {
      topic: '',
      content: '',
    },
  });

  // Check if this discussion has the unread flag from API response
  const hasUnread = hasUnreadFlag(discussion.flags);
  /* Fixed by Codex on 2026-02-19
     Who: Codex
     What: Decode backend-escaped discussion text for card rendering and edit defaults.
     Why: Some discussion payloads include entity artifacts like `&#x20` that leaked into UI text.
     How: Normalize topic/content once with a shared decoder and reuse the normalized values. */
  const decodedTopic = useMemo(
    () => decodeHtmlEntities(discussion.topic ?? ''),
    [discussion.topic]
  );
  const decodedContent = useMemo(
    () => decodeHtmlEntities(discussion.content ?? ''),
    [discussion.content]
  );

  // Use the mark as read hook - tracks read state locally and syncs with backend
  const { showNewTag } = useMarkAsReadOnView(cardRef, {
    entityId: Number(discussion.id),
    entityType: 'discussion',
    hasUnreadFlag: hasUnread,
    articleContext: communityId && articleId ? { communityId, articleId } : undefined,
  });

  // Toggle comments display
  const handleToggleComments = useCallback(() => {
    setDisplayComments((prev) => !prev);
  }, []);

  useEffect(() => {
    /* Fixed by Codex on 2026-02-17
       Who: Codex
       What: Harden unread auto-open behavior for discussion comment panels.
       Why: Auto-expand could be skipped when `comments_count` was missing, even though NEW badges showed unread activity.
       How: Treat only an explicit `0` comment count as non-expandable and reset the one-time guard when unread clears. */
    if (!showNewTag) {
      hasAutoExpandedCommentsRef.current = false;
      return;
    }
    if (hasAutoExpandedCommentsRef.current) return;
    if (discussion.comments_count === 0) return;
    setDisplayComments(true);
    hasAutoExpandedCommentsRef.current = true;
  }, [showNewTag, discussion.comments_count]);

  /* Fixed by Codex on 2026-02-15
     Problem: Discussion clicks referenced undefined unread state and skipped proper read tracking.
     Solution: Use stored read/unread actions keyed off the NEW tag to mark the discussion read and clear article badges.
     Result: Clicking a discussion reliably clears unread state without hook dependency warnings. */
  const handleOpenThread = useCallback(() => {
    if (discussion.id) {
      handleDiscussionClick(Number(discussion.id));
    }
    if (showNewTag && communityId && articleId) {
      markItemRead(Number(discussion.id), EntityType.discussion, communityId, articleId);
      clearNewEvent(communityId, articleId);
    }
  }, [
    handleDiscussionClick,
    discussion.id,
    showNewTag,
    communityId,
    articleId,
    markItemRead,
    clearNewEvent,
  ]);

  // Check if user can resolve/unresolve (admin or discussion author)
  const canResolve = isCommunityArticle && (isAdmin || discussion.is_author);
  const canEditDiscussion = !!discussion.is_author;
  const shouldShowActions = (canResolve || canEditDiscussion) && !isEditing;

  const { mutate: toggleResolved, isPending: isToggling } =
    useArticlesDiscussionApiToggleDiscussionResolved({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: (response) => {
          const newResolvedState = response.data.is_resolved;
          setIsResolved(newResolvedState || false);
          toast.success(
            newResolvedState ? 'Discussion marked as resolved' : 'Discussion marked as unresolved'
          );
          refetch?.();
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  const { mutate: updateDiscussion, isPending: isUpdating } =
    useArticlesDiscussionApiUpdateDiscussion({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: () => {
          toast.success('Discussion updated successfully.');
          setIsEditing(false);
          refetch?.();
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });
  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Enable Ctrl/Cmd+Enter to submit discussion edits from cards.
     Why: Provide the same keyboard submit behavior as other discussion inputs.
     How: Bind the shared submit-on-ctrl-enter hook to the card edit form ref. */
  useSubmitOnCtrlEnter(formRef, isUpdating, isEditing);

  const handleToggleResolved = () => {
    if (!discussion.id || isToggling) return;
    toggleResolved({ discussionId: Number(discussion.id) });
  };

  useEffect(() => {
    if (!isEditing) {
      reset({ topic: decodedTopic, content: decodedContent });
    }
  }, [decodedContent, decodedTopic, isEditing, reset]);

  const handleEditStart = () => {
    reset({ topic: decodedTopic, content: decodedContent });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    reset({ topic: decodedTopic, content: decodedContent });
    setIsEditing(false);
  };

  const handleEditSubmit = (values: DiscussionEditFormValues) => {
    if (!discussion.id) return;
    updateDiscussion({ discussionId: Number(discussion.id), data: values });
  };

  // const { data, refetch: refetchReactions } = useUsersCommonApiGetReactionCount(
  //   'articles.discussion',
  //   Number(discussion.id),
  //   {
  //     request: { headers: { Authorization: `Bearer ${accessToken}` } },
  //   }
  // );

  // const { mutate } = useUsersCommonApiPostReaction({
  //   request: { headers: { Authorization: `Bearer ${accessToken}` } },
  //   mutation: {
  //     onSuccess: () => {
  //       refetchReactions();
  //     },
  //     onError: (error) => {
  //       showErrorToast(error);
  //     },
  //   },
  // });

  // const handleReaction = (reaction: Reaction) => {
  //   if (reaction === 'upvote')
  //     mutate({
  //       data: { content_type: 'articles.discussion', object_id: Number(discussion.id), vote: 1 },
  //     });
  //   else if (reaction === 'downvote')
  //     mutate({
  //       data: { content_type: 'articles.discussion', object_id: Number(discussion.id), vote: -1 },
  //     });
  // };

  return (
    <div
      ref={cardRef}
      key={discussion.id}
      className={cn(
        'relative mb-4 border-b border-common-minimal pb-4 text-xs transition-colors duration-500',
        showNewTag && 'bg-functional-blue/5'
      )}
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src={
                  discussion.user.profile_pic_url
                    ? discussion.user.profile_pic_url?.startsWith('http')
                      ? discussion.user.profile_pic_url
                      : `data:image/png;base64,${discussion.user.profile_pic_url}`
                    : `/images/assets/user-icon.webp`
                }
                alt={discussion.user.username}
                width={32}
                height={32}
                className="mr-2 aspect-square h-7 w-7 rounded-full object-cover md:h-8 md:w-8"
                quality={75}
                sizes="32px"
                unoptimized={!discussion.user.profile_pic_url}
              />
              <div className="flex items-center">
                <span className="text-sm font-semibold text-text-secondary">
                  {discussion.user.username}
                </span>
                <span className="ml-2 text-xxs text-text-tertiary">
                  • {dayjs(discussion.created_at).fromNow()}
                </span>
                {isResolved && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span aria-label="Resolved discussion" className="ml-2 inline-flex">
                          <Check className="h-4 w-4 text-functional-green" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This discussion is resolved</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {/* NEW badge - shown optimistically until 1s after viewing (2s visibility threshold) */}
                {showNewTag && (
                  <>
                    {/* Fixed by Codex on 2026-02-15
                        Who: Codex
                        What: Tokenize NEW badge foreground.
                        Why: Keep unread badges aligned with skin palettes.
                        How: Use primary-foreground instead of hard-coded white. */}
                    <span className="ml-2 rounded bg-functional-blue px-1 text-[9px] font-semibold uppercase text-primary-foreground">
                      New
                    </span>
                  </>
                )}
              </div>
            </div>
            {shouldShowActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-md p-1 text-text-tertiary hover:bg-common-minimal hover:text-text-primary focus:outline-none"
                    disabled={isToggling}
                    aria-label="Discussion actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditDiscussion && (
                    <DropdownMenuItem onClick={handleEditStart}>Edit discussion</DropdownMenuItem>
                  )}
                  {canResolve && (
                    <DropdownMenuItem onClick={handleToggleResolved} disabled={isToggling}>
                      {isResolved ? 'Mark as Unresolved' : 'Mark as Resolved'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex w-full min-w-0 flex-col gap-0">
            {/* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Make discussion titles keyboard accessible.
               Why: Clickable spans are not focusable for keyboard users.
               How: Swap to a button with aria-label and preserved styling. */}
            {isEditing ? (
              <form
                ref={formRef}
                onSubmit={handleSubmit(handleEditSubmit)}
                className="mb-2 flex flex-col gap-3"
              >
                <FormInput<DiscussionEditFormValues>
                  label="Topic"
                  name="topic"
                  type="text"
                  placeholder="Enter discussion topic"
                  register={register}
                  requiredMessage="Topic is required"
                  errors={errors}
                  autoFocus
                />
                <FormInput<DiscussionEditFormValues>
                  label="Content"
                  name="content"
                  type="text"
                  placeholder="Enter discussion content"
                  register={register}
                  control={control}
                  requiredMessage="Content is required"
                  errors={errors}
                  textArea={true}
                  supportMarkdown={true}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" variant="blue" loading={isUpdating} showLoadingSpinner>
                    <ButtonTitle>{isUpdating ? 'Saving...' : 'Save changes'}</ButtonTitle>
                  </Button>
                  <Button type="button" variant="outline" onClick={handleEditCancel}>
                    <ButtonTitle>Cancel</ButtonTitle>
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Fixed by Codex on 2026-02-20
                   Who: Codex
                   What: Reworked discussion preview wrapping to avoid horizontal overflow without splitting normal words aggressively.
                   Why: `break-all` solved overflow but produced hard mid-word breaks and diverged from repository text-wrapping patterns.
                   How: Use `break-words` with `overflow-wrap:anywhere` on discussion-local containers/content instead of global helper overrides. */}
                <button
                  type="button"
                  aria-label="Open discussion"
                  onClick={handleOpenThread}
                  className="line-clamp-2 min-w-0 flex-grow cursor-pointer break-words text-left text-sm font-semibold text-text-primary [overflow-wrap:anywhere] hover:text-functional-blue hover:underline"
                >
                  {decodedTopic}
                </button>
                {/* <span className="text-text-secondary res-text-xs">{discussion.content}</span> */}
                <div className="w-full min-w-0 overflow-hidden break-words [overflow-wrap:anywhere]">
                  <RenderParsedHTML
                    rawContent={decodedContent}
                    isShrinked={true}
                    containerClassName="mb-0"
                    supportMarkdown={true}
                    supportLatex={true}
                    contentClassName="text-xs sm:text-sm break-words [overflow-wrap:anywhere]"
                    gradientClassName="sm:from-common-background"
                  />
                </div>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center text-xs text-text-tertiary">
            <button
              type="button"
              aria-expanded={displayComments}
              aria-controls={`discussion-${discussion.id}-comments`}
              onClick={handleToggleComments}
              className="flex items-center gap-2 text-[10px] hover:underline focus:outline-none"
            >
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 shrink-0" />
                {discussion.comments_count} comments
                {displayComments ? (
                  <ChevronUp className="h-3 w-3 shrink-0 text-text-tertiary" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0 text-text-tertiary" />
                )}
              </div>
            </button>
            {/* <button className="flex items-center space-x-1">
              <Share2 size={14} />
              <span>Share</span>
            </button> */}
          </div>
        </div>
        {/* <div className="flex flex-col gap-2">
          <MoreVertical className="text-gray-500" />
          <div className="flex flex-col items-center">
            <button
              className="text-text-tertiary hover:text-text-primary"
              onClick={() => handleReaction('upvote')}
            >
              <ChevronUp size={20} />
            </button>
            <span className="font-bold text-text-secondary">{data?.data.likes}</span>
            <button
              className="text-text-tertiary hover:text-text-primary"
              onClick={() => handleReaction('downvote')}
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div> */}
      </div>
      {displayComments && (
        <div id={`discussion-${discussion.id}-comments`}>
          <DiscussionComments
            discussionId={Number(discussion.id)}
            articleContext={communityId && articleId ? { communityId, articleId } : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default DiscussionCard;

export const DiscussionCardSkeleton: React.FC = () => {
  return (
    <Skeleton className="rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <div className="flex items-center gap-2">
        <BlockSkeleton className="aspect-square h-7 w-8 shrink-0 rounded-full md:h-8 md:w-8" />
        <TextSkeleton className="w-40" />
      </div>
      <TextSkeleton className="w-full" />
      <TextSkeleton className="w-3/4" />
      <div className="flex items-center gap-6">
        <TextSkeleton className="w-20" />
        <TextSkeleton className="w-20" />
      </div>
    </Skeleton>
  );
};
