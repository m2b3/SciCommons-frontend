import React, { useCallback, useEffect, useState } from 'react';

import { FileX2 } from 'lucide-react';
import { toast } from 'sonner';

import { useArticlesApiGetArticles } from '@/api/articles/articles';
import { ArticlesListOut } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import ArticlePreviewSection from '@/components/articles/ArticlePreviewSection';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface CommunityArticlesProps {
  communityId: number;
}

const CommunityArticles: React.FC<CommunityArticlesProps> = ({ communityId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [articles, setArticles] = useState<ArticlesListOut[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'preview'>('grid');
  const [selectedPreviewArticle, setSelectedPreviewArticle] = useState<ArticlesListOut | null>(
    null
  );

  const handleViewTypeChange = useCallback((newViewType: 'grid' | 'preview') => {
    setViewType(newViewType);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('community-articles-layout-type', newViewType);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('community-articles-layout-type');
    if (saved === 'grid' || saved === 'preview') {
      setViewType(saved);
    }
  }, []);

  const { data, isPending, error } = useArticlesApiGetArticles(
    {
      community_id: communityId,
      page: page,
      per_page: 10,
      search: search,
    },
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
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
            'h-[calc(100vh-130px)] overflow-y-auto',
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
            itemsPerPage={10}
            loadingType={LoadingType.PAGINATION}
            searchPlaceholder="Search articles..."
            emptyStateContent="No articles found"
            emptyStateSubcontent="Be the first to create an article in this community"
            emptyStateLogo={<FileX2 size={64} />}
            showViewTypeIcons={true}
            viewType={viewType}
            setViewType={(v) => handleViewTypeChange(v as 'grid' | 'preview')}
            allowedViewTypes={['grid', 'preview']}
            listContainerClassName={cn('flex flex-col gap-3 h-full')}
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
                className="h-[calc(100vh-130px)]"
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default CommunityArticles;
