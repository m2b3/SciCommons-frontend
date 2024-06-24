import React, { useEffect } from 'react';

import { useParams, useSearchParams } from 'next/navigation';

import clsx from 'clsx';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useCommunitiesApiPostsSubmitArticleToCommunity } from '@/api/community-posts/community-posts';
import FormInput from '@/components/FormInput';
import { useAuthStore } from '@/stores/authStore';

interface FormValues {
  communityName: string;
  note: string;
}

const SubmitToCommunity = () => {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const communityName = searchParams.get('name');
  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const { mutate, isSuccess, isPending, error } = useCommunitiesApiPostsSubmitArticleToCommunity({
    axios: axiosConfig,
  });

  useEffect(() => {
    if (communityName) {
      reset({ communityName, note: '' });
    }
  }, [communityName, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutate({ articleSlug: params.slug, communityName: data.communityName });
  };

  // Toast messages for success and error
  useEffect(() => {
    if (isSuccess) {
      toast.success('Article submitted successfully');
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [error]);

  return (
    <div className="my-4 rounded-lg bg-white p-4 shadow-md">
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
          <button className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            Cancel
          </button>
          <button
            className={clsx(
              'rounded-md px-4 py-2 text-white hover:bg-green-600',
              isPending ? 'bg-gray-400' : 'bg-green-500'
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
