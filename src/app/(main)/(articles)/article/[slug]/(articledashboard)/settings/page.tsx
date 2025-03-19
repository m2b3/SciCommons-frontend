'use client';

import React, { useEffect } from 'react';

import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

import AddFAQs from './AddFAQs';
import EditArticleDetails, { EditArticleDetailsSkeleton } from './EditArticleDetails';

type ActiveTab = 'Details' | 'FAQs';

const ArticleSettings = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Details');

  const { data, isPending, error } = useArticlesApiGetArticle(
    params?.slug || '',
    {},
    {
      query: { enabled: !!accessToken },
      request: axiosConfig,
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`, {
        duration: 2000,
        position: 'top-right',
      });
    }
  }, [error]);

  return (
    <div className="flex flex-col text-gray-900">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Details', 'FAQs']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Details' && (
        <div className="my-4 rounded bg-white-primary px-8 py-4 shadow">
          <div className="mb-4 flex flex-col items-center justify-center">
            <h1 className="font-bold res-heading-base">
              Edit your
              <span className="text-green-500"> Article </span>
              Details
            </h1>
          </div>
          {isPending && <EditArticleDetailsSkeleton />}
          {data && (
            <EditArticleDetails
              title={data.data.title}
              abstract={data.data.abstract}
              authors={data.data.authors.map((author) => ({
                label: author.label,
                value: author.value,
              }))}
              keywords={data.data.keywords.map((keyword) => ({
                label: keyword,
                value: keyword,
              }))}
              submissionType={data.data.submission_type}
              defaultImageURL={data.data.article_image_url || ''}
              articleId={Number(data.data.id)}
            />
          )}
        </div>
      )}
      {data && activeTab === 'FAQs' && (
        <AddFAQs
          faqs={data.data.faqs || []}
          title={data.data.title}
          abstract={data.data.abstract}
          authors={data.data.authors.map((author) => ({
            label: author.label,
            value: author.value,
          }))}
          keywords={data.data.keywords.map((keyword) => ({
            label: keyword,
            value: keyword,
          }))}
          submissionType={data.data.submission_type}
          articleId={Number(data.data.id)}
        />
      )}
    </div>
  );
};

export default withAuth(ArticleSettings, 'article', (props) => props.params.slug);
