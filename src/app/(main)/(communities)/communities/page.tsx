'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { Users } from 'lucide-react';

import { useCommunitiesApiListCommunities } from '@/api/communities/communities';
import { CommunityOut } from '@/api/schemas';
import { useUsersApiListMyCommunities } from '@/api/users/users';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import CommunityCard, { CommunityCardSkeleton } from '@/components/communities/CommunityCard';
import TabComponent from '@/components/communities/TabComponent';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface CommunitiesResponse {
  data: {
    items: CommunityOut[];
    num_pages: number;
    total: number;
  };
}

enum Tabs {
  COMMUNITIES = 'Communities',
  MY_COMMUNITIES = 'My Communities',
}

interface TabContentProps {
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  accessToken?: string;
  isActive: boolean;
}

const CommunitiesTabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  isActive,
}) => {
  const [communities, setCommunities] = useState<CommunityOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;

  const { data, isPending, error } = useCommunitiesApiListCommunities<CommunitiesResponse>(
    {
      page,
      per_page: 10,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['communities', page, search],
        enabled: isActive,
      },
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
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

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      setCommunities([]);
    },
    [setSearch, setPage]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderCommunity = useCallback(
    (community: CommunityOut) => <CommunityCard community={community} />,
    []
  );

  const renderSkeleton = useCallback(() => <CommunityCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
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
        title={Tabs.COMMUNITIES}
        listContainerClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      />
    </div>
  );
};

const MyCommunitiesTabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  accessToken,
  isActive,
}) => {
  const [communities, setCommunities] = useState<CommunityOut[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;

  const { data, isPending, error } = useUsersApiListMyCommunities<CommunitiesResponse>(
    {
      page,
      per_page: 10,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['my_communities', page, search],
        enabled: isActive,
      },
      request: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    }
  );

  useEffect(() => {
    if (error) {
      showErrorToast(error);
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

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      setCommunities([]);
    },
    [setSearch, setPage]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderCommunity = useCallback(
    (community: CommunityOut) => <CommunityCard community={community} />,
    []
  );

  const renderSkeleton = useCallback(() => <CommunityCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
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
        searchPlaceholder="Search your communities..."
        emptyStateContent="No communities found"
        emptyStateSubcontent="Try using different keywords"
        emptyStateLogo={<Users size={64} />}
        title={Tabs.MY_COMMUNITIES}
        listContainerClassName="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      />
    </div>
  );
};

const Communities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.COMMUNITIES);
  const [communitiesPage, setCommunitiesPage] = useState<number>(1);
  const [myCommunitiesPage, setMyCommunitiesPage] = useState<number>(1);
  const [communitiesSearch, setCommunitiesSearch] = useState<string>('');
  const [myCommunitiesSearch, setMyCommunitiesSearch] = useState<string>('');

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container mx-auto p-4">
      <div className="pb-4">
        {user && (
          <TabComponent
            tabs={[Tabs.COMMUNITIES, Tabs.MY_COMMUNITIES]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
      <div className="relative">
        <CommunitiesTabContent
          search={communitiesSearch}
          setSearch={setCommunitiesSearch}
          page={communitiesPage}
          setPage={setCommunitiesPage}
          isActive={activeTab === Tabs.COMMUNITIES}
        />
        {user && accessToken && (
          <MyCommunitiesTabContent
            search={myCommunitiesSearch}
            setSearch={setMyCommunitiesSearch}
            page={myCommunitiesPage}
            setPage={setMyCommunitiesPage}
            accessToken={accessToken}
            isActive={activeTab === Tabs.MY_COMMUNITIES}
          />
        )}
      </div>
    </div>
  );
};

export default Communities;
