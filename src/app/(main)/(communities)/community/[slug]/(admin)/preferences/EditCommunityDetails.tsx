import React, { useEffect } from 'react';

import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCommunitiesApiUpdateCommunity } from '@/api/communities/communities';
import { CommunityOut, UpdateCommunityDetails } from '@/api/schemas';
import FormInput from '@/components/common/FormInput';
import ImageUpload from '@/components/common/ImageUpload';
import LabeledTooltip from '@/components/common/LabeledToolTip';
import MultiLabelSelector from '@/components/common/MultiLabelSelector';
import OptionCard from '@/components/communities/OptionCard';
import { Option } from '@/components/ui/multiple-selector';
import { FileObj } from '@/types';

type OptionType = 'public' | 'locked' | 'hidden';

interface FormValues {
  description: string;
  tags: Option[];
  type: OptionType;
  profileImage: FileObj;
  bannerImage: FileObj;
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

  const { mutate, isPending: isUpdatePending } = useCommunitiesApiUpdateCommunity({
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
        tags: formData.tags.map((tag) => tag.value),
        type: formData.type,
        rules: data.data.rules,
        about: data.data.about,
      };

      const truncateFileName = (file: File): File => {
        let fileName = file.name;
        if (fileName.length > 100) {
          const extension = fileName.split('.').pop() || '';
          fileName = fileName.slice(0, 96 - extension.length) + '...' + extension;
        }
        return new File([file], fileName, { type: file.type });
      };

      let profile_pic_file: File | undefined;
      if (formData.profileImage && formData.profileImage.file) {
        profile_pic_file = truncateFileName(formData.profileImage.file);
      }

      let banner_pic_file: File | undefined;
      if (formData.bannerImage && formData.bannerImage.file) {
        banner_pic_file = truncateFileName(formData.bannerImage.file);
      }

      mutate({
        communityId: Number(data.data.id),
        data: {
          payload: { details: dataToSend },
          profile_pic_file,
          banner_pic_file,
        },
      });
    }
  };

  const options: { name: string; description: string; value: OptionType }[] = [
    {
      name: 'Public',
      description: 'Anyone can join and see the community content.',
      value: 'public',
    },
    {
      name: 'Locked',
      description: 'Anyone can see the community but needs permission to join.',
      value: 'locked',
    },
    {
      name: 'Hidden',
      description: 'Only invited users can join and see the community content.',
      value: 'hidden',
    },
  ];

  useEffect(() => {
    if (data) {
      reset({
        description: data.data.description,
        tags: data.data.tags.map((tag) => ({ label: tag, value: tag })),
        type: data.data.type as OptionType,
      });
    }
  }, [data, reset]);

  return (
    <div className="my-4 rounded bg-white-primary px-8 py-4 shadow">
      <div className="mb-4 flex flex-col items-center justify-center">
        <h1 className="font-bold res-heading-sm">
          Edit your
          <span className="text-green-500"> Community </span>
          Details
        </h1>
      </div>
      {isPending && <DetailsSkeleton />}
      {data && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-8">
          {/* Profile Image */}
          <Controller
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
          />
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
          />
          {/* Tags */}
          <Controller
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
          />
          {/* Community Type */}
          <div>
            <LabeledTooltip
              label="Community Type"
              info="Select the type of community you want to create."
            />
            <div className="flex flex-col gap-2 md:flex-row">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <>
                    {options.map((option) => (
                      <OptionCard
                        key={option.value}
                        name={option.name}
                        description={option.description}
                        value={option.value}
                        selectedValue={field.value}
                        onChange={field.onChange}
                      />
                    ))}
                  </>
                )}
              />
            </div>
          </div>
          <Controller
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
          />

          <button
            type="submit"
            className={clsx(
              'mx-auto max-w-md rounded-md bg-green-500 px-4 py-2 text-white res-text-sm',
              {
                'cursor-not-allowed opacity-50': isUpdatePending,
              }
            )}
          >
            {isUpdatePending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditCommunityDetails;

const DetailsSkeleton: React.FC = () => {
  return (
    <div className="my-6 rounded bg-white px-8 py-4 shadow">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="h-44 w-full rounded-md bg-gray-200"></div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="h-32 w-full rounded-md bg-gray-200"></div>
          </div>
        </div>
        <div className="h-16 w-full rounded-md bg-gray-200"></div>
        <div className="h-44 w-full rounded-md bg-gray-200"></div>
        <div className="mx-auto max-w-md rounded-md bg-green-500 px-4 py-2 text-white">
          Loading...
        </div>
      </div>
    </div>
  );
};
