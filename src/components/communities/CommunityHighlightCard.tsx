import React from 'react';

import Image from 'next/image';

interface CommunityHighlightCardProps {
  image: string;
  description: string;
  members: string;
  articlesPublished: number;
}

const CommunityHighlightCard: React.FC<CommunityHighlightCardProps> = ({
  image,
  description,
  members,
  articlesPublished,
}) => {
  return (
    <div className="flex items-start">
      <Image
        src={image}
        alt="Community"
        width={64}
        height={64}
        className="mr-4 h-16 w-16 rounded-full"
      />
      <div>
        <p className="mb-1 text-gray-700">{description}</p>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">{members} Members</p>
          <p className="text-sm text-gray-500">{articlesPublished} Articles Published</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityHighlightCard;
