import React, { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesApiUpdateArticle } from '@/api/articles/articles';
import { ArticleUpdateSchema } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Option } from '@/components/ui/multiple-selector';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { FileObj } from '@/types';

interface FormValues {
  title: string;
  abstract: string;
  authors: Option[];
  // keywords: Option[];
  submissionType: 'Public' | 'Private';
  articleImageFile: FileObj;
}

interface EditArticleDetailsProps {
  articleId: number;
  title: string;
  abstract: string;
  authors: Option[];
  // keywords: Option[];
  submissionType: 'Public' | 'Private';
  defaultImageURL: string | null;
  isEditEnabled: boolean;
  setIsEditEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  articleSlug: string;
}

const EditArticleDetails: React.FC<EditArticleDetailsProps> = (props) => {
  const {
    title,
    abstract,
    authors,
    submissionType,
    defaultImageURL,
    articleId,
    isEditEnabled,
    setIsEditEnabled,
    articleSlug,
  } = props;
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
      // keywords: keywords,
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

  const router = useRouter();

  const onSubmit = (formData: FormValues) => {
    const dataToSend: ArticleUpdateSchema = {
      payload: {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        // keywords: formData.keywords.map((keyword) => keyword.value),
        submission_type: formData.submissionType,
      },
    };
    // let image_file: File | undefined;
    // if (formData.articleImageFile && formData.articleImageFile.file) {
    //   const originalFile = formData.articleImageFile.file;
    //   let fileName = originalFile.name;

    //   // Truncate filename if it's longer than 100 characters
    //   if (fileName.length > 100) {
    //     const extension = fileName.split('.').pop() || '';
    //     fileName = fileName.slice(0, 96 - extension.length) + '...' + extension;
    //   }

    //   image_file = new File([originalFile], fileName, { type: originalFile.type });
    // }

    // mutate({ articleId, data: { details: dataToSend, image_file } });
    mutate({ articleId, data: { details: dataToSend } });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Article details updated successfully');
      router.push(`/article/${articleSlug}`);
    }
    if (updateError) {
      toast.error(`${updateError.response?.data.message}`);
    }
  }, [updateError, isSuccess, router, articleSlug]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
      {/* <Controller
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
      /> */}
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
        readOnly={!isEditEnabled}
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
        readOnly={!isEditEnabled}
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
            readonly={!isEditEnabled}
          />
        )}
      />
      {/* <Controller
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
      /> */}
      <div className="mb-4 space-y-2">
        <label className="block text-sm font-medium text-text-secondary">Submission Type</label>
        <Controller
          name="submissionType"
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="mt-1 flex gap-2">
              <Button
                className={cn(
                  'w-fit cursor-pointer rounded-lg border px-4 py-2',
                  value === 'Public'
                    ? 'border-functional-green bg-functional-green/10'
                    : 'border-common-contrast'
                )}
                type="button"
                variant={'outline'}
                onClick={() => isEditEnabled && onChange('Public')}
              >
                <ButtonTitle className="text-base">Public</ButtonTitle>
              </Button>
              {/* <Button
                className={cn(
                  'w-fit cursor-pointer rounded-lg border px-4 py-2',
                  value === 'Private'
                    ? 'border-functional-green bg-functional-green/10'
                    : 'border-common-contrast'
                )}
                type="button"
                variant={'outline'}
                onClick={() => isEditEnabled && onChange('Private')}
              >
                <ButtonTitle className="text-base">Private</ButtonTitle>
              </Button> */}
            </div>
          )}
        />
      </div>
      <Button
        showLoadingSpinner={false}
        loading={isUpdatePending}
        className="mx-auto w-full"
        type="submit"
        disabled={!isEditEnabled}
      >
        <ButtonTitle>{isUpdatePending ? 'Loading...' : 'Submit Article'}</ButtonTitle>
      </Button>
    </form>
  );
};

export default EditArticleDetails;

export const EditArticleDetailsSkeleton = () => {
  return (
    <Skeleton>
      <TextSkeleton className="w-32" />
      <TextSkeleton className="h-10" />
      <TextSkeleton className="mt-4 w-32" />
      <TextSkeleton className="h-10" />
      <TextSkeleton className="mt-4 w-32" />
      <BlockSkeleton />
      <TextSkeleton className="mt-4 w-32" />
      <BlockSkeleton className="h-72" />
      <TextSkeleton className="mt-4 w-32" />
      <TextSkeleton className="h-10" />
    </Skeleton>
  );
};
