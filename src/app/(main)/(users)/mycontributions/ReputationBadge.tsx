import React from 'react';

import Image from 'next/image';

interface ReputationBadgeProps {
  level: string;
  score: number;
}

const ReputationBadge: React.FC<ReputationBadgeProps> = ({ level, score }) => (
  <div className="relative inset-0 flex items-center justify-between overflow-hidden rounded-xl border border-common-contrast bg-common-cardBackground p-4">
    <Image
      src={'/images/assets/gradient.webp'}
      fill
      alt=""
      className="z-0 object-cover opacity-20 blur-lg invert dark:invert-0"
      quality={10}
    />
    <div>
      <h3 className="text-sm text-text-secondary">Reputation Level</h3>
      <p className="mt-1 text-xl font-bold text-text-primary md:text-2xl">{level}</p>
    </div>
    <div className="text-right">
      <p className="text-sm text-text-secondary">Total Score</p>
      <p className="mt-1 text-xl font-bold text-text-primary md:text-2xl">{score}</p>
    </div>
  </div>
);

export default ReputationBadge;

export const ReputationBadgeSkeleton: React.FC = () => (
  <div className="flex animate-pulse items-center justify-between rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 p-4 text-white">
    <div>
      <div className="h-4 w-32 rounded bg-gray-300"></div>
      <div className="mt-1 h-6 w-24 rounded bg-gray-300"></div>
    </div>
    <div className="text-right">
      <div className="h-4 w-20 rounded bg-gray-300"></div>
      <div className="mt-1 h-8 w-16 rounded bg-gray-300"></div>
    </div>
  </div>
);
