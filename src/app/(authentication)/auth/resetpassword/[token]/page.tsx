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
            <Image src="/auth/resetpassword.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 font-bold text-black res-text-xl">Reset Password</h1>
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
            minLengthValue={8}
            minLengthMessage="Password must be at least 8 characters"
            errors={errors}
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
            eyeBtnClassName="text-black/40 hover:text-black/60"
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
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
            eyeBtnClassName="text-black/40 hover:text-black/60"
          />
          <Button type="submit" loading={isPending} showLoadingSpinner className="w-full">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default withAuthRedirect(ResetPasswordForm);
