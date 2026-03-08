import React from 'react';

import Link from 'next/link';

import { CommunityBasicOut } from '@/api/schemas';

interface CommunityHighlightCardProps {
  community: CommunityBasicOut;
}

const CommunityHighlightCard: React.FC<CommunityHighlightCardProps> = ({ community }) => {
  const encodedCommunityName = encodeURIComponent(community.name || '');

  return (
    <div className="flex items-start">
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Replace highlight card grays with semantic tokens.
          Why: Align community highlights with skin palettes.
          How: Swap gray utilities for text/background tokens. */}
      {/* <Image
        src={
          community.profile_pic_url
            ? community.profile_pic_url
            : `data:image/png;base64,${imageData}`
        }
        alt={community.name}
        width={32}
        height={32}
        className="mr-4 h-12 w-12 rounded-full"
      /> */}
      <div>
        <Link href={`/community/${encodedCommunityName}`}>
          <p className="mb-1 text-text-primary hover:underline">{community.name}</p>
        </Link>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-text-tertiary">{community.total_members} Members</p>
          <p className="text-sm text-text-tertiary">
            {community.total_published_articles} Articles Published
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityHighlightCard;

export const CommunityHighlightCardSkeleton: React.FC = () => {
  return (
    <div className="flex items-start">
      <div className="mr-4 h-12 w-12 animate-pulse rounded-full bg-common-minimal" />
      <div className="flex-1">
        <div className="mb-1 h-5 w-32 animate-pulse rounded bg-common-minimal" />
        <div className="flex items-center space-x-4">
          <div className="h-4 w-24 animate-pulse rounded bg-common-minimal" />
          <div className="h-4 w-32 animate-pulse rounded bg-common-minimal" />
        </div>
      </div>
    </div>
  );
};
