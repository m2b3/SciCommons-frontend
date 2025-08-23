import React from 'react';

import { Star } from 'lucide-react';

import { ArticlesListOut } from '@/api/schemas';
import { cn } from '@/lib/utils';

import RenderParsedHTML from '../common/RenderParsedHTML';
import TruncateText from '../common/TruncateText';

export const ArticlePreviewSection = ({
  article,
  className,
}: {
  article: ArticlesListOut | null;
  className?: string;
}) => {
  if (!article)
    return (
      <div
        className={cn(
          'w-full overflow-y-auto rounded-xl border border-common-minimal/50 bg-common-cardBackground/50 p-6',
          className
        )}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-text-tertiary/50">No article selected</h1>
          <p className="text-text-tertiary/50">Select an article to preview</p>
        </div>
      </div>
    );
  return (
    <div
      className={cn(
        'w-full overflow-y-auto rounded-xl border border-common-minimal/50 bg-common-cardBackground/50 p-6',
        className
      )}
    >
      <RenderParsedHTML
        rawContent={article.title}
        isShrinked={false}
        supportMarkdown={false}
        supportLatex={true}
        contentClassName="res-text-xl font-bold line-clamp-5"
        containerClassName="mb-4 sm:mb-4"
      />
      <div className="mb-8">
        <h3 className="mb-1 font-semibold text-text-secondary res-text-xs">Abstract</h3>
        <RenderParsedHTML
          rawContent={article.abstract}
          isShrinked={true}
          supportMarkdown={false}
          supportLatex={true}
          gradientClassName="sm:from-common-background"
        />
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
      <div className="flex w-fit items-center rounded-md border border-common-minimal py-1 pl-0 pr-1.5">
        <Star className="h-3.5 text-functional-yellow" fill="currentColor" />
        <span className="text-xs text-text-secondary">{article.total_ratings}</span>
      </div>
    </div>
  );
};
