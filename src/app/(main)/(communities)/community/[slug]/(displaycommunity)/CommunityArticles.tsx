import React, { useCallback, useEffect, useState } from 'react';

import { FileX2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from 'usehooks-ts';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticlesListOut } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import ArticlePreviewSection from '@/components/articles/ArticlePreviewSection';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { FIVE_MINUTES_IN_MS, SCREEN_WIDTH_SM } from '@/constants/common.constants';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { cn } from '@/lib/utils';
import { useArticlesViewStore } from '@/stores/articlesViewStore';
import { useAuthStore } from '@/stores/authStore';

interface CommunityArticlesProps {
  communityId: number;
}

const CommunityArticles: React.FC<CommunityArticlesProps> = ({ communityId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);
  const viewType = useArticlesViewStore((s) => s.viewType as 'grid' | 'list' | 'preview');
  const setViewType = useArticlesViewStore((s) => s.setViewType);
  const gridCount = useArticlesViewStore((s) => s.gridCount);
  const setGridCount = useArticlesViewStore((s) => s.setGridCount);
  const [selectedPreviewArticle, setSelectedPreviewArticle] = useState<ArticlesListOut | null>(
    null
  );
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);

  useEffect(() => {
    if (!isDesktop && viewType === 'preview') {
      setViewType('grid');
    }
  }, [isDesktop, viewType, setViewType]);

  const { data, isPending, error } = useArticlesApiGetArticles(
    {
      community_id: communityId,
      page: page,
      per_page: 50,
      search: search,
    },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
        staleTime: FIVE_MINUTES_IN_MS,
      },
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
    if (data) {
      setArticles(data.data.items);
    }
  }, [data, error]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      setArticles([]);
      setSelectedPreviewArticle(null);
    },
    [setSearch, setPage, setArticles, setSelectedPreviewArticle]
  );

  const handleLoadMore = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  useKeyboardNavigation<ArticlesListOut>({
    items: articles,
    selectedItem: selectedPreviewArticle,
    setSelectedItem: setSelectedPreviewArticle,
    isEnabled: viewType === 'preview',
    getItemId: (article) => article.id,
    autoSelectFirst: true,
    getItemElement: (item) =>
      document.querySelector(`[data-article-id="${String(item.id)}"]`) as HTMLElement | null,
    hasMore: false,
  });

  const renderArticle = useCallback(
    (article: ArticlesListOut) => (
      <div data-article-id={String(article.id)} onClick={() => setSelectedPreviewArticle(article)}>
        <ArticleCard
          article={article}
          forCommunity
          compactType={'full'}
          className={cn(
            'h-full',
            viewType === 'preview' &&
              selectedPreviewArticle?.id === article.id &&
              'border-functional-green/50 bg-functional-green/10'
          )}
          handleArticlePreview={() => setSelectedPreviewArticle(article)}
        />
      </div>
    ),
    [viewType, selectedPreviewArticle]
  );

  const renderSkeleton = useCallback(() => <ArticleCardSkeleton />, []);

  return (
    <div className="space-y-2">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full"
        autoSaveId="community-articles-list-panel"
      >
        <ResizablePanel
          className={cn(
            'max-h-[calc(100vh-130px)] overflow-y-auto',
            viewType === 'preview' ? 'pr-2' : ''
          )}
          defaultSize={60}
          minSize={30}
          maxSize={70}
        >
          <SearchableList<ArticlesListOut>
            onSearch={handleSearch}
            onLoadMore={handleLoadMore}
            renderItem={renderArticle}
            renderSkeleton={renderSkeleton}
            isLoading={isPending}
            items={articles}
            totalItems={data?.data.total || 0}
            totalPages={data?.data.num_pages || 1}
            currentPage={page}
            itemsPerPage={50}
            loadingType={LoadingType.INFINITE_SCROLL}
            searchPlaceholder="Search articles..."
            emptyStateContent="No articles found"
            emptyStateSubcontent="Be the first to create an article in this community"
            emptyStateLogo={<FileX2 size={64} />}
            showViewTypeIcons={true}
            viewType={viewType}
            setViewType={setViewType}
            setGridCount={setGridCount}
            allowedViewTypes={['grid', 'preview']}
            listContainerClassName={cn(
              'grid grid-cols-1',
              viewType === 'preview'
                ? 'h-full md:grid-cols-1 lg:grid-cols-1'
                : {
                    'md:grid-cols-1 lg:grid-cols-1': gridCount === 1,
                    'md:grid-cols-2 lg:grid-cols-2': gridCount === 2,
                    'md:grid-cols-2 lg:grid-cols-3': gridCount === 3,
                  }
            )}
          />
        </ResizablePanel>
        {viewType === 'preview' && (
          <>
            <ResizableHandle withHandle={true} className="bg-common-cardBackground" />
            <ResizablePanel
              className="ml-2 hidden lg:block"
              defaultSize={40}
              minSize={30}
              maxSize={70}
            >
              <ArticlePreviewSection
                article={selectedPreviewArticle}
                className="h-[calc(100vh-90px)]"
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default CommunityArticles;
