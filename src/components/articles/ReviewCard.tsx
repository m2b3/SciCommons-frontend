import { FC, useMemo, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  CheckCircle,
  MessageCircle,
  Pencil,
  Shield,
  ThumbsDown,
  ThumbsUp,
  UserCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCommunitiesArticlesApiApproveArticle } from '@/api/community-articles/community-articles';
import { ReviewOut } from '@/api/schemas';
import {
  useUsersCommonApiGetReactionCount,
  useUsersCommonApiPostReaction,
} from '@/api/users-common-api/users-common-api';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { Reaction } from '@/types';

import TruncateText from '../common/TruncateText';
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
  const imageData = useIdenticon(40);

  const { data, refetch: refetchReactions } = useUsersCommonApiGetReactionCount(
    'articles.review',
    Number(review.id)
  );

  const { mutate } = useUsersCommonApiPostReaction({
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
          <span className="ml-2 flex items-center rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-800 res-text-xs">
            <UserCircle className="mr-1 h-3 w-3" />
            Reviewer
          </span>
        );
      case 'moderator':
        return (
          <span className="ml-2 flex items-center rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 res-text-xs">
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
        <div className="mb-4 rounded-lg border bg-white-secondary p-4 shadow-sm res-text-sm">
          <div className="mb-2 flex justify-between">
            <div className="flex items-center gap-4">
              <div>
                <Image
                  src={`data:image/png;base64,${imageData}`}
                  alt={review.user.username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-2 font-bold">
                  by {review.anonymous_name || review.user.username}
                  {review.is_author && (
                    <Pencil
                      size={16}
                      onClick={() => setEdit(!edit)}
                      className="cursor-pointer hover:text-green-500"
                    />
                  )}
                  {getReviewTypeTag(review.review_type || '')}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < currentVersion.rating ? 'text-green-500' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.287 3.948a1 1 0 00.95.69h4.193c.969 0 1.371 1.24.588 1.81l-3.39 2.463a1 1 0 00-.364 1.118l1.287 3.948c.3.921-.755 1.688-1.54 1.118l-3.39-2.463a1 1 0 00-1.175 0l-3.39 2.463c-.785.57-1.84-.197-1.54-1.118l1.287-3.948a1 1 0 00-.364-1.118L2.222 9.375c-.784-.57-.38-1.81.588-1.81h4.193a1 1 0 00.95-.69l1.287-3.948z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 res-text-xs">
              <div className="">
                <select
                  id="version-select"
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
                  className="rounded border-gray-300 p-1"
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
          <h3 className="mb-2 font-semibold res-text-base">
            <TruncateText text={currentVersion.subject} maxLines={2} />
          </h3>

          <div className="mb-4 text-gray-700">
            <TruncateText text={currentVersion.content} maxLines={4} isHTML />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-gray-500">
              <div className="flex items-center">
                {data?.data.user_reaction === 1 ? (
                  <button
                    onClick={() => handleReaction('upvote')}
                    className="text-green-500 hover:text-green-700"
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReaction('upvote')}
                    className="text-gray-500 hover:text-green-500"
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
                    className="text-red-500 hover:text-red-700"
                  >
                    <ThumbsDown className="mr-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReaction('downvote')}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <ThumbsDown className="mr-1 h-4 w-4" />
                  </button>
                )}
                <span>{data?.data.dislikes}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                <button
                  onClick={() => setDisplayComments(!displayComments)}
                  className="hover:underline focus:outline-none"
                >
                  {review.comments_count} comments
                </button>
              </div>
              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={review.is_approved || approveArticlePending}
                  className={`flex items-center rounded-full px-3 py-1 font-medium res-text-xs ${
                    review.is_approved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  {review.is_approved ? 'Approved' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {displayComments && (
        <ReviewComments reviewId={Number(review.id)} displayComments={displayComments} />
      )}
    </>
  );
};

export default ReviewCard;

export const ReviewCardSkeleton: FC = () => {
  return (
    <div className="mb-4 animate-pulse rounded-lg border p-4 shadow-sm">
      <div className="mb-2 flex justify-between">
        <div>
          <div className="h-4 w-24 rounded bg-gray-300"></div>
          <div className="mt-2 flex items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mr-1 h-4 w-4 rounded bg-gray-300"></div>
            ))}
          </div>
        </div>
        <div className="h-4 w-32 rounded bg-gray-300"></div>
      </div>
      <div className="mb-2 h-6 w-48 rounded bg-gray-300"></div>
      <div className="mb-4 h-20 rounded bg-gray-300"></div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-4 text-gray-500">
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300"></div>
            <div className="h-4 w-6 rounded bg-gray-300"></div>
          </div>
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300"></div>
            <div className="h-4 w-6 rounded bg-gray-300"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300"></div>
            <div className="h-4 w-12 rounded bg-gray-300"></div>
          </div>
          <div className="h-8 w-20 rounded bg-blue-300"></div>
        </div>
      </div>
    </div>
  );
};
