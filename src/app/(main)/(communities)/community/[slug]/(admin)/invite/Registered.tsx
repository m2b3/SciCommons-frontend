import React, { useEffect } from 'react';

import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesApiInvitationInviteRegisteredUsers } from '@/api/community-invitations/community-invitations';
import FormInput from '@/components/common/FormInput';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import { Option } from '@/components/ui/multiple-selector';
import { showErrorToast } from '@/lib/toastHelpers';

interface IRegisteredProps {
  username: Option[];
  note: string;
}

const Registered = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IRegisteredProps>({
    mode: 'onChange',
  });

  const { isPending, mutate, data, isSuccess, error } =
    useCommunitiesApiInvitationInviteRegisteredUsers();

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      console.log(data);
      toast.success('Invitation sent successfully!');
    }
  }, [isSuccess, data]);

  const onSubmit = (data: IRegisteredProps) => {
    const usernames = data.username.map((user) => user.value);
    const dataToSend = {
      usernames,
      note: data.note,
    };

    mutate({ communityId: 1, data: dataToSend });
  };

  return (
    <div className="my-4 rounded-lg bg-white-primary p-4 shadow-md">
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
          requiredMessage="Note is required"
          info="Provide a brief summary of your article's content."
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
            {isPending ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Registered;
