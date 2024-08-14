'use client';

import React, { useEffect } from 'react';

import { YooptaContentValue } from '@yoopta/editor';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import SplitScreenLayout from '@/components/common/SplitScreenLayout';
import TabNavigation from '@/components/ui/tab-navigation';
import useStore from '@/hooks/useStore';
import { showErrorToast } from '@/lib/toastHelpers';
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
      showErrorToast(error);
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
        <div className="flex flex-col gap-4 shadow-md">
          <CommunityStatsSkeleton />
          <CommunityRulesSkeleton />
        </div>
      ) : (
        data && (
          <div className="flex flex-col gap-4">
            <CommunityStats community={data.data} />
            <CommunityRules community={data.data} />
            <RelevantCommunities communityId={data.data.id} />
          </div>
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

export default withAuthRedirect(Community, { requireAuth: true });
