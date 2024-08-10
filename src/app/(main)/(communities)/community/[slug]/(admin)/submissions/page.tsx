'use client';

import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import {
  useCommunitiesArticlesApiListCommunityArticlesByStatus,
  useCommunitiesArticlesApiManageArticle,
} from '@/api/community-articles/community-articles';
import { ArticleOut, ArticleStatus } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

type Action = 'approve' | 'reject' | 'publish';

const Submissions = ({ params }: { params: { slug: string } }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const [activeTab, setActiveTab] = useState<ArticleStatus>('submitted');
  const [actionInProgress, setActionInProgress] = useState<{
    action: Action;
    articleId: number | null;
  }>({ action: 'approve', articleId: null });

  const { data, isPending, error, refetch } =
    useCommunitiesArticlesApiListCommunityArticlesByStatus(
      params?.slug || '',
      { status: activeTab.toLowerCase() as ArticleStatus },
      {
        query: { enabled: !!accessToken },
        request: axiosConfig,
      }
    );

  const { mutate } = useCommunitiesArticlesApiManageArticle({
    request: axiosConfig,
    mutation: {
      onSuccess: (data) => {
        refetch();
        toast.success(`${data.data.message}`);
        setActionInProgress({ action: 'approve', articleId: null });
      },
      onError: (error) => {
        toast.error(`${error.response?.data.message}`);
        setActionInProgress({ action: 'approve', articleId: null });
      },
    },
  });

  const handleAction = (action: Action, communityArticleId: number) => {
    mutate({ communityArticleId, action });
  };

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  const renderActionButtons = (article: ArticleOut) => {
    if (activeTab === 'submitted') {
      return (
        <>
          <button
            className="mr-2 rounded-lg bg-green-500 px-4 py-2 text-xs text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            onClick={() => handleAction('approve', Number(article.community_article?.id))}
            disabled={
              actionInProgress.action === 'approve' && actionInProgress.articleId === article.id
            }
          >
            {actionInProgress.action === 'approve' && actionInProgress.articleId === article.id
              ? 'Approving...'
              : 'Approve'}
          </button>
          <button
            className="rounded-lg bg-red-500 px-4 py-2 text-xs text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            onClick={() => handleAction('reject', Number(article.community_article?.id))}
            disabled={
              actionInProgress.action === 'reject' && actionInProgress.articleId === article.id
            }
          >
            {actionInProgress.action === 'reject' && actionInProgress.articleId === article.id
              ? 'Rejecting...'
              : 'Reject'}
          </button>
        </>
      );
    } else if (activeTab === 'accepted') {
      return (
        <div className="flex space-x-2">
          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            onClick={() => handleAction('publish', Number(article.community_article?.id))}
            disabled={
              actionInProgress.action === 'publish' && actionInProgress.articleId === article.id
            }
          >
            {actionInProgress.action === 'publish' && actionInProgress.articleId === article.id
              ? 'Publishing...'
              : 'Publish'}
          </button>
        </div>
      );
    }
    return null;
  };

  const renderArticles = () => {
    if (isPending) {
      return Array.from({ length: 4 }).map((_, index) => <ArticleCardSkeleton key={index} />);
    }

    if (data && data.data.items.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center rounded-lg bg-white shadow-lg dark:bg-gray-800 dark:shadow-gray-700/50">
          <h1 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
            No articles found
          </h1>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen max-w-6xl flex-col space-y-4">
        {data &&
          data.data.items.map((article, index) => (
            <div className="relative flex flex-col gap-2 p-2" key={index}>
              <div className="absolute bottom-4 right-4">{renderActionButtons(article)}</div>
              <ArticleCard article={article} />
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col dark:bg-gray-900">
      <div className="self-start">
        <TabComponent
          tabs={['submitted', 'under_review', 'accepted', 'published', 'rejected']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="my-4 flex flex-col space-y-4">{renderArticles()}</div>
    </div>
  );
};

export default withAuth(Submissions, 'community', (props) => props.params.slug);
