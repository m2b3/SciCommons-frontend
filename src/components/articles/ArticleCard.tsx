import { FC, memo, useMemo } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { TextAlignLeftIcon } from '@radix-ui/react-icons';
import { Star } from 'lucide-react';

import { ArticlesListOut } from '@/api/schemas';
import { cn } from '@/lib/utils';
import { useArticlesViewStore } from '@/stores/articlesViewStore';

import RenderParsedHTML from '../common/RenderParsedHTML';
import { Skeleton, TextSkeleton } from '../common/Skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

// Helper function to strip HTML tags and decode entities
const stripHTML = (html: string): string => {
  if (!html) return '';
  // Check if we're in a browser environment
  if (typeof document !== 'undefined') {
    // Create a temporary div to parse HTML and extract text
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }
  // Fallback for SSR: use regex to strip HTML tags
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

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

const ArticleCard: FC<ArticleCardProps> = memo(
  ({ article, forCommunity, className, compactType = 'full', handleArticlePreview }) => {
    const viewType = useArticlesViewStore((state) => state.viewType);

    // Memoize stripped HTML to avoid recalculating on every render
    const strippedTitle = useMemo(() => stripHTML(article.title), [article.title]);
    const strippedAbstract = useMemo(
      () => (article.abstract ? stripHTML(article.abstract) : null),
      [article.abstract]
    );

    return (
      <div
        className={cn(
          'group flex flex-row items-start gap-2 rounded-lg p-3 hover:bg-common-cardBackground',
          className,
          {
            'border-none bg-transparent p-2 hover:shadow-none': compactType === 'minimal',
          }
        )}
        onClick={() => {
          if (compactType === 'default') {
            handleArticlePreview?.(article);
          }
        }}
      >
        {compactType === 'default' && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex w-12 items-center justify-center rounded-md border border-common-minimal py-1 pl-0 pr-1.5">
              <Star className="h-3 text-functional-yellow" fill="currentColor" />
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
        <div className="flex w-full">
          <div className="w-full min-w-0 flex-grow gap-4">
            <Link
              href={
                forCommunity
                  ? `/community/${article.community_article?.community.name}/articles/${article.slug}`
                  : `/article/${article.slug}`
              }
              className="flex w-full flex-row items-center justify-between gap-2"
            >
              {/* <h2 className="line-clamp-2 text-wrap font-semibold text-text-primary res-text-lg hover:underline">
              {article.title}
            </h2> */}
              <RenderParsedHTML
                rawContent={article.title}
                supportLatex={true}
                supportMarkdown={false}
                contentClassName={cn(
                  'line-clamp-2 text-wrap font-semibold text-text-primary text-sm sm:text-sm md:text-sm lg:text-sm hover:underline',
                  {
                    'line-clamp-1 sm:text-sm text-sm':
                      compactType === 'minimal' || compactType === 'default',
                    'underline underline-text-tertiary hover:text-functional-green':
                      compactType === 'minimal',
                  }
                )}
                containerClassName="mb-0"
              />
              {compactType !== 'full' && viewType !== 'preview' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="hidden cursor-pointer opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                      }}
                    >
                      <TextAlignLeftIcon className="h-4 w-4 text-text-secondary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={8}
                    className="z-[1000] max-h-96 max-w-sm rounded-lg border-common-contrast bg-common-cardBackground p-3 shadow-lg"
                  >
                    <div className="max-h-[calc(24rem-1.5rem)] space-y-2 overflow-y-auto">
                      <h3 className="text-sm font-semibold text-text-primary">{strippedTitle}</h3>
                      {strippedAbstract && (
                        <p className="text-xs text-text-secondary">{strippedAbstract}</p>
                      )}
                      <p className="text-xs text-text-secondary">
                        Submitted By:{' '}
                        <span className="text-text-tertiary">{article.user.username}</span>
                      </p>
                      <p className="text-wrap text-xs text-text-secondary">
                        Authors:{' '}
                        <span className="text-text-tertiary">
                          {article.authors.map((author) => author.label).join(', ')}
                        </span>
                      </p>
                      <div className="flex w-fit items-center rounded-md border border-common-minimal py-1 pl-0 pr-1.5">
                        <Star className="h-3 text-functional-yellow" fill="currentColor" />
                        <span className="text-xs text-text-secondary">{article.total_ratings}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
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
              <p className="mt-1 text-xxs text-text-secondary">
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
      </div>
    );
  }
);

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;

export const ArticleCardSkeleton: FC = () => {
  return (
    <Skeleton className="flex flex-row items-start gap-2 overflow-hidden rounded-xl border-4 border-common-background bg-common-cardBackground p-3">
      <TextSkeleton className="h-6 w-11" />
      <div className="w-full space-y-1">
        <TextSkeleton className="h-6" />
        <TextSkeleton className="h-2 w-1/4" />
      </div>
    </Skeleton>
  );
};
