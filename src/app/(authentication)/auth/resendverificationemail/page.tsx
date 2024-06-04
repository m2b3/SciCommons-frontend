'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useForm } from 'react-hook-form';

import FormInput from '@/components/FormInput';

interface IResendForm {
  email: string;
}

const ResendVerificationForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IResendForm>({
    mode: 'onChange',
  });

  const onSubmit = async (data: IResendForm) => {
    console.log(data);
    try {
      // Assume a function sendVerificationEmail() that sends the email
    } catch (error) {}
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md rounded-md bg-white p-6 shadow-md dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Image src="/auth/resendemail.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 text-2xl font-bold"> Resend Verification Email</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {' '}
            Enter your email address to receive a new verification email.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-md p-4">
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
          />
          <button
            type="submit"
            className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Resend Verification Email
          </button>
          <Link
            href="/auth/login"
            className="mt-4 flex items-center justify-center text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Sign in
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResendVerificationForm;
