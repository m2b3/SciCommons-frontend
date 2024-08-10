'use client';

import React from 'react';

import { useCommunitiesArticlesApiGetAssignedArticles } from '@/api/community-articles/community-articles';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import EmptyState from '@/components/common/EmptyState';
import { useAuthStore } from '@/stores/authStore';

interface AssessmentsListProps {
  communityId: number;
}

const AssessmentsList: React.FC<AssessmentsListProps> = ({ communityId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, isPending } = useCommunitiesArticlesApiGetAssignedArticles(communityId, {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  return (
    <div className="flex flex-col space-y-4">
      {isPending && Array.from({ length: 5 }, (_, index) => <ArticleCardSkeleton key={index} />)}
      {data && data.data.length === 0 && (
        <EmptyState
          content="No assessments found"
          subcontent="We will notify you when you have assessments to complete. You're viewing this section because you are a moderator or a reviewer of this community."
        />
      )}
      {data &&
        data.data.map((article) => (
          <div className="relative flex flex-col gap-2 bg-white p-2" key={article.id}>
            <ArticleCard article={article} forCommunity />
          </div>
        ))}
    </div>
  );
};

export default AssessmentsList;
