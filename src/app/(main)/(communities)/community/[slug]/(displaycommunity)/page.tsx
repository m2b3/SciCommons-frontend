'use client';

import React, { useEffect } from 'react';

import toast from 'react-hot-toast';

import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import CommunityHighlightCard from '@/components/communities/CommunityHighlightCard';
import DisplayCommunitySkeletonLoader from '@/components/loaders/DisplayCommunitySkeletonLoader';
import TabNavigation from '@/components/ui/tab-navigation';
import { RelevantCommunities } from '@/constants/dummyData';
import useStore from '@/hooks/useStore';
import { useAuthStore } from '@/stores/authStore';

import AssessmentsList from './(moderators)/AssessmentsList';
import CommunityArticles from './CommunityArticles';
import CommunityRules, { CommunityRulesSkeleton } from './CommunityRules';
import CommunityStats, { CommunityStatsSkeleton } from './CommunityStats';
import DisplayCommunity from './DisplayCommunity';

// Todo: Fix the issue of accessToken for non-logged in users (Important)

const Community = ({ params }: { params: { slug: string } }) => {
  const accessToken = useStore(useAuthStore, (state) => state.accessToken);

  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  const communityQuery = useCommunitiesApiGetCommunity(params.slug, {
    request: axiosConfig,
  });

  const { data, error, isPending, refetch } = communityQuery;

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  const tabs = data
    ? [
        {
          title: 'Articles',
          content: <CommunityArticles communityId={data.data.id} />,
        },
        {
          title: 'About',
          content: (
            <div className="flex flex-col space-y-4">
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra, erat vitae
                condimentum luctus, velit purus lacinia nunc, id suscipit mi purus et odio.
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia
                curae; Sed convallis, neque in placerat egestas, libero diam finibus turpis, a
                ultricies justo tortor nec purus.
              </p>
            </div>
          ),
        },
        ...(data.data.is_moderator || data.data.is_reviewer
          ? [
              {
                title: 'Assessments',
                content: <AssessmentsList communityId={data.data.id} />,
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="container mx-auto flex flex-col space-y-2 p-4">
      <div className="flex flex-col md:flex-row">
        <div className="p-2 md:w-2/3">
          {isPending && <DisplayCommunitySkeletonLoader />}
          {data && <DisplayCommunity community={data.data} refetch={refetch} />}
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
              <CommunityStats community={data.data} />
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
      {data && (
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
      )}
    </div>
  );
};

export default Community;
