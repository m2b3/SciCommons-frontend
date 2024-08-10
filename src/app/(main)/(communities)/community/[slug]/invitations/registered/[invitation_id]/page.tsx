'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Users } from 'lucide-react';
import { toast } from 'sonner';

import {
  useCommunitiesApiInvitationGetCommunityInvitationDetails,
  useCommunitiesApiInvitationRespondToInvitation,
} from '@/api/community-invitations/community-invitations';
import CommunityInvitationSkeletonLoader from '@/components/loaders/CommunityInvitationSkeletonLoader';
import { useAuthStore } from '@/stores/authStore';

export default function RegisteredUsersInvitation({
  params,
}: {
  params: { slug: string; invitation_id: string };
}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  const [action, setAction] = useState<'accept' | 'reject'>('accept');

  const communityId = isNaN(Number(params.slug)) ? -1 : Number(params.slug);
  const invitationId = isNaN(Number(params.invitation_id)) ? -1 : Number(params.invitation_id);

  const { data, error, isPending } = useCommunitiesApiInvitationGetCommunityInvitationDetails(
    communityId,
    invitationId,
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const {
    mutate,
    isSuccess: isRespondSuccess,
    error: respondError,
    isPending: isRespondPending,
    data: respondData,
  } = useCommunitiesApiInvitationRespondToInvitation({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error(error.response?.data.message || 'Failed to get invitation details');
    }
  }, [error]);

  useEffect(() => {
    if (isRespondSuccess) {
      toast.success(respondData.data.message);
      if (action === 'accept') {
        router.push(`/community/${communityId}`);
      } else {
        router.push('/communities');
      }
    }
  }, [isRespondSuccess, respondData, router, action, communityId]);

  useEffect(() => {
    if (respondError) {
      console.error(respondError);
      toast.error(respondError.response?.data.message || 'Failed to respond to invitation');
    }
  }, [respondError]);

  const handleAccept = (accept: 'accept' | 'reject') => {
    setAction(accept === 'accept' ? 'accept' : 'reject');
    mutate({ invitationId, data: { action: accept } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="flex max-w-md flex-col items-center space-y-4 rounded-lg bg-white p-6 shadow-lg">
        {error && <div className="text-red-500">{error.response?.data.message}</div>}
        {isPending && <CommunityInvitationSkeletonLoader />}
        {data && (
          <>
            <div className="">
              <Image
                className="rounded-full"
                src={data.data.profile_pic_url || '/auth/login.png'}
                alt={data.data.name || 'Community Profile Picture'}
                width={60}
                height={60}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold">{data?.data.name}</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="mr-1 h-4 w-4" />
                <span>{data.data.num_members} members</span>
              </div>
              <p className="mt-2 text-gray-600">{data.data.description}</p>
            </div>
            <div className="flex space-x-4 self-end">
              <button
                onClick={() => handleAccept('accept')}
                className="rounded-lg bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                disabled={isRespondPending}
              >
                {isRespondPending && action === 'accept' ? 'Loading...' : 'Accept'}
              </button>
              <button
                onClick={() => handleAccept('reject')}
                className="rounded-lg bg-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-400"
                disabled={isRespondPending}
              >
                {isRespondPending && action === 'reject' ? 'Loading...' : 'Reject'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
