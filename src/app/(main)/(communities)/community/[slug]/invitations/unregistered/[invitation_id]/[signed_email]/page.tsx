'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from 'zustand';

import {
  useCommunitiesApiInvitationGetCommunityInvitationDetails,
  useCommunitiesApiInvitationRespondToEmailInvitation,
} from '@/api/community-invitations/community-invitations';
import CommunityInvitationSkeletonLoader from '@/components/loaders/CommunityInvitationSkeletonLoader';
import { Button, ButtonTitle } from '@/components/ui/button';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

export default function UnRegisteredUsersInvitation({
  params,
}: {
  params: { slug: string; invitation_id: string; signed_email: string };
}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const imageData = useIdenticon(60);
  const [action, setAction] = useState<'accept' | 'reject'>('accept');
  const isAuthenticated = useStore(useAuthStore, (state) => state.isAuthenticated);
  const communityId = parseInt(params.slug);
  const invitationId = parseInt(params.invitation_id);

  const { data, error, isPending } = useCommunitiesApiInvitationGetCommunityInvitationDetails(
    communityId,
    invitationId,
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
      },
    }
  );

  const {
    mutate,
    isSuccess: isRespondSuccess,
    error: respondError,
    isPending: isRespondPending,
    data: respondData,
  } = useCommunitiesApiInvitationRespondToEmailInvitation({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (isRespondSuccess) {
      toast.success(respondData.data.message);
      if (action === 'accept') {
        router.push(`/community/${data?.data.name}`);
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
    mutate({ token: params.signed_email, data: { action: accept } });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-common-background p-4">
      <Image
        src={'/images/assets/gradient.webp'}
        fill
        alt=""
        className="z-0 opacity-10 invert dark:invert-0"
        quality={10}
      />
      <div className="relative flex w-full flex-col items-start gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-6 res-text-xs hover:shadow-md hover:shadow-common-minimal md:w-[520px]">
        {error && <div className="text-functional-red">{error.response?.data.message}</div>}
        {isPending && <CommunityInvitationSkeletonLoader />}
        {data && (
          <>
            <div className="relative size-10 flex-shrink-0 sm:mr-4">
              <Image
                // src={data.data.profile_pic_url || `data:image/png;base64,${imageData}`}
                src={`data:image/png;base64,${imageData}`}
                alt={data.data.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="w-full flex-1">
              <h3 className="mb-2 truncate font-bold text-text-primary res-text-base">
                {data.data.name}
              </h3>
              <p className="mb-4 line-clamp-2 text-base text-text-secondary">
                {data.data.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-text-secondary">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span className="text-xs">{data.data.num_members} Members</span>
                </div>
                {/* <div className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                <span className="text-xs">Published {community.num_articles} Articles</span>
              </div> */}
              </div>
            </div>
            <div className="flex space-x-4 self-end">
              <Button
                onClick={() =>
                  isAuthenticated ? handleAccept('accept') : router.push('/auth/login')
                }
                disabled={isRespondPending}
                type="button"
              >
                <ButtonTitle>
                  {isRespondPending && action === 'accept'
                    ? 'Loading...'
                    : isAuthenticated
                      ? 'Accept'
                      : 'Login to Accept'}
                </ButtonTitle>
              </Button>
              <Button
                onClick={() => handleAccept('reject')}
                disabled={isRespondPending}
                type="button"
                variant={'danger'}
              >
                <ButtonTitle>
                  {isRespondPending && action === 'reject' ? 'Loading...' : 'Reject'}
                </ButtonTitle>
              </Button>
            </div>
            {respondError && <p className="text-red-500">{respondError.response?.data.message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
