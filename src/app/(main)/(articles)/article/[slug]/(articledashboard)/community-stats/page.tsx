'use client';

import React, { useEffect } from 'react';

import { Card, LineChart, Title } from '@tremor/react';

import { withAuth } from '@/HOCs/withAuth';
import { useArticlesApiGetCommunityArticleStats } from '@/api/articles/articles';
import TruncateText from '@/components/common/TruncateText';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityDashboard = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error } = useArticlesApiGetCommunityArticleStats(params?.slug || '', {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const dataFormatter = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}`;

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    data && (
      <div className="container mx-auto p-6 dark:bg-gray-900">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold dark:text-white">
            <TruncateText text={data.data.title} maxLines={2} />
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Community: {data.data.community_name} | Author: {data.data.submitter}
          </p>
        </header>
        {data.data.community_name ? (
          <>
            {/* Community Performance Metrics */}
            <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
                <h2 className="text-2xl font-semibold dark:text-white">{data.data.discussions}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Community Discussions</p>
              </div>
              <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
                <h2 className="text-2xl font-semibold dark:text-white">{data.data.likes}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Community Likes</p>
              </div>
              <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
                <h2 className="text-2xl font-semibold dark:text-white">
                  {data.data.reviews_count}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Community Reviews and Ratings
                </p>
              </div>
            </section>

            {/* Community Engagement Insights */}
            <section className="mb-6">
              <h2 className="mb-4 text-xl font-semibold dark:text-white">
                Community Engagement Insights
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="dark:bg-gray-800">
                  <Title className="dark:text-white">Community Reviews Over Time</Title>
                  <LineChart
                    className="h-80 dark:text-gray-200"
                    data={data.data.reviews_over_time.map((item) => ({
                      date: item.date,
                      reviews: item.count,
                    }))}
                    index="date"
                    categories={['reviews']}
                    colors={['indigo', 'rose']}
                    valueFormatter={dataFormatter}
                    yAxisWidth={60}
                    onValueChange={(v) => console.log(v)}
                  />
                </Card>
                <Card className="dark:bg-gray-800">
                  <Title className="dark:text-white">Community Likes Over Time</Title>
                  <LineChart
                    className="h-80 dark:text-gray-200"
                    data={data.data.likes_over_time.map((item) => ({
                      date: item.date,
                      likes: item.count,
                    }))}
                    index="date"
                    categories={['likes']}
                    colors={['indigo', 'rose']}
                    valueFormatter={dataFormatter}
                    yAxisWidth={60}
                    onValueChange={(v) => console.log(v)}
                  />
                </Card>
                <Card className="dark:bg-gray-800">
                  <Title className="dark:text-white">Average Community Rating</Title>
                  <h2 className="text-2xl font-semibold dark:text-white">
                    {data.data.average_rating} / 5
                  </h2>
                </Card>
              </div>
            </section>

            {/* Community Reviews and Feedback */}
            <section className="mb-6">
              <h2 className="mb-4 text-xl font-semibold dark:text-white">
                Community Reviews and Feedback
              </h2>
              <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
                <h3 className="mb-2 text-lg font-semibold dark:text-white">
                  Recent Community Reviews
                </h3>
                {data.data.recent_reviews.length === 0 && (
                  <p className="dark:text-gray-300">
                    No community reviews available for this article.
                  </p>
                )}
                <ul>
                  {data.data.recent_reviews.map((review, index) => (
                    <li key={index} className="mb-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{review.excerpt}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Community Engagement Actions */}
            <section className="mb-6">
              <h2 className="mb-4 text-xl font-semibold dark:text-white">
                Community Engagement Actions
              </h2>
              <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
                <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  Share Article
                </button>
                <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                  Respond to Reviews
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded bg-white p-4 shadow dark:bg-gray-800">
            <p className="text-center text-lg dark:text-white">
              No community data available for this article.
            </p>
          </div>
        )}
      </div>
    )
  );
};

export default withAuth(CommunityDashboard, 'article', (props) => props.params.slug);
