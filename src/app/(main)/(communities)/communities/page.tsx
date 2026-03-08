'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Users } from 'lucide-react';

import { useCommunitiesApiListCommunities } from '@/api/communities/communities';
import { CommunityListOut } from '@/api/schemas';
import { useUsersApiListMyCommunities } from '@/api/users/users';
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

type CommunityMembershipRole = 'admin' | 'moderator' | 'reviewer' | 'member' | null;

const roleBadgeDefinitions: Record<
  Exclude<CommunityMembershipRole, 'member' | null>,
  CommunityRoleBadge
> = {
  admin: { code: 'A', label: 'Admin' },
  moderator: { code: 'M', label: 'Moderator' },
  reviewer: { code: 'R', label: 'Reviewer' },
};

const resolveCommunityRole = (role: CommunityListOut['role']): CommunityMembershipRole => {
  const normalizedRole = role?.trim().toLowerCase();
  if (!normalizedRole) return null;

  if (normalizedRole === 'admin' || normalizedRole === 'owner') return 'admin';
  if (normalizedRole === 'moderator' || normalizedRole === 'mod') return 'moderator';
  if (normalizedRole === 'reviewer') return 'reviewer';
  if (normalizedRole === 'member') return 'member';

  return null;
};

/* Fixed by Codex on 2026-03-08
   Who: Codex
   What: Unified card role sorting around the new list API `role` field.
   Why: Backend now returns role per community item, so client no longer needs 4 extra role lookup calls.
   How: Normalize per-item roles, map admin/moderator/reviewer/member to ordered tiers, and keep type-based fallback for non-members. */
const getCommunitySortTier = (community: CommunityListOut): number => {
  const membershipRole = resolveCommunityRole(community.role);

  if (membershipRole === 'admin') return 0;
  if (membershipRole === 'moderator') return 1;
  if (membershipRole === 'reviewer') return 2;
  if (membershipRole === 'member') return 3;
  if (community.type === 'public') return 4;
  if (community.type === 'private') return 5;
  return 6;
};

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

  /* Fixed by Codex on 2026-03-08
     Who: Codex
     What: Kept deterministic Communities sorting while removing role fan-out queries.
     Why: The list API now includes each user's role per community item, so sorting can be done from one payload.
     How: Stable-sort by per-item role tier, then preserve original list order within the same tier. */
  const sortedDisplayedItems = useMemo(() => {
    return displayedItems
      .map((community, index) => ({ community, index }))
      .sort((left, right) => {
        const tierDelta = getCommunitySortTier(left.community) - getCommunitySortTier(right.community);
        return tierDelta !== 0 ? tierDelta : left.index - right.index;
      })
      .map(({ community }) => community);
  }, [displayedItems]);

  const renderCommunity = useCallback(
    (community: CommunityListOut) => {
      const membershipRole = resolveCommunityRole(community.role);
      const roleBadges: CommunityRoleBadge[] =
        membershipRole && membershipRole !== 'member' ? [roleBadgeDefinitions[membershipRole]] : [];
      const isMemberOnly = membershipRole === 'member';
      const hasAnyMembership = membershipRole !== null;
      const accessIndicator: CommunityAccessIndicator | undefined =
        !hasAnyMembership
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
    []
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

  const sortedDisplayedItems = useMemo(() => {
    return displayedItems
      .map((community, index) => ({ community, index }))
      .sort((left, right) => {
        const tierDelta = getCommunitySortTier(left.community) - getCommunitySortTier(right.community);
        return tierDelta !== 0 ? tierDelta : left.index - right.index;
      })
      .map(({ community }) => community);
  }, [displayedItems]);

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
      const membershipRole = resolveCommunityRole(community.role);
      const roleBadges: CommunityRoleBadge[] =
        membershipRole && membershipRole !== 'member' ? [roleBadgeDefinitions[membershipRole]] : [];

      return <CommunityCard community={community} roleBadges={roleBadges} />;
    },
    []
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
