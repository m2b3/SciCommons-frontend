import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDebounce } from 'use-debounce';

import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

export enum LoadingType {
  PAGINATION = 'pagination',
  INFINITE_SCROLL = 'infinite_scroll',
  LOAD_MORE = 'load_more',
}

interface SearchableListProps<T> {
  onSearch: (term: string) => void;
  onLoadMore: (page: number) => void;
  renderItem: (item: T) => React.ReactNode;
  renderSkeleton: () => React.ReactNode;
  isLoading: boolean;
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage?: number;
  searchPlaceholder?: string;
  loadingType?: LoadingType;
  loadMoreText?: string;
  emptyStateContent: string;
  emptyStateSubcontent: string;
  emptyStateLogo: React.ReactNode;
  title?: string;
  listContainerClassName?: string;
  onPageChange?: (page: number) => void;
}

function SearchableList<T>({
  onSearch,
  onLoadMore,
  renderItem,
  renderSkeleton,
  isLoading,
  items,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage = 10,
  searchPlaceholder = 'Search...',
  loadingType = LoadingType.PAGINATION,
  loadMoreText = 'Load More',
  emptyStateContent,
  emptyStateSubcontent,
  emptyStateLogo,
  title,
  listContainerClassName = 'flex flex-col gap-4',
  onPageChange,
}: SearchableListProps<T>) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && currentPage < totalPages) {
      onLoadMore(currentPage + 1);
    }
  }, [isLoading, currentPage, totalPages, onLoadMore]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      // Clear items immediately to show loading state
      onLoadMore(newPage);
    },
    [onLoadMore]
  );

  useEffect(() => {
    if (loadingType !== LoadingType.INFINITE_SCROLL) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverTarget = observerTarget.current;

    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [loadingType, handleLoadMore]);

  const hasMore = items.length < totalItems;

  return (
    <div className="space-y-2">
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-8 md:flex-row">
        {title && (
          <h1 className="whitespace-nowrap text-3xl font-bold text-text-primary">{title}</h1>
        )}
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[720px] text-text-primary focus-visible:ring-foreground"
        />
      </div>

      <div className={cn('flex h-fit flex-col space-y-2')}>
        {!isLoading && totalItems > 0 && (
          <span className="text-sm text-text-tertiary">
            Results: {totalItems} {title}
          </span>
        )}
        <div className={cn(listContainerClassName)}>
          {items.map((item, index) => (
            <div key={index}>{renderItem(item)}</div>
          ))}
          {isLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <div key={`skeleton-${index}`}>{renderSkeleton()}</div>
            ))}
        </div>
        {!isLoading && items.length === 0 && (
          <EmptyState
            content={emptyStateContent}
            logo={emptyStateLogo}
            subcontent={emptyStateSubcontent}
          />
        )}
        {loadingType === LoadingType.INFINITE_SCROLL && hasMore && (
          <div ref={observerTarget} className="h-10" />
        )}
      </div>
      {loadingType === LoadingType.PAGINATION && totalPages > 1 && items.length > 0 && (
        <Pagination className="mt-4 text-text-secondary">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => handlePageChange(currentPage - 1)} />
              </PaginationItem>
            )}
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext href="#" onClick={() => handlePageChange(currentPage + 1)} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
      {loadingType === LoadingType.LOAD_MORE && hasMore && (
        <Button onClick={handleLoadMore} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? 'Loading...' : loadMoreText}
        </Button>
      )}
    </div>
  );
}

export default SearchableList;
