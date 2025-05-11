import React from 'react';

import Image from 'next/image';

import { BlockSkeleton } from '@/components/common/Skeleton';
import { Skeleton } from '@/components/common/Skeleton';

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
  <Skeleton className="mt-6 flex w-full flex-row items-center justify-between overflow-x-hidden rounded-xl border border-common-contrast bg-gradient-to-r from-purple-400/25 to-pink-500/25">
    <div>
      <BlockSkeleton className="h-4 w-32 bg-white/30" />
      <BlockSkeleton className="mt-1 h-6 w-24 bg-white/30" />
    </div>
    <div>
      <BlockSkeleton className="h-4 w-20 bg-white/30" />
      <BlockSkeleton className="mt-1 h-8 w-16 bg-white/30" />
    </div>
  </Skeleton>
);
