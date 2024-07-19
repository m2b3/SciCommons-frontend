import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { ArticleOut } from '@/api/schemas';

interface DisplayArticleProps {
  article: ArticleOut;
}

const TruncateText = ({ text, maxLines }: { text: string; maxLines: number }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
        const maxHeight = lineHeight * maxLines;
        setIsTruncated((textRef.current as HTMLElement).scrollHeight > maxHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [maxLines, text]);

  return (
    <div>
      <p
        ref={textRef}
        className={`${
          !isExpanded && isTruncated ? `line-clamp-${maxLines}` : ''
        } text-gray-600 dark:text-gray-300`}
      >
        {text}
      </p>
      {isTruncated && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

const DisplayArticle: React.FC<DisplayArticleProps> = ({ article }) => {
  return (
    <div className="flex flex-col items-start rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:flex-row">
      <div className="mb-4 w-full md:mb-0 md:mr-4 md:w-1/3">
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
        <h3 className="mb-2 font-bold res-text-sm dark:text-white">
          <TruncateText text={article.title} maxLines={2} />
        </h3>
        <div className="mb-4">
          <span className="text-green-600 dark:text-green-400">Abstract</span>
          <TruncateText text={article.abstract} maxLines={4} />
        </div>
        <div className="mb-2">
          <span className=" dark:text-white">Authors:</span>
          <TruncateText
            text={article.authors.map((author) => author.label).join(', ')}
            maxLines={2}
          />
        </div>
        <div className="mb-2">
          <span className=" text-green-600 dark:text-green-400">Keywords</span>
          <TruncateText text={article.keywords.join(', ')} maxLines={2} />
        </div>
        <div>
          <span className=" text-green-600 dark:text-green-400">Article Links</span>
          {article.article_pdf_urls.map((link, index) => (
            <div key={index} className="ml-2">
              <a href={link} className="text-blue-600 hover:underline dark:text-blue-400">
                <TruncateText text={link.split('/').pop() || link} maxLines={2} />
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
    <div className="flex animate-pulse items-start rounded-lg border p-4 shadow-sm">
      <div className="mr-4 h-auto w-1/3">
        <div className="h-52 w-full rounded-lg bg-gray-300"></div>
      </div>
      <div className="flex-1 space-y-4">
        <div className="h-6 rounded bg-gray-300"></div>
        <div className="h-4 w-3/4 rounded bg-gray-300"></div>
        <div className="h-4 rounded bg-gray-300"></div>
        <div className="h-4 w-1/2 rounded bg-gray-300"></div>
        <div className="h-4 rounded bg-gray-300"></div>
      </div>
    </div>
  );
};
