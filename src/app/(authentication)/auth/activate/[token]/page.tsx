'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { MoveLeftIcon, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
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
            <Image src="/auth/activateaccount.png" alt="logo" width={80} height={80} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-black">
            {isPending
              ? 'Activating your Account...'
              : isError
                ? 'Error Activating Account'
                : 'Account Activated'}
          </h1>
          <div className="mt-2 text-sm text-text-secondary">
            {isPending ? (
              <div className="mt-4 flex justify-center">
                <RefreshCcw className="spin-animation h-8 w-8 shrink-0 text-functional-green" />
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
          className="mt-2 flex items-center justify-center text-xs text-functional-green hover:underline"
        >
          <MoveLeftIcon className="mr-1 size-4 shrink-0" />
          Back to Sign in
        </Link>
      </div>
    </div>
  );
};

export default withAuthRedirect(ActivateAccount);
