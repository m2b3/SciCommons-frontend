import { FC } from 'react';

import { Calendar, Eye, Heart, MessageCircle, Users } from 'lucide-react';

interface CommunityArticleStatsProps {
  likes: string;
  views: string;
  reviews: string;
  comments: string;
  publishedDate: string;
}

const CommunityArticleStats: FC<CommunityArticleStatsProps> = ({
  likes,
  views,
  reviews,
  comments,
  publishedDate,
}) => {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Community Article Stats</h3>
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
          <Users className="mr-2 h-5 w-5" />
          <span>{reviews} Participated so far</span>
        </div>
        <div className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5" />
          <span>{comments} comments</span>
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

export default CommunityArticleStats;
