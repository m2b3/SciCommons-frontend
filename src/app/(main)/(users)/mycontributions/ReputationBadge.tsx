import React from 'react';

interface ReputationBadgeProps {
  level: string;
  score: number;
}

const ReputationBadge: React.FC<ReputationBadgeProps> = ({ level, score }) => (
  <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 p-4 text-white dark:from-purple-600 dark:to-pink-700">
    <div>
      <h3 className="text-lg font-semibold">Reputation Level</h3>
      <p className="mt-1 text-2xl font-bold">{level}</p>
    </div>
    <div className="text-right">
      <p className="text-sm">Total Score</p>
      <p className="text-3xl font-bold">{score}</p>
    </div>
  </div>
);

export default ReputationBadge;

export const ReputationBadgeSkeleton: React.FC = () => (
  <div className="flex animate-pulse items-center justify-between rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 p-4 text-white dark:from-purple-600 dark:to-pink-700">
    <div>
      <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
      <div className="mt-1 h-6 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
    </div>
    <div className="text-right">
      <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-700"></div>
      <div className="mt-1 h-8 w-16 rounded bg-gray-300 dark:bg-gray-700"></div>
    </div>
  </div>
);
