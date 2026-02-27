'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useForm } from 'react-hook-form';

// import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiAuthLoginUser } from '@/api/users-auth/users-auth';
import FormInput from '@/components/common/FormInput';
import { ArrowNarrowLeft } from '@/components/ui/Icons/common';
import { Button } from '@/components/ui/button';
import { emailOrUsernameSchema } from '@/constants/zod-schema';
import { usePathTracker } from '@/hooks/usePathTracker';
import { useSubmitOnCtrlEnter } from '@/hooks/useSubmitOnCtrlEnter';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface ILoginForm {
  login: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        /* Fixed by Codex on 2026-02-09
           Problem: The login success toast fired on every successful sign-in, creating redundant noise.
           Solution: Commented out the success toast so login transitions directly to navigation.
           Result: Users are redirected after login without an extra toast. */
        // toast.success('Logged in successfully');
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
        const requestedRedirect = searchParams?.get('redirect');
        const safeRedirect =
          requestedRedirect &&
          requestedRedirect.startsWith('/') &&
          !requestedRedirect.startsWith('/auth')
            ? requestedRedirect
            : null;
        const previousPath = getPreviousPath();

        // Redirect logic
        if (safeRedirect) {
          router.push(safeRedirect);
        } else if (previousPath && !previousPath.startsWith('/auth')) {
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

  const formRef = React.useRef<HTMLFormElement>(null);

  useSubmitOnCtrlEnter(formRef, isPending);

  return (
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Replace auth page hard-coded colors with design tokens.
          Why: Enable UI skins to swap palettes without touching component markup.
          How: Swap black/white/gray utilities for semantic token classes. */}
      <div className="relative flex h-dvh flex-col items-center justify-center bg-common-background p-4 sm:p-0">
        <Image
          src="/images/assets/bg-auth-pages.webp"
          alt=""
          aria-hidden="true"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        {/* Left side */}
        <div className="relative flex h-fit w-full flex-col gap-6 overflow-y-auto rounded-xl bg-common-cardBackground px-8 py-12 sm:w-[540px] sm:justify-center sm:p-16 md:shadow-common">
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Replace clickable div/image with real buttons.
              Why: Non-button click targets are not keyboard accessible.
              How: Use button elements with aria-labels for back and home actions. */}
          <button
            type="button"
            aria-label="Go back"
            className="absolute left-6 top-6 flex flex-row items-center text-sm md:hidden"
            onClick={() => router.back()}
          >
            <ArrowNarrowLeft className="text-text-primary" />
          </button>
          <button
            type="button"
            aria-label="Go to SciCommons home"
            className="mx-auto mb-2 md:mb-4"
            onClick={() => router.push('/')}
          >
            <Image alt="SciCommons logo" width={60} height={20} src={'/logo.png'} />
          </button>
          <h4 className="text-xl font-bold text-text-primary md:text-2xl">
            Sign in to your account
          </h4>
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto flex w-full flex-col space-y-4"
          >
            <FormInput<ILoginForm>
              label="Username or Email"
              name="login"
              type="text"
              placeholder="Username or Email"
              register={register}
              requiredMessage="Username or Email is required"
              schema={emailOrUsernameSchema}
              errors={errors}
              labelClassName="text-text-primary"
              helperTextClassName="text-text-tertiary"
              inputClassName="bg-common-minimal text-text-primary ring-common-contrast"
              autoFocus
            />
            <FormInput<ILoginForm>
              label="Password"
              name="password"
              type="password"
              placeholder="Password"
              register={register}
              requiredMessage="Password is required"
              errors={errors}
              labelClassName="text-text-primary"
              helperTextClassName="text-text-tertiary"
              inputClassName="bg-common-minimal text-text-primary ring-common-contrast"
              eyeBtnClassName="text-text-tertiary hover:text-text-secondary"
            />
            {/* Remember me and forgot password */}
            <div className="mb-6 flex items-center justify-between res-text-sm">
              {/* <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-common-contrast text-functional-blue focus:ring-functional-blue"
                />
                <label htmlFor="remember_me" className="ml-2 block text-text-primary">
                  Remember me
                </label>
              </div> */}
              <div className="">
                <Link
                  href="/auth/forgotpassword"
                  className="text-sm text-functional-green hover:text-functional-greenContrast hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <Button type="submit" loading={isPending} className="w-full" showLoadingSpinner={true}>
              Login
            </Button>
          </form>
          <div className="mt-4 text-xs">
            <p className="text-text-tertiary">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-functional-green hover:underline">
                Sign up for free
              </Link>
            </p>
            <p className="text-text-tertiary">
              Didn&apos;t receive verification email?{' '}
              <Link
                href="/auth/resendverificationemail"
                className="text-functional-green hover:underline"
              >
                Resend verification email
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuthRedirect(LoginForm);