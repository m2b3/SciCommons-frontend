import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { FileText, Users } from 'lucide-react';

import { CommunityListOut } from '@/api/schemas';
import { cn } from '@/lib/utils';

import { Skeleton, TextSkeleton } from '../common/Skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// import { toast } from 'sonner';
// import { useCommunitiesApiJoinJoinCommunity } from '@/api/join-community/join-community';
// import { showErrorToast } from '@/lib/toastHelpers';
// import { useAuthStore } from '@/stores/authStore';

interface CommunityCardProps {
  community: CommunityListOut;
}

const CommunityCard: FC<CommunityCardProps> = ({ community }) => {
  // COMMENTED OUT BCOZ WE ARE NOT SHOWING JOIN BUTTON IN COMMUNITY CARD UNTIL AUTH IS FIXED.
  // const accessToken = useAuthStore((state) => state.accessToken);
  // const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  // const { mutate, data, isSuccess, error } = useCommunitiesApiJoinJoinCommunity({
  //   request: axiosConfig,
  // });

  // const handleJoin = () => {
  //   mutate({ communityId: community.id });
  // };

  // useEffect(() => {
  //   if (isSuccess) {
  //     toast.success(`${data.data.message}`);
  //   }
  //   if (error) {
  //     showErrorToast(error);
  //   }
  // }, [isSuccess, error, data]);

  return (
    <div className="relative flex h-full flex-col items-start gap-4 rounded-lg border border-common-contrast bg-common-cardBackground p-2.5 px-3.5 res-text-xs hover:shadow-md hover:shadow-common-minimal">
      {/* <div className="relative size-10 flex-shrink-0 sm:mr-4">
        <Image
          src={community.profile_pic_url || `data:image/png;base64,${imageData}`}
          alt={community.name}
          fill
          className="rounded-full object-cover"
        />
      </div> */}
      <div className="w-full flex-1 pb-2 sm:pb-0">
        <Link href={`/community/${encodeURIComponent(community.name)}`}>
          <h3 className="mb-2 truncate text-base font-bold text-text-primary hover:underline">
            {community.name}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-xs text-text-secondary">{community.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-text-secondary">
          <div className="flex items-center">
            <Users className="mr-1 h-3 w-3" />
            <span className="text-xxs">{community.num_members} Members</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-1 h-3 w-3" />
            <span className="text-xxs">{community.num_published_articles} Articles</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        {community.org === 'ashoka' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image width={24} height={32} src={'/images/ashoka-logo.png'} alt="Ashoka" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This community is part of Ashoka group</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <span
          className={cn('rounded-sm border px-2 py-1 !text-xxs font-normal capitalize', {
            'border-emerald-500 bg-emerald-500/10 text-emerald-500': community.type === 'public',
            'border-indigo-500 bg-indigo-500/10 text-indigo-500': community.type === 'private',
            'border-red-500 bg-red-500/10 text-red-500': community.type === 'hidden',
          })}
        >
          {community.type}
        </span>
      </div>
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
    <Skeleton className="flex rounded-lg border border-common-contrast bg-common-cardBackground p-3.5">
      <div className="flex-1">
        <TextSkeleton className="h-6 w-4/5" />
        <TextSkeleton className="mt-3 w-full" />
        <div className="mt-3 flex gap-8">
          <TextSkeleton className="h-3 w-24" />
          <TextSkeleton className="h-3 w-32" />
        </div>
      </div>
    </Skeleton>
  );
};
