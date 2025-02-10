'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthRequestReset } from '@/api/users-auth/users-auth';
import Button from '@/components/common/Button';
import FormInput from '@/components/common/FormInput';
import { showErrorToast } from '@/lib/toastHelpers';

interface IForgotPasswordForm {
  email: string;
}

const ForgotPasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordForm>({
    mode: 'onChange',
  });

  const { isSuccess, mutate, isPending } = useUsersApiAuthRequestReset({
    mutation: {
      onSuccess: () => {
        toast.success('Password reset email sent successfully', {
          duration: 2000,
          position: 'top-right',
        });
      },
      onError: (err) => {
        showErrorToast(err);
      },
    },
  });

  const onSubmit = (data: IForgotPasswordForm) => {
    mutate({ email: data.email });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md rounded-md p-6 res-text-sm md:bg-white md:shadow-md md:dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Image src="/auth/forgotpassword.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 font-bold res-text-xl">
            {isSuccess ? 'Password Reset Email Sent' : 'Forgot Your Password'}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {' '}
            {isSuccess
              ? 'We have sent you an email with instructions to reset your password.'
              : 'Enter your email address to receive a password reset link.'}
          </p>
        </div>
        {isSuccess ? (
          <>
            <Link
              href="/auth/login"
              className="mt-4 flex items-center justify-center text-brand hover:text-brand-dark dark:text-brand-dark dark:hover:text-brand"
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
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-2 p-4">
            <FormInput<IForgotPasswordForm>
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
                Send Reset Link
              </Button>
              <Link
                href="/auth/login"
                className="mt-2 flex items-center justify-center text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
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
        )}
      </div>
    </div>
  );
};

export default withAuthRedirect(ForgotPasswordForm);
