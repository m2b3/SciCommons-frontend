'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useArticlesApiCreateArticle } from '@/api/articles/articles';
import { ArticleCreateSchema } from '@/api/schemas';
import SubmitArticleForm from '@/components/articles/SubmitArticleForm';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';
import { SubmitArticleFormValues } from '@/types';

const STORAGE_KEY = 'articleFormData';

const ArticleForm: React.FC = () => {
  const router = useRouter();
  const { articleData } = useFetchExternalArticleStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isInitialized, setIsInitialized] = useState(false);

  const { mutate: submitArticle, isPending } = useArticlesApiCreateArticle({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (data) => {
        toast.success('Article submitted successfully! Redirecting....');
        router.push(`/article/${data.data.slug}`);
        localStorage.removeItem(STORAGE_KEY);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SubmitArticleFormValues>({
    defaultValues: {
      submissionType: 'Public',
      title: '',
      abstract: '',
      authors: [],
      keywords: [],
      article_link: '',
    },
    mode: 'onChange',
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      reset(parsedData);
      setActiveTab(parsedData.activeTab || 'upload');
    }
    setIsInitialized(true);
  }, [reset]);

  // Save form data to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const subscription = watch((formData) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...formData, activeTab }));
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, activeTab, isInitialized]);

  // Handle tab change
  useEffect(() => {
    if (isInitialized) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsedData, activeTab }));
      }
    }
  }, [activeTab, isInitialized]);

  // Handle article data
  useEffect(() => {
    if (isInitialized && articleData) {
      const newData = {
        title: articleData.title,
        authors: articleData.authors.map((author) => ({ label: author, value: author })),
        abstract: articleData.abstract,
        article_link: articleData.link,
      };
      reset(newData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...newData, activeTab }));
    }
  }, [articleData, reset, activeTab, isInitialized]);

  const onSubmit: SubmitHandler<SubmitArticleFormValues> = (formData) => {
    const dataToSend: ArticleCreateSchema = {
      payload: {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        article_link: formData.article_link || '',
        keywords: formData.keywords.map((keyword) => keyword.value),
        submission_type: formData.submissionType,
        community_name: null,
      },
    };
    const image_file = formData.imageFile ? formData.imageFile.file : undefined;
    const pdf_files = formData.pdfFiles
      ? formData.pdfFiles.map((pdfFile) => pdfFile && pdfFile.file).filter(Boolean)
      : [];

    submitArticle({ data: { details: dataToSend, image_file, pdf_files } });
  };

  return (
    <div className="container py-4 text-gray-900">
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

export default withAuthRedirect(ArticleForm, { requireAuth: true });
