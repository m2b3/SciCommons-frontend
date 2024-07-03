'use client';

import React, { useEffect, useState } from 'react';

import { NextPage } from 'next';
import { useParams, useRouter } from 'next/navigation';

import { MoveLeft } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useCommunitiesApiPostsCreateCommunityArticle } from '@/api/community-posts/community-posts';
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

  const {
    data,
    mutate: submitArticle,
    error,
    isSuccess,
    isPending,
  } = useCommunitiesApiPostsCreateCommunityArticle({
    request: {
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

    submitArticle({
      communityName: params.slug,
      data: { details: dataToSend, image_file, pdf_file },
    });
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
      router.push(`/article/${data.data.slug}/submit`);
    }
  }, [isSuccess, data, router]);

  return (
    <div className="container py-4">
      {/* Back to community */}
      <div className="mb-4">
        <button
          onClick={() => router.push(`/community/${params.slug}`)}
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
