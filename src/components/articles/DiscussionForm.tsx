import React, { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  getArticlesDiscussionApiListDiscussionsQueryKey,
  useArticlesDiscussionApiCreateDiscussion,
} from '@/api/discussions/discussions';
import { DiscussionOut, PaginatedDiscussionSchema, UserStats } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import { Button } from '@/components/ui/button';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface FormValues {
  topic: string;
  content: string;
}

interface DiscussionFormProps {
  setShowForm: (showForm: boolean) => void;
  articleId: number;
  communityId?: number | null;
}

const DiscussionForm: React.FC<DiscussionFormProps> = ({ setShowForm, articleId, communityId }) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [creationError, setCreationError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<FormValues>({
    defaultValues: {
      topic: '',
      content: '',
    },
  });

  const { mutate, isPending } = useArticlesDiscussionApiCreateDiscussion({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onMutate: async (variables) => {
        const { data: newDiscussion } = variables;
        const queryKey = getArticlesDiscussionApiListDiscussionsQueryKey(articleId, {
          community_id: communityId ?? undefined,
        });

        await queryClient.cancelQueries({ queryKey });

        const previousDiscussions = queryClient.getQueryData(queryKey) as
          | PaginatedDiscussionSchema
          | undefined;

        queryClient.setQueryData(queryKey, (oldData: PaginatedDiscussionSchema | undefined) => {
          if (oldData && oldData.items) {
            return {
              ...oldData,
              items: [
                {
                  id: Date.now(),
                  topic: newDiscussion.topic,
                  content: newDiscussion.content,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  article_id: articleId,
                  community: communityId,
                  comments_count: 0,
                  user: {
                    id: 0,
                    username: 'Unknown User',
                    reputation_score: 0,
                    reputation_level: 'Beginner',
                  } as UserStats,
                } as DiscussionOut,
              ],
            };
          }
          return oldData;
        });

        return { previousDiscussions };
      },

      onSuccess: () => {
        toast.success('Discussion created successfully');
        setShowForm(false);
        reset();
        queryClient.invalidateQueries({
          queryKey: getArticlesDiscussionApiListDiscussionsQueryKey(articleId),
        });
        setCreationError(null);
      },

      onError: (error, variables, context) => {
        const queryKey = getArticlesDiscussionApiListDiscussionsQueryKey(articleId, {
          community_id: communityId || 0,
        });
        queryClient.setQueryData(
          queryKey,
          context?.previousDiscussions as PaginatedDiscussionSchema | undefined
        );
        if (!creationError) {
          showErrorToast(error);
        }
        setCreationError(error);
        setIsRetrying(false);
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: getArticlesDiscussionApiListDiscussionsQueryKey(articleId, {
            community_id: communityId || 0,
          }),
        });
      },
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutate({ articleId, data, params: { community_id: communityId } });
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setCreationError(null);
    const formValues = getValues();
    mutate(
      { articleId, data: formValues, params: { community_id: communityId } },
      {
        onSettled: () => setIsRetrying(false),
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-4 flex flex-col gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4"
    >
      {creationError && <div className="mb-4 text-red-500"></div>}
      <FormInput<FormValues>
        label="Topic"
        name="topic"
        type="text"
        placeholder="Enter discussion topic"
        register={register}
        requiredMessage="Topic is required"
        errors={errors}
      />
      <FormInput<FormValues>
        label="Content"
        name="content"
        type="text"
        placeholder="Enter discussion content"
        register={register}
        requiredMessage="Content is required"
        errors={errors}
        textArea={true}
      />

      {creationError ? (
        <Button
          onClick={handleRetry}
          disabled={isPending || isSubmitting || isRetrying}
          className="mt-4 bg-red-500 text-white hover:bg-red-600"
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      ) : (
        <Button
          type="submit"
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
          disabled={isPending || isSubmitting}
        >
          Submit
        </Button>
      )}
    </form>
  );
};

export default DiscussionForm;
