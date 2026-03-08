'use client';

import React, { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { useAuthStore } from '@/stores/authStore';

import EditArticleDetails, { EditArticleDetailsSkeleton } from './EditArticleDetails';

const ArticleSettings = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  const searchParams = useSearchParams();
  const communityName = searchParams?.get('community') ?? null;
  const returnTo = searchParams?.get('returnTo') ?? null;
  const returnPath = searchParams?.get('returnPath') ?? null;
  // const [activeTab, setActiveTab] = React.useState<ActiveTab>('Details');

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
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col">
      {/* <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Details', 'FAQs']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div> */}
      {/* {activeTab === 'Details' && ( */}
      <div className="relative w-full rounded-xl border-common-contrast sm:border sm:bg-common-cardBackground sm:p-6">
        <div className="mb-4 flex items-center justify-between sm:justify-center">
          <h1 className="font-bold text-text-primary res-heading-base">
            Edit your
            <span className="text-functional-green"> Article </span>
            Details
          </h1>
        </div>
        {/* Fixed by Codex on 2026-02-09
            Problem: Users had to click an extra edit icon after already choosing Edit Article.
            Solution: Keep settings page in always-editable mode (no extra toggle).
            Result: Fields are immediately editable on arrival. */}
        {isPending && <EditArticleDetailsSkeleton />}
        {data && (
          <EditArticleDetails
            title={data.data.title}
            abstract={data.data.abstract}
            authors={data.data.authors.map((author) => ({
              label: author.label,
              value: author.value,
            }))}
            // keywords={data.data.keywords.map((keyword) => ({
            //   label: keyword,
            //   value: keyword,
            // }))}
            submissionType={data.data.submission_type}
            defaultImageURL={data.data.article_image_url || ''}
            articleId={Number(data.data.id)}
            articleSlug={params.slug}
            communityName={communityName}
            returnTo={returnTo}
            returnPath={returnPath}
          />
        )}
      </div>
      {/* )} */}
      {/* {data && activeTab === 'FAQs' && (
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
      )} */}
    </div>
  );
};

export default withAuth(ArticleSettings, 'article', (props) => props.params.slug);
