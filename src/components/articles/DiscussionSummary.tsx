'use client';

import React, { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  articlesDiscussionApiGetDiscussionSummary,
  getArticlesDiscussionApiGetDiscussionSummaryQueryKey,
  useArticlesDiscussionApiCreateDiscussionSummary,
  useArticlesDiscussionApiDeleteDiscussionSummary,
  useArticlesDiscussionApiUpdateDiscussionSummary,
} from '@/api/discussions/discussions';
import { DiscussionSummaryOut } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import { Button, ButtonTitle } from '@/components/ui/button';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { useSubmitOnCtrlEnter } from '@/hooks/useSubmitOnCtrlEnter';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

dayjs.extend(relativeTime);

// NOTE(bsureshkrishna, 2026-02-07): Discussion summary feature added after baseline 5271498
// so admins can curate a collapsible summary per community article.
interface DiscussionSummaryProps {
  communityArticleId: number;
  isAdmin: boolean;
}

interface FormValues {
  content: string;
}

const DiscussionSummary: React.FC<DiscussionSummaryProps> = ({ communityArticleId, isAdmin }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const summaryPanelId = 'discussion-summary-panel';

  // Use custom query that treats 404 as "no summary" (null) instead of error
  // This allows the "no summary" state to be cached properly
  const { data: summary, isPending } = useQuery<DiscussionSummaryOut | null>({
    queryKey: getArticlesDiscussionApiGetDiscussionSummaryQueryKey(communityArticleId),
    queryFn: async () => {
      try {
        const response = await articlesDiscussionApiGetDiscussionSummary(communityArticleId, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
      } catch (error: unknown) {
        // Treat 404 as "no summary exists" - return null as valid data
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          return null;
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: !!accessToken && !!communityArticleId,
    staleTime: FIFTEEN_MINUTES_IN_MS,
    gcTime: FIFTEEN_MINUTES_IN_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const hasSummary = !!summary?.content;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      content: '',
    },
  });

  // Create mutation
  const { mutate: createSummary, isPending: isCreating } =
    useArticlesDiscussionApiCreateDiscussionSummary({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: () => {
          toast.success('Discussion summary created successfully');
          setIsEditing(false);
          reset();
          queryClient.invalidateQueries({
            queryKey: getArticlesDiscussionApiGetDiscussionSummaryQueryKey(communityArticleId),
          });
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  // Update mutation
  const { mutate: updateSummary, isPending: isUpdating } =
    useArticlesDiscussionApiUpdateDiscussionSummary({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: () => {
          toast.success('Discussion summary updated successfully');
          setIsEditing(false);
          reset();
          queryClient.invalidateQueries({
            queryKey: getArticlesDiscussionApiGetDiscussionSummaryQueryKey(communityArticleId),
          });
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Enable Ctrl/Cmd+Enter to submit discussion summary edits.
     Why: Keep keyboard submit behavior consistent across discussion inputs.
     How: Attach the shared submit-on-ctrl-enter hook to the summary form ref. */
  useSubmitOnCtrlEnter(formRef, isCreating || isUpdating);

  // Delete mutation
  const { mutate: deleteSummary, isPending: isDeleting } =
    useArticlesDiscussionApiDeleteDiscussionSummary({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      mutation: {
        onSuccess: () => {
          toast.success('Discussion summary deleted successfully');
          // Remove the cached data immediately so UI updates
          queryClient.removeQueries({
            queryKey: getArticlesDiscussionApiGetDiscussionSummaryQueryKey(communityArticleId),
          });
        },
        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  const handleEdit = () => {
    if (summary?.content) {
      setValue('content', summary.content);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this discussion summary?')) {
      deleteSummary({ communityArticleId });
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (formData) => {
    if (hasSummary) {
      updateSummary({ communityArticleId, data: { content: formData.content } });
    } else {
      createSummary({ communityArticleId, data: { content: formData.content } });
    }
  };

  // Loading state
  if (isPending) {
    return (
      <div className="mb-4 animate-pulse">
        <div className="mb-2 h-5 w-40 rounded bg-common-minimal" />
        <div className="h-16 rounded bg-common-minimal" />
      </div>
    );
  }

  // No summary and not admin - don't render anything at all
  if (!hasSummary && !isAdmin) {
    return null;
  }

  // Has summary - show it with edit/delete buttons for admin
  if (hasSummary) {
    return (
      <div className="mb-4 border-b border-common-minimal pb-4">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-semibold text-text-primary hover:text-text-secondary"
            aria-expanded={isExpanded}
            aria-controls={summaryPanelId}
          >
            Discussions Summary
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-200', isExpanded && '-rotate-180')}
            />
          </button>
          {isAdmin && !isEditing && isExpanded && (
            <div className="flex items-center gap-1">
              {/* Fixed by Codex on 2026-02-15
                  Who: Codex
                  What: Add ARIA labels to icon-only admin actions.
                  Why: Icon buttons without labels are not announced to screen readers.
                  How: Provide aria-labels and explicit button types for edit/delete. */}
              <button
                type="button"
                onClick={handleEdit}
                className="rounded p-1.5 text-text-tertiary hover:bg-common-minimal hover:text-text-secondary"
                title="Edit summary"
                aria-label="Edit discussion summary"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded p-1.5 text-text-tertiary hover:bg-functional-red/10 hover:text-functional-red disabled:opacity-50"
                title="Delete summary"
                aria-label="Delete discussion summary"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Collapsible content */}
        <div
          id={summaryPanelId}
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {/* Editing mode */}
          {isAdmin && isEditing ? (
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <FormInput<FormValues>
                label=""
                name="content"
                type="text"
                placeholder="Add summary for article discussions..."
                register={register}
                control={control}
                requiredMessage="Content is required"
                errors={errors}
                textArea={true}
                supportMarkdown={true}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel} size="sm">
                  <ButtonTitle>Cancel</ButtonTitle>
                </Button>
                <Button
                  type="submit"
                  variant="blue"
                  loading={isCreating || isUpdating}
                  showLoadingSpinner
                  size="sm"
                >
                  <ButtonTitle>Update</ButtonTitle>
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Fixed by Codex on 2026-02-20
                  Who: Codex
                  What: Applied soft-wrap overflow handling to discussion summary content.
                  Why: Long unbroken tokens in summary markdown could overflow card boundaries in full-page and split views.
                  How: Use local break-word wrapping with overflow-wrap:anywhere on the summary container and parsed content root. */}
              <div className="w-full min-w-0 overflow-hidden break-words text-sm text-text-secondary [overflow-wrap:anywhere]">
                <RenderParsedHTML
                  rawContent={summary.content}
                  supportMarkdown={true}
                  supportLatex={false}
                  containerClassName="mb-0"
                  contentClassName="break-words [overflow-wrap:anywhere]"
                />
              </div>
              {summary.updated_at && (
                <div className="mt-2 text-xxs text-text-tertiary">
                  Last updated {dayjs(summary.updated_at).fromNow()}
                  {summary.last_updated_by && ` by ${summary.last_updated_by.username}`}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // No summary but admin - show header with editor
  if (isAdmin) {
    return (
      <div className="mb-4 border-b border-common-minimal pb-4">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-semibold text-text-primary hover:text-text-secondary"
            aria-expanded={isExpanded}
            aria-controls={summaryPanelId}
          >
            Discussions Summary
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-200', isExpanded && '-rotate-180')}
            />
          </button>
        </div>
        <div
          id={summaryPanelId}
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <FormInput<FormValues>
              label=""
              name="content"
              type="text"
              placeholder="Add summary for article discussions..."
              register={register}
              control={control}
              requiredMessage="Content is required"
              errors={errors}
              textArea={true}
              supportMarkdown={true}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="blue"
                loading={isCreating}
                showLoadingSpinner
                size="sm"
              >
                <ButtonTitle>Save</ButtonTitle>
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default DiscussionSummary;
