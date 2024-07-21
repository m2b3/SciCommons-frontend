'use client';

import React, { useEffect, useRef } from 'react';

import toast from 'react-hot-toast';

import { useCommunitiesApiGetCommunity } from '@/api/communities/communities';
import CommunityHighlightCard from '@/components/communities/CommunityHighlightCard';
import DisplayCommunitySkeletonLoader from '@/components/loaders/DisplayCommunitySkeletonLoader';
import TabNavigation from '@/components/ui/tab-navigation';
import { RelevantCommunities } from '@/constants/dummyData';
import useStore from '@/hooks/useStore';
import { useAuthStore } from '@/stores/authStore';

import AssessmentsList from '../assessments/[assessmentId]/AssessmentsList';
import CommunityArticles from './CommunityArticles';
import CommunityRules, { CommunityRulesSkeleton } from './CommunityRules';
import CommunityStats, { CommunityStatsSkeleton } from './CommunityStats';
import DisplayCommunity from './DisplayCommunity';

// Todo: Fix the issue of accessToken for non-logged in users (Important)

const Community = ({ params }: { params: { slug: string } }) => {
  const accessToken = useStore(useAuthStore, (state) => state.accessToken);

  const axiosConfig = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};

  const [isRightHovered, setIsRightHovered] = React.useState(false);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);

  const communityQuery = useCommunitiesApiGetCommunity(params.slug, {
    request: axiosConfig,
  });

  const { data, error, isPending, refetch } = communityQuery;

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  const tabs = data
    ? [
        {
          title: 'Articles',
          content: <CommunityArticles communityId={data.data.id} />,
        },
        {
          title: 'About',
          content: (
            <div className="flex flex-col space-y-4">
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra, erat vitae
                condimentum luctus, velit purus lacinia nunc, id suscipit mi purus et odio.
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia
                curae; Sed convallis, neque in placerat egestas, libero diam finibus turpis, a
                ultricies justo tortor nec purus.
              </p>
            </div>
          ),
        },
        ...(data.data.is_moderator || data.data.is_reviewer
          ? [
              {
                title: 'Assessments',
                content: <AssessmentsList communityId={data.data.id} />,
              },
            ]
          : []),
      ]
    : [];

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (window.innerWidth >= 1024) {
        // Only apply this behavior for lg screens and up
        const leftSide = leftSideRef.current;
        const rightSide = rightSideRef.current;

        if (rightSide && rightSide.contains(e.target as Node)) {
          // If scrolling inside the right side, do nothing
          return;
        }

        if (leftSide) {
          const { scrollTop, scrollHeight, clientHeight } = leftSide;

          if (e.deltaY > 0 && scrollTop + clientHeight < scrollHeight) {
            // Scrolling down and left side has more to scroll
            e.preventDefault();
            leftSide.scrollTop += e.deltaY;
          } else if (e.deltaY < 0 && scrollTop > 0) {
            // Scrolling up and left side is not at the top
            e.preventDefault();
            leftSide.scrollTop += e.deltaY;
          }
          // If left side is at the top or bottom, allow normal page scroll
        }
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  return (
    <div className="container mx-auto">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="p-4">
          {isPending ? (
            <DisplayCommunitySkeletonLoader />
          ) : (
            data && <DisplayCommunity community={data.data} refetch={refetch} />
          )}
        </div>
        {data && (
          <>
            {/* <div className="p-4">
              <CommunityStats community={data.data} />
            </div> */}
            {/* <div className="p-4">
              {data.data.rules.length === 0 ? (
                <div className="rounded-md bg-white p-6 shadow-md">
                  <h2 className="mb-4 text-xl font-semibold">No Rules</h2>
                  <p className="text-gray-700">Rules have not been set for this community.</p>
                </div>
              ) : (
                <CommunityRules rules={data.data.rules} />
              )}
            </div> */}
            <div className="p-4">
              <TabNavigation tabs={tabs} />
            </div>
            <div className="p-4">
              <div className="rounded-md bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold">Relevant Communities</h2>
                <div className="flex flex-col gap-8">
                  {RelevantCommunities.map((community, index) => (
                    <CommunityHighlightCard
                      key={index}
                      image={community.image}
                      description={community.description}
                      members={community.members}
                      articlesPublished={community.articlesPublished}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex">
          {/* Left side */}
          <div ref={leftSideRef} className="scrollbar-hide h-screen w-2/3 overflow-y-auto p-4">
            {isPending ? (
              <DisplayCommunitySkeletonLoader />
            ) : (
              data && <DisplayCommunity community={data.data} refetch={refetch} />
            )}
            {data && (
              <div className="mt-4">
                <TabNavigation tabs={tabs} />
              </div>
            )}
          </div>

          {/* Right side */}
          <div
            ref={rightSideRef}
            className={`h-screen w-1/3 p-4 transition-all duration-300 ${
              isRightHovered ? 'custom-scrollbar overflow-y-auto' : 'overflow-y-hidden'
            }`}
            onMouseEnter={() => setIsRightHovered(true)}
            onMouseLeave={() => setIsRightHovered(false)}
          >
            {isPending ? (
              <>
                <CommunityStatsSkeleton />
                <CommunityRulesSkeleton />
              </>
            ) : (
              data && (
                <>
                  <div className="mb-4">
                    <CommunityStats community={data.data} />
                  </div>
                  {data.data.rules.length === 0 ? (
                    <div className="mb-4 rounded-md bg-white p-6 shadow-md">
                      <h2 className="mb-4 text-xl font-semibold">No Rules</h2>
                      <p className="text-gray-700">Rules have not been set for this community.</p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <CommunityRules rules={data.data.rules} />
                    </div>
                  )}
                  <div className="rounded-md bg-white p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Relevant Communities</h2>
                    <div className="flex flex-col gap-8">
                      {RelevantCommunities.map((community, index) => (
                        <CommunityHighlightCard
                          key={index}
                          image={community.image}
                          description={community.description}
                          members={community.members}
                          articlesPublished={community.articlesPublished}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
