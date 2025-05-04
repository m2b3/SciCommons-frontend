import React, { useEffect, useState } from 'react';

import { AxiosResponse } from 'axios';
import { Pencil, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesApiUpdateCommunity } from '@/api/communities/communities';
import { CommunityOut, CommunityOutCommunitySettings, UpdateCommunityDetails } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import LabeledTooltip from '@/components/common/LabeledToolTip';
import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import OptionCard from '@/components/communities/OptionCard';
import { Button, ButtonTitle } from '@/components/ui/button';
import { Option } from '@/components/ui/multiple-selector';
import { useAuthStore } from '@/stores/authStore';

type OptionType = 'public' | 'private' | 'hidden';

interface FormValues {
  description: string;
  tags: Option[];
  type: OptionType;
  community_settings?: CommunityOutCommunitySettings | undefined;
  // profileImage: FileObj;
  // bannerImage: FileObj;
}

interface EditCommunityDetailsProps {
  data: AxiosResponse<CommunityOut> | undefined;
  isPending: boolean;
  refetch?: () => void;
}

const EditCommunityDetails: React.FC<EditCommunityDetailsProps> = ({
  data,
  isPending,
  refetch,
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const accessToken = useAuthStore((state) => state.accessToken);
  const [selectedType, setSelectedType] = useState<OptionType>(data?.data.type as OptionType);
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [selectedPublicCommunitiesSettings, setSelectedPublicCommunitiesSettings] = useState(
    data?.data.community_settings as string
  );

  const { mutate, isPending: isUpdatePending } = useCommunitiesApiUpdateCommunity({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
    mutation: {
      onSuccess: () => {
        toast.success('Community Details updated successfully');
        refetch && refetch();
      },
      onError: (error) => {
        toast.error(`Error: ${error.response?.data.message}`);
      },
    },
  });

  const onSubmit = (formData: FormValues) => {
    if (data) {
      const dataToSend: UpdateCommunityDetails = {
        description: formData.description,
        type: formData.type,
        rules: data.data?.rules || [],
        community_settings: formData.community_settings,
        // tags: formData.tags?.map((tag) => tag.value),
        // about: data.data.about,
      };

      // const truncateFileName = (file: File): File => {
      //   let fileName = file.name;
      //   if (fileName.length > 100) {
      //     const extension = fileName.split('.').pop() || '';
      //     fileName = fileName.slice(0, 96 - extension.length) + '...' + extension;
      //   }
      //   return new File([file], fileName, { type: file.type });
      // };

      // let profile_pic_file: File | undefined;
      // if (formData.profileImage && formData.profileImage.file) {
      //   profile_pic_file = truncateFileName(formData.profileImage.file);
      // }

      // let banner_pic_file: File | undefined;
      // if (formData.bannerImage && formData.bannerImage.file) {
      //   banner_pic_file = truncateFileName(formData.bannerImage.file);
      // }

      mutate({
        communityId: Number(data.data.id),
        data: {
          payload: { details: dataToSend },
          // profile_pic_file,
          // banner_pic_file,
        },
      });
    }
  };

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

  useEffect(() => {
    if (data) {
      setSelectedType(data.data.type as OptionType);
      setSelectedPublicCommunitiesSettings(
        data.data.community_settings ||
          ((data.data.type == 'public' && 'anyone_can_join') as string)
      );
      reset({
        description: data.data.description,
        tags: data.data.tags?.map((tag) => ({ label: tag, value: tag })),
        type: data.data.type as OptionType,
        community_settings: data.data.community_settings,
      });
    }
  }, [data, reset]);

  return (
    <div className="relative my-4 rounded-xl border-common-contrast sm:border sm:bg-common-cardBackground sm:p-4 md:p-6">
      <div
        className="absolute hidden aspect-square h-fit cursor-pointer rounded-full p-2 hover:bg-common-contrast sm:right-4 sm:top-4 sm:block md:right-6 md:top-6"
        onClick={() => setIsEditEnabled(!isEditEnabled)}
      >
        {!isEditEnabled ? (
          <Pencil className="size-5 text-functional-blue" />
        ) : (
          <X className="size-5 text-text-secondary" />
        )}
      </div>
      <div className="mb-4 flex items-center justify-between sm:justify-center">
        <h1 className="text-center font-bold text-text-primary res-heading-sm">
          Edit your
          <span className="text-functional-green"> Community </span>
          Details
        </h1>
        <div
          className="aspect-square h-fit cursor-pointer rounded-full p-2 hover:bg-common-contrast sm:hidden"
          onClick={() => setIsEditEnabled(!isEditEnabled)}
        >
          {!isEditEnabled ? (
            <Pencil className="size-5 text-functional-blue" />
          ) : (
            <X className="size-5 text-text-secondary" />
          )}
        </div>
      </div>
      {isPending && <DetailsSkeleton />}
      {data && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
          {/* Profile Image */}
          {/* <Controller
            name="profileImage"
            control={control}
            // rules={{ required: 'Profile Image is required' }}
            render={({}) => (
              <ImageUpload
                control={control}
                name="profileImage"
                label="Community Profile Image"
                info="Upload a profile image for your community"
                defaultImageURL={data.data.profile_pic_url ? data.data.profile_pic_url : undefined}
              />
            )}
          /> */}
          {/* Description */}
          <FormInput<FormValues>
            label="Description"
            name="description"
            type="text"
            textArea={true}
            placeholder="Briefly describe your community"
            register={register}
            requiredMessage="Description is required"
            minLengthValue={10}
            minLengthMessage="Description must be at least 10 characters"
            info="Your community's name should be unique and descriptive."
            errors={errors}
            readOnly={!isEditEnabled}
          />
          {/* Tags */}
          {/* <Controller
            name="tags"
            control={control}
            rules={{ required: 'Authors are required' }}
            render={({ field: { onChange, value }, fieldState }) => (
              <MultiLabelSelector
                label="Tags"
                tooltipText="Help users find your community by adding tags."
                placeholder="Add Tags"
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
                          if (!isEditEnabled) return;
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
                              if (!isEditEnabled) return;
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
          {/* <Controller
            name="bannerImage"
            control={control}
            render={({}) => (
              <ImageUpload
                control={control}
                name="bannerImage"
                label="Community Banner Image"
                info="Upload a banner image for your community"
                defaultImageURL={data.data.banner_pic_url ? data.data.banner_pic_url : undefined}
              />
            )}
          /> */}

          <Button
            showLoadingSpinner={false}
            className="w-full"
            loading={isUpdatePending}
            type="submit"
            disabled={!isEditEnabled}
          >
            <ButtonTitle>{isUpdatePending ? 'Saving...' : 'Save Changes'}</ButtonTitle>
          </Button>
        </form>
      )}
    </div>
  );
};

export default EditCommunityDetails;

const DetailsSkeleton: React.FC = () => {
  return (
    <Skeleton>
      <TextSkeleton className="w-32" />
      <BlockSkeleton />
      <TextSkeleton className="mt-8 w-44" />
      <BlockSkeleton />
      <TextSkeleton className="mt-8 w-44" />
      <div className="flex w-full justify-between gap-2">
        <BlockSkeleton className="h-12 w-1/3" />
        <BlockSkeleton className="h-12 w-1/3" />
        <BlockSkeleton className="h-12 w-1/3" />
      </div>
      <BlockSkeleton className="mt-4 h-8" />
    </Skeleton>
  );
};
