'use client';

import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  getArticlesDiscussionApiGetDiscussionSummaryQueryKey,
  useArticlesDiscussionApiCreateDiscussionSummary,
  useArticlesDiscussionApiDeleteDiscussionSummary,
  useArticlesDiscussionApiGetDiscussionSummary,
  useArticlesDiscussionApiUpdateDiscussionSummary,
} from '@/api/discussions/discussions';
import FormInput from '@/components/common/FormInput';
import RenderParsedHTML from '@/components/common/RenderParsedHTML';
import { Button, ButtonTitle } from '@/components/ui/button';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

dayjs.extend(relativeTime);

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

  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isPending, error } = useArticlesDiscussionApiGetDiscussionSummary(
    communityArticleId,
    {
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
      query: {
        enabled: !!accessToken && !!communityArticleId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
        refetchOnWindowFocus: false,
        // Don't retry on 404 - it's expected when no summary exists
        retry: (failureCount, error) => {
          if (error?.response?.status === 404) return false;
          return failureCount < 3;
        },
      },
    }
  );

  const summary = data?.data;
  const hasSummary = !!summary?.content;
  const isNotFoundError = error?.response?.status === 404;

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

  // Loading state - only show on initial load
  const isInitialLoading = isPending && !error;
  if (isInitialLoading) {
    return (
      <div className="mb-4 animate-pulse">
        <div className="mb-2 h-5 w-40 rounded bg-common-minimal" />
        <div className="h-16 rounded bg-common-minimal" />
      </div>
    );
  }

  // Error state (non-404) - silently fail
  if (error && !isNotFoundError) {
    return null;
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
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-semibold text-text-primary hover:text-text-secondary"
          >
            Discussions Summary
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-200', isExpanded && '-rotate-180')}
            />
          </button>
          {isAdmin && !isEditing && isExpanded && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleEdit}
                className="rounded p-1.5 text-text-tertiary hover:bg-common-minimal hover:text-text-secondary"
                title="Edit summary"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded p-1.5 text-text-tertiary hover:bg-functional-red/10 hover:text-functional-red disabled:opacity-50"
                title="Delete summary"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Collapsible content */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {/* Editing mode */}
          {isAdmin && isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
              <div className="text-sm text-text-secondary">
                <RenderParsedHTML
                  rawContent={summary.content}
                  supportMarkdown={true}
                  supportLatex={false}
                  containerClassName="mb-0"
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
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-semibold text-text-primary hover:text-text-secondary"
          >
            Discussions Summary
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-200', isExpanded && '-rotate-180')}
            />
          </button>
        </div>
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
