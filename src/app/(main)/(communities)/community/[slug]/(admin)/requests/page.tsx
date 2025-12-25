'use client';

import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import {
  useCommunitiesApiJoinGetJoinRequests,
  useCommunitiesApiJoinManageJoinRequest,
} from '@/api/join-community/join-community';
import { useAuthStore } from '@/stores/authStore';

import RequestListItem, { RequestListItemSkeleton } from './RequestListItem';

const Requests = ({ params }: { params: { slug: string } }) => {
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
    <div className="">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-text-primary res-heading-xs">Join Requests</h2>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="block w-40 rounded-md px-3 py-2 text-text-primary ring-1 ring-common-contrast res-text-xs focus:outline-none focus:ring-functional-green"
        >
          <option value="All" className="text-sm text-text-primary">
            All
          </option>
          <option value="approved" className="text-sm text-text-primary">
            Accepted
          </option>
          <option value="pending" className="text-sm text-text-primary">
            Pending
          </option>
          <option value="rejected" className="text-sm text-text-primary">
            Rejected
          </option>
        </select>
      </div>
      <div className="flex flex-col gap-4">
        {isPending &&
          Array.from({ length: 3 }).map((_, index) => <RequestListItemSkeleton key={index} />)}
        {filteredItems && filteredItems.length === 0 && (
          <p className="text-text-secondary res-text-xs">No Join Requests found</p>
        )}
        {filteredItems &&
          filteredItems.map((item) => (
            <RequestListItem
              key={item.id}
              communityId={item.community_id}
              name={item.user.username}
              status={item.status}
              profilePicture={item.user.profile_pic_url}
              requestedAt={item.requested_at}
              handleAction={handleAction}
              isPending={isMutating}
              joinRequestId={item.id}
            />
          ))}
      </div>
    </div>
  );
};

export default withAuth(Requests, 'community', (props) => props.params.slug);
