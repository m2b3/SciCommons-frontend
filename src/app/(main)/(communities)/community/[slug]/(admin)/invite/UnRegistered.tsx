import React, { useEffect } from 'react';

import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesApiInvitationSendInvitationsToUnregisteredUsers } from '@/api/community-invitations/community-invitations';
import FormInput from '@/components/common/FormInput';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { Option } from '@/components/ui/multiple-selector';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface IUnRegisteredProps {
  emails: Option[];
  subject: string;
  content: string;
}

const UnRegistered = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IUnRegisteredProps>({
    mode: 'onChange',
  });

  const accessToken = useAuthStore((state) => state.accessToken);

  const { isPending, mutate, isSuccess, error } =
    useCommunitiesApiInvitationSendInvitationsToUnregisteredUsers({
      request: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Invitation sent successfully!', {
        duration: 2000,
        position: 'top-right',
      });
    }
  }, [isSuccess]);

  const onSubmit = (data: IUnRegisteredProps) => {
    const emails = data.emails.map((email) => email.value);
    const dataToSend = {
      emails,
      subject: data.subject,
      body: data.content,
    };

    mutate({ communityId: 1, data: dataToSend });
  };

  return (
    <div className="my-4 rounded-lg bg-white-primary p-4 shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
        <Controller
          name="emails"
          control={control}
          rules={{ required: 'Authors are required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <MultiLabelSelector
              label="Enter emails of users"
              tooltipText="Select users to send a join request."
              placeholder="Enter Emails"
              creatable
              value={value}
              onChange={onChange}
              fieldState={fieldState}
            />
          )}
        />
        <FormInput<IUnRegisteredProps>
          label="Subject"
          name="subject"
          type="text"
          placeholder="Enter the subject"
          register={register}
          requiredMessage="Subject is required"
          info="Provide a subject for the invitation email."
          errors={errors}
        />
        <FormInput<IUnRegisteredProps>
          label="Content"
          name="content"
          type="text"
          placeholder="Enter the content"
          register={register}
          requiredMessage="Content is required"
          info="Provide the content for the invitation email."
          errors={errors}
          textArea={true}
        />
        <div className="flex justify-end space-x-4 res-text-sm">
          <button className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300">
            Cancel
          </button>
          <button
            className={clsx(
              'rounded-md px-4 py-2 text-white',
              isPending ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
            )}
            disabled={isPending}
          >
            {isPending ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnRegistered;
