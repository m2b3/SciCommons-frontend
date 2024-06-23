'use client';

import React from 'react';

import SearchBar from '@/components/SearchBar';
import CommunityCard from '@/components/communities/CommunityCard';
import TabNavigation from '@/components/ui/tab-navigation';
import { communityData } from '@/constants/dummyData';

import { Posts } from './TabContent';
import UserProfileStats from './UserProfileStats';

const MyContributions: React.FC = () => {
  const tabs = [
    {
      title: 'Articles',
      content: (
        <div className="flex flex-col space-y-4">
          <SearchBar />
          {/* {articles.map((article, index) => (
            <ArticleCard key={index} {...article} />
          ))} */}
        </div>
      ),
    },
    {
      title: 'Communities',
      content: (
        <div className="flex flex-col space-y-4">
          {communityData.map((community, index) => (
            <CommunityCard key={index} {...community} />
          ))}
        </div>
      ),
    },
    { title: 'Posts', content: <Posts /> },
    { title: 'Bookmarks', content: <Posts /> },
  ];

  return (
    <div className="container mx-auto p-4">
      <UserProfileStats
        reputationScore={10}
        goldMedals={2}
        silverMedals={4}
        bronzeMedals={8}
        ratedArticles={9}
        commentedArticles={10}
        articlesPublished={42}
        communitiesInvolved={5}
        profileImageUrl="/auth/login.png"
      />

      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default MyContributions;
