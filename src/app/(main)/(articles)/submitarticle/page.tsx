'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import clsx from 'clsx';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useArticlesApiCreateArticle } from '@/api/articles/articles';
import FormInput from '@/components/FormInput';
import ImageUpload from '@/components/ImageUpload';
import MultiLabelSelector from '@/components/MultiLabelSelector';
import { Option } from '@/components/ui/multiple-selector';
import { useAuthStore } from '@/stores/authStore';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';

import FileOrLinkTab from './FileOrLinkTab';

export interface FormValues {
  title: string;
  abstract: string;
  keywords: Option[];
  authors: Option[];
  imageFile: FileObj;
  pdfFile: FileObj;
  submission_type: 'Public' | 'Private';
}

export interface FileObj {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

const ArticleForm: React.FC = () => {
  const { articleData } = useFetchExternalArticleStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  const {
    data,
    mutate: submitArticle,
    error,
    isSuccess,
    isPending,
  } = useArticlesApiCreateArticle({
    axios: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      submission_type: 'Public',
      title: articleData?.title || '',
      abstract: articleData?.abstract || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (error) {
      console.error('Error submitting article:', error);
      toast.error(
        `Error submitting article: ${(error?.response?.data as { detail?: string })?.detail || 'An error occurred'}`
      );
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Article submitted successfully! Redirecting....');
      router.push(`/article/${data.data.id}`);
    }
  }, [isSuccess, data, router]);

  // reset the form details when there is article data is available
  useEffect(() => {
    if (articleData) {
      reset({
        title: articleData.title,
        authors: articleData.authors.map((author) => ({ label: author, value: author })),
        abstract: articleData.abstract,
      });
    }
  }, [articleData, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const dataToSend = {
      title: data.title,
      abstract: data.abstract,
      submission_type: data.submission_type,
      authors: JSON.stringify(data.authors),
      keywords: JSON.stringify(data.keywords),
      pdf_file: data.pdfFile.file,
      image_file: data.imageFile.file,
    };

    submitArticle({ data: dataToSend });
  };

  return (
    <div className="container py-4">
      <div className="mb-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">
          Submit an
          <span className="text-green-500"> Article</span>
        </h1>
        <p className="text-gray-600">
          Share your latest research with the community and receive valuable feedback.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <FileOrLinkTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          control={control}
          name="pdfFile"
        />
        <FormInput<FormValues>
          label="Title"
          name="title"
          type="text"
          placeholder="Enter the title of your article"
          register={register}
          requiredMessage="Title is required"
          minLengthValue={10}
          minLengthMessage="Title must be at least 10 characters"
          maxLengthValue={100}
          maxLengthMessage="Title must not exceed 100 characters"
          info="Please provide a clear and concise title for your article."
          errors={errors}
          readOnly={activeTab === 'search'}
        />
        {activeTab === 'search' && (
          <p className="text-sm text-gray-500">
            You cannot edit the title when searching for articles.
          </p>
        )}
        <Controller
          name="authors"
          control={control}
          rules={{ required: 'Authors are required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <MultiLabelSelector
              label="Authors"
              tooltipText="Select authors for the article."
              placeholder="Add Authors"
              creatable
              value={value}
              onChange={onChange}
              fieldState={fieldState}
            />
          )}
        />
        <FormInput<FormValues>
          label="Abstract"
          name="abstract"
          type="text"
          placeholder="Enter the abstract of your article"
          register={register}
          requiredMessage="Abstract is required"
          info="Provide a brief summary of your article's content."
          errors={errors}
          textArea={true}
          readOnly={activeTab === 'search'}
        />
        <Controller
          name="keywords"
          control={control}
          rules={{ required: 'Keywords are required' }}
          render={({ field, fieldState }) => (
            <MultiLabelSelector
              label="Keywords"
              tooltipText="Select keywords for the article."
              placeholder="Add Keywords"
              creatable
              {...field}
              fieldState={fieldState}
            />
          )}
        />
        <Controller
          name="imageFile"
          control={control}
          render={({}) => (
            <ImageUpload
              control={control}
              name="imageFile"
              label="Image"
              info="Upload an image for the article"
            />
          )}
        />
        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Submission Type</label>
          <Controller
            name="submission_type"
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange('Public')}
                  className={`rounded-md px-4 py-2 ${value === 'Public' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => onChange('Private')}
                  className={`rounded-md px-4 py-2 ${value === 'Private' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Private
                </button>
              </div>
            )}
          />
        </div>
        <button
          type="submit"
          className={clsx('mx-auto max-w-md rounded-md bg-green-500 px-4 py-2 text-white', {
            'cursor-not-allowed opacity-50': isPending,
          })}
        >
          {isPending ? 'Loading...' : 'Submit Article'}
        </button>
      </form>
    </div>
  );
};

export default ArticleForm;
