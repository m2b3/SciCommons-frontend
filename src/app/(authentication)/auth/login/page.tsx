'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthLoginUser } from '@/api/users-auth/users-auth';
import FormInput from '@/components/common/FormInput';
import { ArrowNarrowLeft } from '@/components/ui/Icons/common';
import { Button } from '@/components/ui/button';
import { usePathTracker } from '@/hooks/usePathTracker';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface ILoginForm {
  login: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { getPreviousPath } = usePathTracker();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>({
    mode: 'onChange',
  });

  const { isPending, mutate: logInUser } = useUsersApiAuthLoginUser({
    mutation: {
      onSuccess: (data) => {
        toast.success('Logged in successfully');
        setAccessToken(
          data.data.token,
          data.data.user || {
            id: 0,
            username: '',
            email: '',
            first_name: '',
            last_name: '',
          }
        );
        const previousPath = getPreviousPath();

        // Redirect logic
        if (previousPath && !previousPath.startsWith('/auth')) {
          router.push(previousPath);
        } else {
          router.push('/'); // Redirect to home if previous path is auth-related or not available
        }
      },
      onError: (err) => {
        showErrorToast(err);
      },
    },
  });

  const onSubmit = (data: ILoginForm) => {
    logInUser({ data });
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
      {/* Left side */}
      <div className="relative flex h-fit w-full flex-col gap-6 overflow-y-auto rounded-xl bg-white px-8 py-12 sm:w-[540px] sm:justify-center sm:p-16 md:shadow-[0px_4px_200px_-40px_rgba(66,182,95,0.5)]">
        <div
          className="absolute left-6 top-6 flex cursor-pointer flex-row items-center text-sm md:hidden"
          onClick={() => router.back()}
        >
          <ArrowNarrowLeft className="text-black" />
        </div>
        <Image
          alt="scicommons_logo"
          width={60}
          height={20}
          src={'/logo.png'}
          className="mx-auto mb-2 md:mb-4"
          onClick={() => router.push('/')}
        />
        <h4 className="text-xl font-bold text-black md:text-2xl">Sign in to your account</h4>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full flex-col space-y-4">
          <FormInput<ILoginForm>
            label="Username or Email"
            name="login"
            type="text"
            placeholder="Username or Email"
            register={register}
            requiredMessage="Username or Email is required"
            patternValue={/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$|^\w+$/}
            patternMessage="Enter a valid email or username"
            errors={errors}
            labelClassName="text-black/90"
            helperTextClassName="text-black/60"
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
          />
          <FormInput<ILoginForm>
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
            register={register}
            requiredMessage="Password is required"
            errors={errors}
            labelClassName="text-black/90"
            helperTextClassName="text-black/60"
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
            eyeBtnClassName="text-black/40 hover:text-black/60"
          />
          {/* Remember me and forgot password */}
          <div className="mb-6 flex items-center justify-between res-text-sm">
            {/* <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
              />
              <label htmlFor="remember_me" className="ml-2 block text-gray-900 dark:text-gray-400">
                Remember me
              </label>
            </div> */}
            <div className="">
              <Link
                href="/auth/forgotpassword"
                className="text-functional-green hover:text-functional-greenContrast hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
          <Button type="submit" loading={isPending} className="w-full" showLoadingSpinner={true}>
            Login
          </Button>
        </form>
        <div className="mt-4 res-text-sm">
          <p className="text-text-tertiary">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-functional-green hover:underline">
              Sign up for free
            </Link>
          </p>
          <p className="text-text-tertiary">
            Didn&apos;t receive signup email?{' '}
            <Link
              href="/auth/resendverificationemail"
              className="text-functional-green hover:underline"
            >
              Resend Sign up email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default withAuthRedirect(LoginForm);
