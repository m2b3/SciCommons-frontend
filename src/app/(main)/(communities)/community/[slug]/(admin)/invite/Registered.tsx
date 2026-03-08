import React, { useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesApiInvitationInviteRegisteredUsers } from '@/api/community-invitations/community-invitations';
import FormInput from '@/components/common/FormInput';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Option } from '@/components/ui/multiple-selector';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface IRegisteredProps {
  username: Option[];
  note: string;
}

const Registered = ({ communityId }: { communityId: number }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IRegisteredProps>({
    mode: 'onChange',
  });
  const accessToken = useAuthStore((state) => state.accessToken);

  const { isPending, mutate, data, isSuccess, error } =
    useCommunitiesApiInvitationInviteRegisteredUsers({
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
  }, [isSuccess, data]);

  const onSubmit = (data: IRegisteredProps) => {
    const usernames = data.username.map((user) => user.value);
    const dataToSend = {
      usernames,
      note: data.note,
    };

    mutate({ communityId, data: dataToSend });
  };

  return (
    <div className="my-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
        <Controller
          name="username"
          control={control}
          rules={{ required: 'Authors are required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <MultiLabelSelector
              label="Enter names of users"
              tooltipText="Select users to send a join request."
              placeholder="Add Users"
              creatable
              value={value}
              onChange={onChange}
              fieldState={fieldState}
            />
          )}
        />
        <FormInput<IRegisteredProps>
          label="Note"
          name="note"
          type="text"
          placeholder="Enter the note"
          register={register}
          control={control}
          requiredMessage="Note is required"
          info="Provide a brief summary of your article's content."
          errors={errors}
          textArea={true}
        />
        <div className="flex justify-end space-x-4">
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

export default Registered;
