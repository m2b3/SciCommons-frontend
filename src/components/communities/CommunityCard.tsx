import { FC, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Bookmark, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';

import { BookmarkContentTypeEnum } from '@/api/schemas';
import { CommunityListOut } from '@/api/schemas';
import { useUsersCommonApiToggleBookmark } from '@/api/users-common-api/users-common-api';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import RenderParsedHTML from '../common/RenderParsedHTML';
import { Skeleton, TextSkeleton } from '../common/Skeleton';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// NOTE(bsureshkrishna, 2026-02-07): Community cards gained bookmark support,
// slug-based routing, and sanitized description rendering vs baseline 5271498.
// import { useCommunitiesApiJoinJoinCommunity } from '@/api/join-community/join-community';

interface CommunityCardProps {
  community: CommunityListOut;
  roleBadges?: CommunityRoleBadge[];
  showMemberBadge?: boolean;
  accessIndicator?: CommunityAccessIndicator;
}

export interface CommunityRoleBadge {
  code: 'A' | 'M' | 'R';
  label: 'Admin' | 'Moderator' | 'Reviewer';
}

export interface CommunityAccessIndicator {
  tone: 'public' | 'private';
  label: string;
}

const roleBadgeClassByCode: Record<CommunityRoleBadge['code'], string> = {
  A: 'border-functional-yellow/60 bg-functional-yellow/10 text-functional-yellow',
  M: 'border-functional-green/60 bg-functional-green/10 text-functional-green',
  R: 'border-functional-blue/60 bg-functional-blue/10 text-functional-blue',
};

const accessIndicatorClassByTone: Record<CommunityAccessIndicator['tone'], string> = {
  public: 'bg-functional-green',
  private: 'bg-functional-red',
};

const CommunityCard: FC<CommunityCardProps> = ({
  community,
  roleBadges = [],
  showMemberBadge = false,
  accessIndicator,
}) => {
  // COMMENTED OUT BCOZ WE ARE NOT SHOWING JOIN BUTTON IN COMMUNITY CARD UNTIL AUTH IS FIXED.
  const accessToken = useAuthStore((state) => state.accessToken);
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

  const [isBookmarked, setIsBookmarked] = useState(community.is_bookmarked ?? false);

  // Sync bookmark state when community data changes (e.g., after auth state changes)
  useEffect(() => {
    if (community.is_bookmarked !== undefined && community.is_bookmarked !== null) {
      setIsBookmarked(community.is_bookmarked);
    }
  }, [community.is_bookmarked]);

  const { mutate: toggleBookmark, isPending } = useUsersCommonApiToggleBookmark({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onMutate: () => {
        // Optimistically update the UI
        setIsBookmarked((prev) => !prev);
      },
      onSuccess: (response) => {
        // Sync with server response
        setIsBookmarked(response.data.is_bookmarked);
      },
      onError: (error) => {
        // Revert optimistic update on error
        setIsBookmarked((prev) => !prev);
        showErrorToast(error);
      },
    },
  });

  const handleBookmarkToggle = () => {
    if (!accessToken) {
      toast.error('Please login to bookmark communities');
      return;
    }

    toggleBookmark({
      data: {
        content_type: BookmarkContentTypeEnum.communitiescommunity,
        object_id: community.id,
      },
    });
  };

  const topRightMarkerLabels = [
    ...roleBadges.map((badge) => badge.label),
    ...(showMemberBadge ? ['Member'] : []),
    ...(accessIndicator ? [accessIndicator.label] : []),
  ];
  const hasTopRightMarkers = topRightMarkerLabels.length > 0;

  return (
    <div className="relative flex h-full flex-col items-start gap-4 rounded-lg border border-common-contrast bg-common-cardBackground p-2.5 px-3.5 res-text-xs hover:shadow-md hover:shadow-common-minimal">
      {/* Fixed by Codex on 2026-02-23
          Who: Codex
          What: Added compact membership/access markers to community cards.
          Why: Communities and My Communities need quick role/access context without relying on color alone.
          How: Render tokenized top-right A/M/R/m badges and public/private access dots with explicit aria labels. */}
      {hasTopRightMarkers && (
        <div
          className="absolute right-2 top-2 flex items-center gap-1"
          role="group"
          aria-label={`Community status: ${topRightMarkerLabels.join(', ')}`}
        >
          {roleBadges.map((badge) => (
            <span
              key={badge.code}
              role="img"
              aria-label={badge.label}
              title={badge.label}
              className={cn(
                'inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold',
                roleBadgeClassByCode[badge.code]
              )}
            >
              {badge.code}
            </span>
          ))}
          {showMemberBadge && (
            <span
              role="img"
              aria-label="Member"
              title="Member"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-common-contrast bg-common-minimal text-[10px] font-semibold text-text-secondary"
            >
              m
            </span>
          )}
          {accessIndicator && (
            <span
              role="img"
              aria-label={accessIndicator.label}
              title={accessIndicator.label}
              className={cn(
                'inline-flex h-3 w-3 rounded-full ring-2 ring-common-cardBackground',
                accessIndicatorClassByTone[accessIndicator.tone]
              )}
            >
              <span className="sr-only">{accessIndicator.label}</span>
            </span>
          )}
        </div>
      )}
      {/* <div className="relative size-10 flex-shrink-0 sm:mr-4">
        <Image
          src={community.profile_pic_url || `data:image/png;base64,${imageData}`}
          alt={community.name}
          fill
          className="rounded-full object-cover"
        />
      </div> */}
      <div className={cn('w-full flex-1 pb-2 sm:pb-0', hasTopRightMarkers && 'pr-20')}>
        <Link href={`/community/${encodeURIComponent(community.name)}`}>
          <h3 className="mb-2 truncate text-base font-bold text-text-primary hover:underline">
            {community.name}
          </h3>
        </Link>
        <RenderParsedHTML
          rawContent={(community.description || '').split(/\n\s*#{1,6}\s+/)[0] || ''}
          supportMarkdown={true}
          supportLatex={false}
          containerClassName="mb-3"
          contentClassName="line-clamp-2 text-xs text-text-secondary"
        />
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
                {/* Fixed by Codex on 2026-02-15
                    Who: Codex
                    What: Make org badges focusable for tooltip access.
                    Why: Images alone are not keyboard focusable.
                    How: Wrap the logo in a button with an aria-label. */}
                <button type="button" aria-label="Ashoka community">
                  <Image width={24} height={32} src={'/images/ashoka-logo.png'} alt="Ashoka" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This community is part of Ashoka group</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <span
          className={cn('rounded-sm border px-2 py-1 !text-xxs font-normal capitalize', {
            /* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Tokenize community type badges.
               Why: Ensure badges respond to UI skin changes.
               How: Replace emerald/indigo/red utilities with functional tokens. */
            'border-functional-green bg-functional-green/10 text-functional-green':
              community.type === 'public',
            'border-functional-blue bg-functional-blue/10 text-functional-blue':
              community.type === 'private',
            'border-functional-red bg-functional-red/10 text-functional-red':
              community.type === 'hidden',
          })}
        >
          {community.type}
        </span>
        <Button
          variant="transparent"
          size="xs"
          className="p-0"
          aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          aria-pressed={isBookmarked}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBookmarkToggle();
          }}
          disabled={isPending}
          withTooltip
          tooltipData={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          <Bookmark
            className={cn('size-4 transition-colors', {
              'fill-functional-yellow text-functional-yellow': isBookmarked,
              'text-text-tertiary hover:text-text-secondary': !isBookmarked,
            })}
          />
        </Button>
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
