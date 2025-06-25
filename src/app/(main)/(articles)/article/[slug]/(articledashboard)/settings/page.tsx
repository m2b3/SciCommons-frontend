'use client';

import React, { useEffect, useState } from 'react';

import { Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMediaQuery } from 'usehooks-ts';

import { withAuth } from '@/HOCs/withAuth';
import { useArticlesApiGetArticle } from '@/api/articles/articles';
import { SCREEN_WIDTH_SM } from '@/constants/common.constants';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import EditArticleDetails, { EditArticleDetailsSkeleton } from './EditArticleDetails';

type ActiveTab = 'Details' | 'FAQs';

const ArticleSettings = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  // const [activeTab, setActiveTab] = React.useState<ActiveTab>('Details');
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const isDesktop = useMediaQuery(`(min-width: ${SCREEN_WIDTH_SM}px)`);

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
          <div
            className={cn(
              'aspect-square h-fit cursor-pointer rounded-full p-2 hover:bg-common-contrast',
              isDesktop ? 'absolute right-4 top-4' : ''
            )}
            onClick={() => setIsEditEnabled(!isEditEnabled)}
          >
            {!isEditEnabled ? (
              <Pencil className="size-5 text-functional-blue" />
            ) : (
              <X className="size-5 text-text-secondary" />
            )}
          </div>
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
            // keywords={data.data.keywords.map((keyword) => ({
            //   label: keyword,
            //   value: keyword,
            // }))}
            submissionType={data.data.submission_type}
            defaultImageURL={data.data.article_image_url || ''}
            articleId={Number(data.data.id)}
            isEditEnabled={isEditEnabled}
            setIsEditEnabled={setIsEditEnabled}
            articleSlug={params.slug}
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
