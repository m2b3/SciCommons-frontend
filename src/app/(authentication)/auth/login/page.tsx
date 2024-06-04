'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import clsx from 'clsx';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useUsersApiLoginUser } from '@/api/users/users';
import FormInput from '@/components/FormInput';
import { useAuthStore } from '@/stores/authStore';

interface ILoginForm {
  login: string; // Can be either username or email
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();

  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginForm>({
    mode: 'onChange',
  });

  const { error, data, isSuccess, isPending, mutate: logInUser } = useUsersApiLoginUser();

  const onSubmit = (data: ILoginForm) => {
    logInUser({ data });
  };

  useEffect(() => {
    if (error) {
      toast.error(
        `Error: ${(error as { response: { data: { detail: string } } })?.response?.data?.detail || 'An error occurred'}`,
        {
          position: 'bottom-right',
        }
      );
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Login successful!', {
        position: 'bottom-right',
      });

      // console.log('Data:', data.data.token);
      setAccessToken(data.data.token);

      router.push('/');
    }
  }, [isSuccess, router, setAccessToken, data]);

  return (
    <div className="flex h-screen flex-col dark:bg-gray-900 md:flex-row">
      {/* Left side */}
      <div className="flex h-full flex-col justify-center p-12 md:w-1/2">
        <h1 className="mb-4 text-4xl font-bold">Good to See You Again!</h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Join a vibrant community of researchers, share your latest work, and receive valuable
          feedback. Log in now to start rating and commenting on scientific articles, and take your
          research to the next level.
        </p>
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
          />
          <FormInput<ILoginForm>
            label="Password"
            name="password"
            type="password"
            placeholder="Password"
            register={register}
            requiredMessage="Password is required"
            errors={errors}
          />
          {/* Remember me and forgot password */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-400"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link href="/auth/forgotpassword" className="text-green-500 hover:text-green-400">
                Forgot your password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className={clsx(
              'flex w-full justify-center rounded-md border border-transparent bg-brand px-4 py-2 font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
              {
                'hover:bg-brand-dark': !isPending,
                'cursor-not-allowed opacity-50': isPending,
              }
            )}
            disabled={isPending}
          >
            {isPending // Default values shown
              ? 'Loading...'
              : 'Login'}
          </button>
        </form>
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-green-500">
              Sign up for free
            </Link>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Didn&apos;t receive signup email?{' '}
            <Link href="/auth/resendverificationemail" className="text-green-500">
              Resend Sign up email
            </Link>
          </p>
        </div>
      </div>
      {/* Right side */}
      <div className="relative hidden h-full bg-cover bg-center md:block md:w-1/2">
        <Image src="/auth/login.png" alt="Background" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 mb-12 hidden items-end justify-center md:flex">
          <div className="max-w-md rounded-xl bg-white bg-opacity-[0.25] p-2 shadow-lg backdrop-blur-sm md:p-6">
            <p className="text-sm font-medium text-gray-800 md:text-base lg:text-lg">
              &quot;When something is important enough, you do it even if the odds are not in your
              favor.&quot;- Elon Musk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
