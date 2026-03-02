'use client';

import React from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthResetPassword } from '@/api/users-auth/users-auth';
import FormInput from '@/components/common/FormInput';
import { Button } from '@/components/ui/button';
import { matchPassword, passwordSchema } from '@/constants/zod-schema';
import { showErrorToast } from '@/lib/toastHelpers';

interface IResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPasswordForm = ({ params }: { params: { token: string } }) => {
  const router = useRouter();
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
        showErrorToast(err);
      },
    },
  });

  const onSubmit = (data: IResetPasswordForm) => {
    mutate({
      token: params.token,
      data: {
        password: data.password,
        confirm_password: data.confirmPassword,
      },
    });
  };

  return (
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Swap reset-password styling to token-driven colors.
          Why: Allow skin variants to change the palette without code edits.
          How: Replace fixed black/white utilities with design tokens. */}
      <div className="relative flex h-dvh flex-col items-center justify-center bg-common-background p-4 sm:p-0">
        <Image
          src="/images/assets/bg-auth-pages.webp"
          alt=""
          aria-hidden="true"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="relative flex h-fit w-full flex-col gap-6 overflow-y-auto rounded-xl bg-common-cardBackground px-8 py-12 sm:w-[540px] sm:justify-center sm:px-10 sm:py-14 md:shadow-common">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Image
                src="/auth/resetpassword.png"
                alt="Reset password illustration"
                width={80}
                height={80}
              />
            </div>
            <h1 className="mt-4 font-bold text-text-primary res-text-xl">Reset Password</h1>
            <p className="mt-2 text-sm text-text-secondary">
              {' '}
              Enter your new password and confirm it to reset your password.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
            <FormInput<IResetPasswordForm>
              label="Password"
              name="password"
              type="password"
              placeholder="Password"
              register={register}
              requiredMessage="Password is required"
              schema={passwordSchema}
              errors={errors}
              inputClassName="bg-common-minimal text-text-primary ring-common-contrast"
              eyeBtnClassName="text-text-tertiary hover:text-text-secondary"
            />
            <FormInput<IResetPasswordForm>
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              register={register}
              requiredMessage="Confirm Password is required"
              schema={matchPassword(watch('password') || '')}
              errors={errors}
              inputClassName="bg-common-minimal text-text-primary ring-common-contrast"
              eyeBtnClassName="text-text-tertiary hover:text-text-secondary"
            />
            <Button type="submit" loading={isPending} showLoadingSpinner className="w-full">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default withAuthRedirect(ResetPasswordForm);
