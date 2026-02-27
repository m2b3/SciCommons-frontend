import { FC, memo, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { TextAlignLeftIcon } from '@radix-ui/react-icons';
import { Bookmark, Star } from 'lucide-react';
import { toast } from 'sonner';

import { ArticlesListOut, BookmarkContentTypeEnum } from '@/api/schemas';
import { useUsersCommonApiToggleBookmark } from '@/api/users-common-api/users-common-api';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useArticlesViewStore } from '@/stores/articlesViewStore';
import { useAuthStore } from '@/stores/authStore';

import RenderParsedHTML from '../common/RenderParsedHTML';
import { Skeleton, TextSkeleton } from '../common/Skeleton';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import AbstractText from './AbstractText';

// NOTE(bsureshkrishna, 2026-02-07): Article cards gained bookmark toggles, preview hover,
// and community-aware routing/LaTeX title rendering relative to baseline 5271498.
interface ActionType {
  type: 'button';
  label: string;
  tooltipText?: string;
  variant: 'default' | 'danger' | 'blue' | 'gray' | 'transparent' | 'outline' | 'inverted';
  isLoading?: boolean;
  onClick: () => void;
}

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
  actions?: ActionType[];
}

const ArticleCard: FC<ArticleCardProps> = memo(
  ({ article, forCommunity, className, compactType = 'full', handleArticlePreview, actions }) => {
    const viewType = useArticlesViewStore((state) => state.viewType);
    const accessToken = useAuthStore((state) => state.accessToken);
    const encodedCommunityName = encodeURIComponent(
      article.community_article?.community.name || ''
    );

    const [isBookmarked, setIsBookmarked] = useState(article.is_bookmarked ?? false);
    const isPreviewClickable = compactType === 'default' && !!handleArticlePreview;

    // Sync bookmark state when article data changes (e.g., after auth state changes)
    useEffect(() => {
      if (article.is_bookmarked !== undefined && article.is_bookmarked !== null) {
        setIsBookmarked(article.is_bookmarked);
      }
    }, [article.is_bookmarked]);

    const { mutate: toggleBookmark, isPending } = useUsersCommonApiToggleBookmark({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onMutate: () => {
          // Optimistically update the UI
          setIsBookmarked((prev) => !prev);
        },
        onSuccess: (response) => {
          // Sync with server response
          setIsBookmarked(response.data.is_bookmarked);
        },
        onError: (error) => {
          // Revert optimistic update on error
          setIsBookmarked((prev) => !prev);
          showErrorToast(error);
        },
      },
    });

    const handleBookmarkToggle = () => {
      if (!accessToken) {
        toast.error('Please login to bookmark articles');
        return;
      }

      toggleBookmark({
        data: {
          content_type: BookmarkContentTypeEnum.articlesarticle,
          object_id: article.id,
        },
      });
    };

    return (
      <div
        className={cn(
          'group flex flex-row items-center gap-2 rounded-lg p-2.5 hover:bg-common-cardBackground',
          className,
          {
            'border-none bg-transparent p-2 hover:shadow-none': compactType === 'minimal',
          },
          isPreviewClickable &&
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/50'
        )}
        /* Fixed by Codex on 2026-02-15
           Who: Codex
           What: Make the preview card keyboard accessible.
           Why: Click-only preview cards are not focusable for keyboard users.
           How: Add role, tabIndex, and key handlers when the preview action is available. */
        role={isPreviewClickable ? 'button' : undefined}
        tabIndex={isPreviewClickable ? 0 : undefined}
        aria-label={isPreviewClickable ? 'Open article preview' : undefined}
        onClick={() => {
          if (isPreviewClickable) {
            handleArticlePreview?.(article);
          }
        }}
        onKeyDown={(event) => {
          if (!isPreviewClickable) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
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
          </div>
        )}
        <div className="flex w-full">
          <div className="w-full min-w-0 flex-grow gap-4">
            {/* Fixed by Claude Sonnet 4.5 on 2026-02-08
                Problem: Link extended full width even for short titles, making card hard to click
                Solution: Link uses inline-block (not flex-1) to only be as wide as title text
                Layout: flex container with justify-between pushes buttons to right, link stays minimal */}
            <div className="flex w-full flex-row items-center justify-between gap-2">
              <Link
                href={
                  forCommunity
                    ? `/community/${encodedCommunityName}/articles/${article.slug}`
                    : `/article/${article.slug}`
                }
                className="inline-block"
              >
                <RenderParsedHTML
                  rawContent={article.title}
                  supportLatex={true}
                  supportMarkdown={false}
                  contentClassName={cn(
                    `text-wrap font-semibold text-text-primary text-sm sm:text-sm md:text-sm lg:text-sm hover:underline`,
                    {
                      'line-clamp-2 text-xs sm:text-xs md:text-xs lg:text-xs':
                        compactType === 'minimal' || compactType === 'default',
                      'underline underline-text-tertiary hover:text-functional-green':
                        compactType === 'minimal',
                    }
                  )}
                  containerClassName="mb-0"
                />
              </Link>
              <div className="flex h-full flex-shrink-0 flex-col items-center justify-between gap-1">
                <Button
                  variant="transparent"
                  size="xs"
                  className="p-0"
                  aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  aria-pressed={isBookmarked}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    handleBookmarkToggle();
                  }}
                  disabled={isPending}
                  withTooltip
                  tooltipData={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                >
                  <Bookmark
                    className={cn('size-3.5 transition-colors', {
                      'fill-functional-yellow text-functional-yellow': isBookmarked,
                      'text-text-tertiary hover:text-text-secondary': !isBookmarked,
                    })}
                  />
                </Button>
                {(compactType !== 'full' || forCommunity) && viewType !== 'preview' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open abstract preview"
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
                        <RenderParsedHTML
                          rawContent={article.title}
                          supportLatex={true}
                          supportMarkdown={false}
                          contentClassName="text-sm font-semibold text-text-primary"
                          containerClassName="mb-0"
                        />
                        {/* Fixed by Codex on 2026-02-15
                            Who: Codex
                            What: Switched abstract rendering to the AbstractText wrapper.
                            Why: Preserve line breaks and avoid repeating RenderParsedHTML flags.
                            How: Use AbstractText with the existing clamp styling. */}
                        {article.abstract && (
                          <AbstractText
                            text={article.abstract}
                            className="line-clamp-4 text-xs text-text-secondary"
                            containerClassName="mb-0"
                          />
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
                          <span className="text-xs text-text-secondary">
                            {article.total_ratings}
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            {compactType === 'full' && (
              <AbstractText
                text={article.abstract}
                className={cn('mt-2 line-clamp-2 text-wrap text-xs text-text-primary')}
                containerClassName="mb-0"
              />
            )}
            {compactType === 'full' && (
              <p
                className={cn(
                  'mt-2 text-wrap text-xs text-text-secondary',
                  forCommunity ? 'line-clamp-1' : 'line-clamp-2'
                )}
              >
                Authors: {article.authors.map((author) => author.label).join(', ')}
              </p>
            )}

            {compactType === 'full' && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-xxs text-text-secondary">
                  Submitted By: {article.user.username}
                </p>
                {actions && actions.length > 0 && (
                  <div className="ml-auto flex items-center gap-2">
                    {actions.map((action) => (
                      <Button
                        variant={action.variant}
                        className="px-2 py-1"
                        size="xs"
                        loading={action.isLoading}
                        withTooltip
                        tooltipData={action.tooltipText}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          action.onClick();
                        }}
                        key={action.label}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
