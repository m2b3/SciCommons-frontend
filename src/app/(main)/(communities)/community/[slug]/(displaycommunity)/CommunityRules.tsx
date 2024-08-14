import React from 'react';

import { CommunityOut } from '@/api/schemas';

interface CommunityRulesProps {
  community: CommunityOut;
}

const CommunityRules: React.FC<CommunityRulesProps> = ({ community }) => {
  return (
    <div className="rounded-md border-2 border-gray-200 bg-white-secondary p-6 shadow-md">
      <h2 className="mb-4 font-semibold text-gray-800 res-heading-xs">Rules</h2>
      {community.rules.length === 0 && (
        <p className="text-gray-700 res-text-sm">Rules have not been set for this community.</p>
      )}
      {community.rules.map((rule, index) => (
        <ul className="space-y-3" key={index}>
          <li key={index} className="flex items-start">
            <span className="mr-2 text-green-500">{index + 1}.</span>
            <p className="text-gray-700 res-text-sm">{rule}</p>
          </li>
        </ul>
      ))}
    </div>
  );
};

export default CommunityRules;

export const CommunityRulesSkeleton: React.FC = () => {
  return (
    <div className="rounded-md border-2 border-gray-200 bg-white-secondary p-6 shadow-md">
      <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200" />
      <ul className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 h-4 w-4 animate-pulse rounded bg-green-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          </li>
        ))}
      </ul>
    </div>
  );
};
