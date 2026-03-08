'use client';

import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import {
  useCommunitiesApiJoinGetJoinRequests,
  useCommunitiesApiJoinManageJoinRequest,
} from '@/api/join-community/join-community';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

import RequestListItem, { RequestListItemSkeleton } from './RequestListItem';

type ActiveTab = 'Pending' | 'Approved';
type JoinRequestStatus = 'pending' | 'approved';

const Requests = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { data, error, isPending, refetch } = useCommunitiesApiJoinGetJoinRequests(
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

  const [activeTab, setActiveTab] = useState<ActiveTab>('Pending');

  /* Fixed by Codex on 2026-02-24
     Who: Fixed by Codex on 2026-02-24.
     What: Replaced the join-requests dropdown with shared pending/approved tabs.
     Why: Admins need actionable pending requests separated from approved history.
     How: Reused TabComponent and mapped each tab to a strict API status filter. */
  const tabStatusMap: Record<ActiveTab, JoinRequestStatus> = {
    Pending: 'pending',
    Approved: 'approved',
  };

  const handleAction = (id: number, action: 'approve' | 'reject', communityId: number) => {
    mutate({ communityId, joinRequestId: id, action });
  };

  const filteredItems = data?.data.filter((item) => item.status === tabStatusMap[activeTab]);

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
      <div className="mb-4 flex flex-col gap-3">
        <h2 className="font-bold text-text-primary res-heading-xs">Join Requests</h2>
        <div className="self-start">
          <TabComponent<ActiveTab>
            tabs={['Pending', 'Approved']}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {isPending &&
          Array.from({ length: 3 }).map((_, index) => <RequestListItemSkeleton key={index} />)}
        {filteredItems && filteredItems.length === 0 && (
          <p className="text-text-secondary res-text-xs">
            {activeTab === 'Pending'
              ? 'No pending join requests found'
              : 'No approved join requests found'}
          </p>
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
