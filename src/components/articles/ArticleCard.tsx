import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { MessageSquare, Star, User } from 'lucide-react';

interface ArticleCardProps {
  title: string;
  abstract: string;
  authors: string;
  community: string;
  tags: string[];
  ratings: number;
  comments: number;
  discussions: number;
  imageUrl: string;
  slug: string;
}

const ArticleCard: FC<ArticleCardProps> = ({
  title,
  abstract,
  authors,
  community,
  tags,
  ratings,
  comments,
  discussions,
  imageUrl,
  slug,
}) => {
  return (
    <div className="flex rounded-lg border bg-white p-4 shadow-lg">
      <div className="flex-grow">
        <Link href={`/article/${slug}`}>
          <h2 className="text-xl font-semibold hover:underline">{title}</h2>
        </Link>
        <p className="text-gray-500">{abstract}</p>
        <p className="mt-2 text-gray-700">Authors: {authors}</p>
        <p className="mt-1 text-gray-500">Published Community/Journal: {community}</p>
        <div className="mt-2 flex flex-wrap">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="mr-2 rounded bg-gray-200 px-2.5 py-0.5 text-sm font-medium text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="ml-1">{ratings} ratings</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <span className="ml-1">{comments} comments</span>
          </div>
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500" />
            <span className="ml-1">{discussions} discussions</span>
          </div>
        </div>
      </div>
      <div className="ml-4 flex-none">
        <Image src={imageUrl} alt="Article Image" width={180} height={180} className="rounded-lg" />
      </div>
    </div>
  );
};

export default ArticleCard;

export const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="flex rounded-lg border bg-white p-4 shadow-lg">
      <div className="flex-grow">
        <div className="mb-2 h-6 w-1/2 animate-pulse bg-gray-300"></div>
        <div className="mb-2 h-4 w-full animate-pulse bg-gray-300"></div>
        <div className="mb-4 h-4 w-1/3 animate-pulse bg-gray-300"></div>
        <div className="mb-2 h-4 w-2/3 animate-pulse bg-gray-300"></div>
        <div className="mb-4 h-4 w-1/3 animate-pulse bg-gray-300"></div>
        <div className="mt-2 flex flex-wrap">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="mb-2 mr-2 h-6 w-12 animate-pulse rounded bg-gray-300"></div>
          ))}
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-300"></div>
          <div className="h-5 w-20 animate-pulse rounded bg-gray-300"></div>
          <div className="h-5 w-20 animate-pulse rounded bg-gray-300"></div>
        </div>
      </div>
      <div className="ml-4 flex-none">
        <div className="h-36 w-36 animate-pulse rounded-lg bg-gray-300"></div>
      </div>
    </div>
  );
};
