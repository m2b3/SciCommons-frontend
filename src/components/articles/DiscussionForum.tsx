import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useArticlesDiscussionApiListDiscussions } from '@/api/discussions/discussions';
import EmptyState from '@/components/common/EmptyState';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import { ErrorMessage } from '@/constants';
import { cn } from '@/lib/utils';
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
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken,
      },
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message || ErrorMessage}`);
    }
  }, [error]);

  const handleNewDiscussion = (): void => {
    setShowForm((prev) => !prev);
  };

  const handleDiscussionClick = (discussionId: number): void => {
    setDiscussionId(discussionId);
  };

  if (discussionId) {
    return <DiscussionThread discussionId={discussionId} setDiscussionId={setDiscussionId} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between res-text-sm">
        <h1 className="font-bold text-text-primary res-text-xl">Discussions</h1>
        <Button onClick={handleNewDiscussion}>
          <ButtonIcon>
            <Plus
              size={16}
              className={cn('transition-transform duration-200', {
                'rotate-45 scale-125': showForm,
              })}
            />
          </ButtonIcon>
          <ButtonTitle>New Discussion</ButtonTitle>
        </Button>
      </div>

      {showForm ? (
        <DiscussionForm setShowForm={setShowForm} articleId={articleId} communityId={communityId} />
      ) : (
        <>
          {isPending && (
            <div className="flex w-full flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <DiscussionCardSkeleton key={index} />
              ))}
            </div>
          )}
          {data && data.data.items.length === 0 && (
            <EmptyState
              content="No discussions yet"
              subcontent="Be the first to start a discussion"
            />
          )}
        </>
      )}
      <div className="flex w-full flex-col gap-4">
        {data &&
          data.data.items.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              handleDiscussionClick={handleDiscussionClick}
            />
          ))}
      </div>
    </div>
  );
};

export default DiscussionForum;
