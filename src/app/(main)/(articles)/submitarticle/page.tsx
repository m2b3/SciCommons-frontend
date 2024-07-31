'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesApiCreateArticle } from '@/api/articles/articles';
import { ArticleCreateSchema } from '@/api/schemas';
import SubmitArticleForm from '@/components/articles/SubmitArticleForm';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';
import { SubmitArticleFormValues } from '@/types';

const ArticleForm: React.FC = () => {
  const router = useRouter();

  const { articleData } = useFetchExternalArticleStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const accessToken = useAuthStore((state) => state.accessToken);

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
        article_link: articleData.link,
      });
    }
  }, [articleData, reset]);

  // reset fields when the active tab changes
  useEffect(() => {
    reset({
      title: '',
      authors: [],
      abstract: '',
      article_link: '',
      keywords: [],
      imageFile: undefined,
      pdfFiles: undefined,
      submissionType: 'Public',
    });
  }, [activeTab, reset]);

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
    // map pdfFiles if both pdf file and pdfFiles are present
    const pdf_files = formData.pdfFiles
      ? formData.pdfFiles.map((pdfFile) => pdfFile && pdfFile.file).filter(Boolean)
      : [];

    submitArticle({ data: { details: dataToSend, image_file, pdf_files } });
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
