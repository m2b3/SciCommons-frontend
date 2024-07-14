'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useUsersApiAuthResendActivation } from '@/api/users-auth/users-auth';
import FormInput from '@/components/FormInput';
import Button from '@/components/common/Button';

interface IResendForm {
  email: string;
}

const ResendVerificationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IResendForm>({
    mode: 'onChange',
  });

  const { mutate, isPending } = useUsersApiAuthResendActivation({
    mutation: {
      onSuccess: () => {
        toast.success('Verification email sent successfully');
      },
      onError: (err) => {
        toast.error(err.response?.data.message || 'An error occurred');
      },
    },
  });

  const onSubmit = (data: IResendForm) => {
    mutate({ email: data.email });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md rounded-md p-6 md:bg-white md:shadow-md md:dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Image src="/auth/resendemail.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 font-bold res-heading-base dark:text-white">
            {' '}
            Resend Verification Email
          </h1>
          <p className="mt-2 text-gray-500 res-text-sm dark:text-gray-400">
            {' '}
            Enter your email address to receive a new verification email.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex max-w-md flex-col gap-4 p-4"
        >
          <FormInput<IResendForm>
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            register={register}
            requiredMessage="Email is required"
            patternValue={/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/}
            patternMessage="Enter a valid email address"
            errors={errors}
          />
          <div>
            <Button type="submit" isPending={isPending}>
              Resend Verification Email
            </Button>
            <Link
              href="/auth/login"
              className="mt-2 flex items-center justify-center text-green-500 res-text-sm hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResendVerificationForm;
