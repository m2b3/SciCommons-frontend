// components/ArticleDisplayCard.tsx
import { FC } from 'react';

import Image from 'next/image';

interface DisplayArticleProps {
  imageUrl: string;
  title: string;
  abstract: string;
  authors: string;
  keywords: string;
  articleLink: string;
}

const DisplayArticle: FC<DisplayArticleProps> = ({
  imageUrl,
  title,
  abstract,
  authors,
  keywords,
  articleLink,
}) => {
  return (
    <div className="flex items-start rounded-lg border p-4 shadow-sm">
      <div className="mr-4 h-auto w-1/3 overflow-hidden rounded-lg">
        <Image src={imageUrl} alt={title} width={300} height={200} className="rounded-lg" />
      </div>
      <div className="flex-1">
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
      </div>
    </div>
  );
};

export default DisplayArticle;
