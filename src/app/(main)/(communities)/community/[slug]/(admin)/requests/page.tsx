'use client';

import React, { use, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import {
  useCommunitiesApiJoinGetJoinRequests,
  useCommunitiesApiJoinManageJoinRequest,
} from '@/api/join-community/join-community';
import { useAuthStore } from '@/stores/authStore';

import RequestListItem, { RequestListItemSkeleton } from './RequestListItem';

const Requests = (props: { params: Promise<{ slug: string }> }) => {
  const params = use(props.params);
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { data, error, isSuccess, isPending, refetch } = useCommunitiesApiJoinGetJoinRequests(
    params?.slug || '',
    {
      query: { enabled: !!accessToken },
      request: axiosConfig,
    }
  );

  const {
    mutate,
    data: mutationData,
    isPending: isMutating,
    error: mutationError,
    isSuccess: isMutationSuccess,
  } = useCommunitiesApiJoinManageJoinRequest({ request: axiosConfig });

  const [filter, setFilter] = useState<string>('All');

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as 'All' | 'pending' | 'approved' | 'rejected');
  };

  const handleAction = (id: number, action: 'approve' | 'reject', communityId: number) => {
    mutate({ communityId, joinRequestId: id, action });
  };

  const filteredItems = data?.data.filter((item) => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  useEffect(() => {
    if (isSuccess) {
      //  setListItems(data.data.map((item) => ({ id: item.id, name: item.name, status: item.status, profilePicture: item.profilePicture }));
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  useEffect(() => {
    if (mutationError) {
      toast.error(`${mutationError.response?.data.message}`);
    }
  }, [mutationError]);

  useEffect(() => {
    if (isMutationSuccess) {
      toast.success(`${mutationData.data.message}`);
      refetch();
    }
  }, [isMutationSuccess, mutationData, refetch]);

  return (
    <div>
      <div className="rounded-lg bg-white-primary p-4 text-gray-900 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium res-heading-xs">Join Requests</h2>
          <select
            value={filter}
            onChange={handleFilterChange}
            className="block w-40 rounded-md border-gray-300 px-3 py-2 res-text-xs focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          >
            <option value="All">All</option>
            <option value="approved">Accepted</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex flex-col gap-4">
          {isPending &&
            Array.from({ length: 3 }).map((_, index) => <RequestListItemSkeleton key={index} />)}
          {filteredItems && filteredItems.length === 0 && (
            <p className="text-gray-500">No Join Requests found</p>
          )}
          {filteredItems &&
            filteredItems.map((item) => (
              <RequestListItem
                key={item.id}
                communityId={item.community_id}
                name={item.user.username}
                status={item.status}
                profilePicture={item.user.profile_pic_url || 'https://picsum.photos/200/200'}
                requestedAt={item.requested_at}
                handleAction={handleAction}
                isPending={isMutating}
                joinRequestId={item.id}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Requests, 'community', async (props) => {
  const params = await props.params;
  return params.slug;
});
