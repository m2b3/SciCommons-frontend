import { FC, useState } from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MessageCircle, Pencil, ThumbsDown, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

import { ReviewOut } from '@/api/schemas';
import { useUsersApiGetReactionCount, useUsersApiPostReaction } from '@/api/users/users';
import useIdenticon from '@/hooks/useIdenticons';
import { useAuthStore } from '@/stores/authStore';
import { Reaction } from '@/types';

import ReviewComments from './ReviewComments';
import ReviewForm from './ReviewForm';

interface ReviewCardProps {
  review: ReviewOut;
  refetch?: () => void;
}

const ReviewCard: FC<ReviewCardProps> = ({ review, refetch }) => {
  // Extend dayjs with the relativeTime plugin
  dayjs.extend(relativeTime);

  const [edit, setEdit] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [displayComments, setDisplayComments] = useState<boolean>(false);
  const imageData = useIdenticon(40);

  const accessToken = useAuthStore((state) => state.accessToken);

  // Todo: Too many requests
  const { data, refetch: refetchReactions } = useUsersApiGetReactionCount(
    'articles.review',
    Number(review.id),
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const { mutate } = useUsersApiPostReaction({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        refetchReactions();
      },
      onError: (error) => {
        toast.error(error.response?.data.message || 'An error occurred');
      },
    },
  });

  const handleReaction = (reaction: Reaction) => {
    if (reaction === 'upvote')
      mutate({ data: { content_type: 'articles.review', object_id: Number(review.id), vote: 1 } });
    else if (reaction === 'downvote')
      mutate({ data: { content_type: 'articles.review', object_id: Number(review.id), vote: -1 } });
  };

  const currentVersion =
    selectedVersion === 0
      ? {
          rating: review.rating,
          content: review.content,
          subject: review.subject,
          created_at: review.updated_at,
        }
      : review.versions[selectedVersion - 1];

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
        <div className="mb-4 rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                <span className="flex items-center gap-2 font-bold dark:text-white">
                  by {review.anonymous_name || review.user.username}
                  {review.is_author && (
                    <Pencil
                      size={16}
                      onClick={() => setEdit(!edit)}
                      className="cursor-pointer hover:text-green-500"
                    />
                  )}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < currentVersion.rating ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.287 3.948a1 1 0 00.95.69h4.193c.969 0 1.371 1.24.588 1.81l-3.39 2.463a1 1 0 00-.364 1.118l1.287 3.948c.3.921-.755 1.688-1.54 1.118l-3.39-2.463a1 1 0 00-1.175 0l-3.39 2.463c-.785.57-1.84-.197-1.54-1.118l1.287-3.948a1 1 0 00-.364-1.118L2.222 9.375c-.784-.57-.38-1.81.588-1.81h4.193a1 1 0 00.95-.69l1.287-3.948z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="">
                <select
                  id="version-select"
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
                  className="rounded border-gray-300 p-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>Latest</option>
                  {review.versions.map((version, index) => (
                    <option key={index + 1} value={index + 1}>
                      {dayjs(version.created_at).format('MMM D, YYYY ')}
                    </option>
                  ))}
                </select>
              </div>
              ({dayjs(currentVersion.created_at).fromNow()})
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold dark:text-white">{currentVersion.subject}</h3>
          <div
            className="mb-4 text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: currentVersion.content,
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                {data?.data.user_reaction === 1 ? (
                  <button
                    onClick={() => handleReaction('upvote')}
                    className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReaction('upvote')}
                    className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
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
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <ThumbsDown className="mr-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReaction('downvote')}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <ThumbsDown className="mr-1 h-4 w-4" />
                  </button>
                )}
                <span>{data?.data.dislikes}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                <button
                  onClick={() => setDisplayComments(!displayComments)}
                  className="hover:underline focus:outline-none"
                >
                  {review.comments_count} comments
                </button>
              </div>
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
    <div className="mb-4 animate-pulse rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex justify-between">
        <div>
          <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mt-2 flex items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="mr-1 h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            ))}
          </div>
        </div>
        <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-600"></div>
      </div>
      <div className="mb-2 h-6 w-48 rounded bg-gray-300 dark:bg-gray-600"></div>
      <div className="mb-4 h-20 rounded bg-gray-300 dark:bg-gray-600"></div>
      <div className="flex items-center justify-between">
        <div className="flex space-x-4 text-gray-500">
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-4 w-6 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-4 w-6 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="flex items-center">
            <div className="mr-1 h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-4 w-12 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
          <div className="h-8 w-20 rounded bg-blue-300 dark:bg-blue-700"></div>
        </div>
      </div>
    </div>
  );
};
