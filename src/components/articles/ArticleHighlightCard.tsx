import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { MessageCircle, Star } from 'lucide-react';

import { ArticleBasicOut } from '@/api/schemas';
import useIdenticon from '@/hooks/useIdenticons';

interface ArticleHighlightCardProps {
  article: ArticleBasicOut;
}

const ArticleHighlightCard: FC<ArticleHighlightCardProps> = ({ article }) => {
  const imageData = useIdenticon(40);

  return (
    <div className="overflow-hidden rounded-lg bg-white transition-all dark:bg-gray-800 dark:shadow-gray-700">
      <div className="flex items-center p-4">
        <div className="relative mr-4 h-12 w-12 flex-shrink-0">
          <Image
            src={article.article_image_url || `data:image/svg+xml;utf8,${imageData}`}
            alt={article.title}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/article/${article.slug}`}>
            <h4 className="mb-1 line-clamp-2 text-sm font-bold text-gray-800 hover:underline dark:text-gray-100">
              {article.title}
            </h4>
          </Link>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="mr-3 flex items-center">
              <MessageCircle size={14} className="mr-1" />
              <span>{article.total_discussions} discussions</span>
            </div>
            <div className="flex items-center">
              <Star size={14} className="mr-1" />
              <span>{article.total_reviews} reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleHighlightCard;

export const ArticleHighlightCardSkeleton: FC = () => {
  return (
    <div className="overflow-hidden rounded-lg bg-white dark:bg-gray-800">
      <div className="flex items-center p-4">
        <div className="mr-4 h-16 w-16 flex-shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="mb-2 h-4 w-full max-w-[10rem] animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};
