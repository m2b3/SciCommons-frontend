'use client';

import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { withAuth } from '@/HOCs/withAuth';
import {
  useCommunitiesArticlesApiListCommunityArticlesByStatus,
  useCommunitiesArticlesApiManageArticle,
} from '@/api/community-articles/community-articles';
import { ArticleStatus } from '@/api/schemas';
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

  const renderArticles = () => {
    if (isPending) {
      return Array.from({ length: 4 }).map((_, index) => <ArticleCardSkeleton key={index} />);
    }

    if (data && data.data.items.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center rounded-xl sm:bg-common-cardBackground">
          <h1 className="text-text-secondary res-text-xs">No articles found</h1>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen max-w-6xl flex-col space-y-4">
        {data &&
          data.data.items.map((article, index) => (
            <div className="flex flex-col gap-2" key={index}>
              <ArticleCard
                article={article}
                actions={
                  activeTab === 'submitted'
                    ? [
                        {
                          type: 'button',
                          label: 'Approve',
                          variant: 'default',
                          onClick: () =>
                            handleAction('approve', Number(article.community_article?.id)),
                          isLoading:
                            actionInProgress.action === 'approve' &&
                            actionInProgress.articleId === article.id,
                        },
                        {
                          type: 'button',
                          label: 'Reject',
                          variant: 'danger',
                          onClick: () =>
                            handleAction('reject', Number(article.community_article?.id)),
                          isLoading:
                            actionInProgress.action === 'reject' &&
                            actionInProgress.articleId === article.id,
                        },
                      ]
                    : activeTab === 'accepted'
                      ? [
                          {
                            type: 'button',
                            label: 'Publish',
                            variant: 'blue',
                            onClick: () =>
                              handleAction('publish', Number(article.community_article?.id)),
                            isLoading:
                              actionInProgress.action === 'publish' &&
                              actionInProgress.articleId === article.id,
                          },
                        ]
                      : []
                }
              />
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col">
      <div className="w-full self-start">
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
