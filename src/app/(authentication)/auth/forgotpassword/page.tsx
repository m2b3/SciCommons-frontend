'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { MoveLeftIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthRequestReset } from '@/api/users-auth/users-auth';
import FormInput from '@/components/common/FormInput';
import { Button, ButtonTitle } from '@/components/ui/button';
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
        toast.success('Password reset email sent successfully');
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
    <div className="relative flex h-dvh flex-col items-center justify-center bg-black p-4 sm:p-0">
      <Image
        src="/images/assets/bg-auth-pages.webp"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="relative flex h-fit w-full flex-col gap-6 overflow-y-auto rounded-xl bg-white px-8 py-12 sm:w-[540px] sm:justify-center sm:px-10 sm:py-14 md:shadow-[0px_4px_200px_-40px_rgba(66,182,95,0.5)]">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Image src="/auth/forgotpassword.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="text- mt-4 font-bold text-black res-text-xl">
            {isSuccess ? 'Password Reset Email Sent' : 'Forgot Your Password'}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
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
              className="mt-2 flex items-center justify-center text-xs text-functional-green hover:underline"
            >
              <MoveLeftIcon className="mr-1 size-4 shrink-0" />
              Back to Sign in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-2">
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
              inputClassName="bg-neutral-150 text-black ring-neutral-200"
            />
            <div>
              <Button type="submit" loading={isPending} showLoadingSpinner className="w-full">
                <ButtonTitle>Send Reset Link</ButtonTitle>
              </Button>
              <Link
                href="/auth/login"
                className="mt-2 flex items-center justify-center text-xs text-functional-green hover:underline"
              >
                <MoveLeftIcon className="mr-1 size-4 shrink-0" />
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
