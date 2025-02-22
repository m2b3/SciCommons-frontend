import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { MessageSquare, Star, User } from 'lucide-react';

import { ArticleOut } from '@/api/schemas';

import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';

interface ArticleCardProps {
  article: ArticleOut;
  forCommunity?: boolean;
}

const ArticleCard: FC<ArticleCardProps> = ({ article, forCommunity }) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-6 res-text-xs hover:shadow-md hover:shadow-common-minimal">
      <div className="flex">
        <div className="min-w-0 flex-grow gap-4 pr-4">
          <Link
            href={
              forCommunity
                ? `/community/${article.community_article?.community.name}/articles/${article.slug}`
                : `/article/${article.slug}`
            }
          >
            <h2 className="line-clamp-2 text-wrap font-semibold text-text-primary res-text-lg hover:underline">
              {article.title}
            </h2>
          </Link>
          <p className="mt-2 line-clamp-2 overflow-hidden text-ellipsis text-wrap text-text-primary">
            {article.abstract}
          </p>
          <p className="mt-2 text-text-secondary">
            Authors: {article.authors.map((author) => author.label).join(', ')}
          </p>
          <p className="mt-1 text-text-secondary">
            Published Community/Journal: {article.community_article?.community.name}
          </p>
          {/* <div className="mt-2 flex flex-wrap">
            {article.keywords.map((keyword, index) => (
              <span
                key={index}
                className="mb-2 mr-2 rounded bg-common-minimal px-2.5 py-0.5 font-medium text-gray-800"
              >
                {keyword}
              </span>
            ))}
          </div> */}
        </div>
        {article.article_image_url && (
          <div className="ml-4 flex-none">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40">
              <Image
                src={article.article_image_url}
                alt="Article Image"
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <Star className="h-5 w-5 text-functional-yellow" />
          <span className="ml-1 text-text-secondary">{article.total_reviews} ratings</span>
        </div>
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-text-secondary" />
          <span className="ml-1 text-text-secondary">{article.total_comments} comments</span>
        </div>
        <div className="flex items-center">
          <User className="h-5 w-5 text-text-secondary" />
          <span className="ml-1 text-text-secondary">{0} discussions</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;

export const ArticleCardSkeleton: React.FC = () => {
  return (
    <Skeleton className="flex flex-row items-start gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <div className="w-full space-y-2">
        <TextSkeleton className="h-6 w-3/4" />
        <TextSkeleton />
        <TextSkeleton />
        <TextSkeleton className="w-56" />
        <TextSkeleton className="w-3/4" />
        <div className="flex gap-4">
          {[...Array(3)].map((_, index) => (
            <TextSkeleton key={index} className="h-6 w-16" />
          ))}
        </div>
      </div>
      <BlockSkeleton className="aspect-square size-20 sm:size-24 md:size-32 lg:size-40" />
    </Skeleton>
  );
};
