import React, { useEffect } from 'react';

import { Send } from 'lucide-react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { Ratings } from '@/components/ui/ratings';
import { cn } from '@/lib/utils';

import { Button, ButtonIcon, ButtonTitle } from '../ui/button';
import CustomTooltip from './CustomTooltip';
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
}

interface FormInputs {
  content: string;
  rating?: number;
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
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: { content: initialContent, rating: initialRating },
  });

  const onSubmitForm: SubmitHandler<FormInputs> = (data) => {
    onSubmit(data.content, data.rating);
    reset({ content: '', rating: 0 });
  };

  useEffect(() => {
    if (initialRating !== undefined) {
      setValue('rating', initialRating);
    }
  }, [initialRating, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col gap-2">
      <div>
        <textarea
          {...register('content', {
            required: 'Content is required',
            minLength: { value: 3, message: 'Content must be at least 3 characters long' },
            maxLength: { value: 500, message: 'Content must not exceed 500 characters' },
          })}
          placeholder={placeholder}
          className={cn(
            'block w-full rounded-md bg-common-background px-3 py-2 text-text-primary shadow-sm ring-1 ring-common-contrast res-text-sm placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-functional-green',
            {
              'border-functional-red': errors.content,
            }
          )}
          rows={3}
        />
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
        <Button
          type="submit"
          variant={'blue'}
          className={'ml-auto'}
          loading={isPending}
          showLoadingSpinner
        >
          <ButtonIcon>
            <Send size={16} />
          </ButtonIcon>
          <ButtonTitle>{buttonText}</ButtonTitle>
        </Button>
      </div>
    </form>
  );
};

export default CommentInput;
