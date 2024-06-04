import { FC } from 'react';

import { Calendar, Eye, Heart, MessageCircle, MessageSquare, Star } from 'lucide-react';

interface ArticleStatsProps {
  likes: string;
  views: string;
  reviews: string;
  comments: string;
  discussions: string;
  publishedDate: string;
}

const ArticleStats: FC<ArticleStatsProps> = ({
  likes,
  views,
  reviews,
  comments,
  discussions,
  publishedDate,
}) => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Article Stats</h3>
      <div className="space-y-4 text-gray-700">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            <span>{likes} Likes</span>
          </div>
          <div className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            <span>{views} views</span>
          </div>
        </div>
        <div className="flex items-center">
          <Star className="mr-2 h-5 w-5" />
          <span>{reviews} Reviews and Ratings</span>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            <span>{comments} comments</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            <span>{discussions} discussions</span>
          </div>
        </div>
        <div className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          <span>Published On</span>
        </div>
        <div className="ml-7 text-gray-500">
          <span>{publishedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleStats;
