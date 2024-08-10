'use client';

import React, { useEffect } from 'react';

import { YooptaContentValue } from '@yoopta/editor';
import { toast } from 'sonner';

import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import SplitScreenLayout from '@/components/common/SplitScreenLayout';
import TabNavigation from '@/components/ui/tab-navigation';
import useStore from '@/hooks/useStore';
import { useAuthStore } from '@/stores/authStore';

import AssessmentsList from './AssessmentsList';
import CommunityAbout from './CommunityAbout';
import CommunityArticles from './CommunityArticles';
import CommunityRules, { CommunityRulesSkeleton } from './CommunityRules';
import CommunityStats, { CommunityStatsSkeleton } from './CommunityStats';
import DisplayCommunity, { DisplayCommunitySkeleton } from './DisplayCommunity';
import RelevantCommunities from './RelevantCommunities';

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
          content: <CommunityAbout about={data.data.about as YooptaContentValue} />,
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

  const LeftSide = (
    <>
      {isPending ? (
        <DisplayCommunitySkeleton />
      ) : (
        data && <DisplayCommunity community={data.data} refetch={refetch} />
      )}
      {data && (
        <div className="mt-4">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </>
  );

  const RightSide = (
    <>
      {isPending ? (
        <div className="flex flex-col gap-4 shadow-md dark:shadow-gray-700/50">
          <CommunityStatsSkeleton />
          <CommunityRulesSkeleton />
        </div>
      ) : (
        data && (
          <>
            <div className="mb-4">
              <CommunityStats community={data.data} />
            </div>
            {data.data.rules.length === 0 ? (
              <div className="mb-4 rounded-md border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-700/50">
                <h2 className="mb-4 text-xl font-semibold dark:text-gray-100">No Rules</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Rules have not been set for this community.
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <CommunityRules rules={data.data.rules} />
              </div>
            )}
            <RelevantCommunities communityId={data.data.id} />
          </>
        )
      )}
    </>
  );

  return (
    <div className="container mx-auto">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="p-4">
          {isPending ? (
            <DisplayCommunitySkeleton />
          ) : (
            data && <DisplayCommunity community={data.data} refetch={refetch} />
          )}
        </div>
        {data && (
          <>
            <div className="p-4">
              <TabNavigation tabs={tabs} />
            </div>
            <div className="p-4">
              <RelevantCommunities communityId={data.data.id} />
            </div>
          </>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <SplitScreenLayout
          leftSide={LeftSide}
          rightSide={RightSide}
          leftWidth="w-2/3"
          rightWidth="w-1/3"
        />
      </div>
    </div>
  );
};

export default Community;
