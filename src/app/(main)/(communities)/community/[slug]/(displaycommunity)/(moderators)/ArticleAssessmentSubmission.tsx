import React from 'react';

interface ArticleAssessmentSubmissionProps {
  communityId: number;
  articleId: number;
}

const ArticleAssessmentSubmission: React.FC<ArticleAssessmentSubmissionProps> = ({
  communityId,
  articleId,
}) => {
  console.log(communityId, articleId);
  return <div>ArticleAssessmentSubmission</div>;
};

export default ArticleAssessmentSubmission;
