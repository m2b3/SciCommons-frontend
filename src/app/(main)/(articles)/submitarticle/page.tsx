'use client';

import React, { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useArticlesApiCreateArticle } from '@/api/articles/articles';
import SubmitArticleForm from '@/components/articles/SubmitArticleForm';
import { useAuthStore } from '@/stores/authStore';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';
import { SubmitArticleFormValues } from '@/types';

const ArticleForm: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  const { articleData } = useFetchExternalArticleStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const accessToken = useAuthStore((state) => state.accessToken);

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
  } = useForm<SubmitArticleFormValues>({
    defaultValues: {
      submissionType: 'Public',
      title: articleData?.title || '',
      abstract: articleData?.abstract || '',
    },
    mode: 'onChange',
  });
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

  const onSubmit: SubmitHandler<SubmitArticleFormValues> = (formData) => {
    const dataToSend = {
      payload: {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        keywords: formData.keywords.map((keyword) => ({
          value: keyword.value,
          label: keyword.label,
        })),
        submission_type: formData.submissionType,
      },
    };
    const image_file = formData.imageFile ? formData.imageFile.file : undefined;
    const pdf_file = formData.pdfFile ? formData.pdfFile.file : undefined;

    submitArticle({ data: { details: dataToSend, image_file, pdf_file } });
  };

  // Toasts to show success and error messages
  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Article submitted successfully! Redirecting....');
      router.push(`/article/${data.data.slug}`);
    }
  }, [isSuccess, data, router, params.slug]);

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
      <SubmitArticleForm
        {...{
          handleSubmit,
          onSubmit,
          control,
          register,
          errors,
          isPending,
          activeTab,
          setActiveTab,
        }}
      />
    </div>
  );
};

export default ArticleForm;
