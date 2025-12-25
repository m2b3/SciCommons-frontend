import React from 'react';

import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesDiscussionApiCreateDiscussion } from '@/api/discussions/discussions';
import FormInput from '@/components/common/FormInput';
import { Button, ButtonTitle } from '@/components/ui/button';
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
  refetchDiscussions: () => void;
}

const DiscussionForm: React.FC<DiscussionFormProps> = ({
  setShowForm,
  articleId,
  communityId,
  refetchDiscussions,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    control,
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

  const { mutate, isPending, isSuccess } = useArticlesDiscussionApiCreateDiscussion({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        toast.success('Discussion created successfully');
        setShowForm(false);
        reset();
        refetchDiscussions();
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutate({ articleId, data, params: { community_id: communityId } });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mb-4 flex flex-col gap-2 rounded-xl border border-common-contrast bg-common-cardBackground p-4"
    >
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
        control={control}
        requiredMessage="Content is required"
        errors={errors}
        textArea={true}
        isSuccess={isSuccess}
        supportMarkdown={true}
      />
      <Button type="submit" variant={'blue'} loading={isPending} showLoadingSpinner>
        <ButtonTitle>Submit</ButtonTitle>
      </Button>
    </form>
  );
};

export default DiscussionForm;
