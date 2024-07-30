'use client';

import React from 'react';

import { useParams, useRouter } from 'next/navigation';

import { useCommunitiesApiArticlesGetAssignedArticles } from '@/api/community-articles/community-articles';
import ArticleCard, { ArticleCardSkeleton } from '@/components/articles/ArticleCard';
import EmptyState from '@/components/common/EmptyState';
import { useAuthStore } from '@/stores/authStore';

interface AssessmentsListProps {
  communityId: number;
}

const AssessmentsList: React.FC<AssessmentsListProps> = ({ communityId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const { data, isPending } = useCommunitiesApiArticlesGetAssignedArticles(communityId, {
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
            <div className="absolute bottom-4 right-4">
              <button
                className="rounded-lg bg-blue-500 px-4 py-2 text-xs text-white"
                onClick={() => router.push(`/community/${params?.slug}/assessments/${article.id}`)}
              >
                View Details
              </button>
            </div>
            <ArticleCard article={article} />
          </div>
        ))}
    </div>
  );
};

export default AssessmentsList;
