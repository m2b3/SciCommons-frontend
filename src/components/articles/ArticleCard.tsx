import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Star } from 'lucide-react';

import { ArticlesListOut } from '@/api/schemas';
import { cn } from '@/lib/utils';

import RenderParsedHTML from '../common/RenderParsedHTML';
import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';

interface ArticleCardProps {
  article: ArticlesListOut;
  forCommunity?: boolean;
  className?: string;
  /**
   * minimal: only title and ratings
   * default: title, submitted by, ratings and preview button
   * full: all fields
   */
  compactType?: 'minimal' | 'default' | 'full';
  handleArticlePreview?: (article: ArticlesListOut) => void;
}

const ArticleCard: FC<ArticleCardProps> = ({
  article,
  forCommunity,
  className,
  compactType = 'full',
  handleArticlePreview,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-common-contrast bg-common-cardBackground p-4 res-text-xs hover:shadow-md hover:shadow-common-minimal',
        className,
        {
          'border-none bg-transparent p-0 hover:shadow-none': compactType === 'minimal',
        }
      )}
      onClick={() => {
        if (compactType === 'default') {
          handleArticlePreview?.(article);
        }
      }}
    >
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
              contentClassName={cn(
                'line-clamp-2 text-wrap font-semibold text-text-primary res-text-lg hover:underline',
                {
                  'line-clamp-1 sm:text-base text-base':
                    compactType === 'minimal' || compactType === 'default',
                  'underline underline-text-tertiary hover:text-functional-green':
                    compactType === 'minimal',
                }
              )}
              containerClassName="mb-0"
            />
          </Link>
          {/* <p className="mt-2 line-clamp-2 overflow-hidden text-ellipsis text-wrap text-text-primary">
            {article.abstract}
          </p> */}
          {compactType === 'full' && (
            <RenderParsedHTML
              rawContent={article.abstract}
              supportLatex={true}
              supportMarkdown={false}
              contentClassName="mt-2 line-clamp-2 text-wrap text-xs text-text-primary"
              containerClassName="mb-0"
            />
          )}
          {compactType === 'full' && (
            <p className="mt-2 line-clamp-2 text-wrap text-xs text-text-secondary">
              Authors: {article.authors.map((author) => author.label).join(', ')}
            </p>
          )}
          {compactType === 'full' && article.community_article?.community.name && (
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
          {(compactType === 'full' || compactType === 'default') && (
            <p className="mt-1 text-xs text-text-secondary">
              Submitted By: {article.user.username}
            </p>
          )}
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
        {compactType !== 'minimal' && article.article_image_url && (
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
      {compactType === 'default' && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center rounded-md border border-common-minimal py-1 pl-0 pr-1.5">
            <Star className="h-3.5 text-functional-yellow" fill="currentColor" />
            <span className="text-xs text-text-secondary">{article.total_ratings}</span>
          </div>
          {/* <Button variant="outline" className='px-2 py-1' onClick={(e) => {
            e.preventDefault();
            handleArticlePreview?.(article);
          }}>
            <ButtonTitle className='sm:text-xs text-text-tertiary'>
              Preview
            </ButtonTitle>
          </Button> */}
          {/* <ArticlePreviewDrawer article={article} /> */}
          {/* <div className="flex items-center">
          <MessageSquare className="h-3.5 text-text-secondary" />
          <span className="text-xs text-text-secondary">{article.total_comments} comments</span>
        </div>
        <div className="flex items-center">
          <User className="h-3.5 text-text-secondary" />
          <span className="text-xs text-text-secondary">
            {article.total_discussions} discussions
          </span>
        </div> */}
        </div>
      )}
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
