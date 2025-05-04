'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { MoveLeftIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthResendActivation } from '@/api/users-auth/users-auth';
import FormInput from '@/components/common/FormInput';
import { Button, ButtonTitle } from '@/components/ui/button';
import { showErrorToast } from '@/lib/toastHelpers';

interface IResendForm {
  email: string;
}

const ResendVerificationForm: React.FC = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

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
        setIsEmailSent(true);
      },
      onError: (err) => {
        showErrorToast(err);
      },
    },
  });

  const onSubmit = (data: IResendForm) => {
    mutate({ email: data.email });
    setSentEmail(data.email);
  };

  const SuccessMessage = () => (
    <div className="text-center">
      <div className="flex items-center justify-center">
        <Image src="/signupsuccess.gif" alt="Email Sent" width={80} height={80} />
      </div>
      <h2 className="mt-4 font-bold text-black res-heading-base">Verification Email Sent!</h2>
      <p className="mt-2 text-sm text-text-secondary">
        We&apos;ve sent a verification email to {sentEmail}. Please check your inbox and follow the
        instructions to verify your account.
      </p>
      <Link
        href="/auth/login"
        className="mt-8 flex items-center justify-center text-xs text-functional-green hover:underline"
      >
        <MoveLeftIcon className="mr-1 size-4 shrink-0" />
        Back to Sign in
      </Link>
    </div>
  );

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center bg-black p-4 sm:p-0">
      <Image
        src="/images/assets/bg-auth-pages.webp"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="relative flex h-fit w-full flex-col gap-10 overflow-y-auto rounded-xl bg-white px-8 py-12 sm:w-[540px] sm:justify-center sm:px-10 sm:py-14 md:shadow-[0px_4px_200px_-40px_rgba(66,182,95,0.5)]">
        {isEmailSent ? (
          <SuccessMessage />
        ) : (
          <>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Image src="/auth/resendemail.png" alt="logo" width={80} height={80} />
              </div>
              <h1 className="mt-4 font-bold text-black res-heading-base">
                Resend Verification Email
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Enter your email address to receive a new verification email.
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                inputClassName="bg-neutral-150 text-black ring-neutral-200"
              />
              <div>
                <Button type="submit" loading={isPending} showLoadingSpinner className="w-full">
                  <ButtonTitle>Resend Verification Email</ButtonTitle>
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
          </>
        )}
      </div>
    </div>
  );
};

export default withAuthRedirect(ResendVerificationForm);
