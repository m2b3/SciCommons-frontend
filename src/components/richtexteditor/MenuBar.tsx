'use client';

import React from 'react';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';

type Props = {
  editor: Editor | null;
};

const MenuBar = ({ editor }: Props) => {
  if (!editor) {
    return null;
  }
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-5 rounded-tl-md rounded-tr-md border border-common-contrast px-4 py-3">
      <div className="flex w-full flex-wrap items-center justify-start gap-5 lg:w-10/12">
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={
            /* Fixed by Codex on 2026-02-15
               Who: Codex
               What: Tokenize rich-text toolbar colors.
               Why: Allow skins to restyle editor affordances.
               How: Swap sky/white utilities for functional + text tokens. */
            editor.isActive('bold')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <Bold className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={
            editor.isActive('italic')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <Italic className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          className={
            editor.isActive('underline')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <Underline className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
          className={
            editor.isActive('strike')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <Strikethrough className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={
            editor.isActive('heading', { level: 2 })
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <Heading2 className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={
            editor.isActive('bulletList')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <List className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={
            editor.isActive('orderedList')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <ListOrdered className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={
            editor.isActive('blockquote')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <Quote className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().setCode().run();
          }}
          className={
            editor.isActive('code')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'text-text-tertiary hover:text-functional-blue'
          }
        >
          <Code className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          className={
            editor.isActive('undo')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'p-1 text-text-tertiary hover:rounded-lg hover:bg-functional-blue/10 hover:text-functional-blue'
          }
        >
          <Undo className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          className={
            editor.isActive('redo')
              ? 'rounded-lg bg-functional-blue p-2 text-primary-foreground'
              : 'p-1 text-text-tertiary hover:rounded-lg hover:bg-functional-blue/10 hover:text-functional-blue'
          }
        >
          <Redo className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
