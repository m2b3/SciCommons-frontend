'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthSignup } from '@/api/users-auth/users-auth';
import Button from '@/components/common/Button';
import FormInput from '@/components/common/FormInput';
import { showErrorToast } from '@/lib/toastHelpers';

import SignUpSuccess from './SignUpSuccess';

interface IFormInput {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IFormInput>({
    mode: 'onChange',
  });

  const {
    isPending,
    isSuccess,
    mutate: signUp,
  } = useUsersApiAuthSignup({
    mutation: {
      onSuccess: () => {
        toast.success('Registration successful! Please check your email to verify your account.');
      },
      onError: (err) => {
        showErrorToast(err);
      },
    },
  });

  const onSubmit = (data: IFormInput) => {
    signUp({ data });
  };

  useEffect(() => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      document.getElementById(firstErrorField)?.focus();
    }
  }, [errors]);

  if (isSuccess) {
    return <SignUpSuccess />;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left Side */}
      <div className="relative md:w-1/2">
        <Image src="/auth/register.jpg" alt="Background" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 hidden items-center justify-center md:flex">
          <div className="max-w-md rounded-xl bg-white bg-opacity-[0.25] p-4 shadow-lg backdrop-blur-sm md:p-8">
            <p className="font-medium text-gray-800 res-text-base md:text-lg lg:text-xl">
              Join a global community of researchers and enthusiasts, united by a shared passion for
              scientific discovery. Connect with peers, share your insights, and unlock the power of
              collective knowledge. Together, we can build a better future.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-col justify-center bg-white px-12 py-12 dark:bg-gray-800 md:w-1/2 md:p-12">
        <h1 className="mb-4 font-bold text-gray-800 res-heading-lg dark:text-white">
          Join the Science Revolution
        </h1>
        <p className="rest-text-sm mb-8 hidden text-gray-800 dark:text-gray-300 md:block">
          Sign up to access an online hub of research papers, comments, and ratings, and engage with
          a global community of researchers.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full flex-col space-y-4">
          <FormInput
            label="Username"
            name="username"
            type="text"
            placeholder="e.g., john_doe"
            register={register}
            patternValue={/^[a-z0-9._]+$/}
            patternMessage="Username must only contain lowercase letters, numbers, dots, and underscores."
            requiredMessage="Username is required"
            minLengthValue={3}
            minLengthMessage="Username must be at least 3 characters"
            maxLengthValue={30}
            maxLengthMessage="Username cannot exceed 30 characters"
            errors={errors}
            isSubmitting={isSubmitting}
            helperText="3-30 characters. No spaces or special symbols."
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              name="first_name"
              type="text"
              placeholder="First Name"
              register={register}
              requiredMessage="First Name is required"
              errors={errors}
            />
            <FormInput
              label="Last Name"
              name="last_name"
              type="text"
              placeholder="Last Name"
              register={register}
              requiredMessage="Last Name is required"
              errors={errors}
            />
          </div>

          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="e.g., john.doe@example.com"
            register={register}
            requiredMessage="Email is required"
            patternValue={/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i}
            patternMessage="Enter a valid email address."
            errors={errors}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password"
            register={register}
            requiredMessage="Password is required"
            minLengthValue={8}
            minLengthMessage="Password must be at least 8 characters long."
            errors={errors}
          />

          <FormInput
            label="Confirm Password"
            name="confirm_password"
            type="password"
            placeholder="Confirm your password"
            register={register}
            requiredMessage="Confirm Password is required"
            errors={errors}
            patternValue={new RegExp(watch('password'))}
            patternMessage="Passwords must match."
          />

          <Button type="submit" isPending={isPending}>
            Sign Up
          </Button>
        </form>

        <p className="mt-8 text-gray-800 res-text-sm dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default withAuthRedirect(RegisterForm);
