'use client';

import React, { useEffect, useState } from 'react';

import { LucideIcon } from 'lucide-react';
import { Award, Bookmark, FileText, MessageCircle, MessageSquare, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import {
  useUsersApiGetMyArticles,
  useUsersApiGetMyBookmarks,
  useUsersApiGetMyCommunities,
  useUsersApiGetMyFavorites,
  useUsersApiGetMyPosts,
  useUsersApiGetUserStats,
} from '@/api/users/users';
import { ErrorMessage } from '@/constants';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import useIdenticon from '@/hooks/useIdenticons';
import { useAuthStore } from '@/stores/authStore';

import ContributionCard, { ContributionCardSkeleton } from './ContributionCard';
import ItemCard, { ItemCardProps } from './ItemCard';
import ProfileHeader, { ProfileHeaderSkeleton } from './ProfileHeader';
import ReputationBadge, { ReputationBadgeSkeleton } from './ReputationBadge';
import TabButton from './TabButton';

interface UserData {
  name: string;
  image: string;
  bio: string;
  location: string;
  website: string;
  reputationLevel: string;
  reputationScore: number;
  contributions: Array<{
    icon: LucideIcon;
    title: string;
    count: number | null | undefined;
    description: string;
  }>;
  articles: Array<{
    icon: LucideIcon;
    title: string;
    subtitle: string;
    iconColor: string;
  }>;
  communities: Array<{
    icon: LucideIcon;
    title: string;
    subtitle: string; // Add this line
    iconColor: string;
    role: string;
    memberCount: number;
  }>;
  // posts: Array<{
  //   icon: LucideIcon;
  //   title: string;
  //   subtitle: string;
  //   iconColor: string;
  // }>;
  favorites: Array<{
    icon: LucideIcon;
    title: string;
    subtitle: string;
    iconColor: string;
    type: string;
  }>;
  bookmarks: Array<{
    icon: LucideIcon;
    title: string;
    subtitle: string;
    iconColor: string;
    type: string;
  }>;
}

const ContributionsPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const requestConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  const imageData = useIdenticon(50);

  const { data, isPending, error } = useUsersApiGetUserStats({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['user-stats'],
      enabled: !!accessToken,
    },
  });

  const { data: articlesData, error: articlesDataError } = useUsersApiGetMyArticles({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-articles'],
      enabled: !!accessToken,
    },
  });

  const { data: communitiesData, error: communitiesDataError } = useUsersApiGetMyCommunities({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-communities'],
      enabled: !!accessToken,
    },
  });

  const { data: postsData, error: postsDataError } = useUsersApiGetMyPosts({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-posts'],
      enabled: !!accessToken,
    },
  });

  const { data: favoritesData, error: favoritesDataError } = useUsersApiGetMyFavorites({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-favorites'],
      enabled: !!accessToken,
    },
  });

  const { data: bookmarksData, error: bookmarksDataError } = useUsersApiGetMyBookmarks({
    request: requestConfig,
    query: {
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryKey: ['my-bookmarks'],
      enabled: !!accessToken,
    },
  });

  const [activeTab, setActiveTab] = useState<
    'articles' | 'communities' | 'favorites' | 'bookmarks'
  >('articles');

  const userData: UserData | undefined = data && {
    name: data.data.username,
    image: data.data.profile_pic_url || `data:image/png;base64,${imageData}`,
    bio: data.data.bio || 'No bio provided',
    location: 'Boston, MA',
    website: data.data.home_page_url || 'https://x.com',
    reputationLevel: data.data.reputation_level || '',
    reputationScore: data.data.reputation_score || 0,
    contributions: [
      {
        icon: FileText,
        title: 'Articles',
        count: data.data.contributed_articles,
        description: 'Submitted, reviewed, or commented',
      },
      {
        icon: Users,
        title: 'Communities',
        count: data.data.communities_joined,
        description: 'Member or creator',
      },
      // {
      //   icon: Book,
      //   title: 'Posts',
      //   count: data.data.contributed_posts,
      //   description: 'Created or commented',
      // },
      {
        icon: Award,
        title: 'Awards',
        count: 0,
        description: 'For outstanding contributions',
      },
    ],
    articles:
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
      })) || [],
    communities:
      communitiesData?.data.map((community) => ({
        type: 'Community',
        icon: Users,
        title: community.name,
        subtitle: `${community.role} · ${community.members_count} members`,
        iconColor: 'bg-functional-blue/10 text-functional-blue',
        role: community.role,
        slug: community.name,
        memberCount: community.members_count,
      })) || [],
    // posts:
    //   postsData?.data.map((post) => ({
    //     type: 'Post',
    //     icon: post.action === 'Created' ? Book : MessageCircle,
    //     title: post.title,
    //     slug: post.id,
    //     subtitle: `${post.action} on ${post.created_at} · ${post.likes_count} likes`,
    //     iconColor: 'bg-indigo-100 text-indigo-600',
    //   })) || [],
    favorites:
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
      })) || [],
    bookmarks:
      bookmarksData?.data.map((bookmark) => ({
        icon: Bookmark,
        title: bookmark.title,
        subtitle: bookmark.details,
        iconColor: 'bg-functional-yellow/10 text-functional-yellow',
        type: bookmark.type,
        slug: bookmark.slug,
      })) || [],
  };

  const tabContent: Record<typeof activeTab, Array<ItemCardProps>> = {
    articles: userData?.articles || [],
    communities: userData?.communities || [],
    // posts: userData?.posts || [],
    favorites: userData?.favorites || [],
    bookmarks: userData?.bookmarks || [],
  };

  useEffect(() => {
    if (
      error ||
      articlesDataError ||
      communitiesDataError ||
      postsDataError ||
      favoritesDataError ||
      bookmarksDataError
    ) {
      toast.error(
        error?.response?.data.message ||
          articlesDataError?.response?.data.message ||
          communitiesDataError?.response?.data.message ||
          postsDataError?.response?.data.message ||
          favoritesDataError?.response?.data.message ||
          bookmarksDataError?.response?.data.message ||
          ErrorMessage
      );
    }
  }, [
    error,
    articlesDataError,
    communitiesDataError,
    postsDataError,
    favoritesDataError,
    bookmarksDataError,
  ]);

  return (
    <div className="bg-common-background res-text-sm">
      {isPending && (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ProfileHeaderSkeleton />
          <ReputationBadgeSkeleton />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ContributionCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}
      {data &&
        userData &&
        articlesData &&
        communitiesData &&
        postsData &&
        favoritesData &&
        bookmarksData && (
          <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <ProfileHeader
                name={userData.name}
                image={userData.image}
                bio={userData.bio}
                location={userData.location}
                website={userData.website}
              />

              <ReputationBadge level={userData.reputationLevel} score={userData.reputationScore} />

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-6 md:gap-6 lg:grid-cols-4">
                {userData.contributions?.map((contribution, index) => (
                  <ContributionCard key={index} {...contribution} />
                ))}
              </div>

              <div className="mt-8">
                {/* <div className="sm:hidden">
                  <button
                    className="flex w-full items-center justify-between rounded-lg bg-white-primary px-4 py-2 text-left font-semibold text-gray-800 shadow"
                    onClick={() => setIsTabsOpen(!isTabsOpen)}
                  >
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${isTabsOpen ? 'rotate-180 transform' : ''}`}
                    />
                  </button>
                  {isTabsOpen && (
                    <div className="mt-2 overflow-hidden rounded-lg bg-white-primary shadow">
                      {(Object.keys(tabContent) as Array<keyof typeof tabContent>).map((tab) => (
                        <button
                          key={tab}
                          className="w-full px-4 py-2 text-left font-semibold text-gray-800 hover:bg-gray-100"
                          onClick={() => {
                            setActiveTab(tab);
                            setIsTabsOpen(false);
                          }}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div> */}
                <div className="scrollbar-hide flex overflow-x-auto">
                  {(Object.keys(tabContent) as Array<keyof typeof tabContent>).map((tab) => (
                    <TabButton
                      key={tab}
                      active={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabButton>
                  ))}
                </div>

                <div className="py-6">
                  <h2 className="mb-4 text-xl font-semibold text-text-primary">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h2>
                  {tabContent[activeTab].length === 0 && (
                    <p className="text-xs text-text-tertiary">No {activeTab} found</p>
                  )}
                  {tabContent[activeTab].map((item, index) => (
                    <ItemCard key={index} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default withAuthRedirect(ContributionsPage, { requireAuth: true });
