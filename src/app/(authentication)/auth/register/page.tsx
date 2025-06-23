'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthSignup } from '@/api/users-auth/users-auth';
import FormInput from '@/components/common/FormInput';
import { ArrowNarrowLeft } from '@/components/ui/Icons/common';
import { Button } from '@/components/ui/button';
import {
  getPasswordRequirementsStatus,
  getPasswordStrength,
  passwordRegex,
  passwordRequirements,
} from '@/lib/formValidation';
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

  const password = watch('password') || '';
  const passwordStatus = getPasswordRequirementsStatus(password);
  const passwordStrength = getPasswordStrength(password);

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
              Join <span className="text-functional-green">SciCommons</span>
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
          className="mx-auto mb-2 cursor-pointer md:mb-6"
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
            labelClassName="text-black/90"
            helperTextClassName="text-black/60"
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
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
              inputClassName="bg-neutral-150 text-black ring-neutral-200"
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
              inputClassName="bg-neutral-150 text-black ring-neutral-200"
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
            labelClassName="text-black/90"
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password"
            register={register}
            requiredMessage="Password is required"
            patternValue={passwordRegex}
            patternMessage="Password must be at least 8 characters, include uppercase, lowercase, digit, and special character."
            errors={errors}
            labelClassName="text-black/90"
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
            eyeBtnClassName="text-black/40 hover:text-black/60"
          />

          {/* Password requirements checklist */}
          <div className="-mt-2 mb-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-black/70">Password strength:</span>
              <div className="h-2 w-32 rounded bg-gray-200">
                <div
                  className={`h-2 rounded transition-all duration-300 ${
                    passwordStrength <= 2
                      ? 'w-1/5 bg-red-400'
                      : passwordStrength === 3
                        ? 'w-3/5 bg-yellow-400'
                        : passwordStrength === 4
                          ? 'w-4/5 bg-blue-400'
                          : 'w-full bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength / passwordRequirements.length) * 100}%` }}
                />
              </div>
            </div>
            <ul className="space-y-1 text-xs text-black/60">
              {passwordRequirements.map((req, idx) => (
                <li key={req.label} className="flex items-center gap-1">
                  <span
                    className={`inline-block h-3 w-3 rounded-full border ${
                      passwordStatus[idx]
                        ? 'border-green-400 bg-green-400'
                        : 'border-gray-300 bg-white'
                    }`}
                  />
                  {req.label}
                </li>
              ))}
            </ul>
          </div>

          <FormInput
            label="Confirm Password"
            name="confirm_password"
            type="password"
            placeholder="Re-enter your password"
            register={register}
            requiredMessage="Confirm your password"
            validateFn={(value) => value === watch('password') || 'Passwords do not match'}
            errors={errors}
            labelClassName="text-black/90"
            inputClassName="bg-neutral-150 text-black ring-neutral-200"
            eyeBtnClassName="text-black/40 hover:text-black/60"
          />

          <Button type="submit" loading={isPending} className="w-full" showLoadingSpinner={true}>
            Sign Up
          </Button>
        </form>

        <p className="text-text-tertiary res-text-sm">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="hover-text-functional-greenContrast text-functional-green hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default withAuthRedirect(RegisterForm);
