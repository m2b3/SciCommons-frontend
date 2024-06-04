import { FC } from 'react';

import Image from 'next/image';

interface ArticleHighlightCardProps {
  imageUrl: string;
  title: string;
  likes: string;
  reviews: string;
}

const ArticleHighlightCard: FC<ArticleHighlightCardProps> = ({
  imageUrl,
  title,
  likes,
  reviews,
}) => {
  return (
    <div className="mb-4 flex items-center">
      <div className="mr-4 h-16 w-16 overflow-hidden rounded-full">
        <Image src={imageUrl} alt={title} width={64} height={64} className="rounded-full" />
      </div>
      <div>
        <h4 className="text-sm font-bold">{title}</h4>
        <div className="text-sm text-gray-500">
          <span>{likes} likes</span> | <span>{reviews} reviews</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleHighlightCard;
