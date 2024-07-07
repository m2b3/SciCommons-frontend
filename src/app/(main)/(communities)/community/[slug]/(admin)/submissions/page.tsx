'use client';

import React, { useEffect } from 'react';

import { useParams } from 'next/navigation';

import toast from 'react-hot-toast';

import {
  useCommunitiesApiAdminGetArticlesByStatus,
  useCommunitiesApiAdminManageArticle,
} from '@/api/community-admin/community-admin';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import TabComponent from '@/components/communities/TabComponent';
import { useAuthStore } from '@/stores/authStore';

type Action = 'unpublish' | 'publish' | 'approve' | 'reject' | 'remove';

type ActiveTab = 'Published' | 'UnPublished' | 'Submitted';

// Todo: Optimize the code
const Submissions: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const params = useParams<{ slug: string }>();
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('Published');
  const [action, setAction] = React.useState<Action>('unpublish');
  const [articleId, setArticleId] = React.useState<number>(0);

  const {
    data: manageArticleData,
    mutate,
    isSuccess,
    error: manageArticleError,
    isPending: manageArticlePending,
  } = useCommunitiesApiAdminManageArticle({
    request: axiosConfig,
  });

  const { data, isPending, error, refetch } = useCommunitiesApiAdminGetArticlesByStatus(
    params.slug,
    {
      query: { enabled: !!accessToken },
      request: axiosConfig,
    }
  );

  const handleAction = (action: Action, articleId: number) => () => {
    if (data) {
      setAction(action);
      setArticleId(articleId);

      mutate({
        communityId: data.data.community_id,
        articleId: articleId,
        action: action,
      });
    }
  };

  // Toast messages for success and error
  useEffect(() => {
    if (isSuccess) {
      toast.success(`${manageArticleData.data.message}`);
      refetch();
    }
  }, [isSuccess, refetch, manageArticleData]);

  useEffect(() => {
    if (manageArticleError) {
      toast.error(`${manageArticleError.response?.data.message}`);
    }
  }, [manageArticleError]);

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="flex flex-col">
      <div className="self-start">
        <TabComponent<ActiveTab>
          tabs={['Published', 'UnPublished', 'Submitted']}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      {activeTab === 'Published' && (
        <div className="my-4 flex flex-col space-y-4">
          {isPending &&
            Array.from({ length: 4 }).map((_, index) => <ArticleCardSkeleton key={index} />)}
          {data && data.data.published.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg bg-white shadow-lg">
              <h1 className="text-lg font-semibold text-gray-500">No articles published</h1>
            </div>
          )}
          {data &&
            data.data.published.map((article, index) => (
              <div className="relative flex flex-col gap-2 bg-white p-2" key={index}>
                <button
                  key={article.id}
                  className="absolute bottom-4 right-4 rounded-lg bg-green-500 px-4 py-2 text-xs text-white"
                  onClick={handleAction('unpublish', Number(article.id))}
                >
                  {manageArticlePending && action === 'unpublish' && articleId === article.id
                    ? 'Unpublishing...'
                    : 'Unpublish'}
                </button>
                <ArticleCard key={article.id} article={article} />
              </div>
            ))}
        </div>
      )}
      {activeTab === 'UnPublished' && (
        <div className="my-4 flex flex-col space-y-4">
          {isPending &&
            Array.from({ length: 4 }).map((_, index) => <ArticleCardSkeleton key={index} />)}
          {data && data.data.unpublished.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg bg-white shadow-lg">
              <h1 className="text-lg font-semibold text-gray-500">No articles published</h1>
            </div>
          )}
          {data &&
            data.data.unpublished.map((article) => (
              <div className="relative flex flex-col gap-2 bg-white p-2" key={article.id}>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button
                    className="rounded-lg bg-green-500 px-4 py-2 text-xs text-white"
                    onClick={handleAction('publish', Number(article.id))}
                  >
                    {manageArticlePending && action === 'publish' && articleId === article.id
                      ? 'Publishing...'
                      : 'Publish'}
                  </button>
                  <button
                    className="rounded-lg bg-red-500 px-4 py-2 text-xs text-white"
                    onClick={handleAction('remove', Number(article.id))}
                  >
                    {manageArticlePending && action === 'remove' && articleId === article.id
                      ? 'Removing...'
                      : 'Remove'}
                  </button>
                </div>
                <ArticleCard key={article.id} article={article} />
              </div>
            ))}
        </div>
      )}
      {activeTab === 'Submitted' && (
        <div className="my-4 flex flex-col space-y-4">
          {isPending &&
            Array.from({ length: 4 }).map((_, index) => <ArticleCardSkeleton key={index} />)}
          {data && data.data.submitted.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg bg-white shadow-lg">
              <h1 className="text-lg font-semibold text-gray-500">No articles submitted</h1>
            </div>
          )}
          {data &&
            data.data.submitted.map((article) => (
              <div className="relative flex flex-col gap-2 bg-white p-2" key={article.id}>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button
                    className="rounded-lg bg-green-500 px-4 py-2 text-xs text-white hover:bg-green-600"
                    onClick={handleAction('approve', Number(article.id))}
                  >
                    {manageArticlePending && action === 'approve' && articleId === article.id
                      ? 'Approving...'
                      : 'Approve'}
                  </button>
                  <button
                    className="rounded-lg bg-red-500 px-4 py-2 text-xs text-white"
                    onClick={handleAction('reject', Number(article.id))}
                  >
                    {manageArticlePending && action === 'reject' && articleId === article.id
                      ? 'Rejecting...'
                      : 'Reject'}
                  </button>
                </div>
                <ArticleCard key={article.id} article={article} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
