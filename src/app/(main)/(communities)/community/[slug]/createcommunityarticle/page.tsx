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
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';
import { SubmitArticleFormValues } from '@/types';

const STORAGE_KEY = 'communityArticleFormData';

const defaultFormValues: SubmitArticleFormValues = {
  submissionType: 'Public',
  title: '',
  abstract: '',
  authors: [],
  // keywords: [],
  article_link: '',
  pdfFiles: [],
};

const CommunityArticleForm: NextPage = () => {
  const { articleData, fetchArticle } = useFetchExternalArticleStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [isInitialized, setIsInitialized] = useState(false);

  const { mutate: submitArticle, isPending } = useArticlesApiCreateArticle({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (data) => {
        toast.success('Article has been successfully submitted', {
          duration: Infinity,
          action: { label: 'Ok', onClick: () => {} },
        });
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
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setActiveTab(parsedData.activeTab || 'upload');
      const currentTabData = parsedData[parsedData.activeTab] || defaultFormValues;
      reset(currentTabData);
    }
    setIsInitialized(true);
  }, [reset]);

  // Save form data to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const subscription = watch((formData) => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        const parsedData = savedData ? JSON.parse(savedData) : {};

        const dataToSave = {
          ...parsedData,
          [activeTab]: { ...formData, pdfFiles: undefined },
          activeTab,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
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
        const currentTabData = parsedData[activeTab] || defaultFormValues;
        reset(currentTabData);
      }
    }
  }, [activeTab, reset, isInitialized]);

  // Handle article data
  useEffect(() => {
    if (isInitialized && articleData && activeTab === 'search') {
      const newData = {
        ...defaultFormValues,
        title: articleData.title,
        authors: articleData.authors.map((author) => ({ label: author, value: author })),
        abstract: articleData.abstract,
        article_link: articleData.link,
      };
      reset(newData);

      const savedData = localStorage.getItem(STORAGE_KEY);
      const parsedData = savedData ? JSON.parse(savedData) : {};
      const dataToSave = {
        ...parsedData,
        [activeTab]: newData,
        activeTab,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
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
        article_link: formData.article_link || undefined,
        // keywords: formData.keywords.map((keyword) => keyword.value),
        submission_type: formData.submissionType,
        community_name: params?.slug,
      },
    };
    const pdf_files = formData.pdfFiles
      ? formData.pdfFiles.map((pdfFile) => pdfFile && pdfFile.file).filter(Boolean)
      : [];

    submitArticle({ data: { details: dataToSend, pdf_files } });
  };

  const handleSearch = async (query: string) => {
    try {
      await fetchArticle(query);
      setActiveTab('search');
    } catch (error) {
      toast.error('Failed to fetch article. Please try again later.');
    }
  };

  return (
    <div className="container p-0 res-text-sm md:px-8 md:py-4">
      <div className="mx-auto w-full max-w-5xl border-common-contrast p-4 py-8 md:rounded-xl md:border md:bg-common-cardBackground md:p-8">
        <div className="mb-4">
          <button
            onClick={() => router.push(`/community/${params?.slug}`)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:underline"
          >
            <MoveLeft size={16} /> Back to Community
          </button>
        </div>
        <div className="mb-4 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-text-primary">
            Create a<span className="text-functional-green"> Community </span>
            Article
          </h1>
          <p className="mt-2 text-center text-text-tertiary">
            Share your insights and knowledge with our community. Fill in the details below to
            create an article specifically for this community.
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
            onSearch: handleSearch,
            showPrivateCheckOption: true,
            articleData,
          }}
        />
      </div>
    </div>
  );
};

export default CommunityArticleForm;
