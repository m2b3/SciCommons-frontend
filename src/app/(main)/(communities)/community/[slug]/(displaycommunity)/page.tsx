'use client';

import React, { useEffect } from 'react';

import { CircleXIcon } from 'lucide-react';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import EmptyState from '@/components/common/EmptyState';
import CommunityBreadcrumb from '@/components/communities/CommunityBreadcrumb';
import TabNavigation from '@/components/ui/tab-navigation';
import useStore from '@/hooks/useStore';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import AssessmentsList from './AssessmentsList';
import CommunityArticles from './CommunityArticles';
import CommunityRules from './CommunityRules';
import DisplayCommunity, { DisplayCommunitySkeleton } from './DisplayCommunity';

const Community = ({ params }: { params: { slug: string } }) => {
  const accessToken = useStore(useAuthStore, (state) => state.accessToken);
  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Brief flash then logout when accessing communities
     Root cause: Query running before accessToken available sends unauthenticated request → 401 → logout
     Solution: Keep enabled check to prevent query until auth ready, but also handle loading state properly
     Result: Wait for auth before querying, no unauthorized requests */
  const communityQuery = useCommunitiesApiGetCommunity(params.slug, {
    request: axiosConfig,
    query: {
      enabled: !!accessToken, // CRITICAL: Don't query until we have auth token!
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: false, // Don't retry failed requests to prevent multiple 401s
    },
  });

  const { data, error, isPending, refetch } = communityQuery;

  // Don't show error toast - we render error state instead
  // This prevents double error messages (toast + error page)
  useEffect(() => {
    // Only show toast for non-HTTP errors (network issues, etc.)
    if (error && !error.response?.status) {
      showErrorToast(error);
    }
  }, [error]);

  // Performance: Lazy-loaded tabs - Rules and Assessments only render when clicked
  const tabs = data
    ? [
        {
          title: 'Articles',
          content: () =>
            data.data.type == 'private' && !data.data.is_member ? (
              <EmptyState
                logo={<CircleXIcon className="size-8 text-text-secondary" />}
                content="Join to Access"
                subcontent="This is a private community. Become a member to view and contribute."
              />
            ) : (
              <CommunityArticles communityId={data.data.id} communityName={data.data.name} />
            ),
        },
        // {
        //   title: 'About',
        //   content: () => <CommunityAbout about={data.data.about as YooptaContentValue} />,
        // },
        ...(data.data.rules || data.data.is_member
          ? [
              {
                title: 'Rules',
                content: () => <CommunityRules community={data.data} />,
              },
            ]
          : []),
        ...(data.data.is_moderator || data.data.is_reviewer
          ? [
              {
                title: 'Assessments',
                content: () => <AssessmentsList communityId={data.data.id} />,
              },
            ]
          : []),
      ]
    : [];

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Accessing non-existent/private community caused logout and 404, horrible UX
     Solution: Add proper error state rendering for 404 and access denied cases
     Result: User sees meaningful error message without being logged out */

  // Handle error states without logging user out
  // Only show error after query has actually failed (not during hydration/loading)
  if (error && !isPending && error.response?.status) {
    const is404 = error.response.status === 404;
    const is403 = error.response.status === 403;

    return (
      <div className="container h-fit p-4">
        <div className="pl-2">
          <CommunityBreadcrumb
            communityName={params.slug}
            communitySlug={params.slug}
            isLoading={false}
          />
        </div>
        <div className="flex min-h-[60vh] items-center justify-center">
          <EmptyState
            logo={<CircleXIcon className="size-16 text-text-tertiary" />}
            content={
              is404 ? 'Community Not Found' : is403 ? 'Access Denied' : 'Unable to Load Community'
            }
            subcontent={
              is404
                ? "This community doesn't exist or has been removed."
                : is403
                  ? "You don't have permission to view this private community."
                  : 'An error occurred while loading this community. Please try again later.'
            }
          />
        </div>
      </div>
    );
  }

  /* Fixed by Claude Sonnet 4.5 on 2026-02-09
     Problem: Sometimes blank page when accessing community (no error, just empty)
     Root cause: If accessToken exists, no error, but data is undefined (edge case during hydration),
                 the render logic would skip skeleton (isPending=false) and skip content (data=undefined)
     Solution: Show loading state whenever we don't have data AND no error, regardless of isPending
     Result: No more blank pages - always show either skeleton, error, or content */

  // Show loading state while waiting for auth to initialize
  if (!accessToken) {
    return (
      <div className="container h-fit p-4">
        <DisplayCommunitySkeleton />
      </div>
    );
  }

  // Show loading state if we don't have data yet (unless there's an error)
  // This handles edge cases during hydration where isPending might be false but data not loaded
  if (!data && !error) {
    return (
      <div className="container h-fit p-4">
        <DisplayCommunitySkeleton />
      </div>
    );
  }

  // At this point we either have data or an error (error case already handled above)
  return (
    <div className="container h-fit p-4">
      <div className="pl-2">
        <CommunityBreadcrumb
          communityName={data?.data.name}
          communitySlug={params.slug}
          isLoading={isPending}
        />
      </div>
      {data && (
        <>
          <DisplayCommunity community={data.data} refetch={refetch} />
          <div className="mt-2 md:mt-0">
            <TabNavigation tabs={tabs} />
          </div>
        </>
      )}
    </div>
  );
};

export default withAuthRedirect(Community, { requireAuth: true });
