'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useQueries } from '@tanstack/react-query';
import { Users } from 'lucide-react';

import { useCommunitiesApiListCommunities } from '@/api/communities/communities';
import { CommunityListOut } from '@/api/schemas';
import { useUsersApiListMyCommunities, usersApiListMyCommunities } from '@/api/users/users';
import SearchableList, { LoadingType } from '@/components/common/SearchableList';
import CommunityCard, {
  CommunityAccessIndicator,
  CommunityCardSkeleton,
  CommunityRoleBadge,
} from '@/components/communities/CommunityCard';
import TabComponent from '@/components/communities/TabComponent';
import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import { useFilteredList } from '@/hooks/useFilteredList';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface CommunitiesResponse {
  data: {
    items: CommunityListOut[];
    num_pages: number;
    total: number;
  };
}

enum CommunityFilters {
  ALL = 'all',
  BOOKMARKED = 'bookmarked',
}

enum Tabs {
  COMMUNITIES = 'Communities',
  MY_COMMUNITIES = 'My Communities',
}

type ElevatedRole = 'admin' | 'moderator' | 'reviewer';
type MembershipRole = ElevatedRole | 'member';

const roleBadgeDefinitions: Array<{ role: ElevatedRole; badge: CommunityRoleBadge }> = [
  { role: 'admin', badge: { code: 'A', label: 'Admin' } },
  { role: 'moderator', badge: { code: 'M', label: 'Moderator' } },
  { role: 'reviewer', badge: { code: 'R', label: 'Reviewer' } },
];
const roleQueryOrder: MembershipRole[] = ['admin', 'moderator', 'reviewer', 'member'];

const ROLE_QUERY_PAGE_SIZE = 50;

interface TabContentProps {
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  accessToken?: string;
  isActive: boolean;
  headerTabs?: React.ReactNode;
}

const CommunitiesTabContent: React.FC<TabContentProps> = ({
  search,
  setSearch,
  page,
  setPage,
  accessToken,
  isActive,
  headerTabs,
}) => {
  const { displayedItems, setItems, appendItems, setFilter, activeFilter, reset } =
    useFilteredList<CommunityListOut>({
      filters: {
        [CommunityFilters.ALL]: () => true,
        [CommunityFilters.BOOKMARKED]: (community) => community.is_bookmarked === true,
      },
      defaultFilter: CommunityFilters.ALL,
    });

  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;

  const requestConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
  const roleMembershipRequestConfig = accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : undefined;

  const { data, isPending, error } = useCommunitiesApiListCommunities<CommunitiesResponse>(
    {
      page,
      per_page: 50,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['communities', page, search, accessToken ? 'authenticated' : 'public'],
        enabled: isActive,
      },
      request: requestConfig,
    }
  );

  /* Fixed by Codex on 2026-02-23
     Who: Codex
     What: Added role/membership status lookups for the Communities tab.
     Why: Communities cards must show A/M/R badges, member-only "m", and non-member access dots.
     How: Query paginated `/my-communities` role slices and merge ID sets into card-level status markers. */
  const roleQueries = useQueries({
    queries: roleQueryOrder.map((role) => ({
      queryKey: ['my_communities_roles', role, search],
      enabled: isActive && !!accessToken,
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryFn: async () => {
        if (!accessToken) return [] as number[];

        const roleCommunityIds: number[] = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const response = await usersApiListMyCommunities(
            {
              role,
              search,
              page: currentPage,
              per_page: ROLE_QUERY_PAGE_SIZE,
            },
            roleMembershipRequestConfig
          );

          roleCommunityIds.push(...response.data.items.map((community) => community.id));
          totalPages = response.data.num_pages;
          currentPage += 1;
        } while (currentPage <= totalPages);

        return roleCommunityIds;
      },
    })),
  });

  const [adminRoleQuery, moderatorRoleQuery, reviewerRoleQuery, memberRoleQuery] = roleQueries;
  const isRoleMembershipReady =
    !accessToken || roleQueries.every((query) => query.isSuccess || query.isError);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1 || loadingType === LoadingType.PAGINATION) {
        setItems(data.data.items);
      } else {
        appendItems(data.data.items);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType, setItems, appendItems]);

  useEffect(() => {
    if (adminRoleQuery.error) {
      showErrorToast(adminRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (moderatorRoleQuery.error) {
      showErrorToast(moderatorRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (reviewerRoleQuery.error) {
      showErrorToast(reviewerRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (memberRoleQuery.error) {
      showErrorToast(memberRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
  }, [
    adminRoleQuery.error,
    moderatorRoleQuery.error,
    reviewerRoleQuery.error,
    memberRoleQuery.error,
  ]);

  const adminCommunityIds = useMemo(
    () => new Set(adminRoleQuery.data ?? []),
    [adminRoleQuery.data]
  );
  const moderatorCommunityIds = useMemo(
    () => new Set(moderatorRoleQuery.data ?? []),
    [moderatorRoleQuery.data]
  );
  const reviewerCommunityIds = useMemo(
    () => new Set(reviewerRoleQuery.data ?? []),
    [reviewerRoleQuery.data]
  );
  const memberCommunityIds = useMemo(
    () => new Set(memberRoleQuery.data ?? []),
    [memberRoleQuery.data]
  );

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      reset();
    },
    [setSearch, setPage, reset]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  /* Fixed by Codex on 2026-02-23
     Who: Codex
     What: Sorted Communities cards by membership priority for reading-order scanning.
     Why: Product requirement calls for deterministic left-to-right, top-to-bottom role grouping.
     How: Stable-sort filtered items into Admin, Moderator, Reviewer, Member, then non-members by type. */
  const sortedDisplayedItems = useMemo(() => {
    if (!isRoleMembershipReady) {
      return displayedItems;
    }

    const getSortTier = (community: CommunityListOut) => {
      if (adminCommunityIds.has(community.id)) return 0;
      if (moderatorCommunityIds.has(community.id)) return 1;
      if (reviewerCommunityIds.has(community.id)) return 2;
      if (memberCommunityIds.has(community.id)) return 3;
      if (community.type === 'public') return 4;
      if (community.type === 'private') return 5;
      return 6;
    };

    return displayedItems
      .map((community, index) => ({ community, index }))
      .sort((left, right) => {
        const tierDelta = getSortTier(left.community) - getSortTier(right.community);
        return tierDelta !== 0 ? tierDelta : left.index - right.index;
      })
      .map(({ community }) => community);
  }, [
    displayedItems,
    isRoleMembershipReady,
    adminCommunityIds,
    moderatorCommunityIds,
    reviewerCommunityIds,
    memberCommunityIds,
  ]);

  const renderCommunity = useCallback(
    (community: CommunityListOut) => {
      const roleBadges = roleBadgeDefinitions
        .filter(({ role }) => {
          if (role === 'admin') return adminCommunityIds.has(community.id);
          if (role === 'moderator') return moderatorCommunityIds.has(community.id);
          return reviewerCommunityIds.has(community.id);
        })
        .map(({ badge }) => badge);

      const isMemberOnly = memberCommunityIds.has(community.id) && roleBadges.length === 0;
      const hasAnyMembership = roleBadges.length > 0 || isMemberOnly;
      const accessIndicator: CommunityAccessIndicator | undefined =
        isRoleMembershipReady && !hasAnyMembership
          ? community.type === 'public'
            ? {
                tone: 'public',
                label: 'Public community, not a member',
              }
            : community.type === 'private'
              ? {
                  tone: 'private',
                  label: 'Private community, membership required',
                }
              : undefined
          : undefined;

      return (
        <CommunityCard
          community={community}
          roleBadges={roleBadges}
          showMemberBadge={isMemberOnly}
          accessIndicator={accessIndicator}
        />
      );
    },
    [
      adminCommunityIds,
      moderatorCommunityIds,
      reviewerCommunityIds,
      memberCommunityIds,
      isRoleMembershipReady,
    ]
  );

  const renderSkeleton = useCallback(() => <CommunityCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
      <SearchableList<CommunityListOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderCommunity}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={sortedDisplayedItems}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        loadingType={loadingType}
        searchPlaceholder="Search communities..."
        emptyStateContent="No communities found"
        emptyStateSubcontent="Try using different keywords"
        emptyStateLogo={<Users size={64} />}
        title={Tabs.COMMUNITIES}
        headerTabs={headerTabs}
        listContainerClassName="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
        filters={[
          { label: 'All', value: CommunityFilters.ALL },
          { label: 'Bookmarked', value: CommunityFilters.BOOKMARKED },
        ]}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => {
          setFilter(filter);
        }}
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
  headerTabs,
}) => {
  const { displayedItems, setItems, appendItems, setFilter, activeFilter, reset } =
    useFilteredList<CommunityListOut>({
      filters: {
        [CommunityFilters.ALL]: () => true,
        [CommunityFilters.BOOKMARKED]: (community) => community.is_bookmarked === true,
      },
      defaultFilter: CommunityFilters.ALL,
    });

  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const loadingType = LoadingType.PAGINATION;
  const myCommunitiesRequestConfig = accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : undefined;

  const { data, isPending, error } = useUsersApiListMyCommunities<CommunitiesResponse>(
    {
      page,
      per_page: 50,
      search,
    },
    {
      query: {
        staleTime: FIVE_MINUTES_IN_MS,
        refetchOnWindowFocus: true,
        queryKey: ['my_communities', page, search],
        enabled: isActive,
      },
      request: myCommunitiesRequestConfig,
    }
  );

  /* Fixed by Codex on 2026-02-23
     Who: Codex
     What: Added paginated role map queries (admin/moderator/reviewer/member) for My Communities.
     Why: Role badges and ordering both need accurate role sets across all pages, not just page 1.
     How: For each role, iterate through all `/my-communities?role=...` pages and build ID sets. */
  const roleQueries = useQueries({
    queries: roleQueryOrder.map((role) => ({
      queryKey: ['my_communities_roles', role, search],
      enabled: isActive && !!accessToken,
      staleTime: FIVE_MINUTES_IN_MS,
      refetchOnWindowFocus: true,
      queryFn: async () => {
        if (!accessToken) return [] as number[];

        const roleCommunityIds: number[] = [];
        let currentPage = 1;
        let totalPages = 1;

        do {
          const response = await usersApiListMyCommunities(
            {
              role,
              search,
              page: currentPage,
              per_page: ROLE_QUERY_PAGE_SIZE,
            },
            myCommunitiesRequestConfig
          );

          roleCommunityIds.push(...response.data.items.map((community) => community.id));
          totalPages = response.data.num_pages;
          currentPage += 1;
        } while (currentPage <= totalPages);

        return roleCommunityIds;
      },
    })),
  });

  const [adminRoleQuery, moderatorRoleQuery, reviewerRoleQuery, memberRoleQuery] = roleQueries;

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
    if (data) {
      if (page === 1 || loadingType === LoadingType.PAGINATION) {
        setItems(data.data.items);
      } else {
        appendItems(data.data.items);
      }
      setTotalItems(data.data.total);
      setTotalPages(data.data.num_pages);
    }
  }, [data, error, page, loadingType, setItems, appendItems]);

  useEffect(() => {
    if (adminRoleQuery.error) {
      showErrorToast(adminRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (moderatorRoleQuery.error) {
      showErrorToast(moderatorRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (reviewerRoleQuery.error) {
      showErrorToast(reviewerRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
    if (memberRoleQuery.error) {
      showErrorToast(memberRoleQuery.error as Parameters<typeof showErrorToast>[0]);
    }
  }, [
    adminRoleQuery.error,
    moderatorRoleQuery.error,
    reviewerRoleQuery.error,
    memberRoleQuery.error,
  ]);

  const adminCommunityIds = useMemo(
    () => new Set(adminRoleQuery.data ?? []),
    [adminRoleQuery.data]
  );
  const moderatorCommunityIds = useMemo(
    () => new Set(moderatorRoleQuery.data ?? []),
    [moderatorRoleQuery.data]
  );
  const reviewerCommunityIds = useMemo(
    () => new Set(reviewerRoleQuery.data ?? []),
    [reviewerRoleQuery.data]
  );
  const memberCommunityIds = useMemo(
    () => new Set(memberRoleQuery.data ?? []),
    [memberRoleQuery.data]
  );

  const sortedDisplayedItems = useMemo(() => {
    const getSortTier = (community: CommunityListOut) => {
      if (adminCommunityIds.has(community.id)) return 0;
      if (moderatorCommunityIds.has(community.id)) return 1;
      if (reviewerCommunityIds.has(community.id)) return 2;
      if (memberCommunityIds.has(community.id)) return 3;
      if (community.type === 'public') return 4;
      if (community.type === 'private') return 5;
      return 6;
    };

    return displayedItems
      .map((community, index) => ({ community, index }))
      .sort((left, right) => {
        const tierDelta = getSortTier(left.community) - getSortTier(right.community);
        return tierDelta !== 0 ? tierDelta : left.index - right.index;
      })
      .map(({ community }) => community);
  }, [
    displayedItems,
    adminCommunityIds,
    moderatorCommunityIds,
    reviewerCommunityIds,
    memberCommunityIds,
  ]);

  const handleSearch = useCallback(
    (term: string) => {
      setSearch(term);
      setPage(1);
      reset();
    },
    [setSearch, setPage, reset]
  );

  const handleLoadMore = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const renderCommunity = useCallback(
    (community: CommunityListOut) => {
      const roleBadges = roleBadgeDefinitions
        .filter(({ role }) => {
          if (role === 'admin') return adminCommunityIds.has(community.id);
          if (role === 'moderator') return moderatorCommunityIds.has(community.id);
          return reviewerCommunityIds.has(community.id);
        })
        .map(({ badge }) => badge);

      return <CommunityCard community={community} roleBadges={roleBadges} />;
    },
    [adminCommunityIds, moderatorCommunityIds, reviewerCommunityIds]
  );

  const renderSkeleton = useCallback(() => <CommunityCardSkeleton />, []);

  return (
    <div
      className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'hidden opacity-0'}`}
    >
      <SearchableList<CommunityListOut>
        onSearch={handleSearch}
        onLoadMore={handleLoadMore}
        renderItem={renderCommunity}
        renderSkeleton={renderSkeleton}
        isLoading={isPending}
        items={sortedDisplayedItems}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={page}
        loadingType={loadingType}
        searchPlaceholder="Search your communities..."
        emptyStateContent="No communities found"
        emptyStateSubcontent="Try using different keywords"
        emptyStateLogo={<Users size={64} />}
        title={Tabs.MY_COMMUNITIES}
        headerTabs={headerTabs}
        listContainerClassName="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
        filters={[
          { label: 'All', value: CommunityFilters.ALL },
          { label: 'Bookmarked', value: CommunityFilters.BOOKMARKED },
        ]}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => {
          setFilter(filter);
        }}
      />
    </div>
  );
};

interface CommunitiesTabsProps {
  activeTab: Tabs;
  onTabChange: React.Dispatch<React.SetStateAction<Tabs>>;
}

const CommunitiesTabs: React.FC<CommunitiesTabsProps> = ({ activeTab, onTabChange }) => {
  const user = useAuthStore((state) => state.user);
  const tabsList = user ? [Tabs.COMMUNITIES, Tabs.MY_COMMUNITIES] : [Tabs.COMMUNITIES];
  return <TabComponent tabs={tabsList} activeTab={activeTab} setActiveTab={onTabChange} />;
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
      <div className="relative">
        <CommunitiesTabContent
          search={communitiesSearch}
          setSearch={setCommunitiesSearch}
          page={communitiesPage}
          setPage={setCommunitiesPage}
          isActive={activeTab === Tabs.COMMUNITIES}
          headerTabs={<CommunitiesTabs activeTab={activeTab} onTabChange={setActiveTab} />}
          accessToken={accessToken ?? undefined}
        />
        {user && accessToken && (
          <>
            <MyCommunitiesTabContent
              search={myCommunitiesSearch}
              setSearch={setMyCommunitiesSearch}
              page={myCommunitiesPage}
              setPage={setMyCommunitiesPage}
              accessToken={accessToken}
              isActive={activeTab === Tabs.MY_COMMUNITIES}
              headerTabs={<CommunitiesTabs activeTab={activeTab} onTabChange={setActiveTab} />}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Communities;
