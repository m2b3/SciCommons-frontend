'use client';

import { FC, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Play, Star, User } from 'lucide-react';

import { ArticleOut } from '@/api/schemas';
import ArticlePreview from '@/components/articles/ArticlePreview';

import RenderParsedHTML from '../common/RenderParsedHTML';
import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';
import { Drawer, DrawerContent } from '../ui/drawer';

interface ArticleCardProps {
  article: ArticleOut;
  forCommunity?: boolean;
  isCompact?: boolean;
}

const ArticleCard: FC<ArticleCardProps> = ({ article, forCommunity, isCompact = false }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-common-contrast bg-common-cardBackground py-2 pl-2 pr-4 res-text-xs hover:shadow-md hover:shadow-common-minimal md:py-3 md:pl-4 md:pr-6">
      <div className="flex">
        <div className="min-w-0 flex-grow gap-4 pr-4">
          <Link
            href={
              forCommunity
                ? `/community/${article.community_article?.community.name}/articles/${article.slug}`
                : `/article/${article.slug}`
            }
          >
            {/* <h2 className="line-clamp-2 text-wrap font-semibold text-text-primary res-text-lg hover:underline">
              {article.title}
            </h2> */}
            <RenderParsedHTML
              rawContent={article.title}
              supportLatex={true}
              supportMarkdown={false}
              contentClassName="line-clamp-2 text-wrap font-semibold text-text-primary res-text-sm hover:underline"
              containerClassName="mb-0"
            />
          </Link>
          {/* <p className="mt-2 line-clamp-2 overflow-hidden text-ellipsis text-wrap text-text-primary">
            {article.abstract}
          </p> */}
          {/* <RenderParsedHTML
            rawContent={article.abstract}
            supportLatex={true}
            supportMarkdown={false}
            contentClassName="mt-2 line-clamp-2 text-wrap text-xs text-text-primary"
            containerClassName="mb-0"
          /> */}
          <p className="mt-2 line-clamp-2 text-wrap text-xs text-text-secondary">
            Authors: {article.authors.map((author) => author.label).join(', ')}
          </p>
          {article.community_article?.community.name && (
            <p className="mt-1 flex flex-wrap items-center text-xs text-text-secondary">
              <span className="whitespace-nowrap">Published Community/Journal:</span>
              <Link
                href={`/community/${article.community_article?.community.name}`}
                className="ml-1 text-functional-blue hover:underline"
              >
                <span className="whitespace-nowrap">
                  {article.community_article?.community.name}
                </span>
              </Link>
            </p>
          )}
          {/* <p className="mt-1 text-xs text-text-secondary">Submitted By: {article.user.username}</p> */}
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center">
          <Star className="h-3.5 text-functional-yellow" fill="currentColor" />
          <span className="text-xs text-text-secondary">
            {article.total_reviews >= 0 && `${article.total_ratings}`}
          </span>
        </div>
        {/* <div className="flex items-center">
          <MessageSquare className="h-3.5 text-text-secondary" />
          <span className="text-xs text-text-secondary">{article.total_comments} comments</span>
        </div> */}
        <div className="flex items-center">
          <User className="h-3.5 text-text-secondary" />
          <span className="text-xs text-text-secondary">
            {article.total_discussions} Discussions
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="group ml-auto flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-common-minimal"
        >
          <Play
            className="h-3.5 text-functional-yellow transition-transform duration-150 group-hover:scale-110"
            fill="currentColor"
          />
          <span className="text-xs text-text-secondary">Preview</span>
        </button>
      </div>
      <Drawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DrawerContent className="h-[50vh] p-0">
          <div className="h-full w-full overflow-y-auto px-3 pt-2 sm:px-4 sm:pt-3">
            <ArticlePreview article={article} />
          </div>
        </DrawerContent>
      </Drawer>
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
