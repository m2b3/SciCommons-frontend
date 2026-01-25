'use client';

import React, { useMemo } from 'react';

import Link from 'next/link';

import { Bell, ChevronRight } from 'lucide-react';

import { useArticlesDiscussionApiGetUserSubscriptions } from '@/api/discussions/discussions';
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
  communityName: string;
}

interface FlattenedArticle {
  articleId: number;
  articleTitle: string;
  articleSlug: string;
  articleAbstract: string;
  communityArticleId: number | null;
  communityId: number;
  communityName: string;
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

  const communities = subscriptionsData?.data?.communities || [];

  // Flatten the data: each article becomes its own item with community info
  const flattenedArticles = useMemo<FlattenedArticle[]>(() => {
    return communities.flatMap((community) =>
      community.articles.map((article) => ({
        articleId: article.article_id,
        articleTitle: article.article_title,
        articleSlug: article.article_slug,
        articleAbstract: article.article_abstract || '',
        communityArticleId: article.community_article_id || null,
        communityId: community.community_id,
        communityName: community.community_name,
        isAdmin: community.is_admin || false,
      }))
    );
  }, [communities]);

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">Discussions</h2>
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

      {/* Flattened Articles List */}
      {!subscriptionsLoading && flattenedArticles.length > 0 && (
        <div className="space-y-4">
          {flattenedArticles.map((article) => (
            <button
              key={`${article.communityId}-${article.articleId}`}
              onClick={() =>
                onArticleSelect({
                  id: article.articleId,
                  title: article.articleTitle,
                  slug: article.articleSlug,
                  abstract: article.articleAbstract,
                  communityId: article.communityId,
                  communityArticleId: article.communityArticleId,
                  isAdmin: article.isAdmin,
                  communityName: article.communityName,
                })
              }
              className={cn(
                'relative flex w-full flex-col gap-1 text-left transition-colors',
                'before:absolute before:-inset-x-2 before:-inset-y-1.5 before:rounded-sm before:transition-colors',
                'hover:before:bg-common-minimal/50',
                selectedArticle?.id === article.articleId &&
                  'before:border-functional-green/30 before:bg-functional-green/10 hover:before:bg-functional-green/10'
              )}
            >
              <div className="relative z-10 flex w-full flex-nowrap items-center">
                <Link
                  href={`/community/${article.communityName}`}
                  className={cn(
                    'line-clamp-1 truncate text-[9px] font-semibold text-text-tertiary hover:text-functional-blueLight hover:underline',
                    selectedArticle?.id === article.articleId && 'text-text-secondary'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {article.communityName}
                </Link>
                <ChevronRight size={12} className="flex-shrink-0 text-text-tertiary" />
              </div>
              <p
                className={cn(
                  'relative z-10 line-clamp-2 text-xs font-medium text-text-secondary',
                  selectedArticle?.id === article.articleId && 'text-text-primary'
                )}
              >
                {article.articleTitle}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!subscriptionsLoading && flattenedArticles.length === 0 && (
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
