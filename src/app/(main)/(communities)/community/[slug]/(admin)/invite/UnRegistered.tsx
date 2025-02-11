import React, { useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesApiInvitationSendInvitationsToUnregisteredUsers } from '@/api/community-invitations/community-invitations';
import FormInput from '@/components/common/FormInput';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { Button, ButtonTitle } from '@/components/ui/button';
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
      toast.success('Invitation sent successfully!');
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
    <div className="my-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4">
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
          <Button variant={'gray'}>
            <ButtonTitle>Cancel</ButtonTitle>
          </Button>
          <Button loading={isPending} type="submit" showLoadingSpinner={false}>
            <ButtonTitle>{isPending ? 'Sending...' : 'Send Invitation'}</ButtonTitle>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UnRegistered;
