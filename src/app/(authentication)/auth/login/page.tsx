'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthLoginUser } from '@/api/users-auth/users-auth';
import Button from '@/components/common/Button';
import FormInput from '@/components/common/FormInput';
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
        setAccessToken(data.data.token);
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
    <div className="flex h-screen flex-col dark:bg-gray-900 md:flex-row">
      {/* Left side */}
      <div className="flex h-full flex-col justify-center p-12 md:w-1/2">
        <h1 className="mb-4 font-bold res-heading-lg dark:text-gray-200">Good to See You Again!</h1>
        <p className="mb-8 hidden text-gray-600 res-text-sm dark:text-gray-400 md:block">
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
          <div className="mb-6 flex items-center justify-between res-text-sm">
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
              />
              <label htmlFor="remember_me" className="ml-2 block text-gray-900 dark:text-gray-400">
                Remember me
              </label>
            </div>
            <div className="">
              <Link href="/auth/forgotpassword" className="text-green-500 hover:text-green-400">
                Forgot your password?
              </Link>
            </div>
          </div>
          <Button type="submit" isPending={isPending}>
            Login
          </Button>
        </form>
        <div className="mt-4 res-text-sm">
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
        <Image src="/auth/login.jpg" alt="Background" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 mb-12 hidden items-end justify-center md:flex">
          <div className="max-w-md rounded-xl bg-white bg-opacity-[0.25] p-2 shadow-lg backdrop-blur-sm md:p-6">
            <p className="font-medium text-gray-800 res-text-lg">
              &quot;We cannot solve our problems with the same thinking we used when we created
              them.&quot; - Albert Einstein
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthRedirect(LoginForm);
