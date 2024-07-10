import React from 'react';

import { Send } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';

interface CommentInputProps {
  onSubmit: (content: string) => void;
  placeholder: string;
  buttonText: string;
  initialContent?: string;
}

interface FormInputs {
  content: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder,
  buttonText,
  initialContent = '',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: { content: initialContent },
  });

  const onSubmitForm: SubmitHandler<FormInputs> = (data) => {
    onSubmit(data.content);
    reset({ content: '' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="mb-4 mt-2">
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
