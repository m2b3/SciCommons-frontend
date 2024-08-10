'use client';

import React, { useEffect } from 'react';

import { Card, LineChart, Title } from '@tremor/react';
import { FilePlus, FileText, Users } from 'lucide-react';

import { withAuth } from '@/HOCs/withAuth';
import { useCommunitiesApiGetCommunityDashboard } from '@/api/communities/communities';
import ArticleHighlightCard from '@/components/articles/ArticleHighlightCard';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityDashboard = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

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
          <h1 className="text-4xl font-bold dark:text-white">{data.data.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.data.description}</p>
        </header>

        {/* Community Performance Metrics */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <Users size={32} className="dark:text-gray-300" />
              <div>
                <h2 className="text-2xl font-semibold dark:text-white">
                  {data.data.total_members}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
                <p className="text-sm text-green-500 dark:text-green-400">
                  +{data.data.new_members_this_week} this week
                </p>
              </div>
            </div>
          </Card>
          <Card className="dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <FileText size={32} className="dark:text-gray-300" />
              <div>
                <h2 className="text-2xl font-semibold dark:text-white">
                  {data.data.total_articles}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Articles</p>
                <p className="text-sm text-green-500 dark:text-green-400">
                  +{data.data.new_articles_this_week} this week
                </p>
              </div>
            </div>
          </Card>
          <Card className="dark:bg-gray-800">
            <div className="flex items-center space-x-4">
              <FilePlus size={32} className="dark:text-gray-300" />
              <div>
                <h2 className="text-2xl font-semibold dark:text-white">
                  {data.data.articles_published}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Articles Published</p>
                <p className="text-sm text-green-500 dark:text-green-400">
                  +{data.data.new_published_articles_this_week} this week
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* List of Recently Published Articles */}
        <section className="mb-6">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">
            Recently Published Articles
          </h2>
          <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
            {data.data.recently_published_articles.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">
                No articles have been published yet.
              </p>
            )}
            <ul>
              {data.data.recently_published_articles.map((article, index) => (
                <ArticleHighlightCard key={index} article={article} />
              ))}
            </ul>
          </div>
        </section>

        <h2 className="mb-4 text-xl font-semibold dark:text-white">Community Articles Stats</h2>
        {/* Community Articles Stats */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="dark:bg-gray-800">
            <h2 className="text-2xl font-semibold dark:text-white">{data.data.total_reviews}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
          </Card>
          <Card className="dark:bg-gray-800">
            <h2 className="text-2xl font-semibold dark:text-white">
              {data.data.total_discussions}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Discussions</p>
          </Card>
        </section>

        {/* Engagement Insights */}
        <section className="mb-6">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">Engagement Insights</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="dark:bg-gray-800">
              <Title className="dark:text-white">Member Growth Over Time</Title>
              <LineChart
                className="h-80 dark:text-gray-200"
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
            <Card className="dark:bg-gray-800">
              <Title className="dark:text-white">Article Submission Trends</Title>
              <LineChart
                className="h-80 dark:text-gray-200"
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
          <h2 className="mb-4 text-xl font-semibold dark:text-white">
            Community Engagement Actions
          </h2>
          <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
            <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
              Share Community
            </button>
            <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
              Invite Members
            </button>
          </div>
        </section>
      </div>
    )
  );
};

export default withAuth(CommunityDashboard, 'community', (props) => props.params.slug);
