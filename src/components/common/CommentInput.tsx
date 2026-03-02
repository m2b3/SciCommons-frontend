import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Eye, EyeOff, Send } from 'lucide-react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { Ratings } from '@/components/ui/ratings';
import { useSubmitOnCtrlEnter } from '@/hooks/useSubmitOnCtrlEnter';
import { cn } from '@/lib/utils';

import { Button, ButtonIcon, ButtonTitle } from '../ui/button';
import CustomTooltip from './CustomTooltip';
import RenderParsedHTML from './RenderParsedHTML';
import { BlockSkeleton, Skeleton } from './Skeleton';

interface CommentInputProps {
  onSubmit: (content: string, rating?: number) => void;
  placeholder: string;
  buttonText: string;
  initialContent?: string;
  // Review specific props
  initialRating?: number;
  isReview?: boolean;
  // Ratings specific props
  isRatingsLoading?: boolean;
  isRatingsError?: boolean;
  // Reply specific props
  isReply?: boolean;
  isAuthor?: boolean;
  isPending?: boolean;
  mentionCandidates?: string[];
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface FormInputs {
  content: string;
  rating?: number;
}

interface MentionMatch {
  start: number;
  end: number;
  query: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder,
  buttonText,
  initialContent = '',
  initialRating,
  isReview = false,
  isRatingsError = false,
  isRatingsLoading = false,
  isReply = false,
  isAuthor = false,
  isPending = false,
  mentionCandidates = [],
  onChange,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormInputs>({
    defaultValues: { content: initialContent, rating: initialRating },
  });

  const [isMarkdownPreview, setIsMarkdownPreview] = useState<boolean>(false);
  const [activeMention, setActiveMention] = useState<MentionMatch | null>(null);
  const [highlightedMentionIndex, setHighlightedMentionIndex] = useState(0);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = useState(false);
  const [mentionMenuPlacement, setMentionMenuPlacement] = useState<'top' | 'bottom'>('bottom');
  const [mentionMenuMaxHeight, setMentionMenuMaxHeight] = useState(160);
  const contentValue = watch('content', initialContent);
  const formRef = React.useRef<HTMLFormElement>(null);
  const mentionContainerRef = useRef<HTMLDivElement>(null);
  const mentionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mentionOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useSubmitOnCtrlEnter(formRef, isPending);

  const normalizedMentionCandidates = useMemo(() => {
    const uniqueNames = new Set<string>();
    mentionCandidates.forEach((candidate) => {
      const normalized = candidate.trim();
      if (normalized.length > 0) {
        uniqueNames.add(normalized);
      }
    });
    return Array.from(uniqueNames);
  }, [mentionCandidates]);

  const clearMentionMenu = React.useCallback(() => {
    setActiveMention(null);
    setIsMentionMenuOpen(false);
    setHighlightedMentionIndex(0);
  }, []);

  const updateMentionMenuPlacement = React.useCallback(() => {
    const textarea = mentionTextareaRef.current;
    if (!textarea) return;

    const viewportMargin = 8;
    const preferredMenuHeight = 200;
    const rect = textarea.getBoundingClientRect();
    const spaceAbove = rect.top - viewportMargin;
    const spaceBelow = window.innerHeight - rect.bottom - viewportMargin;
    const shouldPlaceOnTop = spaceBelow < preferredMenuHeight && spaceAbove > spaceBelow;
    const availableSpace = shouldPlaceOnTop ? spaceAbove : spaceBelow;

    setMentionMenuPlacement(shouldPlaceOnTop ? 'top' : 'bottom');
    setMentionMenuMaxHeight(Math.max(80, Math.min(240, Math.floor(availableSpace))));
  }, []);

  const filteredMentionCandidates = useMemo(() => {
    if (!activeMention || activeMention.query.length === 0) return [];
    const normalizedQuery = activeMention.query.toLowerCase();
    return normalizedMentionCandidates
      .filter((candidate) => candidate.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [activeMention, normalizedMentionCandidates]);

  /* Fixed by Codex on 2026-02-25
     Who: Codex
     What: Added mention-token parsing for discussion comment textareas.
     Why: Community discussions now support `@member` tagging and need live candidate filtering.
     How: Inspect textarea text before the caret for `@query` tokens and track the active token span. */
  const updateMentionContext = React.useCallback(
    (nextValue?: string) => {
      if (normalizedMentionCandidates.length === 0 || isMarkdownPreview) {
        clearMentionMenu();
        return;
      }

      const textarea = mentionTextareaRef.current;
      if (!textarea) {
        clearMentionMenu();
        return;
      }

      const currentValue = nextValue ?? textarea.value;
      const caretPosition = textarea.selectionStart ?? 0;
      const textBeforeCaret = currentValue.slice(0, caretPosition);
      const mentionMatch = textBeforeCaret.match(/(^|\s)@([A-Za-z0-9_.-]+)$/);

      if (!mentionMatch) {
        clearMentionMenu();
        return;
      }

      const mentionSegment = mentionMatch[0];
      const atSymbolOffset = mentionSegment.lastIndexOf('@');
      const mentionStart = textBeforeCaret.length - mentionSegment.length + atSymbolOffset;
      setActiveMention((previousMention) => {
        const nextMention = {
          start: mentionStart,
          end: caretPosition,
          query: mentionMatch[2],
        };
        const hasMentionChanged =
          !previousMention ||
          previousMention.start !== nextMention.start ||
          previousMention.end !== nextMention.end ||
          previousMention.query !== nextMention.query;

        if (hasMentionChanged) {
          setHighlightedMentionIndex(0);
        }

        return nextMention;
      });
      updateMentionMenuPlacement();
      setIsMentionMenuOpen(true);
    },
    [clearMentionMenu, isMarkdownPreview, normalizedMentionCandidates, updateMentionMenuPlacement]
  );

  const insertMention = React.useCallback(
    (memberName: string) => {
      if (!activeMention) return;
      const normalizedName = memberName.trim();
      if (!normalizedName) return;

      const nextContent = `${contentValue.slice(0, activeMention.start)}@${normalizedName} ${contentValue.slice(activeMention.end)}`;
      const nextCaretPosition = activeMention.start + normalizedName.length + 2;

      setValue('content', nextContent, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      clearMentionMenu();

      requestAnimationFrame(() => {
        const textarea = mentionTextareaRef.current;
        if (!textarea) return;
        textarea.focus();
        textarea.setSelectionRange(nextCaretPosition, nextCaretPosition);
      });
    },
    [activeMention, clearMentionMenu, contentValue, setValue]
  );

  const onSubmitForm: SubmitHandler<FormInputs> = (data) => {
    onSubmit(data.content, data.rating);
    reset({ content: '', rating: 0 });
    setIsMarkdownPreview(false);
    clearMentionMenu();
  };

  useEffect(() => {
    if (initialRating !== undefined) {
      setValue('rating', initialRating);
    }
  }, [initialRating, setValue]);

  useEffect(() => {
    if (!activeMention || filteredMentionCandidates.length === 0) {
      setIsMentionMenuOpen(false);
      return;
    }

    updateMentionMenuPlacement();
    setIsMentionMenuOpen(true);
    if (highlightedMentionIndex >= filteredMentionCandidates.length) {
      setHighlightedMentionIndex(0);
    }
  }, [
    activeMention,
    filteredMentionCandidates.length,
    highlightedMentionIndex,
    updateMentionMenuPlacement,
  ]);

  useEffect(() => {
    if (!isMentionMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (mentionContainerRef.current?.contains(event.target as Node)) return;
      clearMentionMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearMentionMenu, isMentionMenuOpen]);

  useEffect(() => {
    if (!isMentionMenuOpen) return;

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Keep mention menu visible near viewport edges in discussion textareas.
       Why: Dropdowns rendered only below the input could extend off-screen and become unusable near page bottom.
       How: Recompute placement/height on open and during scroll/resize, flipping the menu above when needed. */
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

  useEffect(() => {
    if (!isMentionMenuOpen) return;

    /* Fixed by Codex on 2026-02-25
       Who: Codex
       What: Synced highlighted mention option with list scroll position.
       Why: Arrow-key navigation could move the active option outside the visible list viewport.
       How: Scroll the focused option into view with nearest-block alignment whenever highlight index changes. */
    mentionOptionRefs.current[highlightedMentionIndex]?.scrollIntoView({
      block: 'nearest',
    });
  }, [highlightedMentionIndex, isMentionMenuOpen]);

  const contentField = register('content', {
    required: 'Content is required',
    minLength: { value: 3, message: 'Content must be at least 3 characters long' },
    maxLength: { value: 500, message: 'Content must not exceed 500 characters' },
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-2">
      <div className="relative" ref={mentionContainerRef}>
        {isMarkdownPreview && (
          <div className={cn('mb-4 rounded-md border border-common-contrast p-4')}>
            <RenderParsedHTML
              rawContent={contentValue}
              supportMarkdown={true}
              supportLatex={true}
            />
          </div>
        )}
        <div
          className={cn({
            'h-0 overflow-hidden opacity-0': isMarkdownPreview,
          })}
        >
          <textarea
            {...contentField}
            ref={(element) => {
              contentField.ref(element);
              mentionTextareaRef.current = element;
            }}
            placeholder={placeholder}
            className={cn(
              'block w-full rounded-md bg-common-background px-3 py-2 text-text-primary shadow-sm ring-1 ring-common-contrast res-text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-functional-green',
              {
                'border-functional-red': errors.content,
              }
            )}
            rows={3}
            value={contentValue}
            onChange={(e) => {
              setValue('content', e.target.value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
              onChange?.(e);
              updateMentionContext(e.target.value);
            }}
            onKeyDown={(e) => {
              if (!isMentionMenuOpen || !activeMention || filteredMentionCandidates.length === 0) {
                return;
              }

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedMentionIndex(
                  (prevIndex) => (prevIndex + 1) % filteredMentionCandidates.length
                );
                return;
              }

              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedMentionIndex(
                  (prevIndex) =>
                    (prevIndex - 1 + filteredMentionCandidates.length) %
                    filteredMentionCandidates.length
                );
                return;
              }

              if ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                insertMention(filteredMentionCandidates[highlightedMentionIndex]);
                return;
              }

              if (e.key === 'Escape') {
                e.preventDefault();
                clearMentionMenu();
              }
            }}
            onKeyUp={(e) => {
              if (
                e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'Enter' ||
                e.key === 'Tab' ||
                e.key === 'Escape'
              ) {
                return;
              }
              updateMentionContext();
            }}
            onClick={() => {
              updateMentionContext();
            }}
          />
        </div>
        {isMentionMenuOpen && filteredMentionCandidates.length > 0 && !isMarkdownPreview && (
          <div
            className={cn(
              'absolute inset-x-0 z-20 rounded-md border border-common-contrast bg-common-cardBackground p-1 shadow-lg',
              mentionMenuPlacement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
            )}
          >
            {/* Fixed by Codex on 2026-02-25
                Who: Codex
                What: Added keyboard-accessible mention candidate menu for discussion comments.
                Why: Users need fast `@member` selection without memorizing exact usernames.
                How: Render filtered candidates beneath the textarea and support arrow/enter/tab selection. */}
            <div className="mb-1 px-2 text-xxs text-text-tertiary">Mention a community member</div>
            <div className="overflow-y-auto" style={{ maxHeight: `${mentionMenuMaxHeight}px` }}>
              {filteredMentionCandidates.map((candidate, index) => (
                <button
                  key={candidate}
                  type="button"
                  ref={(element) => {
                    mentionOptionRefs.current[index] = element;
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(candidate);
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
        {errors.content && (
          <p className="mt-1 text-sm text-functional-red">{errors.content.message}</p>
        )}
      </div>
      <div className="flex w-full justify-between">
        {isReview && !isAuthor && !isReply && (
          <>
            {isRatingsLoading ? (
              <Skeleton className="p-0">
                <BlockSkeleton className="h-8 w-24" />
              </Skeleton>
            ) : (
              <Controller
                name="rating"
                control={control}
                // rules={{
                //   validate: (value) => ((value ?? 0) > 0 ? true : 'A valid rating must be given'),
                // }}
                render={({ field }) => (
                  <div className="flex flex-col items-start">
                    <div className="mb-2 flex items-center gap-1">
                      <span className="text-sm font-bold text-text-tertiary">
                        {initialRating && initialRating > 0 ? 'Update' : 'Add'} Ratings:
                      </span>
                      <CustomTooltip info={'Add your ratings to this review'} />
                    </div>
                    <Ratings
                      rating={field.value || 0}
                      onRatingChange={(newRating) => setValue('rating', newRating)}
                      size={14}
                      readonly={false}
                      variant="yellow"
                    />
                    {errors.rating && (
                      <p className="mt-1 text-sm text-functional-red">{errors.rating.message}</p>
                    )}
                    {isRatingsError && (
                      <p className="mt-1 text-sm text-functional-red">Error fetching the ratings</p>
                    )}
                  </div>
                )}
              />
            )}
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => {
              setIsMarkdownPreview(!isMarkdownPreview);
            }}
            className="p-2 text-text-tertiary hover:bg-common-background hover:text-text-secondary"
            variant={'outline'}
            type="button"
            tooltipData="Toggle markdown preview"
            withTooltip
          >
            {isMarkdownPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            type="submit"
            variant={'blue'}
            className={'p-2'}
            loading={isPending}
            showLoadingSpinner
          >
            <ButtonIcon>
              <Send size={14} />
            </ButtonIcon>
            <ButtonTitle>{buttonText}</ButtonTitle>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;
