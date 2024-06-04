import { FC } from 'react';

import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';

interface ReviewCardProps {
  author: string;
  rating: number;
  date: string;
  timeAgo: string;
  title: string;
  content: string;
  likes: number;
  dislikes: number;
  replies: number;
}

const ReviewCard: FC<ReviewCardProps> = ({
  author,
  rating,
  date,
  timeAgo,
  title,
  content,
  likes,
  dislikes,
  replies,
}) => {
  return (
    <div className="mb-4 rounded-lg border p-4 shadow-sm">
      <div className="mb-2 flex justify-between">
        <div>
          <span className="font-bold">by {author}</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-green-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.287 3.948a1 1 0 00.95.69h4.193c.969 0 1.371 1.24.588 1.81l-3.39 2.463a1 1 0 00-.364 1.118l1.287 3.948c.3.921-.755 1.688-1.54 1.118l-3.39-2.463a1 1 0 00-1.175 0l-3.39 2.463c-.785.57-1.84-.197-1.54-1.118l1.287-3.948a1 1 0 00-.364-1.118L2.222 9.375c-.784-.57-.38-1.81.588-1.81h4.193a1 1 0 00.95-.69l1.287-3.948z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <span>{date}</span>
          <span> ({timeAgo})</span>
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-4 text-gray-700">{content}</p>
      <div className="flex items-center justify-between">
        <div className="flex space-x-4 text-gray-500">
          <div className="flex items-center">
            <ThumbsUp className="mr-1 h-4 w-4" />
            <span>{likes}</span>
          </div>
          <div className="flex items-center">
            <ThumbsDown className="mr-1 h-4 w-4" />
            <span>{dislikes}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="flex items-center">
            <MessageCircle className="mr-1 h-4 w-4" />
            <span>{replies} replies</span>
          </div>
          <button className="rounded bg-blue-500 px-3 py-1 font-semibold text-white">Reply</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
