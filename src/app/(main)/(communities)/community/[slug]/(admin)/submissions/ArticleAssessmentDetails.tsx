'use client';

import React, { useEffect } from 'react';

import { ArrowLeft } from 'lucide-react';

import { useCommunitiesApiArticlesGetArticleStatus } from '@/api/community-articles/community-articles';
import DisplayArticle from '@/components/articles/DisplayArticle';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import AssessorVerdict from './AssessorVerdict';

interface ArticleAssessmentDetailsProps {
  communityId: number;
  articleId: number;
  onBack: () => void;
}

const ArticleAssessmentDetails: React.FC<ArticleAssessmentDetailsProps> = ({
  communityId,
  articleId,
  onBack,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, error } = useCommunitiesApiArticlesGetArticleStatus(communityId, articleId, {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <div className="w-full rounded-md bg-white p-4">
      <button onClick={onBack} className="mb-4 items-start text-sm text-blue-500 hover:underline">
        <ArrowLeft size={16} className="mr-2 inline-block" />
        Back to Submissions
      </button>
      <div className="flex flex-col">
        {data && (
          <>
            <div className="flex flex-col gap-4">
              <DisplayArticle article={data.data.article} />
              <div className="p-4">
                {data.data.assessors.map((assessor) => (
                  <AssessorVerdict key={assessor.id} assessor={assessor} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArticleAssessmentDetails;
