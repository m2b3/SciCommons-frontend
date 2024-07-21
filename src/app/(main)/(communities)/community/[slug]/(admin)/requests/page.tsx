'use client';

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  useCommunitiesApiJoinGetJoinRequests,
  useCommunitiesApiJoinManageJoinRequest,
} from '@/api/join-community/join-community';
import { useAuthStore } from '@/stores/authStore';

import RequestListItem, { RequestListItemSkeleton } from './RequestListItem';

const Requests = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  const params = useParams<{ slug: string }>();

  const { data, error, isSuccess, isPending, refetch } = useCommunitiesApiJoinGetJoinRequests(
    params.slug,
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
      <div className="rounded-lg bg-white p-4 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Join Requests</h2>
          <select
            value={filter}
            onChange={handleFilterChange}
            className="block w-40 rounded-md border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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

export default Requests;
