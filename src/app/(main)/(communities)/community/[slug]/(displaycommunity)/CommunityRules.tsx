import React from 'react';

import { CommunityOut } from '@/api/schemas';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';

interface CommunityRulesProps {
  community: CommunityOut;
}

const CommunityRules: React.FC<CommunityRulesProps> = ({ community }) => {
  return (
    <div className="rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <h2 className="mb-4 font-semibold text-text-secondary res-heading-xs">Rules</h2>
      {(!community.rules || community.rules?.length === 0) && (
        <p className="text-text-tertiary res-text-xs">
          Rules have not been set for this community.
        </p>
      )}
      {community.rules &&
        community.rules?.map((rule, index) => (
          <ul className="space-y-3" key={index}>
            <li key={index} className="flex items-start">
              <span className="mr-2 text-functional-greenContrast res-text-xs">{index + 1}.</span>
              <p className="text-text-primary res-text-xs">{rule}</p>
            </li>
          </ul>
        ))}
    </div>
  );
};

export default CommunityRules;

export const CommunityRulesSkeleton: React.FC = () => {
  return (
    <Skeleton className="rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <BlockSkeleton className="h-8 w-20" />
      <TextSkeleton className="mt-2" />
      <TextSkeleton className="mt-2 w-32" />
      <TextSkeleton className="mt-2" />
      <TextSkeleton className="mt-2" />
      <TextSkeleton className="mt-2 w-40" />
    </Skeleton>
  );
};
