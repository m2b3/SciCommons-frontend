'use client';

import React, { useEffect } from 'react';

import toast from 'react-hot-toast';

import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import { useCommunitiesApiPostsGetCommunityArticles } from '@/api/community-posts/community-posts';
import SearchBar from '@/components/SearchBar';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import CommunityHighlightCard from '@/components/communities/CommunityHighlightCard';
import DisplayCommunitySkeletonLoader from '@/components/loaders/DisplayCommunitySkeletonLoader';
import TabNavigation from '@/components/ui/tab-navigation';
import { RelevantCommunities } from '@/constants/dummyData';
import useStore from '@/hooks/useStore';
import { useAuthStore } from '@/stores/authStore';

import CommunityRules, { CommunityRulesSkeleton } from './CommunityRules';
import CommunityStats, { CommunityStatsSkeleton } from './CommunityStats';
import DisplayCommunity from './DisplayCommunity';

// Todo: Fix the issue of accessToken for non-logged in users (Important)

const Community = ({ params }: { params: { slug: string } }) => {
  const accessToken = useStore(useAuthStore, (state) => state.accessToken);

  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  const communityQuery = useCommunitiesApiGetCommunity(params.slug, {
    query: {
      enabled: !!accessToken,
    },
    request: axiosConfig,
  });

  const articlesQuery = useCommunitiesApiPostsGetCommunityArticles(
    communityQuery.data?.data.id || 0,
    {},
    {
      query: {
        enabled: !!accessToken && !!communityQuery.data,
      },
      request: axiosConfig,
    }
  );

  const { data, error, isPending, refetch } = communityQuery;
  const { data: articlesData, error: articlesError, isPending: articlesIsPending } = articlesQuery;

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  useEffect(() => {
    if (articlesError) {
      toast.error(`${articlesError.response?.data.message}`);
    }
  }, [articlesError]);

  const tabs = [
    {
      title: 'Articles',
      content: (
        <div className="space-y-2">
          <SearchBar />
          <div className="flex flex-col space-y-4">
            {articlesIsPending &&
              Array.from({ length: 5 }, (_, index) => <ArticleCardSkeleton key={index} />)}
            {articlesData && articlesData.data.length === 0 && (
              <p className="text-center text-gray-500">No articles found</p>
            )}
            {articlesData &&
              articlesData.data.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  abstract={article.abstract}
                  authors={article.authors.map((author) => author.label).join(', ')}
                  community={'Community'}
                  tags={article.keywords.map((keyword) => keyword.label)}
                  ratings={0}
                  comments={0}
                  discussions={0}
                  imageUrl={article.article_image_url || 'https://picsum.photos/200/200'}
                  slug={article.slug}
                />
              ))}
          </div>
        </div>
      ),
    },
    {
      title: 'About',
      content: (
        <div className="flex flex-col space-y-4">
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra, erat vitae
            condimentum luctus, velit purus lacinia nunc, id suscipit mi purus et odio. Vestibulum
            ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed
            convallis, neque in placerat egestas, libero diam finibus turpis, a ultricies justo
            tortor nec purus. Sed convallis, neque in placerat egestas, libero diam finibus turpis,
            a ultricies justo tortor nec purus. Sed convallis, neque in placerat egestas, libero
            diam finibus turpis, a ultricies justo tortor nec purus.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto flex flex-col space-y-2 p-4">
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          {isPending && <DisplayCommunitySkeletonLoader />}
          {data && (
            <DisplayCommunity
              communityId={data.data.id}
              profileImage={data.data.profile_pic_url || '/auth/register.png'}
              coverImage="/auth/register.png"
              communityName={data.data.name}
              description={data.data.description}
              members={200}
              articlesPublished={10}
              is_admin={data.data.is_admin}
              is_member={data.data.is_member}
              refetch={refetch}
              join_request_status={data.data.join_request_status}
            />
          )}
        </div>
        <div className="flex flex-col gap-2 p-2 md:w-1/3">
          {isPending && (
            <>
              <CommunityStatsSkeleton />
              <CommunityRulesSkeleton />
            </>
          )}

          {data && (
            <>
              <CommunityStats
                members={data.data.num_members}
                articlesPublished={data.data.num_published_articles}
                moderators={data.data.num_moderators}
                reviewers={data.data.num_reviewers}
                articlesReviewed={data.data.num_articles}
              />
              {data.data.rules.length === 0 ? (
                <div className="rounded-md bg-white p-6 shadow-md">
                  <h2 className="mb-4 text-xl font-semibold">No Rules</h2>
                  <p className="text-gray-700">Rules have not been set for this community.</p>
                </div>
              ) : (
                <CommunityRules rules={data.data.rules} />
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          <TabNavigation tabs={tabs} />
        </div>
        <div className="p-2 md:w-1/3">
          <div className="rounded-md bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Relevant Communities</h2>
            <div className="flex flex-col gap-8">
              {RelevantCommunities.map((community, index) => (
                <CommunityHighlightCard
                  key={index}
                  image={community.image}
                  description={community.description}
                  members={community.members}
                  articlesPublished={community.articlesPublished}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
