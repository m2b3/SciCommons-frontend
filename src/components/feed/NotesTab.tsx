
'use client';

import { FC, useEffect, useState } from 'react';

import { Lock, Trash2 } from 'lucide-react';

import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import { Button } from '@/components/ui/button';
import { useDemoFeedStore } from '@/stores/demoFeedStore';

interface NotesTabProps {
  pmid: string;
}

const NotesTab: FC<NotesTabProps> = ({ pmid }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [draft, setDraft] = useState('');
  const notes = useDemoFeedStore((s) => s.byArticle[pmid]?.notes) ?? [];
  const addNote = useDemoFeedStore((s) => s.addNote);
  const deleteNote = useDemoFeedStore((s) => s.deleteNote);

  const submit = () => {
    addNote(pmid, draft);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-common-contrast/50 bg-common-cardBackground p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-text-tertiary">
          <Lock className="size-3" />
          Private to you · Markdown &amp; LaTeX supported
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Leave a private note. Optionally quote the paper. e.g. $E = mc^2$"
          rows={4}
          className="w-full resize-y rounded-lg border border-common-contrast/50 bg-common-background p-2.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-functional-green/50"
        />
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            disabled
            title="Local Zotero sync — coming soon"
            className="cursor-not-allowed text-[11px] text-text-tertiary underline decoration-dotted"
          >
            Connect Zotero
          </button>
          <Button size="sm" onClick={submit} disabled={!draft.trim()}>
            Save note
          </Button>
        </div>
      </div>

      {mounted && notes.length === 0 && (
        <p className="px-1 text-center text-xs text-text-tertiary">
          Highlight text and add private notes.
        </p>
      )}

      {mounted &&
        notes.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-common-contrast/40 bg-common-cardBackground p-3"
          >
            <RenderParsedHTML
              rawContent={note.body}
              supportMarkdown
              supportLatex
              contentClassName="text-sm text-text-primary"
              containerClassName="mb-0"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
              <span>{new Date(note.createdAt).toLocaleString()}</span>
              <button
                type="button"
                onClick={() => deleteNote(pmid, note.id)}
                className="inline-flex items-center gap-1 hover:text-functional-red"
              >
                <Trash2 className="size-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default NotesTab;
