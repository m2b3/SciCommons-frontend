'use client';

// InitializedMDXEditor.tsx
import type { ForwardedRef } from 'react';
import React from 'react';

import { useTheme } from 'next-themes';

import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  DirectiveDescriptor,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  StrikeThroughSupSubToggles,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

import { markdownStyles } from '@/constants/common.constants';
import { cn } from '@/lib/utils';

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  const { theme } = useTheme();

  const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim();

  const YoutubeDirectiveDescriptor: DirectiveDescriptor<any> = {
    name: 'youtube',
    type: 'leafDirective',
    testNode(node) {
      return node.name === 'youtube';
    },
    attributes: ['id'],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <button
            onClick={() => {
              parentEditor.update(() => {
                lexicalNode.selectNext();
                lexicalNode.remove();
              });
            }}
          >
            delete
          </button>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${mdastNode.attributes.id}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      );
    },
  };

  const CustomToolbar = () => {
    return (
      <DiffSourceToggleWrapper>
        <div className="mdx-editor-toolbar flex gap-1 overflow-x-auto p-1">
          <UndoRedo />
          <BlockTypeSelect />
          <BoldItalicUnderlineToggles />
          <StrikeThroughSupSubToggles />
          <CodeToggle />
          <InsertCodeBlock />
          <ListsToggle />
          <CreateLink />
          {/* <InsertImage /> */}
          <InsertTable />
          <InsertThematicBreak />
        </div>
      </DiffSourceToggleWrapper>
    );
  };

  const ALL_PLUGINS = [
    toolbarPlugin({ toolbarContents: () => <CustomToolbar /> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler: async () => Promise.resolve(''),
      disableImageSettingsButton: true,
      EditImageToolbar: () => {
        return null;
      },
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
    // sandpackPlugin({ sandpackConfig: virtuosoSampleSandpackConfig }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        js: 'JavaScript',
        css: 'CSS',
        txt: 'Plain Text',
        tsx: 'TypeScript',
        html: 'HTML',
        go: 'Go',
        java: 'Java',
        python: 'Python',
        bash: 'Bash',
        '': 'Unspecified',
      },
    }),
    directivesPlugin({
      directiveDescriptors: [YoutubeDirectiveDescriptor, AdmonitionDirectiveDescriptor],
    }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: props.markdown }),
    markdownShortcutPlugin(),
  ];

  return (
    <MDXEditor
      plugins={ALL_PLUGINS}
      {...props}
      ref={editorRef}
      onChange={(markdown, initialMarkdownNormalize) => {
        props.onChange?.(markdown, initialMarkdownNormalize);
      }}
      placeholder="Write here..."
      className={cn('rounded-lg border border-common-minimal', theme === 'dark' ? 'dark' : 'light')}
      contentEditableClassName={markdownStyles}
    />
  );
}
