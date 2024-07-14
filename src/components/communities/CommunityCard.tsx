import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { FileText, Users } from 'lucide-react';

interface CommunityCardProps {
  imageUrl: string;
  title: string;
  description: string;
  membersCount: number;
  articlesCount: number;
}

const CommunityCard: FC<CommunityCardProps> = ({
  imageUrl,
  title,
  description,
  membersCount,
  articlesCount,
}) => {
  return (
    <div className="flex flex-col items-start rounded-lg border border-gray-200 bg-white p-4 shadow-sm res-text-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
      <div className="relative mb-4 h-16 w-16 flex-shrink-0 sm:mb-0 sm:mr-4">
        <Image src={imageUrl} alt={title} fill className="rounded-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/community/${encodeURIComponent(title)}`}>
          <h3 className="mb-2 truncate font-bold text-gray-900 res-text-base hover:underline dark:text-gray-100">
            {title}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
        <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>{membersCount} Members</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            <span>Published {articlesCount} Articles</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;

export const CommunityCardSkeleton: FC = () => {
  return (
    <div className="flex flex-col items-start rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
      <div className="mb-4 h-16 w-16 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600 sm:mb-0 sm:mr-4"></div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 h-6 w-48 rounded bg-gray-300 dark:bg-gray-600"></div>
        <div className="mb-4 h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
        <div className="mb-4 h-4 w-5/6 rounded bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-4 w-36 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
