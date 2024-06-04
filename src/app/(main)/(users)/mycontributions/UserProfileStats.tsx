import React from 'react';

import Image from 'next/image';

import { CheckCircle, Edit, LucideUsers, Medal, Star } from 'lucide-react';

interface UserProfileStatsProps {
  reputationScore: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  ratedArticles: number;
  commentedArticles: number;
  articlesPublished: number;
  communitiesInvolved: number;
  profileImageUrl: string;
}

const UserProfileStats: React.FC<UserProfileStatsProps> = ({
  reputationScore,
  goldMedals,
  silverMedals,
  bronzeMedals,
  ratedArticles,
  commentedArticles,
  articlesPublished,
  communitiesInvolved,
  profileImageUrl,
}) => {
  return (
    <div className="flex items-center space-x-4 rounded-lg bg-white p-4 shadow-md">
      <Image src={profileImageUrl} alt="Profile" width={80} height={80} className="rounded-full" />
      <div className="flex-grow">
        <div className="text-lg font-semibold">Reputation Score</div>
        <div className="flex items-center space-x-2 text-xl">
          <span>{reputationScore}</span>
          <div className="flex items-center space-x-1">
            <Medal className="text-yellow-500" />
            <span>{goldMedals}</span>
            <Medal className="text-gray-500" />
            <span>{silverMedals}</span>
            <Medal className="text-orange-500" />
            <span>{bronzeMedals}</span>
          </div>
        </div>
      </div>
      <div className="flex-grow">
        <div className="text-lg font-semibold">Rated Articles</div>
        <div className="flex items-center space-x-2">
          <Star className="text-yellow-500" />
          <span>{ratedArticles}</span>
        </div>
      </div>
      <div className="flex-grow">
        <div className="text-lg font-semibold">Commented Articles</div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="text-green-500" />
          <span>{commentedArticles}</span>
        </div>
      </div>
      <div className="flex-grow">
        <div className="text-lg font-semibold">Articles Published</div>
        <div className="flex items-center space-x-2">
          <Edit className="text-blue-500" />
          <span>{articlesPublished}</span>
        </div>
      </div>
      <div className="flex-grow">
        <div className="text-lg font-semibold">Communities Involved</div>
        <div className="flex items-center space-x-2">
          <LucideUsers className="text-purple-500" />
          <span>{communitiesInvolved}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileStats;
