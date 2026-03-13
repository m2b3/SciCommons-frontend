'use client';

import React, { useEffect, useMemo, useRef } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Bell, ChevronRight } from 'lucide-react';

import { useArticlesDiscussionApiGetUserSubscriptions } from '@/api/discussions/discussions';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionUnreadStore } from '@/stores/subscriptionUnreadStore';

const SCROLL_POSITION_KEY = 'discussions-sidebar-scroll';

interface SelectedArticle {
  id: number;
  title: string;
  slug: string;
  abstract: string;
  communityId: number | null;
  communityArticleId: number | null;
  isAdmin: boolean;
  communityName: string;
}

interface FlattenedArticle {
  articleId: number;
  articleTitle: string;
  articleSlug: string;
  articleAbstract: string;
  communityArticleId: number | null;
  communityId: number;
  communityName: string;
  isAdmin: boolean;
  hasUnreadEvent: boolean;
}

interface DiscussionsSidebarProps {
  onArticleSelect: (article: SelectedArticle) => void;
  selectedArticle: SelectedArticle | null;
  onArticlesLoaded?: (
    articles: Array<{
      articleId: number;
      articleTitle: string;
      articleSlug: string;
      articleAbstract: string;
      communityArticleId: number | null;
      communityId: number;
      communityName: string;
      isAdmin: boolean;
    }>
  ) => void;
  scrollPositionRef?: React.MutableRefObject<number>;
}

const DiscussionsSidebar: React.FC<DiscussionsSidebarProps> = ({
  onArticleSelect,
  selectedArticle,
  onArticlesLoaded,
  scrollPositionRef,
}) => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const accessToken = useAuthStore((state) => state.accessToken);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasRedirectedForEmptyGuestStateRef = useRef(false);

  // Subscribe to articlesWithNewEvents directly to trigger re-renders when new events arrive
  const articlesWithNewEvents = useSubscriptionUnreadStore((s) => s.articlesWithNewEvents);
  const isArticleUnread = useSubscriptionUnreadStore((s) => s.isArticleUnread);
  const markArticleAsRead = useSubscriptionUnreadStore((s) => s.markArticleAsRead);

  // Fetch user subscriptions
  const { data: subscriptionsData, isPending: subscriptionsLoading } =
    useArticlesDiscussionApiGetUserSubscriptions({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
      },
    });

  /* Fixed by Codex on 2026-02-15
     Problem: Hook deps warned because communities reference re-created every render.
     Solution: Memoize communities from the subscriptions payload for stable dependencies.
     Result: useMemo dependencies stay stable and lint warnings are resolved. */
  const communities = useMemo(() => {
    return subscriptionsData?.data?.communities || [];
  }, [subscriptionsData?.data?.communities]);

  // Base list used for URL restore (stable across realtime unread changes)
  const loadedArticles = useMemo(() => {
    return communities.flatMap((community) =>
      community.articles.map((article) => ({
        articleId: article.article_id,
        articleTitle: article.article_title,
        articleSlug: article.article_slug,
        articleAbstract: article.article_abstract || '',
        communityArticleId: article.community_article_id || null,
        communityId: community.community_id,
        communityName: community.community_name,
        isAdmin: community.is_admin || false,
      }))
    );
  }, [communities]);

  // Flatten the data: each article becomes its own item with community info
  // Compute effective unread state using the store (handles optimistic updates and realtime events)
  const flattenedArticles = useMemo<FlattenedArticle[]>(() => {
    return communities.flatMap((community) =>
      community.articles.map((article) => {
        // Use the store to determine effective unread state
        // This combines: API value, optimistic clears, and realtime events
        const effectiveUnread = isArticleUnread(
          community.community_id,
          article.article_id,
          article.has_unread_event || false
        );

        return {
          articleId: article.article_id,
          articleTitle: article.article_title,
          articleSlug: article.article_slug,
          articleAbstract: article.article_abstract || '',
          communityArticleId: article.community_article_id || null,
          communityId: community.community_id,
          communityName: community.community_name,
          isAdmin: community.is_admin || false,
          hasUnreadEvent: effectiveUnread,
        };
      })
    );
    // articlesWithNewEvents is intentionally included to trigger re-render when new realtime events arrive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communities, isArticleUnread, articlesWithNewEvents]);

  /* Fixed by Codex on 2026-02-15
     Problem: Discussions sidebar couldn't restore selected article or scroll position after navigation.
     Solution: Report loaded articles to the parent and keep scroll position in a shared ref.
     Result: URL-based restoration and sidebar scroll persistence work consistently. */
  useEffect(() => {
    if (subscriptionsLoading) return;
    if (loadedArticles.length === 0) return;
    onArticlesLoaded?.(loadedArticles);
  }, [subscriptionsLoading, loadedArticles, onArticlesLoaded]);

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Restore discussions sidebar scroll from session storage.
     Why: Sidebar unmounts on navigation and loses in-memory scroll refs.
     How: Seed the ref and scrollTop from sessionStorage on mount. */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const savedScroll = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (!savedScroll) return;
    const scrollPos = parseInt(savedScroll, 10);
    if (Number.isNaN(scrollPos)) return;
    if (scrollPositionRef) {
      scrollPositionRef.current = scrollPos;
    }
    container.scrollTop = scrollPos;
  }, [scrollPositionRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !scrollPositionRef) return;
    if (subscriptionsLoading) return;
    container.scrollTop = scrollPositionRef.current;
  }, [scrollPositionRef, subscriptionsLoading, loadedArticles.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !scrollPositionRef || !selectedArticle) return;
    container.scrollTop = scrollPositionRef.current;
  }, [selectedArticle, scrollPositionRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !scrollPositionRef) return;

    const handleScroll = () => {
      scrollPositionRef.current = container.scrollTop;
      sessionStorage.setItem(SCROLL_POSITION_KEY, container.scrollTop.toString());
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollPositionRef]);

  /* Fixed by Codex on 2026-02-26
     Problem: Logged-out users could land on discussions and see an empty state with no clear next action.
     Root Cause: Discussions is intentionally public-routable, but subscriptions are auth-gated so zero items can render silently.
     Solution: If auth bootstrap is complete and no discussion articles are available for a logged-out user, redirect to login.
     Result: Empty guest states now route to authentication instead of appearing stale/broken. */
  useEffect(() => {
    if (!isAuthInitialized || subscriptionsLoading || isAuthenticated) {
      return;
    }

    if (flattenedArticles.length > 0 || hasRedirectedForEmptyGuestStateRef.current) {
      return;
    }

    hasRedirectedForEmptyGuestStateRef.current = true;
    router.replace('/auth/login');
  }, [flattenedArticles.length, isAuthInitialized, isAuthenticated, router, subscriptionsLoading]);

  // Handle article selection - mark as read immediately when user clicks
  const handleArticleSelect = (article: FlattenedArticle) => {
    // Mark article as read when user clicks on it (assume user will read everything)
    markArticleAsRead(article.communityId, article.articleId);

    onArticleSelect({
      id: article.articleId,
      title: article.articleTitle,
      slug: article.articleSlug,
      abstract: article.articleAbstract,
      communityId: article.communityId,
      communityArticleId: article.communityArticleId,
      isAdmin: article.isAdmin,
      communityName: article.communityName,
    });
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto p-4"
      tabIndex={0}
      role="region"
      aria-label="Discussions navigation"
    >
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">Discussions</h2>
      </div>

      {!isAuthenticated && (
        <div className="mb-4 rounded-md border border-functional-blue/30 bg-functional-blue/10 p-3">
          <p className="text-xs font-medium text-text-secondary">
            Log in to access private communities and private discussion subscriptions.
          </p>
        </div>
      )}

      {/* Subscriptions Loading State */}
      {subscriptionsLoading && (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              key={index}
              className="rounded-lg border border-common-minimal bg-common-cardBackground p-3"
            >
              <div className="flex items-center justify-between">
                <TextSkeleton className="w-32" />
                <BlockSkeleton className="h-4 w-4" />
              </div>
            </Skeleton>
          ))}
        </div>
      )}

      {/* Flattened Articles List */}
      {!subscriptionsLoading && flattenedArticles.length > 0 && (
        <div className="space-y-4" role="list">
          {flattenedArticles.map((article) => (
            <div
              key={`${article.communityId}-${article.articleId}`}
              role="listitem"
              className={cn(
                'group relative flex w-full flex-col gap-1 rounded-sm p-2 transition-colors',
                selectedArticle?.id === article.articleId
                  ? 'bg-functional-green/10 border border-functional-green/30'
                  : 'hover:bg-common-minimal/50',
                article.hasUnreadEvent &&
                selectedArticle?.id !== article.articleId &&
                'bg-common-contrast/40'
              )}
            >
              <button
                type="button"
                onClick={() => handleArticleSelect(article)}
                aria-pressed={selectedArticle?.id === article.articleId}
                aria-label={`Select discussion: ${article.articleTitle}`}
                className="absolute inset-0 z-10 h-full w-full bg-transparent outline-none ring-functional-green focus-visible:ring-2"
              />

              {article.hasUnreadEvent && (
                <span className="absolute -right-1 top-0 z-30 rounded-full border border-functional-red/50 bg-functional-red px-1.5 py-0.5 text-[8px] font-bold text-white">
                  NEW
                </span>
              )}

              <div className="relative z-20 flex w-full flex-nowrap items-center">
                <Link
                  href={`/community/${encodeURIComponent(article.communityName)}`}
                  className={cn(
                    'line-clamp-1 truncate text-[9px] font-bold uppercase tracking-wider text-text-tertiary hover:text-functional-blueLight hover:underline',
                    selectedArticle?.id === article.articleId && 'text-text-secondary'
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  {article.communityName}
                </Link>
                <ChevronRight size={10} className="flex-shrink-0 text-text-tertiary" />
              </div>

              <p
                className={cn(
                  'relative z-0 line-clamp-2 text-xs font-medium text-text-secondary',
                  selectedArticle?.id === article.articleId && 'text-text-primary',
                  article.hasUnreadEvent && 'font-bold text-text-primary'
                )}
              >
                {article.articleTitle}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!subscriptionsLoading && flattenedArticles.length === 0 && (
        <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center py-8 text-center">
          <Bell className="mb-4 h-16 w-16 text-text-tertiary" />
          <p className="text-lg font-semibold text-text-secondary">No subscriptions yet</p>
          <p className="mt-2 text-sm text-text-tertiary">
            Subscribe to article discussions from community pages
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscussionsSidebar;
