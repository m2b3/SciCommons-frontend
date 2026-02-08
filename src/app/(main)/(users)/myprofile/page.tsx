'use client';

import React, { useEffect } from 'react';

import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
  profilePicture: FileList;
  homePage: string;
  linkedIn: string;
  github: string;
  googleScholar: string;
  professionalStatuses: Array<{
    status: string;
    startYear: string;
    endYear: string;
  }>;
  researchInterests: Option[];
}

const Home: React.FC = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const imageData = useIdenticon(40);

  const [editMode, setEditMode] = React.useState(false);

  const { data, error } = useCurrentUser();
  const { invalidateUser } = useInvalidateCurrentUser();

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
        invalidateUser();
        setEditMode(false);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const methods = useForm<IProfileForm>({
    defaultValues: {
      professionalStatuses: [{ status: '', startYear: '', endYear: '' }],
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (formData: IProfileForm) => {
    const dataToSend = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      bio: formData.bio,
      home_page_url: formData.homePage,
      linkedin_url: formData.linkedIn,
      github_url: formData.github,
      google_scholar_url: formData.googleScholar,
      academic_statuses: formData.professionalStatuses.map((status) => ({
        academic_email: status.status,
        start_year: status.startYear,
        end_year: status.endYear,
      })),
      research_interests: formData.researchInterests.map((interest) => interest.value),
    };

    mutate({
      data: {
        payload: { details: dataToSend },
        profile_image: formData.profilePicture ? formData.profilePicture[0] : undefined,
      },
    });
  };

  useEffect(() => {
    if (data) {
      methods.reset(
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
            endYear: String(status.end_year),
          })),
          researchInterests: data.data.research_interests.map((interest) => ({
            label: interest,
            value: interest,
          })),
        },
        { keepValues: false }
      );
    }
  }, [data, methods]);

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="py-8 res-text-sm">
        <div className="container mx-auto px-4">
          <Profile
            errors={errors}
            editMode={editMode}
            setEditMode={setEditMode}
            profilePicture={data?.data.profile_pic_url || `data:image/png;base64,${imageData}`}
          />
          <PersonalLinks errors={errors} editMode={editMode} />
          <ProfessionalStatus errors={errors} editMode={editMode} />
          <ResearchInterests editMode={editMode} />
          {editMode && (
            <div className="mx-auto mt-6 max-w-4xl">
              <Button type="submit" disabled={isPending} className="w-full">
                <ButtonTitle>Save Changes</ButtonTitle>
              </Button>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default Home;
