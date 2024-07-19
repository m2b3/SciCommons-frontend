import React from 'react';

import { useCommunitiesApiArticlesGetArticleStatus } from '@/api/community-articles/community-articles';
import DisplayArticle from '@/components/articles/DisplayArticle';

import AssessorVerdict from './ReviewList';

interface ArticleAssessmentDetailsProps {
  communityId: number;
  articleId: number;
  onBack: () => void;
}

const ArticleAssessmentDetails: React.FC<ArticleAssessmentDetailsProps> = ({
  communityId,
  articleId,
}) => {
  const { data } = useCommunitiesApiArticlesGetArticleStatus(communityId, articleId);
  return (
    <div className="max-w-2xl">
      <div className="flex flex-col">
        {data && (
          <>
            <DisplayArticle article={data.data.article} />
            {data.data.assessors.map((assessor) => (
              <AssessorVerdict key={assessor.id} assessor={assessor} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ArticleAssessmentDetails;
