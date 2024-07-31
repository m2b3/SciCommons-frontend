import { FileText, UserCheck, Users } from 'lucide-react';

import { CommunityOut } from '@/api/schemas';

interface CommunityStatsProps {
  community: CommunityOut;
}

const CommunityStats: React.FC<CommunityStatsProps> = ({ community }) => {
  return (
    <div className="rounded-md border-2 bg-white p-4 dark:bg-gray-800 dark:shadow-gray-700/50">
      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
        Community Stats
      </h2>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Users className="mr-2 h-5 w-5" />
          <span>{community.num_members} Members</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <FileText className="mr-2 h-5 w-5" />
          <span>Published {community.num_published_articles} Articles so far</span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <UserCheck className="mr-2 h-5 w-5" />
          <span>
            {community.num_moderators} Moderators & {community.num_reviewers} Reviewers
          </span>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <FileText className="mr-2 h-5 w-5" />
          <span>{community.num_articles} articles have been reviewed</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;

export const CommunityStatsSkeleton: React.FC = () => {
  return (
    <div className="rounded-md border-2 bg-white p-4 dark:bg-gray-800 dark:shadow-gray-700/50">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex flex-col space-y-4">
        {[Users, FileText, UserCheck, FileText].map((Icon, index) => (
          <div key={index} className="flex items-center">
            <Icon className="mr-2 h-5 w-5 text-gray-300 dark:text-gray-600" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
};
