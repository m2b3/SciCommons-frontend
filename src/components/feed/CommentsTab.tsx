
'use client';

import { FC, useEffect, useState } from 'react';

import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CommentCategory, useDemoFeedStore } from '@/stores/demoFeedStore';

interface CommentsTabProps {
  pmid: string;
}

const CATEGORIES: { id: CommentCategory; label: string; hint: string }[] = [
  { id: 'general', label: 'General', hint: 'For clarifications, explanations, and smaller questions.' },
  {
    id: 'research',
    label: 'Research',
    hint: 'Detailed insights, critiques, alternative methods, spotting errors.',
  },
  { id: 'anonymous', label: 'Anonymous', hint: "For beginners, or if you're not sure about your question." },
];

const categoryBadge = (category: CommentCategory) =>
  cn('rounded-full px-2 py-0.5 text-[10px] font-medium', {
    'bg-functional-green/10 text-functional-green': category === 'general',
    'bg-functional-blue/10 text-functional-blue': category === 'research',
    'bg-common-minimal text-text-secondary': category === 'anonymous',
  });

const CommentsTab: FC<CommentsTabProps> = ({ pmid }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [category, setCategory] = useState<CommentCategory>('general');
  const [draft, setDraft] = useState('');
  const comments = useDemoFeedStore((s) => s.byArticle[pmid]?.comments) ?? [];
  const addComment = useDemoFeedStore((s) => s.addComment);

  const activeHint = CATEGORIES.find((c) => c.id === category)?.hint;

  const submit = () => {
    addComment(pmid, draft, category);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-common-contrast/50 bg-common-cardBackground p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                category === c.id
                  ? 'border-functional-green/50 text-functional-green'
                  : 'border-common-contrast/50 text-text-secondary hover:bg-common-minimal'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="mb-2 text-[11px] text-text-tertiary">{activeHint}</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Leave a public comment. Markdown & LaTeX supported."
          rows={3}
          className="w-full resize-y rounded-lg border border-common-contrast/50 bg-common-background p-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-functional-green/50"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={submit} disabled={!draft.trim()}>
            Comment
          </Button>
        </div>
      </div>

      {mounted && comments.length === 0 && (
        <p className="px-1 text-center text-xs text-text-tertiary">Be the first to comment.</p>
      )}

      {mounted &&
        comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-common-contrast/40 bg-common-cardBackground p-3"
          >
            <div className="mb-1.5 flex items-center gap-2 text-xs">
              <span className="font-medium text-text-primary">{comment.author}</span>
              <span className={categoryBadge(comment.category)}>{comment.category}</span>
              <span className="ml-auto text-[11px] text-text-tertiary">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <RenderParsedHTML
              rawContent={comment.body}
              supportMarkdown
              supportLatex
              contentClassName="text-sm text-text-secondary"
              containerClassName="mb-0"
            />
          </div>
        ))}
    </div>
  );
};

export default CommentsTab;
