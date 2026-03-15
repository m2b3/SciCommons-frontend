'use client';

import { Card, CardContent } from '@/components/ui/card';

import { ReviewerSuggestion } from './types';

interface ReviewerCardProps {
  rank: number;
  reviewer: ReviewerSuggestion;
  onInvite: (userId: number) => void;
}

export function ReviewerCard({ rank, reviewer, onInvite }: ReviewerCardProps) {
  // Determine color matching based on percentage
  let borderColor = 'border-l-gray-300';
  let badgeColor = 'bg-gray-100 text-gray-800';

  if (reviewer.match_percentage >= 70) {
    borderColor = 'border-l-green-500';
    badgeColor = 'bg-green-100 text-green-800';
  } else if (reviewer.match_percentage >= 50) {
    borderColor = 'border-l-yellow-400';
    badgeColor = 'bg-yellow-100 text-yellow-800';
  }

  return (
    <Card className={`mb-4 border-l-4 ${borderColor}`}>
      <CardContent className="flex flex-row items-center justify-between p-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-500">#{rank}</span>
            <span className="text-lg font-semibold">{reviewer.username}</span>
          </div>
          <span className="text-sm text-gray-400">User ID: {reviewer.user_id}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
            {reviewer.match_percentage}% Match
          </span>
          <button
            onClick={() => onInvite(reviewer.user_id)}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Invite
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
