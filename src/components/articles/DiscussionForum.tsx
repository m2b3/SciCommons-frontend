import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'sonner';

import { useArticlesDiscussionApiListDiscussions } from '@/api/discussions/discussions';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/constants';
import { useAuthStore } from '@/stores/authStore';

import DiscussionCard, { DiscussionCardSkeleton } from './DiscussionCard';
import DiscussionForm from './DiscussionForm';
import DiscussionThread from './DiscussionThread';

interface DiscussionForumProps {
  articleId: number;
  communityId?: number | null;
}

const DiscussionForum: React.FC<DiscussionForumProps> = ({ articleId, communityId }) => {
  dayjs.extend(relativeTime);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [discussionId, setDiscussionId] = useState<number | null>(null);

  const { data, isPending, error } = useArticlesDiscussionApiListDiscussions(
    articleId,
    { community_id: communityId || 0 },
    { request: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message || ErrorMessage}`);
    }
  }, [error]);

  const handleNewDiscussion = (): void => {
    setShowForm(true);
  };

  const handleDiscussionClick = (discussionId: number): void => {
    setDiscussionId(discussionId);
  };

  if (discussionId) {
    return <DiscussionThread discussionId={discussionId} setDiscussionId={setDiscussionId} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Discussions</h1>
        <Button
          onClick={handleNewDiscussion}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          + New Discussion
        </Button>
      </div>

      {showForm ? (
        <DiscussionForm setShowForm={setShowForm} articleId={articleId} communityId={communityId} />
      ) : (
        <>
          {isPending &&
            Array.from({ length: 5 }).map((_, index) => <DiscussionCardSkeleton key={index} />)}
          {data && data.data.items.length === 0 && (
            <EmptyState
              content="No discussions yet"
              subcontent="Be the first to start a discussion"
            />
          )}

          {data &&
            data.data.items.map((discussion) => (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                handleDiscussionClick={handleDiscussionClick}
              />
            ))}
        </>
      )}
    </div>
  );
};

export default DiscussionForum;
