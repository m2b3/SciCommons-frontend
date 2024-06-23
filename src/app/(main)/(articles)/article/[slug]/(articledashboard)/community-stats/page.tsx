'use client';

import React from 'react';

import { Card, LineChart, Title } from '@tremor/react';

import communityArticle from '@/constants/dummyData';

const CommunityDashboard = () => {
  const article = communityArticle;
  const dataFormatter = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}`;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold">{article.title}</h1>
        <p className="text-sm text-gray-500">
          Community: {article.community} | Author: {article.author}
        </p>
      </header>

      {/* Community Performance Metrics */}
      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-2xl font-semibold">{article.communityViews}</h2>
          <p className="text-sm text-gray-500">Community Views</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-2xl font-semibold">{article.communityLikes}</h2>
          <p className="text-sm text-gray-500">Community Likes</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <h2 className="text-2xl font-semibold">{article.communityReviewsCount}</h2>
          <p className="text-sm text-gray-500">Community Reviews and Ratings</p>
        </div>
      </section>

      {/* Community Engagement Insights */}
      <section className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Community Engagement Insights</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <Title>Community Views Over Time</Title>
            <LineChart
              className="h-80"
              data={communityArticle.communityViewsOverTime}
              index="date"
              categories={['views']}
              colors={['indigo', 'rose']}
              valueFormatter={dataFormatter}
              yAxisWidth={60}
              onValueChange={(v) => console.log(v)}
            />
          </Card>
          <Card>
            <Title>Community Likes Over Time</Title>
            <LineChart
              className="h-80"
              data={communityArticle.communityLikesOverTime}
              index="date"
              categories={['likes']}
              colors={['indigo', 'rose']}
              valueFormatter={dataFormatter}
              yAxisWidth={60}
              onValueChange={(v) => console.log(v)}
            />
          </Card>
          <Card>
            <Title>Average Community Rating</Title>
            <h2 className="text-2xl font-semibold">{article.averageCommunityRating} / 5</h2>
          </Card>
        </div>
      </section>

      {/* Community Reviews and Feedback */}
      <section className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Community Reviews and Feedback</h2>
        <div className="rounded bg-white p-4 shadow">
          <h3 className="mb-2 text-lg font-semibold">Recent Community Reviews</h3>
          <ul>
            {article.recentCommunityReviews.map((review, index) => (
              <li key={index} className="mb-2">
                <p className="text-sm text-gray-700">{review.excerpt}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Community Engagement Actions */}
      <section className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Community Engagement Actions</h2>
        <div className="rounded bg-white p-4 shadow">
          <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white">Share Article</button>
          <button className="rounded bg-green-500 px-4 py-2 text-white">Respond to Reviews</button>
        </div>
      </section>
    </div>
  );
};

export default CommunityDashboard;
