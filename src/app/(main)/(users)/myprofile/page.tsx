'use client';

import React, { useEffect, useMemo } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// NOTE(Codex for bsureshkrishna, 2026-02-09): Gate profile behind auth to prevent
// unauthenticated access to user data editing.
import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useUsersApiUpdateUser } from '@/api/users/users';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Option } from '@/components/ui/multiple-selector';
import { useCurrentUser, useInvalidateCurrentUser } from '@/hooks/useCurrentUser';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import PersonalLinks from './PersonalLinks';
import ProfessionalStatus from './ProfessionalStatus';
import Profile from './Profile';
import ResearchInterests from './ResearchInterests';

// Todo: Optimize the code

export interface IProfileForm {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  profilePicture?: FileList;
  homePage: string;
  linkedIn: string;
  github: string;
  googleScholar: string;
  professionalStatuses: Array<{
    status: string;
    startYear: string;
    endYear: string;
    isOngoing?: boolean;
  }>;
  researchInterests: Option[];
}

const Home: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const imageData = useIdenticon(40);

  const [editMode, setEditMode] = React.useState(false);

  const { data, error } = useCurrentUser();
  const { invalidateUser } = useInvalidateCurrentUser();

  const methods = useForm<IProfileForm>({
    defaultValues: {
      professionalStatuses: [],
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = methods;

  const { mutate, isPending } = useUsersApiUpdateUser({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        // Invalidate user cache to refetch and update all components using user data
        /* Fixed by Codex on 2026-02-26
           Who: Codex
           What: Removed eager form reset on successful profile update.
           Why: `reset()` without explicit values reused stale default values and could show pre-save data until refetch completed.
           How: Keep the current form values intact, exit edit mode, and rely on cache invalidation/refetch to refresh canonical defaults. */
        invalidateUser();
        setEditMode(false);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const onSubmit = (formData: IProfileForm) => {
    /* Fixed by Codex on 2026-02-27
       Who: Codex
       What: Normalize optional link and status payload fields before profile update.
       Why: Validation allowed whitespace-only optional links and untrimmed status text, which could be sent as raw spaces.
       How: Trim link/status/year strings once at submit-time and use normalized values for validation + API payload. */
    const normalizedLinks = {
      homePage: formData.homePage.trim(),
      linkedIn: formData.linkedIn.trim(),
      github: formData.github.trim(),
      googleScholar: formData.googleScholar.trim(),
    };
    const normalizedStatuses = formData.professionalStatuses.map((status) => ({
      ...status,
      status: status.status.trim(),
      startYear: status.startYear.trim(),
      endYear: status.endYear.trim(),
    }));

    const dataToSend = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      bio: formData.bio,
      home_page_url: normalizedLinks.homePage,
      linkedin_url: normalizedLinks.linkedIn,
      github_url: normalizedLinks.github,
      google_scholar_url: normalizedLinks.googleScholar,
      academic_statuses: normalizedStatuses.map((status) => ({
        academic_email: status.status,
        start_year: status.startYear,
        end_year: status.isOngoing ? null : status.endYear,
      })),
      research_interests: formData.researchInterests.map((interest) => interest.value),
    };

    /* Fixed by Codex on 2026-02-22
       Who: Codex
       What: Harden submit-time year validation for professional statuses.
       Why: Non-numeric or malformed year strings could pass the previous Number/parse checks.
       How: Enforce 4-digit year format for start/end and keep range/order checks against the current year. */
    const invalidYear = normalizedStatuses.some((s) => {
      const currentYear = new Date().getFullYear();

      if (!/^\d{4}$/.test(s.startYear)) return true;
      const start = Number(s.startYear);
      if (start < 1950 || start > currentYear) return true;

      if (!s.isOngoing) {
        if (!/^\d{4}$/.test(s.endYear)) return true;
        const end = Number(s.endYear);
        if (end < start) return true;
        if (end > currentYear) return true;
      }

      return false;
    });

    if (invalidYear) {
      toast.error('Enter valid years: use 4-digit years between 1950 and the current year.');
      return;
    }

    mutate({
      data: {
        payload: { details: dataToSend },
        profile_image:
          formData.profilePicture && formData.profilePicture.length > 0
            ? formData.profilePicture[0]
            : undefined,
      },
    });
  };

  const onInvalid = () => {
    toast.error('Please fix the highlighted fields before saving.');
  };

  useEffect(() => {
    if (data) {
      reset(
        {
          username: data.data.username,
          firstName: data.data.first_name || '',
          lastName: data.data.last_name || '',
          email: data.data.email || '',
          bio: data.data.bio || '',
          homePage: data.data.home_page_url || '',
          linkedIn: data.data.linkedin_url || '',
          github: data.data.github_url || '',
          googleScholar: data.data.google_scholar_url || '',
          profilePicture: undefined,
          professionalStatuses: data.data.academic_statuses.map((status) => ({
            status: status.academic_email,
            startYear: String(status.start_year),
            endYear: status.end_year ? String(status.end_year) : '',
            isOngoing: status.end_year === null,
          })),
          researchInterests: data.data.research_interests.map((interest) => ({
            label: interest,
            value: interest,
          })),
        },
        { keepValues: false }
      );
    }
  }, [data, reset]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const currentValues = watch();

  const isActuallyDirty = useMemo(() => {
    if (!data) return false;
    /* Fixed by Codex on 2026-02-26
       Who: Codex
       What: Reworked dirty-state comparison typing for profile form.
       Why: Previous `any` casts and unused destructuring weakened type safety and produced lint warnings.
       How: Compare non-file form fields with typed partial defaults and detect file input changes separately. */
    const { profilePicture: currentPic, ...cleanCurrentData } = currentValues;
    const defaultValues = methods.formState.defaultValues as Partial<IProfileForm> | undefined;
    const { profilePicture: _defaultPic, ...cleanDefaultData } = defaultValues || {};
    const isDataChanged = JSON.stringify(cleanCurrentData) !== JSON.stringify(cleanDefaultData);
    const isPicChanged = Boolean(currentPic?.length);
    return isDataChanged || isPicChanged;
  }, [currentValues, methods.formState.defaultValues, data]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="py-8 res-text-sm">
        <div className="container mx-auto px-4">
          <Profile
            errors={errors}
            editMode={editMode}
            setEditMode={setEditMode}
            profilePicture={data?.data.profile_pic_url || `data:image/png;base64,${imageData}`}
            isPending={isPending}
            isActuallyDirty={isActuallyDirty}
          />
          <PersonalLinks errors={errors} editMode={editMode} />
          <ProfessionalStatus errors={errors} editMode={editMode} />
          <ResearchInterests editMode={editMode} />
          {editMode && (
            <div className="mx-auto mt-6 flex max-w-4xl gap-4">
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  reset();
                  setEditMode(false);
                }}
                className="w-full border border-common-contrast bg-common-cardBackground text-text-primary hover:bg-common-minimal"
              >
                <ButtonTitle>Cancel</ButtonTitle>
              </Button>
              <Button
                type="submit"
                disabled={isPending || !isActuallyDirty}
                className={`w-full ${!isActuallyDirty ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <ButtonTitle>Save Changes</ButtonTitle>
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

// NOTE(Codex for bsureshkrishna, 2026-02-09): Enforce auth requirement for profile.
export default withAuthRedirect(Home, { requireAuth: true });
