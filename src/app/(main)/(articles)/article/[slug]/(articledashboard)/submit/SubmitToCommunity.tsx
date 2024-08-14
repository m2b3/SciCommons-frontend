import React, { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import clsx from 'clsx';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesArticlesApiSubmitArticle } from '@/api/community-articles/community-articles';
import FormInput from '@/components/common/FormInput';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface FormValues {
  communityName: string;
  note: string;
}

const SubmitToCommunity = ({ slug }: { slug: string }) => {
  const searchParams = useSearchParams();
  const communityName = searchParams?.get('name');
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const { mutate, isPending } = useCommunitiesArticlesApiSubmitArticle({
    request: axiosConfig,
  });

  useEffect(() => {
    if (communityName) {
      reset({ communityName, note: '' });
    }
  }, [communityName, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutate(
      { articleSlug: slug || '', communityName: data.communityName },
      {
        onSuccess: () => {
          reset();
          toast.success('Article submitted successfully');
        },
        onError: (error) => {
          showErrorToast(error);
        },
      }
    );
  };

  return (
    <div className="my-4 rounded-lg bg-white-secondary p-4 shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
        <FormInput<FormValues>
          label="Enter the community name"
          name="communityName"
          type="text"
          placeholder="Enter the name here..."
          register={register}
          requiredMessage="Community name is required"
          info="Enter the name of the community you want to submit your article to."
          errors={errors}
        />
        <FormInput<FormValues>
          label="Note"
          name="note"
          type="text"
          placeholder="Enter the note"
          register={register}
          requiredMessage="Note is required"
          info="Enter a note for the community admin."
          errors={errors}
          textArea={true}
        />
        <div className="flex justify-end space-x-4">
          <button className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 res-text-sm hover:bg-gray-300">
            Cancel
          </button>
          <button
            className={clsx(
              'rounded-md px-4 py-2 text-white res-text-sm',
              isPending ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
            )}
            disabled={isPending}
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitToCommunity;
