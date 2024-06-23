// components/ArticleDisplayCard.tsx
import { FC } from 'react';

import Image from 'next/image';
import Link from 'next/link';

interface DisplayArticleProps {
  imageUrl: string;
  title: string;
  slug: string;
  abstract: string;
  authors: string;
  keywords: string;
  articleLink: string;
  isSubmitter: boolean;
}

const DisplayArticle: FC<DisplayArticleProps> = ({
  imageUrl,
  title,
  abstract,
  authors,
  keywords,
  articleLink,
  slug,
  isSubmitter,
}) => {
  return (
    <div className="flex items-start rounded-lg border p-4 shadow-sm">
      <div className="mr-4 h-auto w-1/3 overflow-hidden rounded-lg">
        <Image src={imageUrl} alt={title} width={300} height={200} className="rounded-lg" />
      </div>
      <div className="relative flex-1">
        <h3 className="mb-2 text-lg font-bold">{title}</h3>
        <p className="mb-4 text-gray-600">
          <span className="font-semibold text-green-600">Abstract:</span> {abstract}
        </p>
        <p className="mb-2 text-gray-600">
          <span className="font-semibold">Authors:</span> {authors}
        </p>
        <p className="mb-2 text-gray-600">
          <span className="font-semibold text-green-600">Keywords:</span> {keywords}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold text-green-600">Article Link:</span>{' '}
          <a href={articleLink} className="text-blue-600 hover:underline">
            {/* Display the name of the file by extracting it from the articleLink */}
            {articleLink.split('/').pop()}
          </a>
        </p>
        {isSubmitter && (
          <Link href={`/article/${slug}/official-stats`}>
            <button className="absolute bottom-0 right-0 rounded-lg bg-black px-4 py-2 text-sm text-white">
              Dashboard
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DisplayArticle;
