import React, { useEffect } from 'react';

import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesApiUpdateArticle } from '@/api/articles/articles';
import { ArticleUpdateSchema } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import ImageUpload from '@/components/common/ImageUpload';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { Option } from '@/components/ui/multiple-selector';
import { useAuthStore } from '@/stores/authStore';
import { FileObj } from '@/types';

interface FormValues {
  title: string;
  abstract: string;
  authors: Option[];
  keywords: Option[];
  submissionType: 'Public' | 'Private';
  articleImageFile: FileObj;
}

interface EditArticleDetailsProps {
  articleId: number;
  title: string;
  abstract: string;
  authors: Option[];
  keywords: Option[];
  submissionType: 'Public' | 'Private';
  defaultImageURL: string | null;
}

const EditArticleDetails: React.FC<EditArticleDetailsProps> = (props) => {
  const { title, abstract, authors, keywords, submissionType, defaultImageURL, articleId } = props;
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: title,
      abstract: abstract,
      authors: authors,
      keywords: keywords,
      submissionType: submissionType,
    },
  });

  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const {
    mutate,
    error: updateError,
    isPending: isUpdatePending,
    isSuccess,
  } = useArticlesApiUpdateArticle({ request: axiosConfig });

  const onSubmit = (formData: FormValues) => {
    const dataToSend: ArticleUpdateSchema = {
      payload: {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        keywords: formData.keywords.map((keyword) => keyword.value),
        submission_type: formData.submissionType,
      },
    };
    const image_file = formData.articleImageFile ? formData.articleImageFile.file : undefined;

    mutate({ articleId, data: { details: dataToSend, image_file } });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Article details updated successfully');
    }
    if (updateError) {
      toast.error(`${updateError.response?.data.message}`);
    }
  }, [updateError, isSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
      <Controller
        name="articleImageFile"
        control={control}
        render={({}) => (
          <ImageUpload
            control={control}
            name="articleImageFile"
            label="Article Image"
            info="Upload a profile image for your community"
            defaultImageURL={defaultImageURL || undefined}
          />
        )}
      />
      <FormInput<FormValues>
        label="Title"
        name="title"
        type="text"
        placeholder="Briefly describe your community"
        register={register}
        requiredMessage="Description is required"
        minLengthValue={10}
        minLengthMessage="Description must be at least 10 characters"
        info="Your community's name should be unique and descriptive."
        errors={errors}
      />
      <FormInput<FormValues>
        label="Abstract"
        name="abstract"
        type="text"
        textArea={true}
        placeholder="Briefly describe your community"
        register={register}
        requiredMessage="Description is required"
        minLengthValue={10}
        minLengthMessage="Description must be at least 10 characters"
        info="Your community's name should be unique and descriptive."
        errors={errors}
      />
      <Controller
        name="authors"
        control={control}
        rules={{ required: 'Authors are required' }}
        render={({ field: { onChange, value }, fieldState }) => (
          <MultiLabelSelector
            label="Authors"
            tooltipText="Help users find your community by adding tags."
            placeholder="Add Tags"
            creatable
            value={value}
            onChange={onChange}
            fieldState={fieldState}
          />
        )}
      />
      <Controller
        name="keywords"
        control={control}
        rules={{ required: 'Authors are required' }}
        render={({ field: { onChange, value }, fieldState }) => (
          <MultiLabelSelector
            label="Keywords"
            tooltipText="Help users find your community by adding tags."
            placeholder="Add Tags"
            creatable
            value={value}
            onChange={onChange}
            fieldState={fieldState}
          />
        )}
      />
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Submission Type
        </label>
        <Controller
          name="submissionType"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => onChange('Public')}
                className={`rounded-md px-4 py-2 ${
                  value === 'Public'
                    ? 'bg-gray-500 text-white dark:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => onChange('Private')}
                className={`rounded-md px-4 py-2 ${
                  value === 'Private'
                    ? 'bg-gray-500 text-white dark:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Private
              </button>
            </div>
          )}
        />
      </div>
      <button
        type="submit"
        className={clsx(
          'mx-auto max-w-md rounded-md bg-green-500 px-4 py-2 text-white dark:bg-green-600',
          {
            'cursor-not-allowed opacity-50': isUpdatePending,
          }
        )}
      >
        {isUpdatePending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};

export default EditArticleDetails;

export const EditArticleDetailsSkeleton = () => {
  return (
    <div className="dark:bg-gray-900">
      <div className="flex flex-col space-y-8">
        <div className="h-80 w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-32 w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};
