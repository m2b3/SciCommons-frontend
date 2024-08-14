import React, { useEffect } from 'react';

import { useCommunitiesApiGetRelevantCommunities } from '@/api/communities/communities';
import CommunityHighlightCard, {
  CommunityHighlightCardSkeleton,
} from '@/components/communities/CommunityHighlightCard';
import { showErrorToast } from '@/lib/toastHelpers';

interface RelevantCommunitiesProps {
  communityId: number;
}

const RelevantCommunities = ({ communityId }: RelevantCommunitiesProps) => {
  const { data, isPending, error } = useCommunitiesApiGetRelevantCommunities(communityId);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="rounded-md border-2 border-gray-200 bg-white-secondary p-6 shadow-md">
      <h2 className="mb-4 font-semibold text-gray-900 res-heading-xs">Relevant Communities</h2>
      <div className="flex flex-col gap-8">
        {isPending &&
          Array.from({ length: 3 }).map((_, index) => (
            <CommunityHighlightCardSkeleton key={index} />
          ))}
        {data && data.data.length === 0 && (
          <div className="rounded-md py-4">
            <p className="text-gray-700 res-text-sm">No relevant communities found.</p>
          </div>
        )}
        {data &&
          data.data.map((community, index) => (
            <CommunityHighlightCard key={index} community={community} />
          ))}
      </div>
    </div>
  );
};

export default RelevantCommunities;
