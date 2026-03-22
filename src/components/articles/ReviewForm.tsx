import React from 'react';

import { MDXEditorMethods } from '@mdxeditor/editor';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useArticlesReviewApiCreateReview,
  useArticlesReviewApiDeleteReview,
  useArticlesReviewApiUpdateReview,
} from '@/api/reviews/reviews';
import FormInput from '@/components/common/FormInput';
import LabeledTooltip from '@/components/common/LabeledToolTip';
import { ForwardRefEditor } from '@/components/common/MarkdownEditor/ForwardRefEditor';
import { Ratings } from '@/components/ui/ratings';
import { useSubmitOnCtrlEnter } from '@/hooks/useSubmitOnCtrlEnter';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import { Button, ButtonTitle } from '../ui/button';
import { ReviewCardSkeleton } from './ReviewCard';

interface FormValues {
  subject: string;
  content: string;
  rating: number;
}

interface ReviewFormProps {
  articleId: number;
  title?: string;
  content?: string;
  rating?: number;
  reviewId?: number;
  edit?: boolean;
  setEdit?: (edit: boolean) => void;
  refetch?: () => void;
  communityId?: number | null;
  is_submitter?: boolean; // Todo: Remove this after testing
  onSubmitSuccess?: () => void;
}

type ActionType = 'create' | 'edit';

const ReviewForm: React.FC<ReviewFormProps> = ({
  articleId,
  edit,
  setEdit,
  title,
  content,
  rating,
  reviewId,
  refetch,
  communityId,
  is_submitter = false,
  onSubmitSuccess,
}) => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [action, setAction] = React.useState<ActionType>('create');
  const reviewDeleteDialogTitleId = React.useId();
  const reviewDeleteDialogDescriptionId = React.useId();
  const reviewEditorRef = React.useRef<MDXEditorMethods>(null);
  const markdownRef = React.useRef<string>(content || '');
  const [markdown, setMarkdown] = React.useState<string>(content || '');

  const {
    control,
    handleSubmit,
    setValue,
    register,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      subject: title || '',
      content: content || '',
      rating: rating || 0,
    },
    mode: 'onChange',
  });

  const { isPending, mutate: createReview } = useArticlesReviewApiCreateReview({
    request: axiosConfig,
  });

  const { isPending: editPending, mutate: editReview } = useArticlesReviewApiUpdateReview({
    request: axiosConfig,
  });

  const { isPending: deletePending, mutate: deleteReview } = useArticlesReviewApiDeleteReview({
    request: axiosConfig,
  });

  const formRef = React.useRef<HTMLFormElement>(null);
  useSubmitOnCtrlEnter(formRef, isPending || editPending || deletePending);

  /* Fixed by Codex on 2026-02-16
     Who: Codex
     What: Added explicit invalidation for article review-list queries after review mutations.
     Why: Refetch callbacks alone can miss other subscribed instances or stale keys in split-view/sidebar layouts.
     How: Invalidate all queries under `/api/articles/{articleId}/reviews/` prefix post-mutation success. */
  const invalidateReviewQueries = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/reviews/`] });
  }, [queryClient, articleId]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Added explicit review-content validation before API submission.
       Why: Empty markdown payloads could slip through and render as placeholder-like "..." text.
       How: Normalize and trim markdown content from editor ref, then block submission if empty. */
    const normalizedMarkdown = markdownRef.current.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    if (!normalizedMarkdown) {
      toast.error('Review content is required');
      return;
    }

    const reviewData = {
      ...data,
      article_id: articleId,
      content: normalizedMarkdown,
    };

    if (action === 'edit' && reviewId) {
      editReview(
        { data: reviewData, reviewId: reviewId },
        {
          onSuccess: () => {
            toast.success('Review updated successfully');
            refetch && refetch();
            invalidateReviewQueries();
            setEdit && setEdit(false);
          },
          onError: (error) => {
            showErrorToast(error);
          },
        }
      );
    } else {
      createReview(
        { articleId, data: reviewData, params: { community_id: communityId } },
        {
          onSuccess: () => {
            reset();
            markdownRef.current = '';
            setMarkdown('');
            reviewEditorRef.current?.setMarkdown?.('');
            refetch && refetch();
            invalidateReviewQueries();
            toast.success('Review submitted successfully');
            onSubmitSuccess && onSubmitSuccess();
          },
          onError: (error) => {
            reset();
            showErrorToast(error);
          },
        }
      );
    }
  };

  const handleDeleteReview = () => {
    if (!reviewId) return;

    deleteReview(
      { reviewId },
      {
        onSuccess: () => {
          toast.success('Review deleted successfully');
          refetch?.();
          invalidateReviewQueries();
          setEdit?.(false);
        },
        onError: (error) => {
          showErrorToast(error);
        },
      }
    );

    setShowDeleteConfirm(false);
  };

  return (
    <>
      {editPending ? (
        <ReviewCardSkeleton />
      ) : (
        <>
          <form
            id="review-form"
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="mb-4 flex flex-col gap-4 res-text-sm"
          >
            <div className="">
              <LabeledTooltip label="Rate this article" info="Rate this article" />
              <Controller
                name="rating"
                control={control}
                // rules={{ validate: (value) => (value > 0 ? true : 'A valid rating must be given') }}
                rules={{
                  validate: (value) => {
                    if (!is_submitter) {
                      return value > 0 ? true : 'A valid rating must be given';
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <>
                    <Ratings
                      rating={field.value}
                      onRatingChange={(newRating) => setValue('rating', newRating)}
                      readonly={false}
                    />
                    {errors.rating && (
                      <p className="mt-1 text-functional-red res-text-xs">
                        {errors.rating.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <FormInput<FormValues>
              name="subject"
              label="Subject"
              type="text"
              placeholder="Enter the title of your review"
              register={register}
              requiredMessage="Subject is required"
              minLengthValue={10}
              minLengthMessage="Title must be at least 10 characters"
              maxLengthValue={100}
              maxLengthMessage="Title must not exceed 100 characters"
              info="Please provide a clear and concise title for your article."
              errors={errors}
              labelClassName="text-text-secondary"
              inputClassName="bg-common-cardBackground text-text-primary ring-common-contrast"
            />
            {/* <Controller
              name="content"
              control={control}
              rules={{
                required: 'Content is required',
                minLength: { value: 1, message: 'Add a valid review content' },
              }}
              render={({ field }) => (
                <div>
                  <ForwardRefEditor
                    markdown={field.value}
                    ref={reviewEditorRef}
                    onChange={(markdown) => {
                      // field.onChange(markdown);
                      // setMarkdown(markdown);
                    }}
                  />
                  {errors.content && (
                    <p className="mt-2 text-sm text-functional-red">{errors.content.message}</p>
                  )}
                </div>
              )}
            /> */}
            <div>
              <ForwardRefEditor
                markdown={markdown}
                ref={reviewEditorRef}
                onChange={(newMarkdown) => {
                  markdownRef.current = newMarkdown;
                }}
              />
              {errors.content && (
                <p className="mt-2 text-sm text-functional-red">{errors.content.message}</p>
              )}
            </div>
            {edit ? (
              <div className="ml-auto flex gap-2">
                <Button
                  variant={'blue'}
                  onClick={() => setAction('edit')}
                  loading={editPending}
                  type="submit"
                >
                  <ButtonTitle>{editPending ? 'Updating...' : 'Update'}</ButtonTitle>
                </Button>
                <Button
                  variant={'danger'}
                  onClick={() => setShowDeleteConfirm(true)}
                  loading={deletePending}
                  type="button"
                >
                  <ButtonTitle>{deletePending ? 'Deleting...' : 'Delete'}</ButtonTitle>
                </Button>
                <Button variant={'gray'} onClick={() => setEdit && setEdit(false)} type="button">
                  <ButtonTitle>Cancel</ButtonTitle>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant={'blue'}
                  className="p-2"
                  loading={isPending}
                  type="submit"
                  onClick={() => setAction('create')}
                >
                  <ButtonTitle>{isPending ? 'Submitting...' : 'Submit Review'}</ButtonTitle>
                </Button>
                {/* <span className="text-text-tertiary res-text-xs">
                By clicking Submit Review, you agree to our{' '}
                <a href="#" className="text-functional-blue hover:underline">
                  terms of service
                </a>{' '}
                and{' '}
                <a href="#" className="text-functional-blue hover:underline">
                  privacy policy
                </a>
                .
              </span> */}
              </div>
            )}
          </form>
          {/* Fixed by Codex on 2026-02-24
              Who: Codex
              What: Hardened review-delete confirmation modal accessibility and layering.
              Why: z-50 can render behind fixed mobile nav (z-[1000]), and dialog semantics were missing.
              How: Raised overlay z-index and added role/aria labelling for assistive technology. */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={reviewDeleteDialogTitleId}
                aria-describedby={reviewDeleteDialogDescriptionId}
                className="w-[320px] rounded-xl bg-common-cardBackground p-6"
              >
                <p id={reviewDeleteDialogTitleId} className="mb-2 text-lg font-semibold">
                  Delete this review?
                </p>
                <p
                  id={reviewDeleteDialogDescriptionId}
                  className="mb-4 text-sm text-text-secondary"
                >
                  This action cannot be undone.
                </p>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="gray"
                    size="sm"
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <ButtonTitle>Cancel</ButtonTitle>
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    loading={deletePending}
                    type="button"
                    onClick={handleDeleteReview}
                  >
                    <ButtonTitle>Delete</ButtonTitle>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ReviewForm;
