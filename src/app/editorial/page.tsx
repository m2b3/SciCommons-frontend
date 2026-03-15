'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ReviewerCard } from './ReviewerCard';
import { ReviewerRecommendationResponse } from './types';

export default function EditorialDashboard() {
  const [articleIdInput, setArticleIdInput] = useState<string>('1');
  const [communityIdInput, setCommunityIdInput] = useState<string>('1');

  const [articleId, setArticleId] = useState<number>(1);
  const [communityId, setCommunityId] = useState<number>(1);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['reviewer-suggestions', articleId, communityId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles/${articleId}/suggest-reviewers?community_id=${communityId}`
      );
      if (!res.ok) {
        let errorMsg = `HTTP ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.message) errorMsg = errData.message;
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }
      return res.json() as Promise<ReviewerRecommendationResponse>;
    },
    enabled: false,
    retry: 1,
  });

  const handleSearch = () => {
    setArticleId(parseInt(articleIdInput) || 1);
    setCommunityId(parseInt(communityIdInput) || 1);
    setHasSearched(true);
    // Needs a slight timeout to let state update before refetching
    setTimeout(() => refetch(), 0);
  };

  const handleInvite = (userId: number) => {
    alert(`Reviewer invited! (User ID: ${userId})`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Editorial Dashboard</h1>
        <p className="text-gray-600">
          AI-powered reviewer recommendations based on semantic similarity to the paper abstract
        </p>
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          SciCommons currently has no editorial workflow — no reviewer assignment, no decisions, no
          publication. This PoC demonstrates the missing foundation.
        </div>
      </header>

      <div className="flex flex-row items-end gap-4 rounded-lg border bg-gray-50 p-4">
        <div className="flex w-1/3 flex-col gap-1">
          <label htmlFor="articleId" className="text-sm font-medium">
            Article ID
          </label>
          <input
            id="articleId"
            type="number"
            value={articleIdInput}
            onChange={(e) => setArticleIdInput(e.target.value)}
            className="rounded border p-2 text-sm"
          />
        </div>
        <div className="flex w-1/3 flex-col gap-1">
          <label htmlFor="communityId" className="text-sm font-medium">
            Community ID
          </label>
          <input
            id="communityId"
            type="number"
            value={communityIdInput}
            onChange={(e) => setCommunityIdInput(e.target.value)}
            className="rounded border p-2 text-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Find Best Reviewers'}
        </button>
      </div>

      {hasSearched && (
        <div className="mt-8">
          {isLoading && (
            <div className="animate-pulse p-8 text-center text-gray-500">
              Analyzing paper semantics and matching reviewers...
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
              Error fetching recommendations:{' '}
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          )}

          {data && data.suggestions.length === 0 && (
            <div className="rounded-md border border-dashed bg-gray-50 p-8 text-center text-gray-600">
              No community members found for community ID {communityId}
            </div>
          )}

          {data && data.suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-medium">Top matches for: {data.article_title}</h2>
                <div className="mt-1 flex flex-row gap-4">
                  <small className="text-gray-500">
                    Ranked by semantic similarity to paper abstract
                  </small>
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                    Status: {data.article_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {data.suggestions.map((reviewer, index) => (
                  <ReviewerCard
                    key={reviewer.user_id}
                    rank={index + 1}
                    reviewer={reviewer}
                    onInvite={handleInvite}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasSearched && (
        <footer className="mt-12 border-t border-gray-100 pt-4 text-xs text-gray-400">
          In the full GSoC implementation: this triggers a ReviewerInvitation record in the
          database, sends an invitation email, and tracks accept/decline status through a complete
          editorial decision workflow.
        </footer>
      )}
    </div>
  );
}
