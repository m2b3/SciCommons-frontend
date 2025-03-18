'use client';

import React, { use, useEffect } from 'react';

import { Card, LineChart, Title } from '@tremor/react';

import { withAuth } from '@/HOCs/withAuth';
import { useArticlesApiGetArticleOfficialStats } from '@/api/articles/articles';
import TruncateText from '@/components/common/TruncateText';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const Dashboard = (props: { params: Promise<{ slug: string }> }) => {
  const params = use(props.params);
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error } = useArticlesApiGetArticleOfficialStats(params?.slug || '', {
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
      <div className="container mx-auto p-6 text-gray-900">
        {/* Header */}
        <header className="mb-6">
          <h1 className="font-bold res-heading-lg">
            <TruncateText text={data.data.title} maxLines={2} />
          </h1>
          <p className="text-gray-500 res-text-xs">
            Submitted on {new Date(data.data.submission_date).toLocaleDateString()} by{' '}
            {data.data.submitter}
          </p>
        </header>

        {/* Article Performance Metrics */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded bg-white-primary p-4 shadow">
            <h2 className="font-semibold res-heading-sm">{data.data.reviews_count}</h2>
            <p className="text-gray-500 res-text-xs">Reviews and Ratings</p>
          </div>
          <div className="rounded bg-white-primary p-4 shadow">
            <h2 className="font-semibold res-heading-sm">{data.data.likes}</h2>
            <p className="text-gray-500 res-text-xs">Total Likes</p>
          </div>
          <div className="rounded bg-white-primary p-4 shadow">
            <h2 className="font-semibold res-heading-sm">{data.data.discussions}</h2>
            <p className="text-gray-500 res-text-xs">Total Discussions</p>
          </div>
        </section>

        {/* Engagement Insights */}
        <section className="mb-6">
          <h2 className="mb-4 font-semibold res-heading-sm">Engagement Insights</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <Title>Reviews Over Time</Title>
              <LineChart
                className="h-80"
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
            <Card>
              <Title>Likes Over Time</Title>
              <LineChart
                className="h-80"
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
            <Card>
              <Title>Average Rating</Title>
              <h2 className="font-semibold res-heading-sm">{data.data.average_rating} / 5</h2>
            </Card>
          </div>
        </section>

        {/* Reviews and Feedback */}
        <section className="mb-6">
          <h2 className="mb-4 font-semibold res-heading-sm">Reviews and Feedback</h2>
          <div className="rounded bg-white-primary p-4 shadow">
            <h3 className="mb-2 font-semibold res-heading-xs">Recent Reviews</h3>
            <ul>
              {data.data.recent_reviews.map((review, index) => (
                <li key={index} className="flex flex-col gap-2">
                  <div dangerouslySetInnerHTML={{ __html: review.excerpt }} />
                  <p className="text-gray-500 res-text-xs">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Engagement Actions */}
        <section className="mb-6">
          <h2 className="mb-4 font-semibold res-heading-sm">Engagement Actions</h2>
          <div className="rounded bg-white-primary p-4 shadow">
            <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
              Share Article
            </button>
            <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              Respond to Reviews
            </button>
          </div>
        </section>
      </div>
    )
  );
};

export default withAuth(Dashboard, 'article', async (props) => {
  const params = await props.params;
  return params.slug;
});
