'use client';

import React, { useEffect, useState } from 'react';

import { Award, Bookmark, FileText, MessageCircle, MessageSquare, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import {
  useUsersApiGetMe,
  useUsersApiGetMyArticles,
  useUsersApiGetMyBookmarks,
  useUsersApiGetMyCommunities,
  useUsersApiGetMyFavorites,
  useUsersApiGetMyPosts,
  useUsersApiGetUserStats,
} from '@/api/users/users';
import { ErrorMessage } from '@/constants';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import useIdenticon from '@/hooks/useIdenticons';
import { useAuthStore } from '@/stores/authStore';

import ContributionCard, { ContributionCardSkeleton } from './ContributionCard';
import ItemCard, { ItemCardProps, ItemCardSkeleton } from './ItemCard';
import ProfileHeader, { ProfileHeaderSkeleton } from './ProfileHeader';
import ReputationBadge, { ReputationBadgeSkeleton } from './ReputationBadge';
import TabButton from './TabButton';

// Tab configuration for cleaner code
const TABS = ['articles', 'communities', 'favorites', 'bookmarks'] as const;
type TabType = (typeof TABS)[number];

const ContributionsPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const requestConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  const imageData = useIdenticon(50);

  // User stats - used for profile header and contribution cards
  const {
    data: statsData,
    isPending: isStatsPending,
    error: statsError,
  } = useUsersApiGetUserStats({
    request: requestConfig,
    query: {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['user-stats'],
      enabled: !!accessToken,
    },
  });

  // User details - used for profile header (email, social links)
  const {
    data: userDetailsData,
    isPending: isUserDetailsPending,
    error: userDetailsError,
  } = useUsersApiGetMe({
    request: requestConfig,
    query: {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['user-details'],
      enabled: !!accessToken,
    },
  });

  // Tab content data - each loads independently
  const {
    data: articlesData,
    isPending: isArticlesPending,
    error: articlesDataError,
  } = useUsersApiGetMyArticles({
    request: requestConfig,
    query: {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-articles'],
      enabled: !!accessToken,
    },
  });

  const {
    data: communitiesData,
    isPending: isCommunitiesPending,
    error: communitiesDataError,
  } = useUsersApiGetMyCommunities({
    request: requestConfig,
    query: {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-communities'],
      enabled: !!accessToken,
    },
  });

  const { error: postsDataError } = useUsersApiGetMyPosts({
    request: requestConfig,
    query: {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-posts'],
      enabled: !!accessToken,
    },
  });

  const {
    data: favoritesData,
    isPending: isFavoritesPending,
    error: favoritesDataError,
  } = useUsersApiGetMyFavorites({
    request: requestConfig,
    query: {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-favorites'],
      enabled: !!accessToken,
    },
  });

  const {
    data: bookmarksData,
    isPending: isBookmarksPending,
    error: bookmarksDataError,
  } = useUsersApiGetMyBookmarks({
    request: requestConfig,
    query: {
      staleTime: FIFTEEN_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-bookmarks'],
      enabled: !!accessToken,
    },
  });

  const [activeTab, setActiveTab] = useState<TabType>('articles');

  // Profile data - derived from stats and user details
  const profileData = statsData
    ? {
        name:
          userDetailsData?.data.first_name && userDetailsData?.data.last_name
            ? `${userDetailsData.data.first_name} ${userDetailsData.data.last_name}`
            : statsData.data.username,
        image:
          userDetailsData?.data.profile_pic_url ||
          statsData.data.profile_pic_url ||
          `data:image/png;base64,${imageData}`,
        bio: userDetailsData?.data.bio || statsData.data.bio || 'No bio provided',
        email: userDetailsData?.data.email || '',
        website: userDetailsData?.data.home_page_url || statsData.data.home_page_url || '',
        githubUrl: userDetailsData?.data.github_url || '',
        linkedinUrl: userDetailsData?.data.linkedin_url || '',
        googleScholarUrl: userDetailsData?.data.google_scholar_url || '',
        pubMedUrl: userDetailsData?.data.pubMed_url || '',
        reputationLevel: statsData.data.reputation_level || '',
        reputationScore: statsData.data.reputation_score || 0,
      }
    : null;

  // Contribution stats - derived from stats data
  const contributions = statsData
    ? [
        {
          icon: FileText,
          title: 'Articles',
          count: statsData.data.contributed_articles,
          description: 'Submitted, reviewed, or commented',
        },
        {
          icon: Users,
          title: 'Communities',
          count: statsData.data.communities_joined,
          description: 'Member or creator',
        },
        {
          icon: Award,
          title: 'Awards',
          count: 0,
          description: 'For outstanding contributions',
        },
      ]
    : null;

  // Tab content data - transformed from API responses
  const articlesContent: ItemCardProps[] =
    articlesData?.data.map((article) => ({
      type: 'Article',
      icon:
        article.status === 'Submitted'
          ? FileText
          : article.status === 'Commented'
            ? MessageCircle
            : MessageSquare,
      title: article.title,
      subtitle: `${article.status} on ${article.date}`,
      slug: article.slug,
      iconColor: 'bg-functional-green/10 text-functional-green',
    })) || [];

  const communitiesContent: ItemCardProps[] =
    communitiesData?.data.map((community) => ({
      type: 'Community',
      icon: Users,
      title: community.name,
      subtitle: `${community.role} · ${community.members_count} members`,
      iconColor: 'bg-functional-blue/10 text-functional-blue',
      role: community.role,
      slug: community.name,
      memberCount: community.members_count,
    })) || [];

  const favoritesContent: ItemCardProps[] =
    favoritesData?.data.map((favorite) => ({
      icon: Star,
      title: favorite.title,
      subtitle: favorite.details,
      iconColor:
        favorite.type === 'Article'
          ? 'bg-functional-green/10 text-functional-green'
          : favorite.type === 'Community'
            ? 'bg-functional-blue/10 text-functional-blue'
            : 'bg-functional-yellow/10 text-functional-yellow',
      type: favorite.type,
      slug: favorite.slug,
    })) || [];

  const bookmarksContent: ItemCardProps[] =
    bookmarksData?.data.map((bookmark) => ({
      icon: Bookmark,
      title: bookmark.title,
      subtitle: bookmark.details,
      iconColor: 'bg-functional-yellow/10 text-functional-yellow',
      type: bookmark.type,
      slug: bookmark.slug,
    })) || [];

  // Tab content and loading states mapping
  const tabConfig: Record<TabType, { content: ItemCardProps[]; isPending: boolean }> = {
    articles: { content: articlesContent, isPending: isArticlesPending },
    communities: { content: communitiesContent, isPending: isCommunitiesPending },
    favorites: { content: favoritesContent, isPending: isFavoritesPending },
    bookmarks: { content: bookmarksContent, isPending: isBookmarksPending },
  };

  // Show errors as toasts - each error is shown independently
  useEffect(() => {
    const errors = [
      statsError,
      userDetailsError,
      articlesDataError,
      communitiesDataError,
      postsDataError,
      favoritesDataError,
      bookmarksDataError,
    ].filter(Boolean);

    if (errors.length > 0) {
      const errorMessage = errors[0]?.response?.data.message || ErrorMessage;
      toast.error(errorMessage);
    }
  }, [
    statsError,
    userDetailsError,
    articlesDataError,
    communitiesDataError,
    postsDataError,
    favoritesDataError,
    bookmarksDataError,
  ]);

  const isProfilePending = isStatsPending || isUserDetailsPending;
  const { content: activeTabContent, isPending: isActiveTabPending } = tabConfig[activeTab];

  return (
    <div className="min-h-screen bg-common-background px-4 py-6 res-text-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Profile Header Section */}
        {isProfilePending ? (
          <ProfileHeaderSkeleton />
        ) : profileData ? (
          <ProfileHeader
            name={profileData.name}
            image={profileData.image}
            bio={profileData.bio}
            email={profileData.email}
            website={profileData.website}
            githubUrl={profileData.githubUrl}
            linkedinUrl={profileData.linkedinUrl}
            googleScholarUrl={profileData.googleScholarUrl}
            pubMedUrl={profileData.pubMedUrl}
          />
        ) : null}

        {/* Reputation Badge Section */}
        {isStatsPending ? (
          <ReputationBadgeSkeleton />
        ) : profileData ? (
          <ReputationBadge
            level={profileData.reputationLevel}
            score={profileData.reputationScore}
          />
        ) : null}

        {/* Contribution Cards Section */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-6 md:gap-6 lg:grid-cols-3">
          {isStatsPending
            ? Array.from({ length: 3 }).map((_, index) => <ContributionCardSkeleton key={index} />)
            : contributions?.map((contribution, index) => (
                <ContributionCard key={index} {...contribution} />
              ))}
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <div className="scrollbar-hide flex overflow-x-auto">
            {TABS.map((tab) => (
              <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabButton>
            ))}
          </div>

          {/* Tab Content Section */}
          <div className="py-6">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>

            {isActiveTabPending ? (
              // Show skeletons while loading
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ItemCardSkeleton key={index} />
                ))}
              </div>
            ) : activeTabContent.length === 0 ? (
              <p className="text-xs text-text-tertiary">No {activeTab} found</p>
            ) : (
              activeTabContent.map((item, index) => <ItemCard key={index} {...item} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthRedirect(ContributionsPage, { requireAuth: true });
