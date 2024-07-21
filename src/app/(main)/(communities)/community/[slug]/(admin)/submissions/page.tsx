'use client';

import React, { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import { toast } from 'sonner';

import {
  useCommunitiesApiArticlesListCommunityArticlesByStatus,
  useCommunitiesApiArticlesManageArticle,
} from '@/api/community-articles/community-articles';
import { ArticleOut, ArticleStatus } from '@/api/schemas';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

import ArticleAssessmentDetails from './ArticleAssessmentDetails';

type Action = 'approve' | 'reject' | 'publish';

const Submissions: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ slug: string }>();
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const [activeTab, setActiveTab] = useState<ArticleStatus>('submitted');
  // Set communityId and articleId`
  const [selectedIds, setSelectedIds] = useState<{ communityId: number; articleId: number }>();
  const [actionInProgress, setActionInProgress] = useState<{
    action: Action;
    articleId: number | null;
  }>({ action: 'approve', articleId: null });

  const { data, isPending, error, refetch } =
    useCommunitiesApiArticlesListCommunityArticlesByStatus(
      params.slug,
      { status: activeTab.toLowerCase() as ArticleStatus },
      {
        query: { enabled: !!accessToken },
        request: axiosConfig,
      }
    );

  const { mutate } = useCommunitiesApiArticlesManageArticle({
    request: axiosConfig,
    mutation: {
      onMutate: (data) => {
        setActionInProgress({ action: data.action, articleId: data.articleId });
      },
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

  const handleAction = (action: Action, articleId: number, communityId: number) => {
    mutate({ communityId, articleId, action });
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
            className="mr-2 rounded-lg bg-green-500 px-4 py-2 text-xs text-white"
            onClick={() =>
              handleAction(
                'approve',
                Number(article.id),
                Number(article.community_article_status?.community.id)
              )
            }
            disabled={
              actionInProgress.action === 'approve' && actionInProgress.articleId === article.id
            }
          >
            {actionInProgress.action === 'approve' && actionInProgress.articleId === article.id
              ? 'Approving...'
              : 'Approve'}
          </button>
          <button
            className="rounded-lg bg-red-500 px-4 py-2 text-xs text-white"
            onClick={() =>
              handleAction(
                'reject',
                Number(article.id),
                Number(article.community_article_status?.community.id)
              )
            }
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
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs text-white"
            onClick={() =>
              setSelectedIds({
                communityId: Number(article.community_article_status?.community.id),
                articleId: Number(article.id),
              })
            }
          >
            View Details
          </button>

          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-xs text-white"
            onClick={() =>
              handleAction(
                'publish',
                Number(article.id),
                Number(article.community_article_status?.community.id)
              )
            }
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
    } else if (activeTab === 'under_review') {
      return (
        <button
          className="rounded-lg bg-blue-500 px-4 py-2 text-xs text-white"
          onClick={() =>
            setSelectedIds({
              communityId: Number(article.community_article_status?.community.id),
              articleId: Number(article.id),
            })
          }
        >
          View Details
        </button>
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
        <div className="flex h-32 items-center justify-center rounded-lg bg-white shadow-lg">
          <h1 className="text-lg font-semibold text-gray-500">No articles found</h1>
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
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent
          tabs={['submitted', 'under_review', 'accepted', 'published', 'rejected']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="my-4 flex flex-col space-y-4">
        {/* When activeTab is either under_review or accepted & selectedIds is available */}
        {/* Render the ArticleAssessmentDetails component */}
        {selectedIds ? (
          <ArticleAssessmentDetails
            articleId={selectedIds.articleId}
            communityId={selectedIds.communityId}
            onBack={() => setSelectedIds(undefined)}
          />
        ) : (
          renderArticles()
        )}
      </div>
    </div>
  );
};

export default Submissions;
