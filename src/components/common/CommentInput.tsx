import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Send } from 'lucide-react';
import { Ratings } from '@/components/ui/ratings';
import { cn } from '@/lib/utils'; // Adjust the import path as needed

interface CommentInputProps {
  onSubmit: (content: string, rating?: number) => void;
  placeholder: string;
  buttonText: string;
  initialContent?: string;
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
  const { register, handleSubmit, control, formState: { errors, isDirty, isValid } } = useForm<FormInputs>({
    defaultValues: {
      content: initialContent,
      rating: initialRating,
    },
    mode: 'onChange',
  });

  const onSubmitForm: SubmitHandler<FormInputs> = (data) => {
    onSubmit(data.content, data.rating);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="mb-4 mt-2 flex flex-col gap-2">
      {isReview && (
        <Controller
          name="rating"
          control={control}
          rules={{ required: 'A rating is required' }}
          render={({ field, fieldState }) => (
            <>
              <Ratings
                rating={field.value ?? 0}
                onRatingChange={field.onChange}
                size={14}
                readonly={false}
              />
              {fieldState.error && (
                <p className="mt-1 text-sm text-red-500">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      )}
      <textarea
        {...register('content', {
          required: 'Content is required',
          minLength: { value: 3, message: 'Content must be at least 3 characters long' },
          maxLength: { value: 500, message: 'Content must not exceed 500 characters' },
        })}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg bg-white px-3 py-2 text-black ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500',
          { 'border-red-500': errors.content }
        )}
        rows={3}
      />
      {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
      <button
        type="submit"
        disabled={!isDirty || !isValid}
        className={cn(
          'mt-2 inline-flex items-center justify-end rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
          isDirty && isValid ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-gray-500'
        )}
      >
        <Send size={16} className="mr-2" />
        {buttonText}
      </button>
    </form>
  );
};

export default CommentInput;
