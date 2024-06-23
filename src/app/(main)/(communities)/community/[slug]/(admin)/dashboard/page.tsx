'use client';

import React from 'react';

import { Card, LineChart, Title } from '@tremor/react';
import { FilePlus, FileText, Users } from 'lucide-react';

import ArticleHighlightCard from '@/components/articles/ArticleHighlightCard';
import { articlesData, communityStats } from '@/constants/dummyData';

const CommunityDashboard = () => {
  const community = communityStats;
  const dataFormatter = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}`;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold">{community.name}</h1>
        <p className="text-sm text-gray-500">{community.description}</p>
      </header>

      {/* Community Performance Metrics */}
      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center space-x-4">
            <Users size={32} />
            <div>
              <h2 className="text-2xl font-semibold">{community.members}</h2>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-sm text-green-500">+{community.newMembersLastWeek} this week</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <FileText size={32} />
            <div>
              <h2 className="text-2xl font-semibold">{community.totalArticles}</h2>
              <p className="text-sm text-gray-500">Total Articles</p>
              <p className="text-sm text-green-500">+{community.newArticlesLastWeek} this week</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-4">
            <FilePlus size={32} />
            <div>
              <h2 className="text-2xl font-semibold">{community.publishedArticles}</h2>
              <p className="text-sm text-gray-500">Articles Published</p>
              <p className="text-sm text-green-500">
                +{community.newPublishedArticlesLastWeek} this week
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* List of Recently Published Articles */}
      <section className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Recently Published Articles</h2>
        <div className="rounded bg-white p-4 shadow">
          <ul>
            {articlesData.map((article, index) => (
              <ArticleHighlightCard key={index} {...article} />
            ))}
          </ul>
        </div>
      </section>

      <h2 className="mb-4 text-xl font-semibold">Community Articles Stats</h2>
      {/* Community Articles Stats */}
      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-2xl font-semibold">{community.totalReviews}</h2>
          <p className="text-sm text-gray-500">Total Reviews</p>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold">{community.totalViews}</h2>
          <p className="text-sm text-gray-500">Total Views</p>
        </Card>
      </section>

      {/* Engagement Insights */}
      <section className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Engagement Insights</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <Title>Member Growth Over Time</Title>
            <LineChart
              className="h-80"
              data={communityStats.memberGrowthData}
              index="date"
              categories={['members']}
              colors={['indigo', 'rose']}
              valueFormatter={dataFormatter}
              yAxisWidth={60}
            />
          </Card>
          <Card>
            <Title>Article Submission Trends</Title>
            <LineChart
              className="h-80"
              data={communityStats.articleSubmissionTrendsData}
              index="date"
              categories={['articles']}
              colors={['indigo', 'rose']}
              valueFormatter={dataFormatter}
              yAxisWidth={60}
            />
          </Card>
        </div>
      </section>

      {/* Community Engagement Actions */}
      <section className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Community Engagement Actions</h2>
        <div className="rounded bg-white p-4 shadow">
          <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white">Share Community</button>
          <button className="rounded bg-green-500 px-4 py-2 text-white">Invite Members</button>
        </div>
      </section>
    </div>
  );
};

export default CommunityDashboard;
