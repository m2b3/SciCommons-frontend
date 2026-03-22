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
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Tokenize article highlight card colors.
          Why: Ensure highlights inherit skin palettes.
          How: Replace gray utilities with semantic tokens. */}
      <div className="overflow-hidden rounded-lg text-text-primary transition-all">
        <div className="flex items-center p-4">
          <div className="relative mr-4 h-12 w-12 flex-shrink-0">
            <Image
              src={article.article_image_url || `data:image/png;base64,${imageData}`}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/article/${article.slug}`}>
              <h4 className="mb-1 line-clamp-2 font-bold text-text-primary res-text-sm hover:underline">
                {article.title}
              </h4>
            </Link>
            <div className="flex items-center text-text-tertiary res-text-xs">
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
    </>
  );
};

export default ArticleHighlightCard;

export const ArticleHighlightCardSkeleton: FC = () => {
  return (
    <div className="overflow-hidden rounded-lg bg-common-cardBackground">
      <div className="flex items-center p-4">
        <div className="mr-4 h-16 w-16 flex-shrink-0 animate-pulse rounded-full bg-common-minimal" />
        <div className="flex-1">
          <div className="mb-2 h-4 w-full max-w-[10rem] animate-pulse rounded-md bg-common-minimal" />
          <div className="h-3 w-20 animate-pulse rounded-md bg-common-minimal" />
        </div>
      </div>
    </div>
  );
};
