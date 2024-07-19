import React, { useEffect, useRef, useState } from 'react';

import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, Editor as TipTapEditor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Control, FieldValues, Path, useController } from 'react-hook-form';

import MenuBar from './MenuBar';

// Todo: unable to set the content empty after the review is submitted
interface CommentEditorProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
}

const CommentEditor = <TFieldValues extends FieldValues>({
  name,
  control,
}: CommentEditorProps<TFieldValues>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    // Display error if the comment length is less than 50 characters and also comment is required
    rules: {
      required: 'Comment is required',
      minLength: { value: 50, message: 'Comment must be at least 50 characters' },
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write a comment...',
      }),
      Underline,
    ],
    editorProps: {
      attributes: {
        class:
          'flex flex-col px-4 py-3 justify-start border-b border-r border-l border-gray-700 items-start w-full gap-3 pt-4 rounded-bl-md rounded-br-md outline-none',
      },
    },
    content: field.value as string,
    onCreate: () => setEditorLoaded(true),
    onUpdate({ editor }) {
      field.onChange(editor.getHTML());
    },
  });

  const editorRef = useRef<TipTapEditor | null>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    if (editor && editorRef.current) {
      editorRef.current = editor;
    }
  }, [editor]);

  return !editorLoaded ? (
    <div className="h-24 animate-pulse rounded bg-gray-200"></div>
  ) : (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default CommentEditor;
