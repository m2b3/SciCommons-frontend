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
  InsertImage,
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

import { toast } from '@/components/ui/use-toast';
import { markdownStyles } from '@/constants/common.constants';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const MAX_SOURCE_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const MAX_SOURCE_IMAGE_SIZE_MB = MAX_SOURCE_IMAGE_SIZE_BYTES / 1024 / 1024;
const MAX_IMAGE_UPLOADS_PER_MINUTE = 10;
const IMAGE_UPLOAD_WINDOW_MS = 60 * 1000;
const IMAGE_UPLOAD_THROTTLE_STORAGE_KEY = 'mdx-editor-image-upload-throttle-v1';
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
];
const IMAGE_UPLOAD_GUIDANCE_TEXT = `Image uploads are limited to ${MAX_SOURCE_IMAGE_SIZE_MB}MB each and ${MAX_IMAGE_UPLOADS_PER_MINUTE} images per minute. Use images sparingly.`;

type UploadThrottleLedger = Record<string, number[]>;

const normalizeImageMimeType = (mimeType: string) => {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  if (normalizedMimeType === 'image/jpg') return 'image/jpeg';
  return normalizedMimeType;
};

const getUploadThrottleUserKey = (userId: number | null, accessToken: string | null) => {
  if (userId !== null) return `user:${userId}`;
  if (accessToken) return `token:${accessToken.slice(-24)}`;
  return null;
};

const pruneUploadTimestamps = (timestamps: number[], now: number) =>
  timestamps.filter((timestamp) => now - timestamp < IMAGE_UPLOAD_WINDOW_MS);

const readUploadThrottleLedger = (): UploadThrottleLedger => {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(IMAGE_UPLOAD_THROTTLE_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    const ledger: UploadThrottleLedger = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!Array.isArray(value)) continue;
      const numericTimestamps = value.filter((entry): entry is number => typeof entry === 'number');
      if (numericTimestamps.length > 0) {
        ledger[key] = numericTimestamps;
      }
    }

    return ledger;
  } catch {
    return {};
  }
};

const writeUploadThrottleLedger = (ledger: UploadThrottleLedger) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(IMAGE_UPLOAD_THROTTLE_STORAGE_KEY, JSON.stringify(ledger));
  } catch {
    // Ignore storage write failures and fall back to backend-enforced limits.
  }
};

/* Fixed by Codex on 2026-02-28
   Who: Codex
   What: Added a shared per-user upload throttle ledger for all MDX editor instances.
   Why: Image uploads must be capped to 10 files per minute per user across the app.
   How: Persist a sliding-window timestamp ledger in localStorage and reserve an upload slot before compression/upload starts. */
const reserveUploadSlot = (userKey: string, now = Date.now()) => {
  const existingLedger = readUploadThrottleLedger();
  const compactedLedger: UploadThrottleLedger = {};

  for (const [key, timestamps] of Object.entries(existingLedger)) {
    const pruned = pruneUploadTimestamps(timestamps, now);
    if (pruned.length > 0) {
      compactedLedger[key] = pruned;
    }
  }

  const userTimestamps = compactedLedger[userKey] ?? [];
  if (userTimestamps.length >= MAX_IMAGE_UPLOADS_PER_MINUTE) {
    writeUploadThrottleLedger(compactedLedger);
    const retryAfterMs = userTimestamps[0] + IMAGE_UPLOAD_WINDOW_MS - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  compactedLedger[userKey] = [...userTimestamps, now];
  writeUploadThrottleLedger(compactedLedger);
  return { allowed: true, retryAfterSeconds: 0 };
};

async function compressImage(file: File): Promise<File> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/compress-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorPayload?.error ?? 'Failed to compress image');
  }

  const compressedBlob = await response.blob();
  return new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.avif'), {
    type: 'image/avif',
  });
}

/* Fixed by Codex on 2026-02-28
   Who: Codex
   What: Routed MDX image upload requests through the local upload proxy endpoint.
   Why: Direct browser uploads could fail backend origin checks and hide backend-provided error details.
   How: Send FormData to `/api/uploads/image`, parse structured JSON error payloads, and return `public_url` from proxy response. */
async function uploadImage(file: File, accessToken: string | null): Promise<string> {
  if (!accessToken) {
    throw new Error('You must be logged in to upload images');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/uploads/image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as {
      error?: string;
      detail?: string;
      message?: string;
    } | null;
    throw new Error(
      errorPayload?.error ??
        errorPayload?.detail ??
        errorPayload?.message ??
        `Upload failed with status ${response.status}`
    );
  }

  const payload = (await response.json().catch(() => null)) as { public_url?: string } | null;
  if (!payload?.public_url) {
    throw new Error('Upload succeeded but no image URL was returned');
  }

  return payload.public_url;
}

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  hideToolbar = false,
  mentionCandidates = [],
  ...props
}: {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  hideToolbar?: boolean;
  mentionCandidates?: string[];
} & MDXEditorProps) {
  const { theme } = useTheme();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authenticatedUserId = useAuthStore((state) => state.user?.id ?? null);
  const editorRootRef = React.useRef<HTMLDivElement>(null);
  const editorMethodsRef = React.useRef<MDXEditorMethods | null>(null);
  const [activeMentionQuery, setActiveMentionQuery] = React.useState<string | null>(null);
  const [highlightedMentionIndex, setHighlightedMentionIndex] = React.useState(0);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = React.useState(false);
  const [mentionMenuPlacement, setMentionMenuPlacement] = React.useState<'top' | 'bottom'>(
    'bottom'
  );
  const [mentionMenuMaxHeight, setMentionMenuMaxHeight] = React.useState(160);
  const mentionOptionRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  /* Fixed by Codex on 2026-02-28
     Who: Codex
     What: Enabled end-to-end image uploads in MDX editor with pre-upload compression and auth-aware throttling.
     Why: All editor surfaces need consistent image upload behavior with a strict per-user rate limit.
     How: Validate client file constraints, reserve a 10/min user slot, compress via `/api/compress-image`,
          upload through the local `/api/uploads/image` proxy, and surface upload status via toast updates. */
  const imageUploadHandler = React.useCallback(
    async (image: File): Promise<string> => {
      if (!accessToken) {
        const message = 'You must be logged in to upload images';
        toast({
          title: 'Login required',
          description: message,
          variant: 'destructive',
        });
        throw new Error(message);
      }

      if (image.size > MAX_SOURCE_IMAGE_SIZE_BYTES) {
        const message = `Image size exceeds ${MAX_SOURCE_IMAGE_SIZE_MB}MB limit`;
        toast({
          title: 'Image too large',
          description: message,
          variant: 'destructive',
        });
        throw new Error(message);
      }

      const normalizedImageMimeType = normalizeImageMimeType(image.type);
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedImageMimeType)) {
        const message = `Invalid image type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`;
        toast({
          title: 'Invalid image type',
          description: message,
          variant: 'destructive',
        });
        throw new Error(message);
      }

      const throttleUserKey = getUploadThrottleUserKey(authenticatedUserId, accessToken);
      if (throttleUserKey) {
        const throttleResult = reserveUploadSlot(throttleUserKey);
        if (!throttleResult.allowed) {
          const message = `Upload limit reached (max ${MAX_IMAGE_UPLOADS_PER_MINUTE} images/minute). Try again in ${throttleResult.retryAfterSeconds}s.`;
          toast({
            title: 'Upload throttled',
            description: message,
            variant: 'destructive',
          });
          throw new Error(message);
        }
      }

      const uploadToast = toast({
        title: 'Uploading image...',
        description: 'Compressing and uploading your image',
      });

      try {
        const compressedImage = await compressImage(image);
        const publicUrl = await uploadImage(compressedImage, accessToken);

        uploadToast.update({
          id: uploadToast.id,
          title: 'Image uploaded',
          description: 'Your image has been uploaded successfully',
        });

        setTimeout(() => uploadToast.dismiss(), 2000);
        return publicUrl;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload image';
        uploadToast.update({
          id: uploadToast.id,
          title: 'Upload failed',
          description: message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    [accessToken, authenticatedUserId]
  );

  const normalizedMentionCandidates = React.useMemo(() => {
    const dedupedNames = new Set<string>();
    mentionCandidates.forEach((candidate) => {
      const normalizedName = candidate.trim();
      if (normalizedName.length > 0) {
        dedupedNames.add(normalizedName);
      }
    });
    return Array.from(dedupedNames);
  }, [mentionCandidates]);

  const clearMentionMenu = React.useCallback(() => {
    setActiveMentionQuery(null);
    setIsMentionMenuOpen(false);
    setHighlightedMentionIndex(0);
  }, []);

  const updateMentionMenuPlacement = React.useCallback(() => {
    const editorRoot = editorRootRef.current;
    if (!editorRoot) return;

    const viewportMargin = 8;
    const preferredMenuHeight = 200;
    const rect = editorRoot.getBoundingClientRect();
    const spaceAbove = rect.top - viewportMargin;
    const spaceBelow = window.innerHeight - rect.bottom - viewportMargin;
    const shouldPlaceOnTop = spaceBelow < preferredMenuHeight && spaceAbove > spaceBelow;
    const availableSpace = shouldPlaceOnTop ? spaceAbove : spaceBelow;

    setMentionMenuPlacement(shouldPlaceOnTop ? 'top' : 'bottom');
    setMentionMenuMaxHeight(Math.max(80, Math.min(240, Math.floor(availableSpace))));
  }, []);

  const filteredMentionCandidates = React.useMemo(() => {
    if (!isMentionMenuOpen || activeMentionQuery === null) return [];
    const normalizedQuery = activeMentionQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return normalizedMentionCandidates.slice(0, 8);
    }

    return normalizedMentionCandidates
      .filter((candidate) => candidate.toLowerCase().startsWith(normalizedQuery))
      .slice(0, 8);
  }, [activeMentionQuery, isMentionMenuOpen, normalizedMentionCandidates]);

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Added mention autocomplete support to the MDX discussion editor.
     Why: New discussion content used markdown editor controls but lacked the `@member` suggestion flow available in comment textareas.
     How: Detect `@query` at the caret from the contenteditable selection, render a local candidate menu, and insert only the missing mention suffix via `insertMarkdown`. */
  const updateMentionContext = React.useCallback(() => {
    if (normalizedMentionCandidates.length === 0 || props.readOnly) {
      clearMentionMenu();
      return;
    }

    const editorRoot = editorRootRef.current;
    const contentEditable = editorRoot?.querySelector(
      '[contenteditable="true"]'
    ) as HTMLElement | null;

    if (!editorRoot || !contentEditable) {
      clearMentionMenu();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      clearMentionMenu();
      return;
    }

    const range = selection.getRangeAt(0);
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !contentEditable.contains(anchorNode)) {
      clearMentionMenu();
      return;
    }

    const textRange = range.cloneRange();
    textRange.selectNodeContents(contentEditable);
    textRange.setEnd(range.endContainer, range.endOffset);
    const textBeforeCaret = textRange.toString();

    const mentionMatch = textBeforeCaret.match(/(^|\s)@([A-Za-z0-9_.-]*)$/);
    if (!mentionMatch) {
      clearMentionMenu();
      return;
    }

    const nextMentionQuery = mentionMatch[2] ?? '';
    setActiveMentionQuery((previousMentionQuery) => {
      if (previousMentionQuery !== nextMentionQuery) {
        setHighlightedMentionIndex(0);
      }
      return nextMentionQuery;
    });
    updateMentionMenuPlacement();
    setIsMentionMenuOpen(true);
  }, [
    clearMentionMenu,
    normalizedMentionCandidates.length,
    props.readOnly,
    updateMentionMenuPlacement,
  ]);

  const handleSelectMention = React.useCallback(
    (memberName: string) => {
      const editorMethods = editorMethodsRef.current;
      if (!editorMethods) return;

      const mentionQuery = activeMentionQuery ?? '';
      const normalizedQuery = mentionQuery.toLowerCase();
      const normalizedMemberName = memberName.toLowerCase();
      const suffixToInsert =
        normalizedMemberName.startsWith(normalizedQuery) && mentionQuery.length <= memberName.length
          ? memberName.slice(mentionQuery.length)
          : memberName;

      editorMethods.insertMarkdown(`${suffixToInsert} `);
      clearMentionMenu();

      requestAnimationFrame(() => {
        editorMethods.focus();
      });
    },
    [activeMentionQuery, clearMentionMenu]
  );

  const handleEditorRef = React.useCallback(
    (methods: MDXEditorMethods | null) => {
      editorMethodsRef.current = methods;

      if (typeof editorRef === 'function') {
        editorRef(methods);
        return;
      }

      if (editorRef) {
        (editorRef as React.MutableRefObject<MDXEditorMethods | null>).current = methods;
      }
    },
    [editorRef]
  );

  React.useEffect(() => {
    if (filteredMentionCandidates.length === 0) {
      setIsMentionMenuOpen(false);
      return;
    }

    updateMentionMenuPlacement();
    if (highlightedMentionIndex >= filteredMentionCandidates.length) {
      setHighlightedMentionIndex(0);
    }
  }, [filteredMentionCandidates.length, highlightedMentionIndex, updateMentionMenuPlacement]);

  const handleEditorKeyDownCapture = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const editorRoot = editorRootRef.current;
      const contentEditable = editorRoot?.querySelector(
        '[contenteditable="true"]'
      ) as HTMLElement | null;
      if (!contentEditable || !contentEditable.contains(event.target as Node)) return;
      if (!isMentionMenuOpen || filteredMentionCandidates.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedMentionIndex(
          (previousIndex) => (previousIndex + 1) % filteredMentionCandidates.length
        );
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedMentionIndex(
          (previousIndex) =>
            (previousIndex - 1 + filteredMentionCandidates.length) %
            filteredMentionCandidates.length
        );
        return;
      }

      if ((event.key === 'Enter' || event.key === 'Tab') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSelectMention(filteredMentionCandidates[highlightedMentionIndex]);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clearMentionMenu();
      }
    },
    [
      clearMentionMenu,
      filteredMentionCandidates,
      handleSelectMention,
      highlightedMentionIndex,
      isMentionMenuOpen,
    ]
  );

  const handleEditorKeyUpCapture = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const editorRoot = editorRootRef.current;
      const contentEditable = editorRoot?.querySelector(
        '[contenteditable="true"]'
      ) as HTMLElement | null;
      if (!contentEditable || !contentEditable.contains(event.target as Node)) return;

      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === 'Tab' ||
        event.key === 'Escape'
      ) {
        return;
      }
      updateMentionContext();
    },
    [updateMentionContext]
  );

  const handleEditorClickCapture = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const editorRoot = editorRootRef.current;
      const contentEditable = editorRoot?.querySelector(
        '[contenteditable="true"]'
      ) as HTMLElement | null;
      if (!contentEditable || !contentEditable.contains(event.target as Node)) return;
      updateMentionContext();
    },
    [updateMentionContext]
  );

  React.useEffect(() => {
    if (!isMentionMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (editorRootRef.current?.contains(event.target as Node)) return;
      clearMentionMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearMentionMenu, isMentionMenuOpen]);

  React.useEffect(() => {
    if (!isMentionMenuOpen) return;

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Kept markdown mention menu visible within viewport bounds.
       Why: Menus near the bottom of the page could render off-screen and hide suggestion options.
       How: Recompute menu placement/max-height on open and during resize/scroll, flipping above the editor when space is constrained. */
    const handleViewportChange = () => {
      updateMentionMenuPlacement();
    };

    handleViewportChange();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isMentionMenuOpen, updateMentionMenuPlacement]);

  React.useEffect(() => {
    if (!isMentionMenuOpen) return;

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Auto-scrolled markdown mention options with keyboard navigation.
       Why: Arrowing through long lists could move highlight outside the visible suggestion window.
       How: Scroll active option into view using nearest alignment after highlight index updates. */
    mentionOptionRefs.current[highlightedMentionIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [highlightedMentionIndex, isMentionMenuOpen]);

  const YoutubeDirectiveDescriptor: DirectiveDescriptor = {
    name: 'youtube',
    type: 'leafDirective',
    testNode(node) {
      return node.name === 'youtube';
    },
    attributes: ['id'],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      const videoId =
        mdastNode.attributes && typeof mdastNode.attributes.id === 'string'
          ? mdastNode.attributes.id
          : '';
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
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      );
    },
  };

  const CustomToolbar = () => {
    /* Fixed by Codex on 2026-02-28
       Who: Codex
       What: Tuned MDX toolbar shell styling to match SciCommons card/contrast aesthetics.
       Why: The raw MDX toolbar looked visually detached from the rest of the site's controls.
       How: Applied the app's border/background/shadow utility classes to the toolbar wrapper so
            all built-in editor controls render inside a consistent container. */
    return (
      <DiffSourceToggleWrapper>
        <div className="mdx-editor-toolbar flex items-center gap-1 overflow-x-auto rounded-md border border-common-contrast bg-common-cardBackground/95 p-1 shadow-sm backdrop-blur-sm">
          <UndoRedo />
          <BlockTypeSelect />
          <BoldItalicUnderlineToggles />
          <StrikeThroughSupSubToggles />
          <CodeToggle />
          <InsertCodeBlock />
          <ListsToggle />
          <CreateLink />
          <InsertImage />
          <InsertTable />
          <InsertThematicBreak />
        </div>
      </DiffSourceToggleWrapper>
    );
  };

  const ALL_PLUGINS = [
    ...(hideToolbar ? [] : [toolbarPlugin({ toolbarContents: () => <CustomToolbar /> })]),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler,
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
    <div
      className="relative"
      ref={editorRootRef}
      onKeyDownCapture={handleEditorKeyDownCapture}
      onKeyUpCapture={handleEditorKeyUpCapture}
      onClickCapture={handleEditorClickCapture}
    >
      {/* Fixed by Codex on 2026-02-28
          Who: Codex
          What: Aligned editor upload guidance copy with actual enforced upload limits.
          Why: Previous “Up to 5 images” hint conflicted with real runtime constraints and could mislead users.
          How: Render a reusable helper string derived from size/throttle constants only for editable editor instances. */}
      {!props.readOnly && (
        <p className="mb-2 px-1 text-xxs text-text-tertiary">{IMAGE_UPLOAD_GUIDANCE_TEXT}</p>
      )}
      <MDXEditor
        plugins={ALL_PLUGINS}
        {...props}
        ref={handleEditorRef}
        onChange={(markdown, initialMarkdownNormalize) => {
          props.onChange?.(markdown, initialMarkdownNormalize);
        }}
        placeholder={props.placeholder || 'Write here...'}
        className={cn('rounded-lg border border-common-contrast bg-common-background', theme, {
          'bg-common-cardBackground': props.readOnly,
        })}
        contentEditableClassName={markdownStyles}
      />
      {isMentionMenuOpen && filteredMentionCandidates.length > 0 && !props.readOnly && (
        <div
          className={cn(
            'absolute inset-x-0 z-20 rounded-md border border-common-contrast bg-common-cardBackground p-1 shadow-lg',
            mentionMenuPlacement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          )}
        >
          <div className="mb-1 px-2 text-xxs text-text-tertiary">Mention a community member</div>
          <div className="overflow-y-auto" style={{ maxHeight: `${mentionMenuMaxHeight}px` }}>
            {filteredMentionCandidates.map((candidate, index) => (
              <button
                key={candidate}
                type="button"
                ref={(element) => {
                  mentionOptionRefs.current[index] = element;
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelectMention(candidate);
                }}
                className={cn(
                  'flex w-full items-center rounded px-2 py-1 text-left text-xs text-text-primary hover:bg-common-minimal',
                  index === highlightedMentionIndex && 'bg-common-minimal'
                )}
              >
                @{candidate}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
