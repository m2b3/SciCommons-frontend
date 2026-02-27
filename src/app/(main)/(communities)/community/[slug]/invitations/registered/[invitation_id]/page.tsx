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
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import CommunityInvitationSkeletonLoader from '@/components/loaders/CommunityInvitationSkeletonLoader';
import { showErrorToast } from '@/lib/toastHelpers';
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
      query: {
        enabled: !!accessToken,
      },
    }
  );
  const communityName = data?.data.name;

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
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (isRespondSuccess) {
      toast.success(respondData.data.message);
      if (action === 'accept') {
        router.push(
          communityName ? `/community/${encodeURIComponent(communityName)}` : '/communities'
        );
      } else {
        router.push('/communities');
      }
    }
  }, [isRespondSuccess, respondData, router, action, communityName]);

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

  /* Fixed by Codex on 2026-02-15
     Problem: Invitation flow used hard-coded gray/green/red utilities.
     Solution: Replace fixed colors with semantic tokens for surfaces, text, and actions.
     Result: Invitation UI now adapts to active skins. */
  return (
    <div className="flex min-h-screen items-center justify-center bg-common-background p-6">
      <div className="flex max-w-md flex-col items-center space-y-4 rounded-lg bg-common-cardBackground p-6 text-text-primary shadow-lg">
        {error && <div className="text-functional-red">{error.response?.data.message}</div>}
        {isPending && <CommunityInvitationSkeletonLoader />}
        {data && (
          <>
            <div className="">
              <Image
                className="rounded-full"
                // src={data.data.profile_pic_url || '/auth/login.png'}
                src={'/auth/login.png'}
                alt={data.data.name || 'Community Profile Picture'}
                width={60}
                height={60}
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold">{data?.data.name}</h2>
              <div className="flex items-center text-sm text-text-tertiary">
                <Users className="mr-1 h-4 w-4" />
                <span>{data.data.num_members} members</span>
              </div>
              <RenderParsedHTML
                rawContent={data.data.description || ''}
                supportMarkdown={true}
                supportLatex={false}
                containerClassName="mt-2 mb-0"
                contentClassName="text-text-secondary"
              />
            </div>
            <div className="flex space-x-4 self-end">
              <button
                onClick={() => handleAccept('accept')}
                className="rounded-lg bg-functional-green px-3 py-1 text-primary-foreground hover:bg-functional-greenContrast"
                disabled={isRespondPending}
              >
                {isRespondPending && action === 'accept' ? 'Loading...' : 'Accept'}
              </button>
              <button
                onClick={() => handleAccept('reject')}
                className="rounded-lg bg-common-contrast px-3 py-1 text-text-secondary hover:bg-common-heavyContrast"
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
