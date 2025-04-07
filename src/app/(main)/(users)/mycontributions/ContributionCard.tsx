import React from 'react';

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
  <div className="flex items-start space-x-3 rounded-lg border border-common-contrast bg-common-cardBackground p-4 res-text-xs hover:shadow-md hover:shadow-common-minimal">
    <div className="rounded-full bg-blue-100 p-2">
      <div className="h-5 w-5 text-blue-500">
        <Icon />
      </div>
    </div>
    <div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-2xl font-bold text-blue-600">{count}</p>
      <p className="mt-1 text-xs text-text-secondary">{description}</p>
    </div>
  </div>
);

export default ContributionCard;

export const ContributionCardSkeleton: React.FC = () => (
  <div className="flex animate-pulse items-start space-x-3 rounded-lg border border-common-contrast bg-common-cardBackground p-4 res-text-xs hover:shadow-md hover:shadow-common-minimal">
    <div className="rounded-full bg-blue-100 p-2">
      <div className="h-5 w-5 rounded-full bg-gray-300"></div>
    </div>
    <div>
      <div className="h-4 w-32 rounded bg-gray-300"></div>
      <div className="mt-1 h-6 w-20 rounded bg-gray-300"></div>
      <div className="mt-1 h-4 w-40 rounded bg-gray-300"></div>
    </div>
  </div>
);
