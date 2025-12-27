'use client';

import React, { useEffect } from 'react';

import dayjs from 'dayjs';
import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import { useCommunitiesMembersApiGetCommunityMembers } from '@/api/community-members/community-members';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

import UsersListItem from './UsersListItem';

type ActiveTab = 'Members' | 'Moderators' | 'Reviewers' | 'Admins';

// Todo: Optimize the code to reduce the number of lines
const Roles = ({ params }: { params: { slug: string } }) => {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Members');

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error, isPending, refetch } = useCommunitiesMembersApiGetCommunityMembers(
    params?.slug || '',
    {
      query: {
        enabled: !!accessToken,
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Members', 'Moderators', 'Reviewers', 'Admins']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {/* Todo: Reduce the number of lines of code */}
      {activeTab === 'Members' && (
        <div className="my-4 flex flex-col gap-4">
          {isPending &&
            Array.from({ length: 2 }).map((_, index) => <UsersListItemSkeleton key={index} />)}
          {data && data.data.members.length === 0 && (
            <p className="p-4 text-text-secondary">No members exist in this community.</p>
          )}
          {data &&
            data.data.members.map((item, index) => (
              <UsersListItem
                key={index}
                communityId={data.data.community_id}
                name={item.username}
                memberSince={
                  item.joined_at ? dayjs(item.joined_at).format('MMM D, YYYY') : 'Jun, 24'
                }
                reviewedArticles={item.articles_reviewed}
                submittedArticles={item.articles_submitted}
                profilePicture={item.profile_pic_url}
                activeTab={activeTab}
                userId={item.id}
                refetch={refetch}
              />
            ))}
        </div>
      )}
      {data && activeTab === 'Moderators' && (
        <div className="my-4 flex flex-col gap-4">
          {isPending &&
            Array.from({ length: 2 }).map((_, index) => <UsersListItemSkeleton key={index} />)}
          {data && data.data.moderators.length === 0 && (
            <p className="p-4 text-text-secondary">No moderators exist in this community.</p>
          )}
          {data &&
            data.data.moderators.map((item, index) => (
              <UsersListItem
                key={index}
                communityId={data.data.community_id}
                name={item.username}
                memberSince={
                  item.joined_at ? dayjs(item.joined_at).format('MMM D, YYYY') : 'Jun, 24'
                }
                reviewedArticles={item.articles_reviewed}
                submittedArticles={item.articles_submitted}
                profilePicture={item.profile_pic_url}
                activeTab={activeTab}
                userId={item.id}
                refetch={refetch}
              />
            ))}
        </div>
      )}
      {data && activeTab === 'Reviewers' && (
        <div className="my-4 flex flex-col gap-4">
          {isPending &&
            Array.from({ length: 2 }).map((_, index) => <UsersListItemSkeleton key={index} />)}
          {data && data.data.reviewers.length === 0 && (
            <p className="p-4 text-text-secondary">No reviewers exist in this community.</p>
          )}
          {data &&
            data.data.reviewers.map((item, index) => (
              <UsersListItem
                key={index}
                communityId={data.data.community_id}
                name={item.username}
                memberSince={
                  item.joined_at ? dayjs(item.joined_at).format('MMM D, YYYY') : 'Jun, 24'
                }
                reviewedArticles={item.articles_reviewed}
                submittedArticles={item.articles_submitted}
                profilePicture={item.profile_pic_url}
                activeTab={activeTab}
                userId={item.id}
                refetch={refetch}
              />
            ))}
        </div>
      )}
      {data && activeTab === 'Admins' && (
        <div className="my-4 flex flex-col gap-4">
          {isPending &&
            Array.from({ length: 2 }).map((_, index) => <UsersListItemSkeleton key={index} />)}
          {data &&
            data.data.admins.map((item, index) => (
              <UsersListItem
                key={index}
                communityId={data.data.community_id}
                name={item.username}
                memberSince={
                  item.joined_at ? dayjs(item.joined_at).format('MMM D, YYYY') : 'Jun 8, 2024'
                }
                reviewedArticles={item.articles_published}
                submittedArticles={item.articles_submitted}
                profilePicture={item.profile_pic_url}
                activeTab={activeTab}
                userId={item.id}
                refetch={refetch}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default withAuth(Roles, 'community', (props) => props.params.slug);

const UsersListItemSkeleton: React.FC = () => {
  return (
    <Skeleton className="mb-4 flex flex-row gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <BlockSkeleton className="aspect-square size-12 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <TextSkeleton className="w-24" />
        <TextSkeleton className="w-56" />
        <TextSkeleton className="mt-2 w-32" />
      </div>
    </Skeleton>
  );
};
