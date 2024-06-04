'use client';

import React from 'react';

import Image from 'next/image';

import { useForm } from 'react-hook-form';

import FormInput from '@/components/FormInput';

interface IResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IResetPasswordForm>({
    mode: 'onChange',
  });

  const onSubmit = async (data: IResetPasswordForm) => {
    console.log(data);
    // Here, you should have the logic to send the new password to your backend
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md rounded-md bg-white p-6 shadow-md dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Image src="/auth/resetpassword.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 text-2xl font-bold"> Reset Password</h1>
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
          <button
            type="submit"
            className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
