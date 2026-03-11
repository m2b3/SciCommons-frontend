'use client';

import React, { useEffect, useRef, useState } from 'react';

import { NextPage } from 'next';
import { useParams, useRouter } from 'next/navigation';

import { MoveLeft } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesApiCreateArticle } from '@/api/articles/articles';
import { ArticleCreateSchema } from '@/api/schemas';
import SubmitArticleForm from '@/components/articles/SubmitArticleForm';
import {
  clearCommunityArticleDraft,
  getCommunityArticleDraft,
  getCommunityArticleDraftValues,
  saveCommunityArticleDraft,
} from '@/lib/communityArticleDraft';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import useFetchExternalArticleStore from '@/stores/useFetchExternalArticleStore';
import { SubmitArticleFormValues } from '@/types';

const defaultFormValues: SubmitArticleFormValues = {
  submissionType: 'Private', // Always Private for community articles - backend determines visibility based on community settings
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
  const communitySlug = params?.slug || '';
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  /* Fixed by Codex GPT-5 on 2026-03-11
     Problem: Discarding a draft called reset(), and react-hook-form watch callbacks immediately re-saved a new empty draft.
     Solution: Pause autosave during reset-driven updates after discard and resume on the next explicit field change.
     Result: Discard now removes persisted draft data instead of restoring an empty draft on revisit. */
  const pauseDraftAutosaveUntilFieldEditRef = useRef(false);

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
          action: { label: 'Ok', onClick: () => { } },
        });
        router.push(`/article/${data.data.slug}`);
        clearCommunityArticleDraft(localStorage, communitySlug);
        setHasSavedDraft(false);
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
    getValues,
  } = useForm<SubmitArticleFormValues>({
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedDraft = getCommunityArticleDraft(localStorage, communitySlug);
    if (savedDraft) {
      setActiveTab(savedDraft.activeTab);
      reset(getCommunityArticleDraftValues(savedDraft, defaultFormValues));
      setHasSavedDraft(true);
    } else {
      setHasSavedDraft(false);
    }

    setIsInitialized(true);
  }, [communitySlug, reset]);

  // Save form data to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const subscription = watch((formData, { name }) => {
        if (pauseDraftAutosaveUntilFieldEditRef.current) {
          if (!name) {
            return;
          }
          pauseDraftAutosaveUntilFieldEditRef.current = false;
        }

        const normalizedAuthors = (formData.authors || []).filter(
          (author): author is SubmitArticleFormValues['authors'][number] =>
            Boolean(author?.value && author?.label)
        );
        const normalizedPdfFiles = (formData.pdfFiles || []).filter(
          (pdfFile): pdfFile is SubmitArticleFormValues['pdfFiles'][number] =>
            Boolean(pdfFile?.file)
        );

        saveCommunityArticleDraft(localStorage, communitySlug, activeTab, {
          ...defaultFormValues,
          ...formData,
          authors: normalizedAuthors,
          pdfFiles: normalizedPdfFiles,
        });
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, communitySlug, activeTab, isInitialized]);

  // Handle tab change - preserve pdfFiles when switching tabs
  useEffect(() => {
    if (isInitialized) {
      const savedDraft = getCommunityArticleDraft(localStorage, communitySlug);
      const currentTabData = savedDraft?.[activeTab] || defaultFormValues;
      const currentPdfFiles = getValues('pdfFiles');

      reset({
        ...defaultFormValues,
        ...currentTabData,
        pdfFiles: currentPdfFiles || [],
      });
    }
  }, [communitySlug, activeTab, reset, isInitialized, getValues]);

  // Handle article data - preserve pdfFiles when loading article data
  useEffect(() => {
    if (isInitialized && articleData && activeTab === 'search') {
      // Preserve pdfFiles from current form state
      const currentPdfFiles = getValues('pdfFiles');
      const newData = {
        ...defaultFormValues,
        title: articleData.title,
        authors: articleData.authors.map((author) => ({ label: author, value: author })),
        abstract: articleData.abstract,
        article_link: articleData.link,
        pdfFiles: currentPdfFiles || [],
      };
      reset(newData);

      saveCommunityArticleDraft(localStorage, communitySlug, activeTab, newData);
    }
  }, [articleData, reset, communitySlug, activeTab, isInitialized, getValues]);

  const handleDiscardDraft = () => {
    pauseDraftAutosaveUntilFieldEditRef.current = true;
    clearCommunityArticleDraft(localStorage, communitySlug);
    setHasSavedDraft(false);
    setActiveTab('upload');
    reset(defaultFormValues);
  };

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
        community_name: communitySlug,
        pdf_link: articleData?.pdfLink || undefined,
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
            onClick={() => router.push(`/community/${communitySlug}`)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:underline"
          >
            <MoveLeft size={16} /> Back to Community
          </button>
        </div>
        {hasSavedDraft && (
          <div
            role="status"
            className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-functional-green/30 bg-functional-green/10 px-4 py-3 text-sm text-text-primary"
          >
            <p>Restored a saved draft for this community.</p>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="shrink-0 font-medium text-functional-green hover:underline"
            >
              Discard draft
            </button>
          </div>
        )}
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
            hideSubmissionTypeSelector: true,
            articleData,
          }}
        />
      </div>
    </div>
  );
};

export default CommunityArticleForm;
