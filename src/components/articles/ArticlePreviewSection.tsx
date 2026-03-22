import React, { useEffect } from 'react';

import Link from 'next/link';

import { ArrowRightIcon, Star } from 'lucide-react';

import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import { ArticlesListOut } from '@/api/schemas';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import EmptyState from '../common/EmptyState';
import RenderParsedHTML from '../common/RenderParsedHTML';
import TruncateText from '../common/TruncateText';
/* Fixed by Claude Sonnet 4.5 on 2026-02-09
   Added TabNavigation and DiscussionForum imports to support tabbed Reviews/Discussions interface
   Matches the UX pattern used on the main article page */
import TabNavigation from '../ui/tab-navigation';
import AbstractText from './AbstractText';
import DiscussionForum from './DiscussionForum';
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

  const href = article?.community_article
    ? `/community/${article.community_article.community.name}/articles/${article.slug}`
    : `/article/${article?.slug}`;

  const communityId = article?.community_article?.community.id
    ? Number(article.community_article.community.id)
    : undefined;

  // Performance: Removed 1-second delay - React Query caching (15min staleTime) prevents excessive API calls
  // Reviews now load instantly, especially when cached
  const isQueryEnabled = showReviews && !!accessToken && !!article?.id && !!communityId;

  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesReviewApiListReviews(
    article?.id || 0,
    {
      community_id: communityId,
      size: 10,
    },
    {
      query: {
        enabled: isQueryEnabled,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: FIFTEEN_MINUTES_IN_MS, // 15min cache prevents excessive API calls
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
        {/* Fixed by Codex on 2026-02-15
            Who: Codex
            What: Route sidebar abstracts through AbstractText.
            Why: Preserve line breaks and centralize abstract rendering rules.
            How: Swap RenderParsedHTML for AbstractText with existing props. */}
        <AbstractText
          text={article.abstract}
          isShrinked={true}
          gradientClassName="sm:from-common-background"
          className="text-sm"
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
      {showReviews && article && (
        <div className="mt-6 border-t border-common-minimal pt-6">
          {/* Fixed by Claude Sonnet 4.5 on 2026-02-09
              Problem: Sidebar only showed Reviews section without Discussions access
              Solution: Added TabNavigation with both Reviews and Discussions tabs
              Result: Consistent tabbed UX matching the main article page
              Note: isAdmin defaults to false since CommunityArticleForList doesn't include admin status */}
          {/* Performance: Lazy-loaded tabs prevent Discussions from rendering until clicked */}
          <TabNavigation
            tabs={[
              {
                title: 'Reviews',
                content: () => (
                  <div className="flex flex-col gap-2">
                    {reviewsIsPending && (
                      <div className="flex flex-col gap-2">
                        {[...Array(3)].map((_, i) => (
                          <ReviewCardSkeleton key={i} />
                        ))}
                      </div>
                    )}
                    {!reviewsIsPending && reviewsData?.data.items.length === 0 && (
                      <EmptyState
                        content="No reviews yet"
                        subcontent="Be the first to review this article"
                      />
                    )}
                    {!reviewsIsPending &&
                      reviewsData?.data.items.map((review) => (
                        <ReviewCard key={review.id} review={review} refetch={reviewsRefetch} />
                      ))}
                  </div>
                ),
              },
              {
                title: 'Discussions',
                content: () => (
                  <DiscussionForum
                    articleId={article.id}
                    communityId={communityId}
                    communityArticleId={article.community_article?.id}
                    showSubscribeButton={false}
                    isAdmin={false}
                  />
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ArticlePreviewSection;
