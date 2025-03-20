import { FC, useMemo, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  CheckCircle,
  MessageCircle,
  Pencil,
  Shield,
  Star,
  StarIcon,
  UserCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCommunitiesArticlesApiApproveArticle } from '@/api/community-articles/community-articles';
import { ReviewOut } from '@/api/schemas';
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from '@/api/users-common-api/users-common-api';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import { Reaction } from '@/types';

import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';
import TruncateText from '../common/TruncateText';
import { Button, ButtonIcon, ButtonTitle } from '../ui/button';
import ReviewComments from './ReviewComments';
import ReviewForm from './ReviewForm';

interface ReviewCardProps {
  review: ReviewOut;
  refetch?: () => void;
}

const ReviewCard: FC<ReviewCardProps> = ({ review, refetch }) => {
  dayjs.extend(relativeTime);

  const [edit, setEdit] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number>(review.versions.length);
  const [displayComments, setDisplayComments] = useState<boolean>(false);

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, refetch: refetchReactions } = useUsersCommonApiGetReactionCount(
    'articles.review',
    Number(review.id),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { mutate } = useUsersCommonApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetchReactions();
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const { mutate: approveArticle, isPending: approveArticlePending } =
    useCommunitiesArticlesApiApproveArticle({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: (data) => {
          refetch && refetch();
          toast.success(data.data.message);
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote')
      mutate({ data: { content_type: 'articles.review', object_id: Number(review.id), vote: 1 } });
    else if (reaction === 'downvote')
      mutate({ data: { content_type: 'articles.review', object_id: Number(review.id), vote: -1 } });
  };

  const handleApprove = () => {
    approveArticle({ communityArticleId: review.community_article?.id || 0 });
  };

  const currentVersion = useMemo(() => {
    if (selectedVersion === review.versions.length) {
      return {
        rating: review.rating,
        content: review.content,
        subject: review.subject,
        created_at: review.updated_at,
      };
    } else {
      return review.versions[review.versions.length - 1 - selectedVersion];
    }
  }, [review, selectedVersion]);

  const getReviewTypeTag = (reviewType: string) => {
    switch (reviewType) {
      case 'reviewer':
        return (
          <span className="ml-2 flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-400">
            <UserCircle className="mr-1 h-3 w-3" />
            Reviewer
          </span>
        );
      case 'moderator':
        return (
          <span className="ml-2 flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <Shield className="mr-1 h-3 w-3" />
            Moderator
          </span>
        );
      default:
        return null;
    }
  };

  const canApprove =
    review.community_article?.reviewer_ids?.includes(review.user.id || 0) ||
    review.community_article?.moderator_id === review.user.id;

  return (
    <>
      {edit ? (
        <ReviewForm
          reviewId={review.id || 0}
          articleId={review.article_id}
          edit={edit}
          setEdit={setEdit}
          title={currentVersion.subject}
          content={currentVersion.content}
          rating={currentVersion.rating}
          refetch={refetch}
        />
      ) : (
        <div className="mb-4 rounded-xl border-common-contrast res-text-sm sm:border sm:bg-common-cardBackground sm:p-4">
          <div className="mb-2 flex justify-between">
            <div className="flex items-center gap-2">
              <div>
                <Image
                  src={
                    review.user.profile_pic_url
                      ? review.user.profile_pic_url
                      : `data:image/png;base64,${review.avatar}`
                  }
                  alt={review.user.username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-2 font-bold text-text-secondary">
                  by {review.anonymous_name || review.user.username}
                  {review.is_author && (
                    <Pencil
                      size={16}
                      onClick={() => setEdit(!edit)}
                      className="cursor-pointer hover:text-functional-green"
                    />
                  )}
                  {getReviewTypeTag(review.review_type || '')}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill="currentColor"
                      className={`${
                        i < currentVersion.rating ? 'text-functional-yellow' : 'text-text-tertiary'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-text-tertiary">
              <div className="">
                <select
                  id="version-select"
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
                  className="rounded border border-common-minimal p-1"
                >
                  <option value={review.versions.length}>Latest</option>
                  {review.versions
                    .map((version, index) => (
                      <option key={index} value={review.versions.length - 1 - index}>
                        {dayjs(version.created_at).format('MMM D, YYYY ')}
                      </option>
                    ))
                    .reverse()}
                </select>
              </div>
              ({dayjs(currentVersion.created_at).fromNow()})
            </div>
          </div>
          <h3 className="mb-2 mt-4 font-semibold res-text-base">
            <TruncateText
              text={currentVersion.subject}
              maxLines={2}
              textClassName="text-text-primary"
            />
          </h3>

          <div className="mb-4">
            <TruncateText
              text={currentVersion.content}
              maxLines={4}
              isHTML
              textClassName="text-text-primary"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* <div className="flex space-x-4 text-text-secondary">
              <div className="flex items-center">
                {data?.data.user_reaction === 1 ? (
                  <button
                    onClick={() => handleReaction('upvote')}
                    className="text-functional-green hover:text-functional-greenContrast"
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReaction('upvote')}
                    className="text-text-secondary hover:text-functional-green"
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                  </button>
                )}
                <span>{data?.data.likes}</span>
              </div>

              <div className="flex items-center">
                {data?.data.user_reaction === -1 ? (
                  <button
                    onClick={() => handleReaction('downvote')}
                    className="text-functional-red hover:text-functional-redContrast"
                  >
                    <ThumbsDown className="mr-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReaction('downvote')}
                    className="text-text-secondary hover:text-functional-red"
                  >
                    <ThumbsDown className="mr-1 h-4 w-4" />
                  </button>
                )}
                <span>{data?.data.dislikes}</span>
              </div>
            </div> */}
            <div className="ml-auto flex items-center space-x-2 text-text-secondary">
              <button
                onClick={() => setDisplayComments((prev) => !prev)}
                className="flex items-center gap-2 text-xs hover:underline focus:outline-none"
              >
                {review?.comments_ratings > 0 && (
                  <div className="flex items-center gap-1 text-functional-yellow">
                    <StarIcon className="h-3.5 w-3.5 shrink-0" fill="currentColor" />
                    <span>{review?.comments_ratings}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  {review.comments_count} comments
                </div>
              </button>
              {canApprove && (
                <Button
                  disabled={review.is_approved || approveArticlePending}
                  onClick={handleApprove}
                  variant={review.is_approved ? 'default' : 'blue'}
                >
                  <ButtonIcon>
                    <CheckCircle className="h-4 w-4" />
                  </ButtonIcon>
                  <ButtonTitle>{review.is_approved ? 'Approved' : 'Approve'}</ButtonTitle>
                </Button>
              )}
            </div>
          </div>
          {displayComments && (
            <div className="mt-4 w-full">
              <ReviewComments
                reviewId={Number(review.id)}
                displayComments={displayComments}
                isAuthor={review.is_author}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ReviewCard;

export const ReviewCardSkeleton: FC = () => {
  return (
    <Skeleton>
      <TextSkeleton className="w-32" />
      <TextSkeleton className="w-44" />
      <BlockSkeleton />
      <TextSkeleton />
      <div className="flex w-full justify-between">
        <TextSkeleton className="h-8 w-28" />
        <TextSkeleton className="h-8 w-24 bg-functional-blue" />
      </div>
    </Skeleton>
  );
};
