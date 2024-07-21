import React from 'react';

import { Send } from 'lucide-react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { Ratings } from '@/components/ui/ratings';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  onSubmit: (content: string, rating?: number) => void;
  placeholder: string;
  buttonText: string;
  initialContent?: string;
  // Review specific props
  initialRating?: number;
  isReview?: boolean;
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
  initialRating = 0,
  isReview = false,
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

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="mb-4 mt-2 flex flex-col gap-2">
      <div>
        {isReview && (
          <Controller
            name="rating"
            control={control}
            rules={{
              validate: (value) => ((value ?? 0) > 0 ? true : 'A valid rating must be given'),
            }}
            render={({ field }) => (
              <>
                <Ratings
                  rating={field.value || 0}
                  onRatingChange={(newRating) => setValue('rating', newRating)}
                  size={14}
                  readonly={false}
                />
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
                )}
              </>
            )}
          />
        )}
      </div>
      <div>
        <textarea
          {...register('content', {
            required: 'Content is required',
            minLength: { value: 3, message: 'Content must be at least 3 characters long' },
            maxLength: { value: 500, message: 'Content must not exceed 500 characters' },
          })}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-common-lg bg-white px-3 py-2 text-black ring-1 ring-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 dark:bg-gray-950 dark:text-white dark:ring-gray-700 focus:dark:ring-green-500',
            {
              'border-red-500': errors.content,
            }
          )}
          rows={3}
        />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Send size={16} className="mr-2" />
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default CommentInput;
