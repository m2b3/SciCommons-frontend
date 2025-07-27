import { FC, useEffect } from 'react';

import Link from 'next/link';

import { FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useCommunitiesApiJoinJoinCommunity } from '@/api/join-community/join-community';
import { CommunityOut } from '@/api/schemas';
// import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import { Skeleton, TextSkeleton } from '../common/Skeleton';

interface CommunityCardProps {
  community: CommunityOut;
}

const CommunityCard: FC<CommunityCardProps> = ({ community }) => {
  // const imageData = useIdenticon(60);

  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { mutate, data, isSuccess, error } = useCommunitiesApiJoinJoinCommunity({
    request: axiosConfig,
  });

  const handleJoin = () => {
    mutate({ communityId: community.id });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(`${data.data.message}`);
    }
    if (error) {
      showErrorToast(error);
    }
  }, [isSuccess, error, data]);

  return (
    <div className="relative flex h-full flex-col items-start gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4 res-text-xs hover:shadow-md hover:shadow-common-minimal">
      {/* <div className="relative size-10 flex-shrink-0 sm:mr-4">
        <Image
          src={community.profile_pic_url || `data:image/png;base64,${imageData}`}
          alt={community.name}
          fill
          className="rounded-full object-cover"
        />
      </div> */}
      <div className="w-full flex-1 pb-4 sm:pb-0">
        <Link href={`/community/${encodeURIComponent(community.name)}`}>
          <h3 className="mb-2 truncate font-bold text-text-primary res-text-base hover:underline">
            {community.name}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm text-text-secondary">{community.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-text-secondary">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span className="text-xs">{community.num_members} Members</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            <span className="text-xs">{community.num_published_articles} Articles</span>
          </div>
        </div>
      </div>
      <span
        className={cn(
          'rounded-tab absolute bottom-0 right-4 px-2 pb-0.5 pt-1 text-xs font-normal capitalize text-white',
          {
            'bg-emerald-600 dark:bg-emerald-900': community.type === 'public',
            'bg-purple-600 dark:bg-purple-900': community.type === 'private',
            'bg-rose-600 dark:bg-rose-900': community.type === 'hidden',
          }
        )}
      >
        {community.type}
      </span>
      {/* Enable this when auth is fixed. Handle cases for logged in and logged out users. */}
      {/* <div className="absolute right-6 top-6 flex gap-4">
        {community.is_admin && (
          <>
            <Button className="bg-black hover:bg-black">
              <ButtonTitle className="text-white">Admin</ButtonTitle>
            </Button>
          </>
        )}
        {!community.is_admin && community.is_member && (
          <>
            <Button className="cursor-default bg-transparent ring-1 ring-common-contrast hover:bg-transparent">
              <ButtonIcon>
                <UserCheck className="size-4 text-text-secondary" />
              </ButtonIcon>
              <ButtonTitle className="text-text-secondary">Joined</ButtonTitle>
            </Button>
          </>
        )}
        {!community.is_admin &&
          !community.is_member &&
          community.join_request_status === 'pending' && (
            <Button className="cursor-default bg-transparent ring-1 ring-common-contrast hover:bg-transparent">
              <ButtonIcon>
                <Check className="size-4 text-text-secondary" />
              </ButtonIcon>
              <ButtonTitle className="text-text-secondary">Requested</ButtonTitle>
            </Button>
          )}
        {!community.is_admin &&
          !community.is_member &&
          community.join_request_status !== 'pending' && (
            <Button
              className="w-fit bg-transparent ring-1 ring-common-contrast hover:bg-common-minimal"
              onClick={() => handleJoin()}
            >
              <ButtonIcon>
                <UserPlus className="size-3 text-text-secondary" />
              </ButtonIcon>
              <ButtonTitle className="text-text-secondary">Join</ButtonTitle>
            </Button>
          )}
      </div> */}
    </div>
  );
};

export default CommunityCard;

export const CommunityCardSkeleton: FC = () => {
  return (
    <Skeleton className="flex rounded-xl border border-common-contrast bg-common-cardBackground">
      <div className="flex-1">
        <TextSkeleton className="h-6 w-4/5" />
        <TextSkeleton className="mt-4 w-full" />
        <TextSkeleton className="mt-2 w-full" />
        <TextSkeleton className="mt-2 w-3/5" />
        <div className="mt-4 flex gap-8">
          <TextSkeleton className="w-24" />
          <TextSkeleton className="w-32" />
        </div>
      </div>
    </Skeleton>
  );
};
