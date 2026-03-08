import React, { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BellOff, BellPlus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import {
  getArticlesDiscussionApiGetSubscriptionStatusQueryKey,
  useArticlesDiscussionApiGetSubscriptionStatus,
  useArticlesDiscussionApiListDiscussions,
  useArticlesDiscussionApiSubscribeToDiscussion,
  useArticlesDiscussionApiUnsubscribeFromDiscussion,
} from '@/api/discussions/discussions';
import EmptyState from '@/components/common/EmptyState';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import { ErrorMessage } from '@/constants';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { captureMentionNotification } from '@/lib/mentionNotifications';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useRealtimeContextStore } from '@/stores/realtimeStore';

import DiscussionCard, { DiscussionCardSkeleton } from './DiscussionCard';
import DiscussionForm from './DiscussionForm';
import DiscussionSummary from './DiscussionSummary';
import DiscussionThread from './DiscussionThread';

interface DiscussionForumProps {
  articleId: number;
  communityId?: number | null;
  communitySlug?: string | null;
  communityArticleId?: number | null;
  showSubscribeButton?: boolean;
  isAdmin?: boolean;
  initialDiscussionId?: number | null;
  initialCommentId?: number | null;
}

const DiscussionForum: React.FC<DiscussionForumProps> = ({
  articleId,
  communityId,
  communitySlug,
  communityArticleId,
  showSubscribeButton = false,
  isAdmin = false,
  initialDiscussionId = null,
  initialCommentId = null,
}) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [discussionId, setDiscussionId] = useState<number | null>(initialDiscussionId);
  const [focusedCommentId, setFocusedCommentId] = useState<number | null>(initialCommentId);
  const normalizedCommunitySlug = communitySlug?.trim() || '';

  const { data, isPending, error, refetch } = useArticlesDiscussionApiListDiscussions(
    articleId,
    { community_id: communityId || 0 },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['discussions', articleId, communityId],
      },
    }
  );

  // Fetch subscription status - cache for 5 minutes
  const { data: subscriptionData, isLoading: isSubscriptionLoading } =
    useArticlesDiscussionApiGetSubscriptionStatus(
      {
        community_article_id: communityArticleId || 0,
        community_id: communityId || 0,
      },
      {
        request: { headers: { Authorization: `Bearer ${accessToken}` } },
        query: {
          enabled: !!accessToken && !!communityArticleId && !!communityId && showSubscribeButton,
          staleTime: FIFTEEN_MINUTES_IN_MS,
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
        },
      }
    );

  const isSubscribed = subscriptionData?.data?.is_subscribed || false;
  const subscriptionId = subscriptionData?.data?.subscription?.id;

  const { data: communityData } = useCommunitiesApiGetCommunity(normalizedCommunitySlug, {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    query: {
      enabled: !!accessToken && !!communityId && !!normalizedCommunitySlug,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: false,
    },
  });

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Added discussion mention candidates sourced from community membership.
     Why: `@` tagging should only suggest valid members for communities the user belongs to.
     How: Read `community.members` from the community API response and normalize/dedupe names before passing to comment inputs. */
  const mentionCandidates = React.useMemo(() => {
    const members = communityData?.data?.members;
    if (!Array.isArray(members)) return [];

    const dedupedMembers = new Set<string>();
    members.forEach((memberName) => {
      const normalizedMemberName = memberName.trim();
      if (normalizedMemberName.length > 0) {
        dedupedMembers.add(normalizedMemberName);
      }
    });

    return Array.from(dedupedMembers);
  }, [communityData?.data?.members]);

  // Subscribe mutation
  const { mutate: subscribe, isPending: isSubscribing } =
    useArticlesDiscussionApiSubscribeToDiscussion({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: (response) => {
          /* Fixed by Codex on 2026-02-15
             Problem: Subscribe success toast duplicated the button's state change feedback.
             Solution: Commented out the subscribe success toast to reduce redundant UI noise.
             Result: The button label/state change now serves as the confirmation. */
          // toast.success('Successfully subscribed to discussions');

          // Update cached subscription status immediately for better UX (no refetch)
          const params = {
            community_article_id: communityArticleId || 0,
            community_id: communityId || 0,
          };
          const queryKey = getArticlesDiscussionApiGetSubscriptionStatusQueryKey(params);
          queryClient.setQueryData(queryKey, {
            data: {
              is_subscribed: true,
              subscription: response.data,
            },
          });
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  // Unsubscribe mutation
  const { mutate: unsubscribe, isPending: isUnsubscribing } =
    useArticlesDiscussionApiUnsubscribeFromDiscussion({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: () => {
          toast.success('Successfully unsubscribed from discussions');

          // Update cached subscription status immediately for better UX (no refetch)
          const params = {
            community_article_id: communityArticleId || 0,
            community_id: communityId || 0,
          };
          const queryKey = getArticlesDiscussionApiGetSubscriptionStatusQueryKey(params);
          queryClient.setQueryData(queryKey, {
            data: {
              is_subscribed: false,
              subscription: null,
            },
          });
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  // Mark realtime active context for in-place updates
  useEffect(() => {
    const store = useRealtimeContextStore.getState();
    store.setActiveContext(articleId, communityId || null);
    store.setViewingDiscussions(true);

    return () => {
      store.clearActiveContext();
    };
  }, [articleId, communityId]);

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message || ErrorMessage}`);
    }
  }, [error]);

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Sync initial discussion deep-link selection to the current article context.
     Why: Mention links now open `/discussions?articleId=...&discussionId=...` and should land in the thread view.
     How: Reapply `initialDiscussionId` whenever article context changes; reset to list view when absent. */
  useEffect(() => {
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Synced discussion + comment deep-link targets to current article context.
       Why: Mention URLs may carry both `discussionId` and `commentId`; both must reset when context changes.
       How: Reapply incoming deep-link ids on article changes and clear them when absent. */
    setDiscussionId(initialDiscussionId ?? null);
    setFocusedCommentId(initialCommentId ?? null);
  }, [articleId, initialCommentId, initialDiscussionId]);

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Scan fetched discussions for `@username` mentions.
     Why: Mention notifications must be captured from initial backend payloads, not only realtime events.
     How: Walk loaded discussions and register each matching mention once through the shared helper/store. */
  useEffect(() => {
    const discussions = data?.data.items;
    if (!Array.isArray(discussions) || discussions.length === 0) return;

    discussions.forEach((discussion) => {
      if (discussion.id === undefined) return;

      captureMentionNotification({
        sourceType: 'discussion',
        sourceId: Number(discussion.id),
        discussionId: Number(discussion.id),
        articleId: discussion.article_id,
        communityId: communityId ?? null,
        content: discussion.content,
        authorUsername: discussion.user?.username,
        createdAt: discussion.created_at,
      });
    });
  }, [communityId, data?.data.items]);

  const handleNewDiscussion = (): void => {
    setShowForm((prev) => !prev);
  };

  const handleDiscussionClick = (discussionId: number): void => {
    setDiscussionId(discussionId);
    setFocusedCommentId(null);
  };

  const handleSubscriptionToggle = (): void => {
    if (!communityArticleId || !communityId) {
      toast.error('Missing required information to subscribe');
      return;
    }

    if (isSubscribed && subscriptionId) {
      unsubscribe({ subscriptionId });
    } else {
      subscribe({
        data: {
          community_article_id: communityArticleId,
          community_id: communityId,
        },
      });
    }
  };

  if (discussionId) {
    return (
      <DiscussionThread
        discussionId={discussionId}
        setDiscussionId={setDiscussionId}
        initialCommentId={focusedCommentId}
        mentionCandidates={mentionCandidates}
        refetchDiscussions={refetch}
      />
    );
  }

  return (
    <div>
      {/* Discussion Summary - only for community articles */}
      {communityArticleId && (
        <DiscussionSummary communityArticleId={communityArticleId} isAdmin={isAdmin} />
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between text-sm">
        <h1 className="text-xl font-bold text-text-primary">Discussions</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleNewDiscussion} className="p-2">
            <ButtonIcon>
              <Plus
                size={14}
                className={cn('transition-transform duration-200', {
                  'rotate-45': showForm,
                })}
              />
            </ButtonIcon>
            <ButtonTitle>New Discussion</ButtonTitle>
          </Button>
          {showSubscribeButton && (
            <Button
              onClick={handleSubscriptionToggle}
              loading={isSubscribing || isUnsubscribing || isSubscriptionLoading}
              showLoadingSpinner
              className={cn('group p-2', {
                'border-functional-redContrast/30 bg-functional-redContrast/10': isSubscribed,
              })}
              withTooltip
              tooltipData={
                isSubscribed
                  ? 'Unsubscribe from real-time discussion updates'
                  : 'Subscribe to get real-time discussion updates'
              }
              variant={isSubscribed ? 'outline' : 'blue'}
              size="sm"
            >
              <ButtonIcon>
                {isSubscribed ? (
                  <BellOff
                    size={14}
                    className={cn(
                      'transition-transform duration-200',
                      'group-hover:-translate-y-0.5 group-hover:rotate-12',
                      {
                        'text-functional-red': isSubscribed,
                      }
                    )}
                  />
                ) : (
                  <BellPlus
                    size={14}
                    className={cn(
                      'transition-transform duration-200',
                      'group-hover:-translate-y-0.5 group-hover:-rotate-12'
                    )}
                  />
                )}
              </ButtonIcon>
              <ButtonTitle
                className={cn({
                  'text-functional-red': isSubscribed,
                })}
              >
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </ButtonTitle>
            </Button>
          )}
        </div>
      </div>

      {showForm ? (
        <DiscussionForm
          setShowForm={setShowForm}
          articleId={articleId}
          communityId={communityId}
          mentionCandidates={mentionCandidates}
          refetchDiscussions={refetch}
        />
      ) : (
        <>
          {isPending && (
            <div className="flex w-full flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <DiscussionCardSkeleton key={index} />
              ))}
            </div>
          )}
          {data && data.data.items.length === 0 && (
            <EmptyState
              content="No discussions yet"
              subcontent="Be the first to start a discussion"
            />
          )}
        </>
      )}
      <div className="flex w-full flex-col gap-4">
        {data &&
          data.data.items.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              handleDiscussionClick={handleDiscussionClick}
              isAdmin={isAdmin}
              isCommunityArticle={!!communityId}
              refetch={refetch}
              articleId={articleId}
              communityId={communityId}
              mentionCandidates={mentionCandidates}
            />
          ))}
      </div>
    </div>
  );
};

export default DiscussionForum;
