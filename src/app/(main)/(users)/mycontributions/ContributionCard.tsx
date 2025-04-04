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
  <div className="flex items-start space-x-3 rounded-lg bg-white-primary p-4 shadow-md">
    <div className="rounded-full bg-blue-100 p-2">
      <div className="h-5 w-5 text-blue-500">
        <Icon />
      </div>
    </div>
    <div>
      <h3 className="text-base font-semibold text-dark-primary">{title}</h3>
      <p className="mt-1 text-2xl font-bold text-blue-600">{count}</p>
      <p className="mt-1 text-xs text-gray-600">{description}</p>
    </div>
  </div>
);

export default ContributionCard;

export const ContributionCardSkeleton: React.FC = () => (
  <div className="flex animate-pulse items-start space-x-3 rounded-lg bg-white-primary p-4 shadow-md">
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
