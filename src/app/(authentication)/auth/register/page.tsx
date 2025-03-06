'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthSignup } from '@/api/users-auth/users-auth';
import Button from '@/components/common/Button';
import FormInput from '@/components/common/FormInput';
import { ArrowNarrowLeft } from '@/components/ui/Icons/common';
import { emailSchema, matchPassword, passwordSchema, usernameSchema } from '@/constants/zod-schema';
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
  const router = useRouter();
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
    <div className="flex h-dvh flex-col p-4 md:flex-row md:p-0">
      <Image
        src="/images/assets/bg-auth-pages.webp"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0 md:hidden"
      />
      {/* Left Side */}
      <div className="relative overflow-hidden md:w-1/2">
        <Image
          src="/images/assets/bg-auth-pages.webp"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="relative z-10 hidden h-fit items-start justify-center md:flex">
          <div className="z-20 flex w-full flex-col gap-8 md:pl-10 md:pr-12 md:pt-24 lg:pl-24 lg:pt-24">
            <h1 className="text-4xl font-bold text-white">
              Join <span className="text-brand">SciCommons</span>
            </h1>
            <span className="text-sm text-white">
              Sign up to access an online hub of research papers, comments, and ratings, and engage
              with a global community of researchers.
            </span>
            <div className="relative mt-12 overflow-hidden rounded-lg md:h-[400px] md:w-[720px] lg:h-[600px] lg:w-[1080px]">
              <Image
                src="/images/assets/screenshot.png"
                alt="Logo"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="relative flex h-full flex-col gap-4 overflow-y-auto rounded-xl bg-white p-10 md:w-1/2 md:rounded-none md:px-8 md:py-10 lg:px-24">
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
          className="mx-auto mb-2 md:mb-6"
          onClick={() => router.push('/')}
        />
        <h4 className="text-xl font-bold text-black md:text-2xl">Create your free Account</h4>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full flex-col space-y-4">
          <FormInput
            label="Username"
            name="username"
            type="text"
            placeholder="e.g., john_doe"
            register={register}
            schema={usernameSchema}
            requiredMessage="Username is required"
            errors={errors}
            isSubmitting={isSubmitting}
            helperText="3-30 characters. No spaces or special symbols."
            labelClassName="text-black/90"
            helperTextClassName="text-black/60"
            inputClassName="bg-white text-black"
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
              labelClassName="text-black/90"
              inputClassName="bg-white text-black"
            />
            <FormInput
              label="Last Name"
              name="last_name"
              type="text"
              placeholder="Last Name"
              register={register}
              requiredMessage="Last Name is required"
              errors={errors}
              labelClassName="text-black/90"
              inputClassName="bg-white text-black"
            />
          </div>
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="e.g., john.doe@example.com"
            register={register}
            requiredMessage="Email is required"
            schema={emailSchema}
            errors={errors}
            labelClassName="text-black/90"
            inputClassName="bg-white text-black"
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password"
            register={register}
            requiredMessage="Password is required"
            schema={passwordSchema}
            //minLengthValue={8}
            //minLengthMessage="Password must be at least 8 characters long."
            errors={errors}
            labelClassName="text-black/90"
            inputClassName="bg-white text-black"
          />
          <FormInput
            label="Confirm Password"
            name="confirm_password"
            type="password"
            placeholder="Confirm your password"
            register={register}
            requiredMessage="Confirm Password is required"
            errors={errors}
            schema={matchPassword(new RegExp(watch('password')))}
            labelClassName="text-black/90"
            inputClassName="bg-white text-black"
          />

          <Button type="submit" isPending={isPending}>
            Sign Up
          </Button>
        </form>

        <p className="text-gray-800 res-text-sm dark:text-gray-300">
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
