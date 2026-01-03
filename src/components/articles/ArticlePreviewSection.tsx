import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { ArrowRightIcon, Star } from 'lucide-react';

import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import { ArticlesListOut } from '@/api/schemas';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import InfiniteSpinnerAnimation from '../animations/InfiniteSpinnerAnimation';
import EmptyState from '../common/EmptyState';
import RenderParsedHTML from '../common/RenderParsedHTML';
import TruncateText from '../common/TruncateText';
import ReviewCard, { ReviewCardSkeleton } from './ReviewCard';

const ArticlePreviewSection = ({
  article,
  className,
  showReviews = false,
}: {
  article: ArticlesListOut | null;
  className?: string;
  showReviews?: boolean;
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [shouldLoadReviews, setShouldLoadReviews] = useState(false);
  const currentArticleIdRef = useRef<number | null>(null);

  const href = article?.community_article
    ? `/community/${article.community_article.community.name}/articles/${article.slug}`
    : `/article/${article?.slug}`;

  // Handle 1-second delay for loading reviews
  useEffect(() => {
    if (!showReviews || !article) {
      setShouldLoadReviews(false);
      currentArticleIdRef.current = null;
      return;
    }

    // Check if article has changed
    const articleId = article.id;
    if (currentArticleIdRef.current !== articleId) {
      // Article changed - reset everything
      setShouldLoadReviews(false);
      currentArticleIdRef.current = articleId;

      // Set timer to enable API call only after 1 second
      const timer = setTimeout(() => {
        // Double-check that we're still on the same article
        if (currentArticleIdRef.current === articleId) {
          setShouldLoadReviews(true);
        }
      }, 1000);

      // Cleanup timer if article changes before 1 second
      return () => {
        clearTimeout(timer);
      };
    }
  }, [article?.id, showReviews]);

  const communityId = article?.community_article?.community.id
    ? Number(article.community_article.community.id)
    : undefined;

  // API call will only execute when shouldLoadReviews is true (after 1 second delay)
  // AND we're still on the same article
  const isQueryEnabled =
    shouldLoadReviews &&
    !!accessToken &&
    !!article?.id &&
    !!communityId &&
    currentArticleIdRef.current === article?.id;

  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
  } = useArticlesReviewApiListReviews(
    article?.id || 0,
    {
      community_id: communityId,
      size: 10,
    },
    {
      query: {
        // Only enable query after 1 second delay AND all required data is available
        enabled: isQueryEnabled,
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch on mount - we control when to fetch
        staleTime: FIFTEEN_MINUTES_IN_MS,
        queryKey: ['reviews', article?.id, communityId],
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (reviewsError) {
      showErrorToast(reviewsError);
    }
  }, [reviewsError]);

  if (!article)
    return (
      <div
        className={cn(
          'w-full overflow-y-auto rounded-xl border border-common-minimal/50 bg-common-cardBackground/50 p-6',
          className
        )}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-text-tertiary/50">No article selected</h1>
          <p className="text-text-tertiary/50">Select an article to preview</p>
        </div>
      </div>
    );
  return (
    <div
      className={cn(
        'w-full overflow-y-auto rounded-xl border border-common-minimal/50 bg-common-cardBackground/50 p-4',
        className
      )}
    >
      <RenderParsedHTML
        rawContent={article.title}
        isShrinked={false}
        supportMarkdown={false}
        supportLatex={true}
        contentClassName="res-text-xl font-bold line-clamp-5"
        containerClassName="mb-4 sm:mb-4"
      />
      <div className="mb-8">
        <h3 className="mb-1 text-xs font-semibold text-text-secondary">Abstract</h3>
        <RenderParsedHTML
          rawContent={article.abstract}
          isShrinked={true}
          supportMarkdown={false}
          supportLatex={true}
          gradientClassName="sm:from-common-background"
          contentClassName="text-sm"
        />
      </div>
      <div className="mb-4">
        <h3 className="mb-1 text-xs font-semibold text-text-secondary">Authors</h3>
        <div className="text-text-primary">
          <TruncateText
            text={article.authors.map((author) => author.label).join(', ')}
            maxLines={2}
            textClassName="text-sm"
          />
        </div>
      </div>
      <div className="mb-4">
        <h3 className="mb-1 text-xs font-semibold text-text-secondary">Submitted By</h3>
        <div className="text-text-primary">
          <TruncateText text={article.user.username} maxLines={2} textClassName="text-sm" />
        </div>
      </div>
      <div className="mb-4 flex w-fit items-center rounded-md border border-common-minimal py-1 pl-0 pr-1.5">
        <Star className="h-3.5 text-functional-yellow" fill="currentColor" />
        <span className="text-xs text-text-secondary">{article.total_ratings}</span>
      </div>
      <Link
        href={href}
        className="mt-6 flex flex-row items-center gap-1 text-functional-blue hover:underline"
      >
        <span className="text-xs">Go to the Article Page</span>
        <ArrowRightIcon className="h-4 w-4 -rotate-45" />
      </Link>
      {showReviews && !shouldLoadReviews && (
        <div className="mt-6 border-t border-common-minimal pt-6">
          <div className="flex w-full animate-pulse items-center justify-center gap-2">
            <div className="w-5">
              <InfiniteSpinnerAnimation color="#737373" strokeWidth={16} />
            </div>
            <span className="text-xs text-text-secondary">Loading Reviews</span>
          </div>
        </div>
      )}
      {showReviews && shouldLoadReviews && currentArticleIdRef.current === article?.id && (
        <div className="mt-6 border-t border-common-minimal pt-6">
          <h3 className="mb-4 text-sm font-semibold text-text-secondary">Reviews</h3>
          {reviewsIsPending && (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          )}
          {!reviewsIsPending && reviewsData?.data.items.length === 0 && (
            <EmptyState content="No reviews yet" subcontent="Be the first to review this article" />
          )}
          {!reviewsIsPending &&
            reviewsData?.data.items.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      )}
    </div>
  );
};

export default ArticlePreviewSection;
