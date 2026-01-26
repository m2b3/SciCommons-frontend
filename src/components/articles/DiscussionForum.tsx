import React, { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BellOff, BellPlus, Plus } from 'lucide-react';
import { toast } from 'sonner';

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
  communityArticleId?: number | null;
  showSubscribeButton?: boolean;
  isAdmin?: boolean;
}

const DiscussionForum: React.FC<DiscussionForumProps> = ({
  articleId,
  communityId,
  communityArticleId,
  showSubscribeButton = false,
  isAdmin = false,
}) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [discussionId, setDiscussionId] = useState<number | null>(null);

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

  // Subscribe mutation
  const { mutate: subscribe, isPending: isSubscribing } =
    useArticlesDiscussionApiSubscribeToDiscussion({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: (response) => {
          toast.success('Successfully subscribed to discussions');

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

  const handleNewDiscussion = (): void => {
    setShowForm((prev) => !prev);
  };

  const handleDiscussionClick = (discussionId: number): void => {
    setDiscussionId(discussionId);
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
    return <DiscussionThread discussionId={discussionId} setDiscussionId={setDiscussionId} />;
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
            />
          ))}
      </div>
    </div>
  );
};

export default DiscussionForum;
