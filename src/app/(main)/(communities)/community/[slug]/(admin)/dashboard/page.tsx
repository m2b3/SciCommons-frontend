'use client';

import React, { useEffect } from 'react';

import { Card, LineChart, Title } from '@tremor/react';
import { FilePlus, FileText, Users } from 'lucide-react';

import { withAuth } from '@/HOCs/withAuth';
import { useCommunitiesApiGetCommunityDashboard } from '@/api/communities/communities';
import ArticleHighlightCard from '@/components/articles/ArticleHighlightCard';
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

const CommunityDashboard = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error } = useCommunitiesApiGetCommunityDashboard(params?.slug || '', {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    query: {
      enabled: !!accessToken,
    },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const dataFormatter = (number: number) => `${Intl.NumberFormat('us').format(number).toString()}`;

  /* Fixed by Codex on 2026-02-15
     Problem: Community admin dashboard used fixed gray/green/blue utilities.
     Solution: Replace hard-coded colors with semantic tokens for text, surfaces, and actions.
     Result: Admin dashboard now aligns with active skin palettes. */
  return (
    data && (
      <div className="container mx-auto p-6 text-text-primary">
        {/* Header */}
        <header className="mb-6">
          <h1 className="font-bold res-heading-sm">{data.data.name}</h1>
          <RenderParsedHTML
            rawContent={data.data.description || ''}
            supportMarkdown={true}
            supportLatex={false}
            containerClassName="mb-0"
            contentClassName="line-clamp-2 text-text-tertiary res-text-xs"
          />
        </header>

        {/* Community Performance Metrics */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <div className="flex items-center space-x-4">
              <Users size={32} />
              <div>
                <h2 className="font-semibold res-heading-xs">{data.data.total_members}</h2>
                <p className="text-text-tertiary res-text-xs">Total Members</p>
                <p className="text-functional-green res-text-xs">
                  +{data.data.new_members_this_week} this week
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <FileText size={32} />
              <div>
                <h2 className="font-semibold res-heading-xs">{data.data.total_articles}</h2>
                <p className="text-text-tertiary res-text-xs">Total Articles</p>
                <p className="text-functional-green res-text-xs">
                  +{data.data.new_articles_this_week} this week
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <FilePlus size={32} />
              <div>
                <h2 className="font-semibold res-heading-xs">{data.data.articles_published}</h2>
                <p className="text-text-tertiary res-text-xs">Articles Published</p>
                <p className="text-functional-green res-text-xs">
                  +{data.data.new_published_articles_this_week} this week
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* List of Recently Published Articles */}
        <section className="mb-6">
          <h2 className="mb-4 font-semibold res-heading-xs">Recently Published Articles</h2>
          <div className="rounded bg-common-cardBackground p-4 shadow">
            {data.data.recently_published_articles.length === 0 && (
              <p className="text-text-tertiary res-text-sm">No articles have been published yet.</p>
            )}
            <ul>
              {data.data.recently_published_articles.map((article, index) => (
                <ArticleHighlightCard key={index} article={article} />
              ))}
            </ul>
          </div>
        </section>

        <h2 className="mb-4 font-semibold res-heading-xs">Community Articles Stats</h2>
        {/* Community Articles Stats */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <h2 className="font-semibold res-heading-xs">{data.data.total_reviews}</h2>
            <p className="text-text-tertiary res-text-xs">Total Reviews</p>
          </Card>
          <Card>
            <h2 className="font-semibold res-heading-xs">{data.data.total_discussions}</h2>
            <p className="text-text-tertiary res-text-xs">Total Discussions</p>
          </Card>
        </section>

        {/* Engagement Insights */}
        <section className="mb-6">
          <h2 className="mb-4 font-semibold res-heading-xs">Engagement Insights</h2>
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
          <h2 className="mb-4 font-semibold res-heading-xs">Community Engagement Actions</h2>
          <div className="rounded bg-common-cardBackground p-4 shadow">
            <button className="mr-2 rounded bg-functional-blue px-4 py-2 text-primary-foreground res-text-sm hover:bg-functional-blueContrast">
              Share Community
            </button>
            <button className="rounded bg-functional-green px-4 py-2 text-primary-foreground res-text-sm hover:bg-functional-greenContrast">
              Invite Members
            </button>
          </div>
        </section>
      </div>
    )
  );
};

export default withAuth(CommunityDashboard, 'community', (props) => props.params.slug);
