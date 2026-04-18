import React, { Suspense, lazy, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Bookmark, Link2, PanelLeft, Pencil, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from 'usehooks-ts';

import { useCommunitiesArticlesApiToggleArticlePseudonymous } from '@/api/community-articles/community-articles';
import { ArticleOut, BookmarkContentTypeEnum } from '@/api/schemas';
import { useUsersCommonApiToggleBookmark } from '@/api/users-common-api/users-common-api';
import TruncateText from '@/components/common/TruncateText';
import { SCREEN_WIDTH_SM } from '@/constants/common.constants';
import { useDebounceFunction } from '@/hooks/useDebounceThrottle';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import RenderParsedHTML from '../common/RenderParsedHTML';
import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';
import PdfIcon from '../ui/Icons/PdfIcon';
import { Button, ButtonIcon, ButtonTitle } from '../ui/button';
import { Switch } from '../ui/switch';
import AbstractText from './AbstractText';
import ArticleStats from './ArticleStats';

// Dynamically import Drawer components
const Drawer = lazy(() => import('../ui/drawer').then((mod) => ({ default: mod.Drawer })));
const DrawerContent = lazy(() =>
  import('../ui/drawer').then((mod) => ({ default: mod.DrawerContent }))
);
const DrawerHeader = lazy(() =>
  import('../ui/drawer').then((mod) => ({ default: mod.DrawerHeader }))
);
const DrawerTitle = lazy(() =>
  import('../ui/drawer').then((mod) => ({ default: mod.DrawerTitle }))
);
const DrawerTrigger = lazy(() =>
  import('../ui/drawer').then((mod) => ({ default: mod.DrawerTrigger }))
);

// Dynamically import Sheet components
const Sheet = lazy(() => import('../ui/sheet').then((mod) => ({ default: mod.Sheet })));
const SheetContent = lazy(() =>
  import('../ui/sheet').then((mod) => ({ default: mod.SheetContent }))
);
const SheetHeader = lazy(() => import('../ui/sheet').then((mod) => ({ default: mod.SheetHeader })));
const SheetTitle = lazy(() => import('../ui/sheet').then((mod) => ({ default: mod.SheetTitle })));
const SheetTrigger = lazy(() =>
  import('../ui/sheet').then((mod) => ({ default: mod.SheetTrigger }))
);

interface DisplayArticleProps {
  article: ArticleOut;
  editCommunityName?: string | null;
  editReturnTo?: string | null;
  editReturnPath?: string | null;
  showPdfViewerButton?: boolean;
  handleOpenPdfViewer?: () => void;
  listViewHref?: string;
  onListViewClick?: () => void;
}

const DisplayArticle: React.FC<DisplayArticleProps> = ({
  article,
  editCommunityName = null,
  editReturnTo = null,
  editReturnPath = null,
  showPdfViewerButton = false,
  handleOpenPdfViewer = () => {},
  listViewHref,
  onListViewClick,
}) => {
  const hasImage = !!article.article_image_url;
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isPseudonymous, setIsPseudonymous] = useState(true);
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(article.is_bookmarked ?? false);

  useEffect(() => {
    setIsPseudonymous(article.is_pseudonymous || false);
  }, [article.is_pseudonymous]);

  // Sync bookmark state when article data changes (e.g., after auth state changes)
  useEffect(() => {
    if (article.is_bookmarked !== undefined && article.is_bookmarked !== null) {
      setIsBookmarked(article.is_bookmarked);
    }
  }, [article.is_bookmarked]);

  const {
    mutate,
    data: mutationData,
    isSuccess: isMutationSuccess,
    isError: isMutationError,
  } = useCommunitiesArticlesApiToggleArticlePseudonymous({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const handleMakePseudonymous = (value: boolean) => {
    article.id &&
      mutate({
        communityArticleId: Number(article.id),
        params: { pseudonymous: value },
      });
  };

  useEffect(() => {
    if (isMutationSuccess) {
      toast.success(`${mutationData.data.message}`);
    }
    if (isMutationError) {
      toast.error('Update failed');
      setIsPseudonymous(article.is_pseudonymous || false);
    }
  }, [isMutationSuccess, mutationData, isMutationError, article.is_pseudonymous]);

  const debouncedIsPseudonymous = useDebounceFunction(handleMakePseudonymous, 500);

  const { mutate: toggleBookmark, isPending: isBookmarkPending } = useUsersCommonApiToggleBookmark({
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

    if (!article.id) {
      toast.error('Article ID is missing');
      return;
    }

    toggleBookmark({
      data: {
        content_type: BookmarkContentTypeEnum.articlesarticle,
        object_id: article.id,
      },
    });
  };

  /* Fixed by Codex on 2026-02-19
     Who: Codex
     What: Preserve caller context in the Edit Article settings URL.
     Why: Users editing from side-panel list views should return to the same list/panel context.
     How: Attach returnPath (and existing community context when available) to the settings query. */
  const editArticleHref = React.useMemo(() => {
    if (!article.slug) return '/articles';
    const params = new URLSearchParams();
    const resolvedCommunityName = editCommunityName || article.community_article?.community.name;

    if (resolvedCommunityName) {
      params.set('community', resolvedCommunityName);
      params.set('returnTo', editReturnTo || 'community');
    } else if (editReturnTo) {
      params.set('returnTo', editReturnTo);
    }

    if (editReturnPath) {
      params.set('returnPath', editReturnPath);
    }

    if (article.id) {
      params.set('articleId', String(article.id));
    }

    const query = params.toString();
    return query
      ? `/article/${article.slug}/settings?${query}`
      : `/article/${article.slug}/settings`;
  }, [
    article.slug,
    article.community_article,
    article.id,
    editCommunityName,
    editReturnTo,
    editReturnPath,
  ]);

  return (
    <div className={`flex flex-col items-start res-text-xs ${hasImage ? 'sm:flex-row' : ''}`}>
      {hasImage && (
        <div className="mb-4 w-full sm:mb-0 sm:mr-4 sm:w-1/3">
          <div className="relative h-0 w-full pb-[75%]">
            <Image
              src={article.article_image_url || '/placeholder.png'}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              className="absolute left-0 top-0 h-full w-full rounded-lg"
            />
          </div>
        </div>
      )}
      <div className={`relative flex-1 ${hasImage ? '' : 'w-full'}`}>
        {/* Title row with List View button */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <RenderParsedHTML
            rawContent={article.title}
            isShrinked={false}
            supportMarkdown={false}
            supportLatex={true}
            contentClassName="res-text-xl font-bold"
            containerClassName="mb-0"
          />
          {listViewHref && (
            <Button
              asChild
              withTooltip
              tooltipData="List View"
              variant="outline"
              size="xs"
              className="ml-2 border border-common-minimal/70 bg-common-cardBackground px-2 hover:bg-common-minimal sm:px-3"
              aria-label="Switch to community articles list view"
              onClick={onListViewClick}
            >
              <Link href={listViewHref}>
                <ButtonIcon>
                  <PanelLeft size={14} className="text-text-secondary" />
                </ButtonIcon>
                <ButtonTitle className="hidden text-text-secondary sm:flex">List View</ButtonTitle>
              </Link>
            </Button>
          )}
        </div>
        <div className="mb-4">
          <h3 className="mb-1 text-xs font-semibold text-text-secondary">Abstract</h3>
          {/* <div className="text-base text-text-primary">
            <TruncateText text={article.abstract} maxLines={2} />
          </div> */}
          {/* Fixed by GitHub Copilot on 2026-04-10
              Who: GitHub Copilot
              What: Remove mb-10 margin from AbstractText on mobile to eliminate gap.
              Why: Gap between abstract and author was larger than between authors and article links.
              How: Pass containerClassName="mb-0" to override RenderParsedHTML's mobile margin. */}
          <AbstractText
            text={article.abstract}
            articleLink={article.article_link}
            isShrinked={true}
            gradientClassName="sm:from-common-background"
            containerClassName="mb-0"
          />
        </div>
        <div className="mb-4">
          <h3 className="mb-1 text-xs font-semibold text-text-secondary">Authors</h3>
          <div className="text-text-primary">
            <TruncateText
              text={article.authors.map((author) => author.label).join(', ')}
              maxLines={2}
            />
          </div>
        </div>
        {/* <div className="mb-4">
          <h3 className="mb-1 font-semibold text-text-secondary res-text-xs">Keywords</h3>
          <TruncateText text={article.keywords.join(', ')} maxLines={2} />
        </div> */}
        {(article?.article_link || article.article_pdf_urls.length > 0) && (
          <div>
            <h3 className="mb-2 text-xs font-semibold text-text-secondary">Article Links</h3>
            <div className="flex flex-wrap items-center gap-4">
              {article?.article_link && (
                <div className="flex items-center gap-2">
                  <Link2 size={16} className="text-text-tertiary" />
                  <a
                    href={article.article_link || '#'}
                    className="max-w-[300px] truncate text-xs text-functional-blue hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article?.article_link?.split('/').pop() || article.article_link}
                  </a>
                </div>
              )}
              {article.article_pdf_urls.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <PdfIcon className="size-4 shrink-0" />
                  <a
                    href={link}
                    className="max-w-[300px] truncate text-xs text-functional-blue hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.split('/').pop() || link}
                  </a>
                </div>
              ))}
              {showPdfViewerButton && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleOpenPdfViewer()}
                    variant="outline"
                    className="gap-2 rounded-full p-2 hover:border-functional-blueLight/30 hover:text-functional-blueLight"
                    size="xs"
                  >
                    <PanelLeft size={12} />
                    <ButtonTitle>View PDF with Annotations</ButtonTitle>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex w-full items-start justify-between gap-4">
          <div className="flex-1">
            <ArticleStats article={article} />
          </div>

          <div className="flex items-center gap-2 pt-16">
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Tokenize article action pill surfaces.
              Why: Keep edit/settings controls aligned with skin palettes.
              How: Replace hard-coded white/black utilities with semantic tokens. */}
          {article.is_submitter && (
            <Button
              asChild
              variant="outline"
              size="xs"
              className="h-9 w-9 p-0"
              aria-label="Edit Article"
            >
              <Link href={editArticleHref} title="Edit Article">
                <Pencil size={16} className="text-text-secondary" />
              </Link>
            </Button>
          )}
          {!article.community_article && (
            /* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Add ARIA labels and pressed state to the bookmark toggle.
               Why: Icon-only buttons need accessible names and state feedback.
               How: Provide aria-label/aria-pressed on the Button element. */
            <Button
              variant="outline"
              size="xs"
              className="aspect-square p-1.5"
              aria-label={isBookmarked ? 'Remove bookmark for article' : 'Add bookmark for article'}
              aria-pressed={isBookmarked}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                handleBookmarkToggle();
              }}
              disabled={isBookmarkPending}
              withTooltip
              tooltipData={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              <Bookmark
                className={cn('size-4 transition-colors', {
                  'fill-functional-yellow text-functional-yellow': isBookmarked,
                  'text-text-tertiary hover:text-text-secondary': !isBookmarked,
                })}
              />
            </Button>
          )}
          {article.community_article && article.community_article?.is_admin && (
            <Suspense
              fallback={
                <Button
                  variant="outline"
                  size="xs"
                  className="h-9 w-9 p-0"
                >
                  <Settings size={16} className="animate-spin text-text-secondary" />
                </Button>
              }
            >
              {/* Fixed by Codex on 2026-02-15
                  Who: Codex
                  What: Make settings triggers accessible buttons with labels.
                  Why: Icon-only sheet/drawer triggers were unlabeled for screen readers.
                  How: Use asChild buttons with aria-labels and explicit types. */}
              {isDesktop ? (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-9 w-9 p-0"
                      aria-label="Open article settings"
                    >
                      <Settings size={16} className="text-text-secondary" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    isOpen={isSheetOpen}
                    className="flex flex-col items-center p-0 pt-4"
                  >
                    <SheetHeader className="flex flex-col items-center">
                      <SheetTitle className="text-2xl font-bold">Settings</SheetTitle>
                    </SheetHeader>
                    <div className="flex h-full w-full flex-col items-center p-4">
                      <div className="flex w-full max-w-[720px] flex-col gap-4 rounded-xl bg-common-cardBackground p-4 md:p-4">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-base text-text-secondary">
                              Make article reviews and discussion <strong>Pseudomynous</strong>
                            </span>
                            <span className="text-xs text-text-tertiary">
                              (If enabled, all reviews and discussions will remain pseudonymous.)
                            </span>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-functional-blue"
                            checked={isPseudonymous}
                            onCheckedChange={(value) => {
                              setIsPseudonymous(value);
                              debouncedIsPseudonymous(value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-9 w-9 p-0"
                      aria-label="Open article settings"
                    >
                      <Settings size={16} className="text-text-secondary" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="flex flex-col items-center p-0 pt-4">
                    <DrawerHeader className="flex flex-col items-center">
                      <DrawerTitle className="text-2xl font-bold">Settings</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex h-full w-full flex-col items-center p-4">
                      <div className="flex w-full max-w-[720px] flex-col gap-4 rounded-xl bg-common-cardBackground p-4 md:p-4">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-base text-text-secondary">
                              Make article reviews and discussion <strong>Pseudomynous</strong>
                            </span>
                            <span className="text-xs text-text-tertiary">
                              (If enabled, all reviews and discussions will remain pseudonymous.)
                            </span>
                          </div>
                          <Switch
                            className="data-[state=checked]:bg-functional-blue"
                            checked={isPseudonymous}
                            onCheckedChange={(value) => {
                              setIsPseudonymous(value);
                              debouncedIsPseudonymous(value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              )}
            </Suspense>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayArticle;

export const DisplayArticleSkeleton: React.FC = () => {
  return (
    <>
      <Skeleton className="flex flex-col items-start rounded-xl border-common-contrast sm:border sm:bg-common-cardBackground sm:p-4">
        <TextSkeleton className="h-10" />
        <TextSkeleton className="mt-4 h-6 w-20" />
        <TextSkeleton />
        <TextSkeleton className="w-48" />
        <TextSkeleton className="mt-4 h-6 w-20" />
        <TextSkeleton />
        <TextSkeleton />
        <TextSkeleton />
        <TextSkeleton className="w-48" />
        <TextSkeleton className="mt-4 h-6 w-20" />
        <div className="flex w-full flex-wrap items-center gap-4">
          <TextSkeleton className="h-8 w-20" />
          <TextSkeleton className="h-8 w-20" />
          <TextSkeleton className="h-8 w-20" />
          <TextSkeleton className="h-8 w-20" />
        </div>
      </Skeleton>
      <Skeleton className="border-none bg-transparent">
        <div className="mt-4 flex gap-6 border-b border-common-minimal p-4">
          <BlockSkeleton className="h-8 w-32" />
          <BlockSkeleton className="h-8 w-32" />
          <BlockSkeleton className="h-8 w-32" />
        </div>
      </Skeleton>
      <Skeleton className="relative flex rounded-xl border border-common-contrast bg-common-cardBackground">
        <BlockSkeleton className="aspect-square size-10 rounded-full" />
        <div className="ml-4 flex-1">
          <TextSkeleton className="w-20" />
          <TextSkeleton className="mt-2 w-32" />
          <BlockSkeleton className="mt-2" />
        </div>
      </Skeleton>
    </>
  );
};
