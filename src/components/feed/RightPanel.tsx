
'use client';

import { FC, MouseEvent } from 'react';

import Link from 'next/link';

import { Lock, Sparkles } from 'lucide-react';

import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import TabNavigation from '@/components/ui/tab-navigation';
import { getSimilar } from '@/lib/feed/mockFeed';

import CommentsTab from './CommentsTab';
import { formatAuthors } from './feedFormat';
import NotesTab from './NotesTab';

interface RightPanelProps {
  /** When present the panel is article-scoped (Notes/Comments/Similar tabs). */
  pmid?: string;
  /** When provided, Similar entries swap the reader in place instead of navigating. */
  onSelectArticle?: (pmid: string) => void;
}

const SimilarList: FC<{ pmid: string; onSelect?: (pmid: string) => void }> = ({
  pmid,
  onSelect,
}) => {
  const similar = getSimilar(pmid);
  if (similar.length === 0) {
    return <p className="text-center text-xs text-text-tertiary">No similar papers found.</p>;
  }

  // Same rule as the feed cards: keep the href, intercept only plain left-clicks, so
  // modified clicks still open the deep-link route in a new tab.
  const handleOpen = (targetPmid: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onSelect(targetPmid);
  };

  return (
    <div className="flex flex-col gap-2">
      {similar.map((article) => (
        <Link
          key={article.pmid}
          href={`/feed/article/${article.pmid}`}
          onClick={handleOpen(article.pmid)}
          className="rounded-lg border border-common-contrast/40 bg-common-cardBackground p-3 transition-colors hover:border-common-contrast"
        >
          <RenderParsedHTML
            rawContent={article.title}
            supportLatex
            supportMarkdown={false}
            contentClassName="line-clamp-2 text-xs font-medium text-text-primary"
            containerClassName="mb-0"
          />
          <p className="mt-1 truncate text-[11px] text-text-tertiary">
            {formatAuthors(article.authors, 2)} · {article.pubDate}
          </p>
        </Link>
      ))}
    </div>
  );
};

const FeedInfoPanel: FC = () => (
  <div className="flex flex-col gap-4 p-4">
    <div className="rounded-xl border border-common-contrast/50 bg-common-cardBackground p-4">
      <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
        <Lock className="size-4 text-functional-green" />
        Your private notes
      </div>
      <p className="text-xs text-text-secondary">
        Open any article to take private notes and leave public comments. Notes stay private to
        you and will sync to Zotero locally.
      </p>
      <button
        type="button"
        disabled
        title="Local Zotero sync — coming soon"
        className="mt-3 cursor-not-allowed rounded-lg border border-common-contrast/50 px-3 py-1.5 text-[11px] text-text-tertiary"
      >
        Connect Zotero (soon)
      </button>
    </div>

    <div className="rounded-xl border border-common-contrast/50 bg-common-cardBackground p-4">
      <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-text-primary">
        <Sparkles className="size-4 text-functional-blue" />
        What&apos;s next
      </div>
      <ul className="list-inside list-disc space-y-1 text-xs text-text-secondary">
        <li>Live feed of new papers &amp; blogs</li>
        <li>Follow communities and researchers</li>
        <li>RSS / preprint-server sources</li>
      </ul>
    </div>
  </div>
);

const RightPanel: FC<RightPanelProps> = ({ pmid, onSelectArticle }) => {
  if (!pmid) {
    return <FeedInfoPanel />;
  }

  return (
    <div className="p-4">
      <TabNavigation
        // Reset per article, or the previous paper's tab state and mounted notes
        // carry over when the reader swaps in place.
        resetKey={pmid}
        tabs={[
          { id: 'notes', title: 'My Notes', content: () => <NotesTab pmid={pmid} /> },
          { id: 'comments', title: 'Comments', content: () => <CommentsTab pmid={pmid} /> },
          {
            id: 'similar',
            title: 'Similar',
            content: () => <SimilarList pmid={pmid} onSelect={onSelectArticle} />,
          },
        ]}
      />
    </div>
  );
};

export default RightPanel;
