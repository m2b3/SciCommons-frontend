import React from 'react';

import clsx from 'clsx';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  useArticlesReviewApiCreateReview,
  useArticlesReviewApiDeleteReview,
  useArticlesReviewApiUpdateReview,
} from '@/api/reviews/reviews';
import FormInput from '@/components/common/FormInput';
import LabeledTooltip from '@/components/common/LabeledToolTip';
import CommentEditor from '@/components/richtexteditor/CommentEditor';
import { Ratings } from '@/components/ui/ratings';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

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
}

type ActionType = 'create' | 'edit' | 'delete';

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
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const [action, setAction] = React.useState<ActionType>('create');

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

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const reviewData = {
      ...data,
      article_id: articleId,
    };

    if (action === 'edit' && reviewId) {
      editReview(
        { data: reviewData, reviewId: reviewId },
        {
          onSuccess: () => {
            toast.success('Review updated successfully');
            refetch && refetch();
            setEdit && setEdit(false);
          },
          onError: (error) => {
            showErrorToast(error);
          },
        }
      );
    } else if (action === 'delete' && reviewId) {
      deleteReview(
        { reviewId: reviewId },
        {
          onSuccess: () => {
            toast.success('Review deleted successfully');
            refetch && refetch();
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
            refetch && refetch();
            toast.success('Review submitted successfully');
          },
          onError: (error) => {
            reset();
            showErrorToast(error);
          },
        }
      );
    }
  };

  return (
    <>
      {editPending ? (
        <ReviewCardSkeleton />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-4 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white-secondary p-4 shadow-sm res-text-sm"
        >
          <div className="">
            <LabeledTooltip label="Rate this article" info="Rate this article" />
            <Controller
              name="rating"
              control={control}
              rules={{ validate: (value) => (value > 0 ? true : 'A valid rating must be given') }}
              render={({ field }) => (
                <>
                  <Ratings
                    rating={field.value}
                    onRatingChange={(newRating) => setValue('rating', newRating)}
                    readonly={false}
                  />
                  {errors.rating && (
                    <p className="mt-1 text-red-500 res-text-xs">{errors.rating.message}</p>
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
          />
          <CommentEditor control={control} name="content" />
          {edit ? (
            <div className="ml-auto flex gap-2">
              <button
                type="submit"
                className={clsx(
                  'self-end rounded bg-blue-600 px-4 py-2 text-white res-text-xs',
                  editPending && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => setAction('edit')}
              >
                {editPending ? 'Updating...' : 'Update'}
              </button>
              <button
                type="submit"
                className={clsx(
                  'self-end rounded bg-red-600 px-4 py-2 text-white res-text-xs',
                  deletePending && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => setAction('delete')}
              >
                {deletePending ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="self-end rounded bg-gray-500 px-4 py-2 text-white res-text-xs"
                onClick={() => setEdit && setEdit(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className={clsx(
                  'self-start rounded bg-blue-600 px-4 py-2 text-white res-text-xs',
                  isPending && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => setAction('create')}
              >
                {isPending ? 'Submitting...' : 'Submit Review'}
              </button>
              <span className="text-gray-600 res-text-xs">
                By clicking Submit Review, you agree to our{' '}
                <a href="#" className="text-blue-600">
                  terms of service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600">
                  privacy policy
                </a>
                .
              </span>
            </div>
          )}
        </form>
      )}
    </>
  );
};

export default ReviewForm;
