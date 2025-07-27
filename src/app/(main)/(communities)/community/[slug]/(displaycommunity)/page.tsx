'use client';

import React, { useEffect } from 'react';

import { CircleXIcon } from 'lucide-react';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import EmptyState from '@/components/common/EmptyState';
import TabNavigation from '@/components/ui/tab-navigation';
import useStore from '@/hooks/useStore';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import AssessmentsList from './AssessmentsList';
import CommunityArticles from './CommunityArticles';
import CommunityRules from './CommunityRules';
import DisplayCommunity, { DisplayCommunitySkeleton } from './DisplayCommunity';

const Community = ({ params }: { params: { slug: string } }) => {
  const accessToken = useStore(useAuthStore, (state) => state.accessToken);
  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  const communityQuery = useCommunitiesApiGetCommunity(params.slug, {
    request: axiosConfig,
    query: {
      enabled: !!accessToken,
    },
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
          content:
            data.data.type == 'private' && !data.data.is_member ? (
              <EmptyState
                logo={<CircleXIcon className="size-8 text-text-secondary" />}
                content="Join to Access"
                subcontent="This is a private community. Become a member to view and contribute."
              />
            ) : (
              <CommunityArticles communityId={data.data.id} />
            ),
        },
        // {
        //   title: 'About',
        //   content: <CommunityAbout about={data.data.about as YooptaContentValue} />,
        // },
        ...(data.data.rules || data.data.is_member
          ? [
              {
                title: 'Rules',
                content: <CommunityRules community={data.data} />,
              },
            ]
          : []),
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
    <div className="container h-fit p-4">
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
    </div>
  );
};

export default withAuthRedirect(Community, { requireAuth: true });
