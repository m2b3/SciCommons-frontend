import React, { useState } from 'react';

import Image from 'next/image';

import { Edit, Save } from 'lucide-react';
import { FieldErrors, useFormContext } from 'react-hook-form';

import FormInput from '@/components/common/FormInput';

import { IProfileForm } from './page';

interface ProfileProps {
  errors: FieldErrors<IProfileForm>;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  profilePicture: string;
}

const Profile: React.FC<ProfileProps> = ({ errors, editMode, setEditMode, profilePicture }) => {
  const { register } = useFormContext();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="mx-auto flex max-w-4xl flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 md:flex-row">
      <div className="relative mx-auto mb-6 flex items-center justify-center md:mb-0 md:mr-6 md:w-1/3">
        <div className="h-40 w-40 overflow-hidden rounded-full bg-gray-100">
          <Image
            src={previewImage || profilePicture}
            alt="Profile"
            width={160}
            height={160}
            className="h-full w-full object-cover"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          {...register('profilePicture', {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setPreviewImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            },
          })}
        />
        <button
          type="button"
          onClick={() => {
            const fileInput = document.querySelector(
              'input[name="profilePicture"]'
            ) as HTMLInputElement;
            if (fileInput) fileInput.click();
          }}
          className="absolute bottom-1 right-1 rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 md:bottom-40 md:right-14"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>
      <div className="w-full md:w-2/3">
        <h2 className="mb-6 flex items-center font-bold res-text-xl">
          <span>Your Profile</span>
          <button
            type="button"
            onClick={() => setEditMode((prev) => !prev)}
            className="ml-4 text-blue-500 hover:text-blue-600"
          >
            {editMode ? <Save size={24} /> : <Edit size={24} />}
          </button>
        </h2>
        <div className="space-y-4">
          <FormInput
            label="Username"
            name="username"
            type="text"
            register={register}
            errors={errors}
            requiredMessage="Username is required"
            readOnly={true}
          />
          <div className="flex flex-col md:flex-row md:space-x-4">
            <FormInput
              label="First Name"
              name="firstName"
              type="text"
              register={register}
              errors={errors}
              requiredMessage="First name is required"
              readOnly={!editMode}
            />
            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              register={register}
              errors={errors}
              requiredMessage="Last name is required"
              readOnly={!editMode}
            />
          </div>
          <FormInput
            label="Your Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
            requiredMessage="Email is required"
            patternValue={/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i}
            patternMessage="Invalid email address"
            readOnly={true}
          />
          <FormInput
            label="Your Bio"
            name="bio"
            type="text"
            register={register}
            errors={errors}
            textArea={true}
            readOnly={!editMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
