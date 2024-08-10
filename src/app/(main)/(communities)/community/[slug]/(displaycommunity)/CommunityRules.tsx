import React from 'react';

interface CommunityRulesProps {
  rules: string[];
}

const CommunityRules: React.FC<CommunityRulesProps> = ({ rules }) => {
  return (
    <div className="rounded-md border-2 border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-700/50">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">Rules</h2>
      <ul className="space-y-3">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-green-500 dark:text-green-400">{index + 1}.</span>
            <p className="text-gray-700 dark:text-gray-300">{rule}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityRules;

export const CommunityRulesSkeleton: React.FC = () => {
  return (
    <div className="rounded-md border-2 border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-700/50">
      <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <ul className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 h-4 w-4 animate-pulse rounded bg-green-200 dark:bg-green-700" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </li>
        ))}
      </ul>
    </div>
  );
};
