'use client';

import React, { useEffect, useState } from 'react';

import { LucideIcon } from 'lucide-react';
import {
  Award,
  Book,
  Bookmark,
  ChevronDown,
  FileText,
  MessageCircle,
  MessageSquare,
  Star,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useUsersApiGetMyArticles,
  useUsersApiGetMyBookmarks,
  useUsersApiGetMyCommunities,
  useUsersApiGetMyFavorites,
  useUsersApiGetMyPosts,
  useUsersApiGetUserStats,
} from '@/api/users/users';
import { ErrorMessage } from '@/constants';
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
  posts: Array<{
    icon: LucideIcon;
    title: string;
    subtitle: string;
    iconColor: string;
  }>;
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
  });

  const { data: articlesData, error: articlesDataError } = useUsersApiGetMyArticles({
    request: requestConfig,
  });

  const { data: communitiesData, error: communitiesDataError } = useUsersApiGetMyCommunities({
    request: requestConfig,
  });

  const { data: postsData, error: postsDataError } = useUsersApiGetMyPosts({
    request: requestConfig,
  });

  const { data: favoritesData, error: favoritesDataError } = useUsersApiGetMyFavorites({
    request: requestConfig,
  });

  const { data: bookmarksData, error: bookmarksDataError } = useUsersApiGetMyBookmarks({
    request: requestConfig,
  });

  const [activeTab, setActiveTab] = useState<
    'articles' | 'communities' | 'posts' | 'favorites' | 'bookmarks'
  >('articles');
  const [isTabsOpen, setIsTabsOpen] = useState(false);

  const userData: UserData | undefined = data && {
    name: data.data.username,
    image: data.data.profile_pic_url || `data:image/png;base64,${imageData}`,
    bio: data.data.bio || 'No bio provided',
    location: 'Boston, MA',
    website: data.data.home_page_url || 'https://x.com',
    reputationLevel: data.data.reputation_level,
    reputationScore: data.data.reputation_score,
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
      {
        icon: Book,
        title: 'Posts',
        count: data.data.contributed_posts,
        description: 'Created or commented',
      },
      {
        icon: Award,
        title: 'Awards',
        count: 0,
        description: 'For outstanding contributions',
      },
    ],
    articles:
      articlesData?.data.map((article) => ({
        icon:
          article.status === 'Submitted'
            ? FileText
            : article.status === 'Commented'
              ? MessageCircle
              : MessageSquare,
        title: article.title,
        subtitle: `${article.status} on ${article.date}`,
        iconColor: 'bg-green-100 text-green-600',
      })) || [],
    communities:
      communitiesData?.data.map((community) => ({
        icon: Users,
        title: community.name,
        subtitle: `${community.role} · ${community.members_count} members`,
        iconColor: 'bg-purple-100 text-purple-600',
        role: community.role,
        memberCount: community.members_count,
      })) || [],
    posts:
      postsData?.data.map((post) => ({
        icon: post.action === 'Created' ? Book : MessageCircle,
        title: post.title,
        subtitle: `${post.action} on ${post.created_at} · ${post.likes_count} likes`,
        iconColor: 'bg-indigo-100 text-indigo-600',
      })) || [],
    favorites:
      favoritesData?.data.map((favorite) => ({
        icon: Star,
        title: favorite.title,
        subtitle: favorite.details,
        iconColor:
          favorite.type === 'Article'
            ? 'bg-blue-100 text-blue-600'
            : favorite.type === 'Community'
              ? 'bg-green-100 text-green-600'
              : 'bg-yellow-100 text-yellow-600',
        type: favorite.type,
      })) || [],
    bookmarks:
      bookmarksData?.data.map((bookmark) => ({
        icon: Bookmark,
        title: bookmark.title,
        subtitle: bookmark.details,
        iconColor: 'bg-yellow-100 text-yellow-600',
        type: bookmark.type,
      })) || [],
  };

  const tabContent: Record<typeof activeTab, Array<ItemCardProps>> = {
    articles: userData?.articles || [],
    communities: userData?.communities || [],
    posts: userData?.posts || [],
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
    <div className="bg-gray-100 text-gray-900 res-text-sm">
      {isPending && (
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ProfileHeaderSkeleton />
          <ReputationBadgeSkeleton />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {userData.contributions?.map((contribution, index) => (
                  <ContributionCard key={index} {...contribution} />
                ))}
              </div>

              <div className="mt-8">
                <div className="sm:hidden">
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
                </div>
                <div className="mb-4 hidden space-x-2 overflow-x-auto sm:flex">
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

                <div className="rounded-lg bg-white-primary p-4 shadow-md sm:p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h2>
                  {tabContent[activeTab].length === 0 && (
                    <p className="text-gray-500">No {activeTab} found</p>
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

export default ContributionsPage;
