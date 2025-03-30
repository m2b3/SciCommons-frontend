import React from 'react';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      topic: '',
      content: '',
    },
  });

  const { mutate } = useArticlesDiscussionApiCreateDiscussion({
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
      },
      onError: (error, variables, context) => {
        const queryKey = getArticlesDiscussionApiListDiscussionsQueryKey(articleId, {
          community_id: communityId || 0,
        });
        queryClient.setQueryData(
          queryKey,
          context?.previousDiscussions as PaginatedDiscussionSchema | undefined
        );
        showErrorToast(error);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-4 rounded bg-white-secondary p-4 shadow">
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
      <Button type="submit" className="mt-4 bg-blue-500 text-white hover:bg-blue-600">
        Submit
      </Button>
    </form>
  );
};

export default DiscussionForm;
