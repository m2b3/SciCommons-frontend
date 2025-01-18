import React from 'react';

import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useArticlesDiscussionApiCreateDiscussion } from '@/api/discussions/discussions';
import FormInput from '@/components/common/FormInput';
import { Button } from '@/components/ui/button';
import { showErrorToast } from '@/lib/toastHelpers';

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
    mutation: {
      onSuccess: () => {
        toast.success('Discussion created successfully');
        setShowForm(false);
        reset();
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
