import React from 'react';

import Image from 'next/image';

import { CommunityBasicOut } from '@/api/schemas';

interface CommunityHighlightCardProps {
  community: CommunityBasicOut;
}

const CommunityHighlightCard: React.FC<CommunityHighlightCardProps> = ({ community }) => {
  return (
    <div className="flex items-start">
      <Image
        src={community.profile_pic_url || '/images/community-placeholder.png'}
        alt={community.name}
        width={32}
        height={32}
        className="mr-4 h-12 w-12 rounded-full"
      />
      <div>
        <p className="mb-1 text-gray-700">{community.name}</p>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">{community.total_members} Members</p>
          <p className="text-sm text-gray-500">
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
      <div className="mr-4 h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1">
        <div className="mb-1 h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center space-x-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};
