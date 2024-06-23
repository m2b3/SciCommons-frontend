import React from 'react';

interface CommunityRulesProps {
  rules: string[];
}

const CommunityRules: React.FC<CommunityRulesProps> = ({ rules }) => {
  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Rules</h2>
      <ul className="space-y-3">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-green-300">{index + 1}.</span>
            <p className="text-gray-700">{rule}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityRules;

export const CommunityRulesSkeleton: React.FC = () => {
  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="mb-4 h-6 w-1/2 animate-pulse bg-gray-300"></h2>
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 h-5 w-5 animate-pulse bg-gray-300"></span>
            <p className="h-5 w-full animate-pulse bg-gray-300"></p>
          </li>
        ))}
      </ul>
    </div>
  );
};
