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
    <div className="flex items-start rounded-lg border p-4 shadow-sm">
      <Image src={imageUrl} alt={title} width={64} height={64} className="mr-4 rounded-full" />
      <div className="flex-1">
        <Link href={`/community/${title}`}>
          <h3 className="mb-2 text-lg font-bold hover:underline">{title}</h3>
        </Link>
        <p className="mb-4 text-sm text-gray-600">{description}</p>
        <div className="flex items-center text-gray-500">
          <div className="mr-4 flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>{membersCount} Members</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            <span>Published {articlesCount} Articles so far</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;

export const CommunityCardSkeleton: FC = () => {
  return (
    <div className="flex animate-pulse items-start rounded-lg border p-4 shadow-sm">
      <div className="mr-4 h-16 w-16 rounded-full bg-gray-300"></div>
      <div className="flex-1">
        <div className="mb-2 h-6 w-48 rounded bg-gray-300"></div>
        <div className="mb-4 h-4 w-full rounded bg-gray-300"></div>
        <div className="mb-4 h-4 w-5/6 rounded bg-gray-300"></div>
        <div className="flex items-center text-gray-500">
          <div className="mr-4 flex items-center">
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
