import React from 'react';

import { BlockSkeleton } from '@/components/common/Skeleton';
import { Skeleton } from '@/components/common/Skeleton';

interface ContributionCardProps {
  icon: React.FC;
  title: string;
  count: number | undefined | null;
  description: string;
}

const ContributionCard: React.FC<ContributionCardProps> = ({
  icon: Icon,
  title,
  count,
  description,
}) => (
  <div className="flex items-start gap-4 rounded-lg border border-common-contrast bg-common-cardBackground p-4">
    <div className="h-5 w-5 text-functional-blue">
      <Icon />
    </div>
    {/* Fixed by Codex on 2026-02-27
       Who: Codex
       What: Hardened contribution-card header against long title crowding.
       Why: Long titles could press into the trailing count column on tighter widths.
       How: Make the header row `min-w-0` with a flexible wrapping title and a shrink-protected count. */}
    <div className="w-full min-w-0">
      <div className="flex min-w-0 items-start justify-between gap-2 sm:flex-col">
        <h3 className="min-w-0 flex-1 break-words text-base font-semibold text-text-primary [overflow-wrap:anywhere]">
          {title}
        </h3>
        <p className="shrink-0 text-2xl font-bold text-functional-blue">{count}</p>
      </div>
      <p className="mt-1 text-xs text-text-tertiary">{description}</p>
    </div>
  </div>
);

export default ContributionCard;

export const ContributionCardSkeleton: React.FC = () => (
  <Skeleton className="flex w-full flex-row items-start gap-4 rounded-xl border border-common-contrast bg-common-cardBackground">
    <BlockSkeleton className="h-5 w-5 shrink-0 overflow-x-hidden rounded-full" />
    <div className="flex flex-col gap-2">
      <BlockSkeleton className="h-4 w-28" />
      <BlockSkeleton className="h-6 w-20" />
      <BlockSkeleton className="h-4 w-32" />
    </div>
  </Skeleton>
);
