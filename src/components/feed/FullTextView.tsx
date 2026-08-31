'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { AlertCircle, ExternalLink, FileText } from 'lucide-react';

import type { FullTextSection } from '@/lib/feed/fullText';
import { useFullText } from '@/lib/feed/fullText';
import type { FeedArticle } from '@/lib/feed/handoffFeed';
import { cn } from '@/lib/utils';

interface FullTextViewProps {
  article: FeedArticle;
}

const SectionNav: FC<{ sections: FullTextSection[]; activeId: string | null }> = ({
  sections,
  activeId,
}) => (
  <nav className="sticky top-0 hidden w-48 flex-none self-start py-1 xl:block">
    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
      Contents
    </p>
    <ul className="flex flex-col gap-0.5">
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className={cn(
              'block truncate rounded-md px-3 py-1.5 text-xs transition-colors',
              activeId === section.id
                ? 'bg-functional-green/10 font-medium text-functional-green'
                : 'text-text-tertiary hover:bg-common-minimal hover:text-text-secondary'
            )}
          >
            {section.heading}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const Skeleton: FC = () => (
  <div className="mx-auto max-w-3xl animate-pulse" aria-busy="true" aria-label="Loading full text">
    {[0, 1, 2].map((block) => (
      <div key={block} className="mb-8">
        <div className="mb-4 h-5 w-40 rounded bg-common-minimal" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((line) => (
            <div
              key={line}
              className={cn('h-3 rounded bg-common-minimal', line === 4 ? 'w-2/3' : 'w-full')}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/** Shown when the paper is outside the PMC open-access subset, or the fetch failed. */
const Unavailable: FC<{ article: FeedArticle; failed?: boolean }> = ({ article, failed }) => (
  <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-dashed border-common-contrast/50 p-10 text-center">
    {failed ? (
      <AlertCircle className="size-10 text-text-tertiary" />
    ) : (
      <FileText className="size-10 text-text-tertiary" />
    )}
    <p className="text-sm text-text-secondary">
      {failed
        ? "We couldn't load the full text just now."
        : 'This article is not in the PubMed Central open-access subset, so its full text cannot be shown here.'}
    </p>
    <p className="max-w-md text-xs text-text-tertiary">
      {failed
        ? 'The publisher may be unreachable. The abstract is on the Blog tab.'
        : 'The abstract is available on the Blog tab. The publisher’s copy may still be open to you through your institution.'}
    </p>
    <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm">
      {article.url && (
        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
        >
          <ExternalLink className="size-4" /> Open source
        </Link>
      )}
      {article.doi && (
        <Link
          href={`https://doi.org/${article.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
        >
          <ExternalLink className="size-4" /> View at publisher
        </Link>
      )}
      {article.source === 'pubmed' && article.externalId && (
        <Link
          href={`https://pubmed.ncbi.nlm.nih.gov/${article.externalId}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
        >
          <ExternalLink className="size-4" /> PubMed {article.externalId}
        </Link>
      )}
    </div>
  </div>
);

const FullTextView: FC<FullTextViewProps> = ({ article }) => {
  const { data, isLoading, isError } = useFullText(article.pmcid || undefined);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => data?.sections ?? [], [data]);

  // Highlight the section currently nearest the top of the reading area.
  useEffect(() => {
    if (sections.length === 0) return;
    const nodes = sections
      .map((s) => containerRef.current?.querySelector(`#${CSS.escape(s.id)}`))
      .filter((n): n is Element => !!n);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  if (!article.pmcid) return <Unavailable article={article} />;
  if (isLoading) return <Skeleton />;
  if (isError || !data) return <Unavailable article={article} failed />;

  return (
    <div ref={containerRef} className="mx-auto flex max-w-5xl gap-8">
      <SectionNav sections={sections} activeId={activeId} />

      <div className="min-w-0 max-w-3xl flex-1">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-8 scroll-mt-4">
            <h2 className="mb-3 text-lg font-semibold text-text-primary">{section.heading}</h2>

            {section.blocks.map((block, i) => {
              if (block.kind === 'heading') {
                return (
                  <h3
                    key={i}
                    className={cn(
                      'mb-2 mt-5 font-semibold text-text-primary',
                      block.level >= 3 ? 'text-sm' : 'text-[15px]'
                    )}
                  >
                    {block.text}
                  </h3>
                );
              }

              if (block.kind === 'caption') {
                return (
                  <figcaption
                    key={i}
                    className="my-3 border-l-2 border-common-contrast/60 py-1 pl-3 text-[13px] leading-relaxed text-text-tertiary"
                  >
                    {block.text}
                  </figcaption>
                );
              }

              return (
                <p key={i} className="mb-3 text-[15px] leading-relaxed text-text-primary">
                  {block.text}
                </p>
              );
            })}
          </section>
        ))}

        <div className="flex flex-wrap gap-3 border-t border-common-contrast/40 pt-4 text-sm">
          <Link
            href={article.pmcUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
          >
            <ExternalLink className="size-4" /> Open on PMC (figures &amp; tables)
          </Link>
          {article.doi && (
            <Link
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-functional-blue hover:underline"
            >
              <ExternalLink className="size-4" /> DOI: {article.doi}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullTextView;
