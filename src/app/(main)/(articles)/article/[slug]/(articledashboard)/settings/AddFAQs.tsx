import React, { useEffect } from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesApiUpdateArticle } from '@/api/articles/articles';
import { ArticleUpdateSchema } from '@/api/schemas';
import { Option } from '@/components/ui/multiple-selector';
import { useAuthStore } from '@/stores/authStore';

interface FAQ {
  question: string;
  answer: string;
}

interface AddFAQsProps {
  articleId: number;
  title: string;
  abstract: string;
  authors: Option[];
  keywords: Option[];
  submissionType: 'Public' | 'Private';
  faqs: FAQ[];
}

const AddFAQs: React.FC<AddFAQsProps> = (props) => {
  const { articleId, title, abstract, authors, keywords: _keywords, submissionType, faqs } = props;
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { control, handleSubmit } = useForm<{ faqs: FAQ[] }>({
    defaultValues: {
      faqs: faqs,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faqs',
  });

  const { mutate, error, isPending, isSuccess } = useArticlesApiUpdateArticle({
    request: axiosConfig,
  });

  const onSubmit = (data: FAQ[]) => {
    const dataToSend: ArticleUpdateSchema = {
      payload: {
        title: title,
        abstract: abstract,
        authors: authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        // keywords: keywords.map((keyword) => keyword.value),
        submission_type: submissionType,
        faqs: data,
      },
    };
    mutate({ articleId, data: { details: dataToSend } });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('FAQs updated successfully');
    }
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [isSuccess, error]);

  /* Fixed by Codex on 2026-02-15
     Problem: FAQ editor used fixed grays/blue/green/red utilities that ignored skins.
     Solution: Replace hard-coded colors with semantic token classes for text, borders, and actions.
     Result: FAQ form styling now adapts to the active skin. */
  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data.faqs))} className="my-4 space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg bg-common-cardBackground p-4 shadow-md">
          <div className="mb-4 flex items-center space-x-2">
            <label
              htmlFor={`faqs.${index}.question`}
              className="block font-medium text-text-secondary res-text-xs"
            >
              Question {index + 1}
            </label>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-functional-red hover:text-functional-redContrast"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <Controller
            control={control}
            name={`faqs.${index}.question`}
            render={({ field }) => (
              <input
                {...field}
                id={`faqs.${index}.question`}
                placeholder="Enter question"
                className="mt-1 block w-full rounded-md border border-common-contrast bg-common-cardBackground p-2 text-text-primary shadow-sm res-text-xs focus:border-functional-blue focus:ring-functional-blue"
              />
            )}
          />
          <label
            htmlFor={`faqs.${index}.answer`}
            className="mt-4 block font-medium text-text-secondary res-text-xs"
          >
            Answer
          </label>
          <Controller
            control={control}
            name={`faqs.${index}.answer`}
            render={({ field }) => (
              <textarea
                {...field}
                id={`faqs.${index}.answer`}
                placeholder="Enter answer"
                className="mt-1 block w-full rounded-md border border-common-contrast bg-common-cardBackground p-2 text-text-primary shadow-sm res-text-xs focus:border-functional-blue focus:ring-functional-blue"
              />
            )}
          />
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => append({ question: '', answer: '' })}
          className="flex items-center text-functional-green res-text-sm hover:text-functional-greenContrast"
        >
          <Plus className="mr-1 h-5 w-5" /> Add FAQ
        </button>
        <button
          type="submit"
          className="rounded-md bg-functional-blue px-4 py-2 text-primary-foreground res-text-sm hover:bg-functional-blueContrast"
        >
          {isPending ? 'Updating...' : 'Update FAQs'}
        </button>
      </div>
    </form>
  );
};

export default AddFAQs;
