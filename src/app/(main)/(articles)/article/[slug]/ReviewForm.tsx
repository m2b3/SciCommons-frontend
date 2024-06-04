// pages/index.tsx
import React, { useEffect } from 'react';

import clsx from 'clsx';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useArticlesApiCreateReview } from '@/api/articles/articles';
import FormInput from '@/components/FormInput';
import LabeledTooltip from '@/components/LabeledToolTip';
import CommentEditor from '@/components/richtexteditor/CommentEditor';
import { Ratings } from '@/components/ui/ratings';
import { useAuthStore } from '@/stores/authStore';

interface FormValues {
  subject: string;
  content: string;
  rating: number;
}

interface ReviewFormProps {
  articleId: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ articleId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    control,
    handleSubmit,
    setValue,
    register,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      subject: '',
      content: '',
      rating: 0,
    },
  });
  const {
    isSuccess,
    isPending,
    mutate: createReview,
    error,
  } = useArticlesApiCreateReview({
    axios: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  useEffect(() => {
    if (isSuccess) {
      reset();
      toast.success('Review submitted successfully');
    }
  }, [isSuccess, reset]);

  useEffect(() => {
    if (error) {
      console.error('Error submitting article:', error);
      toast.error(
        `Error: ${(error?.response?.data as { detail?: string }) || 'An error occurred'}`
      );
    }
  }, [error]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const reviewData = {
      ...data,
      article_id: articleId,
    };
    createReview({ data: reviewData });
  };

  return (
    <div className="mb-4 rounded-lg border p-4 shadow-sm">
      <div className="mb-4">
        <nav className="flex space-x-4 border-b">
          <button className="border-b-2 border-blue-500 px-4 py-2 font-semibold text-gray-600">
            Reviews
          </button>
          <button className="px-4 py-2 font-semibold text-gray-600">Discussions</button>
          <button className="px-4 py-2 font-semibold text-gray-600">FAQ</button>
        </nav>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className={clsx(
              'self-start rounded bg-black px-4 py-2 text-sm text-white',
              isPending && 'cursor-not-allowed opacity-50'
            )}
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
      </form>
    </div>
  );
};

export default ReviewForm;
