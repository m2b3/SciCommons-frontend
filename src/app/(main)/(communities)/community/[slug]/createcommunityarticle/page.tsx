'use client';

import React, { useEffect, useState } from 'react';

import { NextPage } from 'next';
import { useParams, useRouter } from 'next/navigation';

import { MoveLeft } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesApiCreateArticle } from '@/api/articles/articles';
import { ArticleCreateSchema } from '@/api/schemas';
import SubmitArticleForm from '@/components/articles/SubmitArticleForm';
import { useAuthStore } from '@/stores/authStore';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';
import { SubmitArticleFormValues } from '@/types';

const CommunityArticleForm: NextPage = () => {
  const { articleData } = useFetchExternalArticleStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();

  const params = useParams<{ slug: string }>();

  const { mutate: submitArticle, isPending } = useArticlesApiCreateArticle({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (data) => {
        toast.success(
          "Article has been successfully submitted. You'll notified once it's approved.",
          { duration: Infinity, action: { label: 'Undo', onClick: () => {} } }
        );
        router.push(`/article/${data.data.slug}`);
      },
      onError: (error) => {
        toast.error(`${error.response?.data.message}`);
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
    const dataToSend: ArticleCreateSchema = {
      payload: {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        article_link: formData.article_link || undefined,
        keywords: formData.keywords.map((keyword) => keyword.value),
        submission_type: formData.submissionType,
        community_name: params?.slug,
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
      {/* Back to community */}
      <div className="mb-4">
        <button
          onClick={() => router.push(`/community/${params?.slug}`)}
          className="flex items-center gap-2 text-sm text-green-500 hover:underline"
        >
          <MoveLeft size={16} /> Back to Community
        </button>
      </div>
      <div className="mb-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">
          Create a<span className="text-green-500"> Community </span>
          Article
        </h1>
        <p className="mt-2 text-gray-600">
          Share your insights and knowledge with our community. Fill in the details below to create
          an article specifically for this community.
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

export default CommunityArticleForm;
