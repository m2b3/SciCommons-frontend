'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { Users } from 'lucide-react';
import { toast } from 'sonner';

import { useCommunitiesApiListCommunities } from '@/api/communities/communities';
import { CommunityOut } from '@/api/schemas';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import CommunityCard, { CommunityCardSkeleton } from '@/components/communities/CommunityCard';

interface CommunitiesResponse {
  data: {
    items: CommunityOut[];
    num_pages: number;
    total: number;
  };
}

const Communities: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  // const [sort, setSort] = useState<string>('latest');
  const [communities, setCommunities] = useState<CommunityOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const loadingType = LoadingType.PAGINATION;

  const { data, isPending, error } = useCommunitiesApiListCommunities<CommunitiesResponse>({
    page: page,
    per_page: 10,
    search: search,
  });

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
    if (data) {
      if (page === 1 || loadingType === LoadingType.PAGINATION) {
        setCommunities(data.data.items);
      } else {
        setCommunities((prevCommunities) => [...prevCommunities, ...data.data.items]);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType]);

  const handleSearch = useCallback((term: string) => {
    setSearch(term);
    setPage(1);
    setCommunities([]);
  }, []);

  const handleLoadMore = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const renderCommunity = useCallback(
    (community: CommunityOut) => <CommunityCard community={community} />,
    []
  );

  const renderSkeleton = useCallback(() => <CommunityCardSkeleton />, []);

  return (
    <div className="container mx-auto p-4">
      <SearchableList<CommunityOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderCommunity}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={communities}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        loadingType={loadingType}
        searchPlaceholder="Search communities..."
        emptyStateContent="No communities found"
        emptyStateSubcontent="Try using different keywords"
        emptyStateLogo={<Users size={64} />}
      />
    </div>
  );
};

export default Communities;
