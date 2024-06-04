import { FC } from 'react';

import Image from 'next/image';

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
        <h3 className="mb-2 text-lg font-bold">{title}</h3>
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
