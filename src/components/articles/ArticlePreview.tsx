import React from 'react';

import { Star } from 'lucide-react';

import { ArticleOut } from '@/api/schemas';

import RenderParsedHTML from '../common/RenderParsedHTML';

interface ArticlePreviewProps {
  article: ArticleOut;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  return (
    <div className="flex w-full flex-col gap-2">
      <RenderParsedHTML
        rawContent={article.title}
        supportLatex={true}
        supportMarkdown={false}
        contentClassName="font-semibold text-text-primary res-text-sm break-words"
        containerClassName="mb-0"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center">
          <Star className="h-3.5 text-functional-yellow" fill="currentColor" />
          <span className="ml-1 text-xs text-text-secondary">{article.total_ratings}</span>
        </div>
        <span className="break-words text-xs text-text-secondary">
          Authors: {article.authors.map((a) => a.label).join(', ')}
        </span>
        <span className="break-words text-xs text-text-secondary">
          Submitted by: {article.user.username}
        </span>
      </div>

      <RenderParsedHTML
        rawContent={article.abstract}
        supportLatex={true}
        supportMarkdown={false}
        contentClassName="text-text-primary res-text-xs break-words"
        containerClassName="mb-0"
      />
    </div>
  );
};

export default ArticlePreview;
