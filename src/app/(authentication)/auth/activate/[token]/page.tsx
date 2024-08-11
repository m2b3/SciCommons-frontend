'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { useUsersApiAuthActivate } from '@/api/users-auth/users-auth';
import { ErrorMessage } from '@/constants';

const ActivateAccount = ({ params }: { params: { token: string } }) => {
  const router = useRouter();
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const { mutate: activateAccount, isPending, error, isError } = useUsersApiAuthActivate();

  useEffect(() => {
    if (!isActivated) {
      activateAccount(
        { token: params.token },
        {
          onSuccess: () => {
            setIsActivated(true);
            toast.success('Account activated successfully! Redirecting to login page...');
          },
        }
      );
    }
  }, [activateAccount, isActivated, params.token]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActivated) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/auth/login');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActivated, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="w-full max-w-md rounded-md p-6 md:bg-white md:shadow-md md:dark:bg-gray-900">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center">
            <Image src="/auth/activateaccount.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isPending
              ? 'Activating your Account...'
              : isError
                ? error?.response?.data.message || ErrorMessage
                : 'Account Activated'}
          </h1>
          <div className="mt-2 text-gray-500 dark:text-gray-400">
            {isPending ? (
              <div className="mt-4 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-brand"></div>
              </div>
            ) : isError ? (
              `${error?.response?.data.message || ErrorMessage}`
            ) : (
              `Your account has been activated successfully! Redirecting to login page in ${countdown} seconds...`
            )}
          </div>
        </div>
        <Link
          href="/auth/login"
          className="mt-4 flex items-center justify-center text-brand transition-colors duration-300 hover:text-brand-dark dark:text-brand-dark dark:hover:text-brand"
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
      </div>
    </div>
  );
};

export default ActivateAccount;
