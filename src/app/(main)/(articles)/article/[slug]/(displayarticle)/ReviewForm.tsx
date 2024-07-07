// pages/index.tsx
import React, { useEffect } from 'react';

import clsx from 'clsx';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import {
  useArticlesApiReviewCreateReview,
  useArticlesApiReviewDeleteReview,
  useArticlesApiReviewUpdateReview,
} from '@/api/reviews/reviews';
import FormInput from '@/components/FormInput';
import LabeledTooltip from '@/components/LabeledToolTip';
import CommentEditor from '@/components/richtexteditor/CommentEditor';
import { Ratings } from '@/components/ui/ratings';
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
  });
  // Create a Review
  const {
    isSuccess,
    isPending,
    mutate: createReview,
    error,
  } = useArticlesApiReviewCreateReview({
    request: axiosConfig,
  });

  // Update a Review
  const {
    isSuccess: editSuccess,
    isPending: editPending,
    error: editError,
    mutate: editReview,
  } = useArticlesApiReviewUpdateReview({ request: axiosConfig });

  // Delete a Review
  const {
    isSuccess: deleteSuccess,
    isPending: deletePending,
    error: deleteError,
    mutate: deleteReview,
  } = useArticlesApiReviewDeleteReview({ request: axiosConfig });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const reviewData = {
      ...data,
      article_id: articleId,
    };

    if (action === 'edit' && reviewId) {
      editReview({ data: reviewData, reviewId: reviewId });
    } else if (action === 'delete' && reviewId) {
      deleteReview({ reviewId: reviewId });
    } else {
      createReview({ articleId, data: reviewData });
    }
  };

  // Toast Notifications for UI feedback
  useEffect(() => {
    if (isSuccess) {
      reset();
      refetch && refetch();
      toast.success('Review submitted successfully');
    }
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error, reset, isSuccess, refetch]);

  useEffect(() => {
    if (editSuccess) {
      toast.success('Review updated successfully');
      refetch && refetch();
      setEdit && setEdit(false);
    }
    if (editError) {
      toast.error(`${editError.response?.data.message}`);
    }
  }, [editError, editSuccess, setEdit, refetch]);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success('Review deleted successfully');
      refetch && refetch();
      setEdit && setEdit(false);
    }
    if (deleteError) {
      toast.error(`${deleteError.response?.data.message}`);
    }
  }, [deleteError, deleteSuccess, setEdit, refetch]);

  return (
    <>
      {editPending ? (
        <ReviewCardSkeleton />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-4 flex flex-col gap-4 rounded-lg border p-4 shadow-sm"
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
                    <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
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
                  'self-end rounded bg-black px-4 py-2 text-sm text-white',
                  editPending && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => setAction('edit')}
              >
                {editPending ? 'Updating...' : 'Update'}
              </button>
              <button
                type="submit"
                className={clsx(
                  'self-end rounded bg-red-500 px-4 py-2 text-sm text-white',
                  deletePending && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => setAction('delete')}
              >
                {deletePending ? 'Deleting...' : 'Delete'}
              </button>
              {/* Cancel Button */}
              <button
                type="button"
                className="self-end rounded bg-gray-500 px-4 py-2 text-sm text-white"
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
                  'self-start rounded bg-black px-4 py-2 text-sm text-white',
                  isPending && 'cursor-not-allowed opacity-50'
                )}
                onClick={() => setAction('create')}
              >
                {isPending ? 'Submitting...' : 'Submit Review'}
              </button>
              <span className="text-sm text-gray-500">
                By clicking Submit Review, you agree to our{' '}
                <a href="#" className="text-blue-500">
                  terms of service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-500">
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
