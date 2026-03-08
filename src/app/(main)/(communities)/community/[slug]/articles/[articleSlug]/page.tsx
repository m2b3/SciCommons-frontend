'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { List } from 'lucide-react';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useArticlesReviewApiListReviews } from '@/api/reviews/reviews';
import DiscussionForum from '@/components/articles/DiscussionForum';
import DisplayArticle, { DisplayArticleSkeleton } from '@/components/articles/DisplayArticle';
import ReviewsTabBody from '@/components/articles/ReviewsTabBody';
import CommunityBreadcrumb from '@/components/communities/CommunityBreadcrumb';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import TabNavigation from '@/components/ui/tab-navigation';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useArticlesViewStore } from '@/stores/articlesViewStore';
import { useAuthStore } from '@/stores/authStore';

const CommunityArticleDisplayPage: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ articleSlug: string; slug: string }>();
  const setViewType = useArticlesViewStore((state) => state.setViewType);
  const [submitReview, setSubmitReview] = useState(false);

  const { data, error, isPending } = useArticlesApiGetArticle(
    params?.articleSlug || '',
    { community_name: params?.slug || '' },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    }
  );

  // Performance: Parallel loading optimization - fetch reviews immediately when article ID available
  // This prevents sequential loading waterfall (article → reviews)
  const {
    data: reviewsData,
    error: reviewsError,
    isPending: reviewsIsPending,
    refetch: reviewsRefetch,
  } = useArticlesReviewApiListReviews(
    data?.data.id || 0,
    { community_id: data?.data.community_article?.community.id || 0 },
    {
      query: {
        enabled: !!accessToken && !!data?.data.id,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: FIFTEEN_MINUTES_IN_MS,
      },
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (reviewsError) {
      showErrorToast(reviewsError);
    }
  }, [reviewsError]);

  const hasUserReviewed = reviewsData?.data.items.some((review) => review.is_author) || false;

  // Performance: Lazy-loaded tab content using functions
  // Discussions won't render until user switches to that tab
  const tabs = data
    ? [
        {
          title: 'Reviews',
          content: () => (
            /* Fixed by Codex on 2026-02-21
               Who: Codex
               What: Reused shared ReviewsTabBody for community article reviews tab.
               Why: Keep review interactions identical across community/article/discussions contexts.
               How: Inject community scope and local submit state through shared component props. */
            <ReviewsTabBody
              articleId={Number(data.data.id)}
              reviews={reviewsData?.data.items}
              reviewsIsPending={reviewsIsPending}
              reviewsRefetch={reviewsRefetch}
              hasUserReviewed={hasUserReviewed}
              isReviewFormOpen={submitReview}
              onReviewFormToggle={() => setSubmitReview((prev) => !prev)}
              onReviewSubmitSuccess={() => setSubmitReview(false)}
              communityId={data?.data.community_article?.community.id}
              isSubmitter={data.data.is_submitter}
              reviewFormContainerId="community-article-review-form"
              className="gap-2"
              showHeading={false}
            />
          ),
        },
        {
          title: 'Discussions',
          content: () => (
            <DiscussionForum
              articleId={data?.data.id || 0}
              communityId={data?.data.community_article?.community.id}
              communitySlug={params?.slug || ''}
              communityArticleId={data?.data.community_article?.id}
              showSubscribeButton={true}
              isAdmin={data?.data.community_article?.is_admin || false}
            />
          ),
        },
        // {
        //   title: 'FAQs',
        //   content: <DisplayFAQs faqs={data.data.faqs || []} />,
        // },
      ]
    : [];

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  /* Fixed by Codex on 2026-02-23
     Who: Codex
     What: Added a direct "List View" convenience action on community article detail pages.
     Why: Users navigating from community article grids needed a quick way to return to list mode.
     How: Add a right-aligned action back to the community page, force grid mode on click, and keep it icon-only on mobile with accessible labeling. */
  const handleGoToListView = () => {
    setViewType('grid');
  };

  const communityListHref =
    data?.data.id && params?.slug
      ? `/community/${params.slug}?articleId=${data.data.id}`
      : `/community/${params?.slug}`;

  return (
    <div className="w-full p-4 py-4 md:px-6">
      <CommunityBreadcrumb
        communityName={data?.data.community_article?.community.name}
        communitySlug={params?.slug}
        articleTitle={data?.data.title}
        isLoading={isPending}
      />
      {!isPending && (
        <div className="mb-3 flex justify-end">
          <Button
            asChild
            withTooltip
            tooltipData="List View"
            variant="outline"
            size="xs"
            className="border border-common-minimal/70 bg-common-cardBackground px-2 hover:bg-common-minimal sm:px-3"
            aria-label="Switch to community articles list view"
          >
            <Link href={communityListHref} onClick={handleGoToListView}>
              <ButtonIcon>
                <List size={14} className="text-text-secondary" />
              </ButtonIcon>
              <ButtonTitle className="hidden text-text-secondary sm:flex">List View</ButtonTitle>
            </Link>
          </Button>
        </div>
      )}
      {isPending ? (
        <DisplayArticleSkeleton />
      ) : (
        data && (
          <div className="flex flex-col">
            <DisplayArticle article={data.data} />
            <div className="mt-3 inline-block rounded-md bg-functional-blue/10 px-2 py-0.5 sm:mt-5 sm:rounded-xl sm:px-3 sm:py-1">
              <span className="block text-xs leading-snug text-functional-blueContrast">
                {data.data.community_article?.is_pseudonymous
                  ? 'Community admin has enabled pseudonymous reviews & discussions. Your name won’t be shown.'
                  : 'Community admin has disabled pseudonymous reviews & discussions. Your name will be visible.'}
              </span>
            </div>
          </div>
        )
      )}
      {data && (
        <div className="mt-4">
          <TabNavigation tabs={tabs} />
        </div>
      )}
    </div>
  );
};

export default withAuthRedirect(CommunityArticleDisplayPage, { requireAuth: true });
