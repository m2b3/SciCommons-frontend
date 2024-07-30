'use client';

import React from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUsersApiAuthResetPassword } from '@/api/users-auth/users-auth';
import FormInput from '@/components/FormInput';
import Button from '@/components/common/Button';
import { ErrorMessage } from '@/constants';

interface IResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ token: string }>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IResetPasswordForm>({
    mode: 'onChange',
  });

  const { mutate, isPending } = useUsersApiAuthResetPassword({
    mutation: {
      onSuccess: () => {
        toast.success('Password reset successfully');
        router.push('/auth/login');
      },
      onError: (err) => {
        toast.error(err.response?.data.message || ErrorMessage);
      },
    },
  });

  const onSubmit = (data: IResetPasswordForm) => {
    mutate({
      data: {
        password: data.password,
        confirm_password: data.confirmPassword,
        token: params?.token || '',
      },
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md rounded-md p-6 res-text-sm md:bg-white md:shadow-md md:dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Image src="/auth/resetpassword.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 font-bold res-text-xl"> Reset Password</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {' '}
            Enter your new password and confirm it to reset your password.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex max-w-md flex-col gap-4 p-4"
        >
          <FormInput<IResetPasswordForm>
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
            register={register}
            requiredMessage="Password is required"
            minLengthValue={8}
            minLengthMessage="Password must be at least 8 characters"
            errors={errors}
          />
          <FormInput<IResetPasswordForm>
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            register={register}
            requiredMessage="Confirm Password is required"
            errors={errors}
            patternMessage="The passwords do not match"
            patternValue={new RegExp(watch('password'))}
          />
          <Button type="submit" isPending={isPending}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
