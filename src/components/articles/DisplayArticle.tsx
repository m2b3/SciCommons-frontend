import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Link2 } from 'lucide-react';

import { ArticleOut } from '@/api/schemas';
import TruncateText from '@/components/common/TruncateText';

import { BlockSkeleton, Skeleton, TextSkeleton } from '../common/Skeleton';
import PdfIcon from '../ui/Icons/PdfIcon';
import ArticleStats from './ArticleStats';

interface DisplayArticleProps {
  article: ArticleOut;
}

const DisplayArticle: React.FC<DisplayArticleProps> = ({ article }) => {
  const hasImage = !!article.article_image_url;

  return (
    <div
      className={`flex flex-col items-start rounded-xl border-common-contrast res-text-xs sm:border sm:bg-common-cardBackground sm:p-4 ${hasImage ? 'sm:flex-row' : ''}`}
    >
      {hasImage && (
        <div className="mb-4 w-full sm:mb-0 sm:mr-4 sm:w-1/3">
          <div className="relative h-0 w-full pb-[75%]">
            <Image
              src={article.article_image_url || '/placeholder.png'}
              alt={article.title}
              layout="fill"
              objectFit="cover"
              className="absolute left-0 top-0 h-full w-full rounded-lg"
            />
          </div>
        </div>
      )}
      <div className={`relative flex-1 ${hasImage ? '' : 'w-full'}`}>
        <h2 className="mb-4 font-bold text-text-primary res-text-xl">
          <TruncateText text={article.title} maxLines={2} />
        </h2>
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-text-secondary res-text-xs">Abstract</h3>
          <div className="text-base text-text-primary">
            <TruncateText text={article.abstract} maxLines={2} />
          </div>
        </div>
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-text-secondary res-text-xs">Authors</h3>
          <div className="text-text-primary">
            <TruncateText
              text={article.authors.map((author) => author.label).join(', ')}
              maxLines={2}
            />
          </div>
        </div>
        {/* <div className="mb-4">
          <h3 className="mb-1 font-semibold text-text-secondary res-text-xs">Keywords</h3>
          <TruncateText text={article.keywords.join(', ')} maxLines={2} />
        </div> */}
        <div>
          <h3 className="mb-2 font-semibold text-text-secondary res-text-xs">Article Links</h3>
          {article?.article_link && (
            <div className="mb-1 flex items-center gap-2">
              <Link2 size={16} className="text-text-tertiary" />
              <a
                href={article.article_link || '#'}
                className="text-functional-blue res-text-xs hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {article?.article_link?.split('/').pop() || article.article_link}
              </a>
            </div>
          )}
          {article.article_pdf_urls.map((link, index) => (
            <div key={index} className="mb-1 flex items-center gap-2">
              <PdfIcon className="size-4 shrink-0" />
              <a
                href={link}
                className="text-functional-blue res-text-xs hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.split('/').pop() || link}
              </a>
            </div>
          ))}
        </div>
        {article.is_submitter && (
          <Link href={`/article/${article.slug}/settings`}>
            <button className="absolute bottom-0 right-0 rounded-lg border border-common-contrast bg-black px-4 py-2 text-white res-text-xs">
              Settings
            </button>
          </Link>
        )}
        <div className="mt-4 w-full">
          <ArticleStats article={article} />
        </div>
      </div>
    </div>
  );
};

export default DisplayArticle;

export const DisplayArticleSkeleton: React.FC = () => {
  return (
    <>
      <Skeleton className="flex flex-col items-start rounded-xl border-common-contrast sm:border sm:bg-common-cardBackground sm:p-4">
        <TextSkeleton className="h-10" />
        <TextSkeleton className="mt-4 h-6 w-20" />
        <TextSkeleton />
        <TextSkeleton className="w-48" />
        <TextSkeleton className="mt-4 h-6 w-20" />
        <TextSkeleton />
        <TextSkeleton />
        <TextSkeleton />
        <TextSkeleton className="w-48" />
        <TextSkeleton className="mt-4 h-6 w-20" />
        <div className="flex w-full flex-wrap items-center gap-4">
          <TextSkeleton className="h-8 w-20" />
          <TextSkeleton className="h-8 w-20" />
          <TextSkeleton className="h-8 w-20" />
          <TextSkeleton className="h-8 w-20" />
        </div>
      </Skeleton>
      <Skeleton className="border-none bg-transparent">
        <div className="mt-4 flex gap-6 border-b border-common-minimal p-4">
          <BlockSkeleton className="h-8 w-32" />
          <BlockSkeleton className="h-8 w-32" />
          <BlockSkeleton className="h-8 w-32" />
        </div>
      </Skeleton>
      <Skeleton className="relative flex rounded-xl border border-common-contrast bg-common-cardBackground">
        <BlockSkeleton className="aspect-square size-10 rounded-full" />
        <div className="ml-4 flex-1">
          <TextSkeleton className="w-20" />
          <TextSkeleton className="mt-2 w-32" />
          <BlockSkeleton className="mt-2" />
        </div>
      </Skeleton>
    </>
  );
};
