
'use client';

import { FC } from 'react';

import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

import AbstractText from '@/components/articles/AbstractText';
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import TabNavigation from '@/components/ui/tab-navigation';
import type { FeedArticle } from '@/lib/feed/mockFeed';

import FullTextView from './FullTextView';
import { formatAuthors, sourceBadge } from './feedFormat';

interface ArticleReaderProps {
  article: FeedArticle;
}

const BlogView: FC<{ article: FeedArticle }> = ({ article }) => {
  const badge = sourceBadge(article.source);
  const doiUrl = article.doi ? `https://doi.org/${article.doi}` : undefined;
  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
          {badge.label}
        </span>
        <span>{article.pubDate}</span>
        {article.journal && (
          <>
            <span aria-hidden>·</span>
            <span className="italic">{article.journal}</span>
          </>
        )}
      </div>

      <RenderParsedHTML
        rawContent={article.title}
        supportLatex
        supportMarkdown={false}
        contentClassName="text-2xl font-bold leading-tight text-text-primary [overflow-wrap:anywhere]"
        containerClassName="mb-3"
      />

      <p className="mb-6 text-sm text-text-secondary">{formatAuthors(article.authors, 12)}</p>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-tertiary">
        Abstract
      </h2>
      <AbstractText
        text={article.abstract}
        className="text-[15px] leading-relaxed text-text-primary"
        containerClassName="mb-6"
      />

      {article.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-common-minimal px-2 py-0.5 text-[11px] text-text-secondary"
            >
              #{tag.replace(/\s+/g, '-').toLowerCase()}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-common-contrast/40 pt-4 text-sm">
        {doiUrl && (
          <Link
            href={doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
          >
            <ExternalLink className="size-4" /> DOI: {article.doi}
          </Link>
        )}
        <Link
          href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
        >
          <ExternalLink className="size-4" /> PubMed {article.pmid}
        </Link>
      </div>
    </article>
  );
};

const ArticleReader: FC<ArticleReaderProps> = ({ article }) => {
  return (
    <div className="p-4 sm:p-6">
      <TabNavigation
        // Without a resetKey the active tab and its mounted content leak between
        // articles when the reader swaps in place.
        resetKey={article.pmid}
        tabs={[
          { id: 'blog', title: 'Blog', content: () => <BlogView article={article} /> },
          {
            id: 'paper',
            title: article.pmcid ? 'Full text' : 'Paper',
            content: () => <FullTextView article={article} />,
          },
        ]}
      />
    </div>
  );
};

export default ArticleReader;
