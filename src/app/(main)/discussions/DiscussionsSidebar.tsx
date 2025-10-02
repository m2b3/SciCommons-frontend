'use client';

import React, { useState } from 'react';

import { ChevronDown, ChevronRight, Users } from 'lucide-react';

import { useCommunitiesApiListCommunities } from '@/api/communities/communities';
import { useCommunitiesArticlesApiListCommunityArticlesByStatus } from '@/api/community-articles/community-articles';
import type { CommunityListOut } from '@/api/schemas';
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

  // Fetch communities
  const { data: communitiesData, isPending: communitiesLoading } = useCommunitiesApiListCommunities(
    { per_page: 50 },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
      },
    }
  );

  const communities = communitiesData?.data?.items || [];

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
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">Discussions</h2>
        <p className="mt-1 text-xs text-text-tertiary">Select an article to view discussions</p>
      </div>

      {communitiesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="p-3">
              <div className="flex items-center gap-3">
                <BlockSkeleton className="h-8 w-8 rounded-full" />
                <TextSkeleton className="w-32" />
              </div>
            </Skeleton>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {communities.map((community) => (
            <CommunitySection
              key={community.id}
              community={community}
              isExpanded={expandedCommunities.has(community.id)}
              onToggle={() => toggleCommunity(community.id)}
              onArticleSelect={onArticleSelect}
              selectedArticle={selectedArticle}
            />
          ))}
          {communities.length === 0 && (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-text-tertiary" />
              <p className="text-text-secondary">No communities found</p>
              <p className="text-sm text-text-tertiary">
                Join some communities to see their discussions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CommunitySectionProps {
  community: CommunityListOut;
  isExpanded: boolean;
  onToggle: () => void;
  onArticleSelect: (article: SelectedArticle) => void;
  selectedArticle: SelectedArticle | null;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({
  community,
  isExpanded,
  onToggle,
  onArticleSelect,
  selectedArticle,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // Fetch articles for this community when expanded
  const { data: articlesData, isPending: articlesLoading } =
    useCommunitiesArticlesApiListCommunityArticlesByStatus(
      community.name,
      { status: 'published', size: 20 },
      {
        request: { headers: { Authorization: `Bearer ${accessToken}` } },
        query: {
          enabled: !!accessToken && isExpanded,
          staleTime: FIFTEEN_MINUTES_IN_MS,
          refetchOnWindowFocus: false,
        },
      }
    );

  const articles = articlesData?.data?.items || [];

  return (
    <div className="rounded-lg border border-common-minimal">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-common-minimal"
      >
        <div className="flex items-center gap-3">
          <span className="truncate text-sm font-medium text-text-primary">{community.name}</span>
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-text-tertiary" />
        ) : (
          <ChevronRight size={16} className="text-text-tertiary" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-common-minimal">
          {articlesLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="p-2">
                  <TextSkeleton className="w-full" />
                </Skeleton>
              ))}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() =>
                    onArticleSelect({
                      id: article.id,
                      title: article.title,
                      slug: article.slug,
                      abstract: article.abstract,
                      communityId: community.id,
                    })
                  }
                  className={cn(
                    'w-full border-b border-common-minimal p-3 text-left transition-colors last:border-b-0 hover:bg-common-minimal',
                    selectedArticle?.id === article.id && 'bg-functional-green/10'
                  )}
                >
                  <p className="line-clamp-2 text-xs font-medium text-text-primary">
                    {article.title}
                  </p>
                </button>
              ))}
              {articles.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-xs text-text-tertiary">No articles found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionsSidebar;
