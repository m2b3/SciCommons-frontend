import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { FileText, Users } from 'lucide-react';

import { CommunityOut } from '@/api/schemas';
import useIdenticon from '@/hooks/useIdenticons';

interface CommunityCardProps {
  community: CommunityOut;
}

const CommunityCard: FC<CommunityCardProps> = ({ community }) => {
  const imageData = useIdenticon(60);

  return (
    <div className="flex flex-col items-start rounded-lg border border-gray-200 bg-white-secondary p-4 shadow-sm res-text-xs sm:flex-row">
      <div className="relative mb-4 h-16 w-16 flex-shrink-0 sm:mb-0 sm:mr-4">
        <Image
          src={community.profile_pic_url || `data:image/svg+xml;utf8,${imageData}`}
          alt={community.name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/community/${encodeURIComponent(community.name)}`}>
          <h3 className="mb-2 truncate font-bold text-gray-900 res-text-base hover:underline">
            {community.name}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-gray-600">{community.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-gray-500">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>{community.num_members} Members</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            <span>Published {community.num_articles} Articles</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;

export const CommunityCardSkeleton: FC = () => {
  return (
    <div className="flex flex-col items-start rounded-lg border border-gray-200 bg-white-secondary p-4 shadow-sm sm:flex-row">
      <div className="mb-4 h-16 w-16 flex-shrink-0 rounded-full bg-gray-300 sm:mb-0 sm:mr-4"></div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 h-6 w-48 rounded bg-gray-300"></div>
        <div className="mb-4 h-4 w-full rounded bg-gray-300"></div>
        <div className="mb-4 h-4 w-5/6 rounded bg-gray-300"></div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300"></div>
            <div className="h-4 w-24 rounded bg-gray-300"></div>
          </div>
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300"></div>
            <div className="h-4 w-36 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
