'use client';

import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import MenuBar from './MenuBar';

interface TiptapProps {
  onChange: (content: string) => void;
}

const Tiptap = ({ onChange }: TiptapProps) => {
  const handleChange = (newContent: string) => {
    onChange(newContent);
  };
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    editorProps: {
      attributes: {
        class:
          /* Fixed by Codex on 2026-02-15
             Who: Codex
             What: Tokenize editor border and text colors.
             Why: Keep the rich text editor in sync with UI skins.
             How: Replace gray utilities with semantic token classes. */
          'flex flex-col px-4 py-3 justify-start border-b border-r border-l border-common-contrast text-text-secondary items-start w-full gap-3 font-medium text-[16px] pt-4 rounded-bl-md rounded-br-md outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      handleChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="w-full px-4">
      <MenuBar editor={editor} />
      <EditorContent style={{ whiteSpace: 'pre-line' }} editor={editor} />
    </div>
  );
};

export default Tiptap;
