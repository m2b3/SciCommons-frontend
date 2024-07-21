import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArticleOut } from '@/api/schemas';
import TruncateText from '@/components/common/TruncateText';

interface DisplayArticleProps {
  article: ArticleOut;
}

const DisplayArticle: React.FC<DisplayArticleProps> = ({ article }) => {
  return (
    <div className="flex flex-col items-start rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
      <div className="mb-4 w-full sm:mb-0 sm:mr-4 sm:w-1/3">
        <div className="relative h-0 w-full pb-[75%]">
          <Image
            src={article.article_image_url || '/images/placeholder.jpg'}
            alt={article.title}
            layout="fill"
            objectFit="cover"
            className="absolute left-0 top-0 h-full w-full rounded-lg"
          />
        </div>
      </div>
      <div className="relative flex-1">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          <TruncateText text={article.title} maxLines={2} />
        </h2>
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-700 dark:text-gray-300">Abstract</h3>
          <p className="text-gray-600 dark:text-gray-400">
            <TruncateText text={article.abstract} maxLines={2} />
          </p>
        </div>
        <div className="mb-4">
          <h3 className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">Authors</h3>
          <p className="text-gray-700 dark:text-gray-300">
            <TruncateText
              text={article.authors.map((author) => author.label).join(', ')}
              maxLines={2}
            />
          </p>
        </div>
        <div className="mb-4">
          <h3 className="mb-1 text-sm font-semibold text-gray-600 dark:text-gray-400">Keywords</h3>
          <TruncateText text={article.keywords.join(', ')} maxLines={2} />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
            Article Links
          </h3>
          {article.article_pdf_urls.map((link, index) => (
            <div key={index} className="mb-1">
              <a
                href={link}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.split('/').pop() || link}
              </a>
            </div>
          ))}
        </div>
        {article.is_submitter && (
          <Link href={`/article/${article.slug}/official-stats`}>
            <button className="absolute bottom-0 right-0 rounded-lg bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
              Dashboard
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DisplayArticle;

export const DisplayArticleSkeleton: React.FC = () => {
  return (
    <div className="text-gray-900 dark:text-gray-100">
      <div className="flex animate-pulse items-start rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-700">
        <div className="mr-4 h-auto w-1/3">
          <div className="h-52 w-full rounded-lg bg-gray-300 dark:bg-gray-600"></div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-6 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="h-4 rounded bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
      <div className="mt-4 h-64 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
};
