'use client';

import React, { useEffect } from 'react';

import { Card, LineChart, Title } from '@tremor/react';

import { withAuth } from '@/HOCs/withAuth';
import { useArticlesApiGetCommunityArticleStats } from '@/api/articles/articles';
import TruncateText from '@/components/common/TruncateText';
import { showErrorToast } from '@/lib/toastHelpers';

const CommunityDashboard = ({ params }: { params: { slug: string } }) => {
  const { data, error } = useArticlesApiGetCommunityArticleStats(params?.slug || '');

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
            Community: {data.data.community_name} | Author: {data.data.submitter}
          </p>
        </header>
        {data.data.community_name ? (
          <>
            {/* Community Performance Metrics */}
            <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded bg-white-primary p-4 shadow">
                <h2 className="font-semibold res-heading-sm">{data.data.discussions}</h2>
                <p className="text-gray-500 res-text-xs">Community Discussions</p>
              </div>
              <div className="rounded bg-white-primary p-4 shadow">
                <h2 className="font-semibold res-heading-sm">{data.data.likes}</h2>
                <p className="text-gray-500 res-text-xs">Community Likes</p>
              </div>
              <div className="rounded bg-white-primary p-4 shadow">
                <h2 className="font-semibold res-heading-sm">{data.data.reviews_count}</h2>
                <p className="text-gray-500 res-text-xs">Community Reviews and Ratings</p>
              </div>
            </section>

            {/* Community Engagement Insights */}
            <section className="mb-6">
              <h2 className="mb-4 font-semibold res-heading-sm">Community Engagement Insights</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <Title>Community Reviews Over Time</Title>
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
                  <Title>Community Likes Over Time</Title>
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
                  <Title>Average Community Rating</Title>
                  <h2 className="font-semibold res-heading-sm">{data.data.average_rating} / 5</h2>
                </Card>
              </div>
            </section>

            {/* Community Reviews and Feedback */}
            <section className="mb-6">
              <h2 className="mb-4 font-semibold res-heading-sm">Community Reviews and Feedback</h2>
              <div className="rounded bg-white-primary p-4 shadow">
                <h3 className="mb-2 font-semibold res-heading-xs">Recent Community Reviews</h3>
                {data.data.recent_reviews.length === 0 && (
                  <p className="res-text-sm">No community reviews available for this article.</p>
                )}
                <ul>
                  {data.data.recent_reviews.map((review, index) => (
                    <li key={index} className="mb-2">
                      <p className="text-gray-700 res-text-sm">{review.excerpt}</p>
                      <p className="text-gray-500 res-text-xs">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Community Engagement Actions */}
            <section className="mb-6">
              <h2 className="mb-4 font-semibold res-heading-sm">Community Engagement Actions</h2>
              <div className="rounded bg-white-primary p-4 shadow">
                <button className="mr-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Share Article
                </button>
                <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                  Respond to Reviews
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="rounded bg-white-primary p-4 shadow">
            <p className="text-center res-text-base">
              No community data available for this article.
            </p>
          </div>
        )}
      </div>
    )
  );
};

export default withAuth(CommunityDashboard, 'article', (props) => props.params.slug);
