import React, { Suspense, lazy, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Link2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from 'usehooks-ts';

import { useCommunitiesArticlesApiToggleArticlePseudonymous } from '@/api/community-articles/community-articles';
import { ArticleOut } from '@/api/schemas';
import TruncateText from '@/components/common/TruncateText';
import { useDebounceFunction } from '@/hooks/useDebounceThrottle';
import { useAuthStore } from '@/stores/authStore';

import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';
import PdfIcon from '../ui/Icons/PdfIcon';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
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
}

const DisplayArticle: React.FC<DisplayArticleProps> = ({ article }) => {
  const hasImage = !!article.article_image_url;
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isPseudonymous, setIsPseudonymous] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsPseudonymous(article.is_pseudonymous);
  }, [article.is_pseudonymous]);

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
      setIsPseudonymous(article.is_pseudonymous);
    }
  }, [isMutationSuccess, mutationData, isMutationError]);

  const debouncedIsPseudonymous = useDebounceFunction(handleMakePseudonymous, 500);

  return (
    <div
      className={`flex flex-col items-start rounded-xl border-common-contrast res-text-xs sm:border sm:bg-common-cardBackground sm:p-4 ${hasImage ? 'sm:flex-row' : ''}`}
    >
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
        <h2 className="mb-4 font-bold text-text-primary res-text-xl">
          <TruncateText text={article.title} maxLines={2} />
        </h2>
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-text-secondary res-text-xs">Abstract</h3>
          <div className="text-base text-text-primary">
            <TruncateText text={article.abstract} maxLines={2} />
          </div>
        </div>
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-text-secondary res-text-xs">Authors</h3>
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
        <div>
          <h3 className="mb-2 font-semibold text-text-secondary res-text-xs">Article Links</h3>
          {article?.article_link && (
            <div className="mb-1 flex items-center gap-2">
              <Link2 size={16} className="text-text-tertiary" />
              <a
                href={article.article_link || '#'}
                className="text-functional-blue res-text-xs hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {article?.article_link?.split('/').pop() || article.article_link}
              </a>
            </div>
          )}
          {article.article_pdf_urls.map((link, index) => (
            <div key={index} className="mb-1 flex items-center gap-2">
              <PdfIcon className="size-4 shrink-0" />
              <a
                href={link}
                className="text-functional-blue res-text-xs hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.split('/').pop() || link}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-4 w-full">
          <ArticleStats article={article} />
        </div>

        <div className="mb-2 flex w-full items-center justify-end gap-2 sm:absolute sm:bottom-0 sm:right-0 sm:mb-0 sm:w-fit">
          {article.is_submitter && (
            <Link href={`/article/${article.slug}/settings`}>
              <div className="rounded-lg border border-common-contrast bg-white px-4 py-2 text-black res-text-xs dark:bg-black dark:text-white">
                Edit Article
              </div>
            </Link>
          )}
          {article.community_article && article.community_article?.is_admin && (
            <Suspense
              fallback={
                <Button
                  className="rounded-lg border border-common-contrast px-4 py-2 res-text-xs"
                  variant={'inverted'}
                >
                  <Settings size={18} className="animate-spin" />
                </Button>
              }
            >
              {isDesktop ? (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger>
                    <Button
                      className="rounded-lg border border-common-contrast px-4 py-2 res-text-xs"
                      variant={'inverted'}
                    >
                      <Settings size={18} />
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
                  <DrawerTrigger>
                    <Button
                      className="rounded-lg border border-common-contrast px-4 py-2 res-text-xs"
                      variant={'inverted'}
                    >
                      <Settings size={18} />
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
