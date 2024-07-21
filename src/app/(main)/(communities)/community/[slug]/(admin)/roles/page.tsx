'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import { useCommunitiesMembersApiGetCommunityMembers } from '@/api/community-members/community-members';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

import UsersListItem from './UsersListItem';

type ActiveTab = 'Members' | 'Moderators' | 'Reviewers' | 'Admins';

// Todo: 1. Replace profile picture with actual profile picture
// Todo: 2. Optimize the code to reduce the number of lines
const Roles: React.FC = () => {
  const params = useParams<{ slug: string }>();

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Members');

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error, isPending, refetch } = useCommunitiesMembersApiGetCommunityMembers(
    params.slug,
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
        <div className="my-4 flex flex-col">
          {isPending &&
            Array.from({ length: 2 }).map((_, index) => <UsersListItemSkeleton key={index} />)}
          {data && data.data.members.length === 0 && (
            <p className="bg-white p-4 text-gray-500 shadow">No members exist in this community.</p>
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
                reviewedArticles={item.articles_published}
                submittedArticles={item.articles_published}
                profilePicture={item.profile_pic_url}
                activeTab={activeTab}
                userId={item.id}
                refetch={refetch}
              />
            ))}
        </div>
      )}
      {data && activeTab === 'Moderators' && (
        <div className="my-4 flex flex-col">
          {isPending &&
            Array.from({ length: 2 }).map((_, index) => <UsersListItemSkeleton key={index} />)}
          {data && data.data.moderators.length === 0 && (
            <p className="bg-white p-4 text-gray-500 shadow">
              No moderators exist in this community.
            </p>
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
                reviewedArticles={item.articles_published}
                submittedArticles={item.articles_published}
                profilePicture={item.profile_pic_url}
                activeTab={activeTab}
                userId={item.id}
                refetch={refetch}
              />
            ))}
        </div>
      )}
      {data && activeTab === 'Reviewers' && (
        <div className="my-4 flex flex-col">
          {isPending &&
            Array.from({ length: 2 }).map((_, index) => <UsersListItemSkeleton key={index} />)}
          {data && data.data.reviewers.length === 0 && (
            <p className="bg-white p-4 text-gray-500 shadow">
              No reviewers exist in this community.
            </p>
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
                reviewedArticles={item.articles_published}
                submittedArticles={item.articles_published}
                profilePicture={item.profile_pic_url}
                activeTab={activeTab}
                userId={item.id}
                refetch={refetch}
              />
            ))}
        </div>
      )}
      {data && activeTab === 'Admins' && (
        <div className="my-4 flex flex-col">
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
                submittedArticles={item.articles_published}
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

export default Roles;

const UsersListItemSkeleton: React.FC = () => {
  return (
    <div className="mb-2 flex items-center justify-between rounded-md border bg-white p-4 shadow-md">
      <div className="flex items-center">
        <div className="mr-4 h-12 w-12 animate-pulse rounded-full bg-gray-300"></div>
        <div>
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-300"></div>
          <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-300"></div>
          <div className="mt-2 flex items-center text-gray-500">
            <div className="mr-4 flex items-center">
              <div className="mr-1 h-4 w-4 animate-pulse rounded-full bg-gray-300"></div>
              <div className="h-3 w-20 animate-pulse rounded bg-gray-300"></div>
            </div>
            <div className="flex items-center">
              <div className="mr-1 h-4 w-4 animate-pulse rounded-full bg-gray-300"></div>
              <div className="h-3 w-20 animate-pulse rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="w-16 animate-pulse rounded-md bg-gray-300 px-4 py-2"></div>
        <div className="w-16 animate-pulse rounded-md bg-gray-300 px-4 py-2"></div>
      </div>
    </div>
  );
};
