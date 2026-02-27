'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';
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

const defaultFormValues: SubmitArticleFormValues = {
  submissionType: 'Public',
  title: '',
  abstract: '',
  authors: [],
  // keywords: [],
  article_link: '',
  pdfFiles: [],
};

const ArticleForm: React.FC = () => {
  const router = useRouter();
  const { articleData, fetchArticle } = useFetchExternalArticleStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: submitArticle, isPending } = useArticlesApiCreateArticle({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (data) => {
        /* Fixed by Codex on 2026-02-09
           Problem: Newly created articles did not appear in list views until a hard refresh.
           Solution: Invalidate article list queries on successful create.
           Result: Articles/My Articles lists refetch and show the new entry promptly.
           Alternatives (not implemented): (1) Optimistically insert the new item into caches,
           (2) Force a refetch on the list page when users navigate back. */
        queryClient.invalidateQueries({ queryKey: ['articles'] });
        queryClient.invalidateQueries({ queryKey: ['my_articles'] });
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
    getValues,
  } = useForm<SubmitArticleFormValues>({
    defaultValues: defaultFormValues,
    mode: 'onChange',
  });

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 9: Add refs to coordinate localStorage writes and prevent race conditions
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

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

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 9: Add debouncing (300ms) and isSaving flag to prevent concurrent writes
  // Save form data to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const subscription = watch((formData) => {
        // Clear any pending save
        if (saveTimeoutRef.current !== null) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Debounce the save operation
        saveTimeoutRef.current = window.setTimeout(() => {
          // Check if another save is in progress
          if (isSaving) {
            return;
          }

          setIsSaving(true);
          try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            const parsedData = savedData ? JSON.parse(savedData) : {};

            const dataToSave = {
              ...parsedData,
              [activeTab]: { ...formData, pdfFiles: undefined },
              activeTab,
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
          } finally {
            setIsSaving(false);
            saveTimeoutRef.current = null;
          }
        }, 300); // 300ms debounce
      });

      return () => {
        subscription.unsubscribe();
        // Clean up pending save on unmount
        if (saveTimeoutRef.current !== null) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [watch, activeTab, isInitialized, isSaving]);

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 9: Tab change effect now only reads (doesn't write) to prevent race conditions
  // Handle tab change - preserve pdfFiles when switching tabs
  useEffect(() => {
    if (isInitialized) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const currentTabData = parsedData[activeTab] || defaultFormValues;
        // Preserve pdfFiles from current form state when switching tabs
        const currentPdfFiles = getValues('pdfFiles');
        reset({
          ...currentTabData,
          pdfFiles: currentPdfFiles || [],
        });
      }
    }
  }, [activeTab, reset, isInitialized, getValues]);

  // Fixed by Claude Sonnet 4.5 on 2026-02-08
  // Issue 9: Wait for pending saves before writing to prevent data loss
  // Handle article data - preserve pdfFiles when loading article data
  useEffect(() => {
    if (isInitialized && articleData && activeTab === 'search') {
      // Wait for any pending save to complete
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      // Preserve pdfFiles from current form state
      const currentPdfFiles = getValues('pdfFiles');
      const newData = {
        ...defaultFormValues,
        title: articleData.title,
        authors: articleData.authors.map((author) => ({ label: author, value: author })),
        abstract: articleData.abstract,
        article_link: articleData.link,
        pdf_link: articleData.pdfLink,
        pdfFiles: currentPdfFiles || [],
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
  }, [articleData, reset, activeTab, isInitialized, getValues]);

  const onSubmit: SubmitHandler<SubmitArticleFormValues> = async (formData) => {
    const dataToSend: ArticleCreateSchema = {
      payload: {
        title: formData.title,
        abstract: formData.abstract,
        authors: formData.authors.map((author) => ({
          value: author.value,
          label: author.label,
        })),
        article_link: formData.article_link || '',
        // keywords: formData.keywords.map((keyword) => keyword.value),
        submission_type: formData.submissionType,
        community_name: null,
        pdf_link: articleData?.pdfLink || undefined,
      },
    };

    // Handle file uploads
    const pdf_files: File[] = [];
    if (formData.pdfFiles && formData.pdfFiles.length > 0) {
      for (const fileObj of formData.pdfFiles) {
        if (fileObj && fileObj.file instanceof File) {
          let file = fileObj.file;

          // Fixed by Claude Sonnet 4.5 on 2026-02-08
          // Issue 14: Sanitize filename to prevent path traversal attacks
          let sanitizedName = file.name
            // Remove path separators (forward slash, backslash)
            .replace(/[/\\]/g, '_')
            // Remove null bytes
            .replace(/\0/g, '')
            // Remove ".." sequences
            .replace(/\.\./g, '_')
            // Remove leading dots to prevent hidden files
            .replace(/^\.+/, '');

          // Validate file extension
          const hasValidExtension = /\.(pdf|PDF)$/i.test(sanitizedName);
          if (!hasValidExtension) {
            sanitizedName += '.pdf';
          }

          // Check if filename is 100 characters or longer and truncate
          if (sanitizedName.length >= 100) {
            // Split the filename and extension
            const nameParts = sanitizedName.split('.');
            const extension = nameParts.pop() || '';
            const baseName = nameParts.join('.');

            // Truncate the base name and add the extension back
            sanitizedName = baseName.slice(0, 95) + '...' + (extension ? `.${extension}` : '');
          }

          // Create a new File object with the sanitized name
          file = new File([file], sanitizedName, { type: file.type });

          pdf_files.push(file);
        }
      }
    }

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
        <div className="mb-4 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-text-primary">
            Submit an
            <span className="text-functional-green"> Article</span>
          </h1>
          <p className="mt-2 text-center text-text-tertiary">
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
            onSearch: handleSearch,
            articleData,
          }}
        />
      </div>
    </div>
  );
};

export default withAuthRedirect(ArticleForm, { requireAuth: true });
