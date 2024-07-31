'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import { Card, LineChart, Title } from '@tremor/react';
import { FilePlus, FileText, Users } from 'lucide-react';

import { useCommunitiesApiGetCommunityDashboard } from '@/api/communities/communities';
import ArticleHighlightCard from '@/components/articles/ArticleHighlightCard';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityDashboard = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ slug: string }>();

  const { data, error } = useCommunitiesApiGetCommunityDashboard(params?.slug || '', {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const dataFormatter = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}`;

  return (
    data && (
      <div className="container mx-auto p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-4xl font-bold">{data.data.name}</h1>
          <p className="text-sm text-gray-500">{data.data.description}</p>
        </header>

        {/* Community Performance Metrics */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center space-x-4">
              <Users size={32} />
              <div>
                <h2 className="text-2xl font-semibold">{data.data.total_members}</h2>
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-sm text-green-500">
                  +{data.data.new_members_this_week} this week
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <FileText size={32} />
              <div>
                <h2 className="text-2xl font-semibold">{data.data.total_articles}</h2>
                <p className="text-sm text-gray-500">Total Articles</p>
                <p className="text-sm text-green-500">
                  +{data.data.new_articles_this_week} this week
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <FilePlus size={32} />
              <div>
                <h2 className="text-2xl font-semibold">{data.data.articles_published}</h2>
                <p className="text-sm text-gray-500">Articles Published</p>
                <p className="text-sm text-green-500">
                  +{data.data.new_published_articles_this_week} this week
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* List of Recently Published Articles */}
        <section className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Recently Published Articles</h2>
          <div className="rounded bg-white p-4 shadow">
            {data.data.recently_published_articles.length === 0 && (
              <p className="text-gray-500">No articles have been published yet.</p>
            )}
            <ul>
              {data.data.recently_published_articles.map((article, index) => (
                <ArticleHighlightCard key={index} article={article} />
              ))}
            </ul>
          </div>
        </section>

        <h2 className="mb-4 text-xl font-semibold">Community Articles Stats</h2>
        {/* Community Articles Stats */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <h2 className="text-2xl font-semibold">{data.data.total_reviews}</h2>
            <p className="text-sm text-gray-500">Total Reviews</p>
          </Card>
          <Card>
            <h2 className="text-2xl font-semibold">{data.data.total_discussions}</h2>
            <p className="text-sm text-gray-500">Total Discussions</p>
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
                data={data.data.member_growth.map((item) => ({
                  date: item.date,
                  members: item.count,
                }))}
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
                data={data.data.article_submission_trends.map((item) => ({
                  date: item.date,
                  articles: item.count,
                }))}
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
            <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white">
              Share Community
            </button>
            <button className="rounded bg-green-500 px-4 py-2 text-white">Invite Members</button>
          </div>
        </section>
      </div>
    )
  );
};

export default CommunityDashboard;
