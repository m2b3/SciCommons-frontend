'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';
import { useCommunitiesApiCreateCommunity } from '@/api/communities/communities';
import { CreateCommunityDetails } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import LabeledTooltip from '@/components/common/LabeledToolTip';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Option } from '@/components/ui/multiple-selector';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

import OptionCard from './OptionCard';

interface FileObj {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

type OptionType = 'public' | 'private' | 'hidden';

interface FormValues {
  name: string;
  description: string;
  tags: Option[];
  type: OptionType;
  profileImage: FileObj;
  community_settings?: string;
}

const CreateCommunity: React.FC = () => {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [selectedType, setSelectedType] = useState<OptionType>('public');
  const [selectedPublicCommunitiesSettings, setSelectedPublicCommunitiesSettings] =
    useState('anyone_can_join');

  const { mutate: createCommunity, isPending } = useCommunitiesApiCreateCommunity({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: (data) => {
        toast.success('Community created successfully! Redirecting to community page...');
        // router.push(`/community/${data.data.slug}`);
        router.push(`/communities`);
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      type: 'public',
      community_settings: 'anyone_can_join',
    },
    mode: 'onChange',
  });

  const options: { name: string; value: OptionType }[] = [
    {
      name: 'Public',
      value: 'public',
    },
    {
      name: 'Private',
      value: 'private',
    },
    {
      name: 'Hidden',
      value: 'hidden',
    },
  ];

  const publicCommunitiesSettingsOptions = [
    {
      name: 'Anyone can join',
      value: 'anyone_can_join',
    },
    {
      name: 'Request to join',
      value: 'request_to_join',
    },
  ];

  const optionsDescriptions: { [key: string]: string } = {
    public: 'Open to all. Anyone can join and view content.',
    private: 'Listed but requires approval to join. Only members can view content.',
    hidden: 'Unlisted. Only invited users can join and view content.',
  };

  const publicCommunitiesSettingsOptionsDescriptions: { [key: string]: string } = {
    anyone_can_join: 'Anyone can join instantly and participate.',
    request_to_join: 'Visible to all, but joining requires approval.',
  };

  const onSubmit = (data: FormValues) => {
    const dataToSend: CreateCommunityDetails = {
      name: data.name,
      description: data.description,
      // tags: data.tags?.map((tag) => tag.value),
      type: data.type,
      community_settings: data.type == 'public' ? data.community_settings : undefined,
    };

    createCommunity({
      data: { payload: { details: dataToSend } },
    });
  };

  return (
    <div className="container p-0 res-text-sm md:px-8 md:py-4">
      <div className="mx-auto w-full max-w-5xl border-common-contrast p-4 py-8 md:rounded-xl md:border md:bg-common-cardBackground md:p-8">
        <div className="mb-4 flex flex-col items-center justify-center">
          <h1 className="font-bold text-text-primary res-heading-base">
            Create your
            <span className="text-functional-green"> Community</span>
          </h1>
          <p className="mt-2 text-center text-text-tertiary">
            Create a community to share your interests and connect with people.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
          <FormInput<FormValues>
            label="Community Name"
            name="name"
            type="text"
            placeholder="Enter your community name"
            register={register}
            requiredMessage="Title is required"
            maxLengthValue={100}
            maxLengthMessage="Name must not exceed 100 characters"
            info="Your community's name should be unique and descriptive."
            errors={errors}
          />

          <FormInput<FormValues>
            label="Description"
            name="description"
            type="text"
            textArea={true}
            placeholder="Briefly describe your community"
            register={register}
            requiredMessage="Description is required"
            minLengthValue={1}
            maxLengthValue={500}
            minLengthMessage="Description must be at least 1 characters"
            maxLengthMessage="Description must not exceed 500 characters"
            info="Your community's name should be unique and descriptive."
            errors={errors}
          />
          {/* <Controller
          name="tags"
          control={control}
          rules={{ required: 'Tags are required' }}
          render={({ field: { onChange, value }, fieldState }) => (
            <MultiLabelSelector
              label="Tags"
              tooltipText="Help users find your community by adding tags."
              placeholder="Add Tags"
              maxOptions={5}
              creatable
              value={value}
              onChange={onChange}
              fieldState={fieldState}
            />
          )}
        /> */}
          {/* Community Type */}
          <div className="w-full">
            <LabeledTooltip
              label="Community Type"
              info="Select the type of community you want to create."
            />
            <div className="scrollbar-hide mb-4 flex w-full gap-4 overflow-x-auto">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <>
                    {options.map((option) => (
                      <OptionCard
                        key={option.value}
                        name={option.name}
                        value={option.value}
                        selectedValue={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          setSelectedType(value);
                        }}
                        showRadio={false}
                      />
                    ))}
                  </>
                )}
              />
            </div>
            {selectedType == 'public' && (
              <>
                <LabeledTooltip
                  label="Public Communities Settings"
                  info="Select the settings for your public community."
                />
                <div className="scrollbar-hide mb-4 flex w-full gap-4 overflow-x-auto">
                  <Controller
                    name="community_settings"
                    control={control}
                    render={({ field }) => (
                      <>
                        {publicCommunitiesSettingsOptions.map((option) => (
                          <OptionCard
                            key={option.value}
                            name={option.name}
                            // @ts-expect-error: Type mismatch due to dynamic form control
                            value={option.value}
                            // @ts-expect-error: Type mismatch due to dynamic form control
                            selectedValue={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              setSelectedPublicCommunitiesSettings(value);
                            }}
                          />
                        ))}
                      </>
                    )}
                  />
                </div>
              </>
            )}
            <span className="w-full text-wrap text-sm italic text-functional-yellow">
              {selectedType === 'public'
                ? publicCommunitiesSettingsOptionsDescriptions[selectedPublicCommunitiesSettings]
                : optionsDescriptions[selectedType]}
            </span>
          </div>

          <Button
            showLoadingSpinner={false}
            loading={isPending}
            className="mx-auto w-full max-w-2xl"
            type="submit"
          >
            <ButtonTitle>{isPending ? 'Loading...' : 'Create Community'}</ButtonTitle>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default withAuthRedirect(CreateCommunity, { requireAuth: true });
