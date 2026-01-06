'use client';

import React, { useState } from 'react';

import { Bell, ChevronDown, ChevronRight } from 'lucide-react';

import { useArticlesDiscussionApiGetUserSubscriptions } from '@/api/discussions/discussions';
import { SubscriptionArticleOut } from '@/api/schemas';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface SelectedArticle {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  communityId: number | null;
  communityArticleId: number | null;
  isAdmin: boolean;
}

interface DiscussionsSidebarProps {
  onArticleSelect: (article: SelectedArticle) => void;
  selectedArticle: SelectedArticle | null;
}

const DiscussionsSidebar: React.FC<DiscussionsSidebarProps> = ({
  onArticleSelect,
  selectedArticle,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [expandedCommunities, setExpandedCommunities] = useState<Set<number>>(new Set());

  // Fetch user subscriptions
  const { data: subscriptionsData, isPending: subscriptionsLoading } =
    useArticlesDiscussionApiGetUserSubscriptions({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
      },
    });

  const subscriptions = subscriptionsData?.data?.communities || [];

  const toggleCommunity = (communityId: number) => {
    setExpandedCommunities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(communityId)) {
        newSet.delete(communityId);
      } else {
        newSet.add(communityId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">Discussions</h2>
        {/* <p className="mt-1 text-xs text-text-tertiary">Select an article to view discussions</p> */}
      </div>

      {/* Subscriptions Loading State */}
      {subscriptionsLoading && (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              key={index}
              className="rounded-lg border border-common-minimal bg-common-cardBackground p-3"
            >
              <div className="flex items-center justify-between">
                <TextSkeleton className="w-32" />
                <BlockSkeleton className="h-4 w-4" />
              </div>
            </Skeleton>
          ))}
        </div>
      )}

      {/* Subscribed Articles Section */}
      {!subscriptionsLoading && subscriptions.length > 0 && (
        <div className="space-y-3">
          {subscriptions.map((subscription) => {
            const isExpanded = expandedCommunities.has(subscription.community_id);
            return (
              <div
                key={subscription.community_id}
                className="rounded-lg border border-common-minimal"
              >
                {/* Community Header - Clickable */}
                <button
                  onClick={() => toggleCommunity(subscription.community_id)}
                  className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-common-minimal"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {subscription.community_name}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={16} className="flex-shrink-0 text-text-tertiary" />
                  ) : (
                    <ChevronRight size={16} className="flex-shrink-0 text-text-tertiary" />
                  )}
                </button>

                {/* Articles List - Shown when expanded */}
                {isExpanded && (
                  <div className="border-t border-common-minimal">
                    {subscription.articles.map((article: SubscriptionArticleOut) => (
                      <button
                        key={article.article_id}
                        onClick={() =>
                          onArticleSelect({
                            id: article.article_id,
                            title: article.article_title,
                            slug: article.article_slug,
                            abstract: article.article_abstract || '',
                            communityId: subscription.community_id,
                            communityArticleId: article.community_article_id || null,
                            isAdmin: subscription.is_admin || false,
                          })
                        }
                        className={cn(
                          'w-full border-b border-common-minimal p-3 text-left transition-colors last:border-b-0 hover:bg-common-minimal',
                          selectedArticle?.id === article.article_id && 'bg-functional-green/10'
                        )}
                      >
                        <p className="line-clamp-2 text-xs font-medium text-text-secondary">
                          {article.article_title}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!subscriptionsLoading && subscriptions.length === 0 && (
        <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-8 text-center">
          <Bell className="mb-4 h-16 w-16 text-text-tertiary" />
          <p className="text-lg font-semibold text-text-secondary">No subscriptions yet</p>
          <p className="mt-2 text-sm text-text-tertiary">
            Subscribe to article discussions from community pages
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            You&apos;ll see them here for quick access
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscussionsSidebar;
