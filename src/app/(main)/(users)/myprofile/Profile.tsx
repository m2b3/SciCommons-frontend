import React, { useState } from 'react';

import Image from 'next/image';

import { Edit, Pencil, Save } from 'lucide-react';
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
  const profileImageInputRef = React.useRef<HTMLInputElement | null>(null);

  const profilePictureRegister = register('profilePicture', {
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
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:flex-row md:p-6">
      <div className="mx-auto mb-6 flex items-start justify-center md:mb-0 md:mr-6 md:w-1/3">
        <div className="relative h-40 w-40 shrink-0">
          <div className="h-full w-full overflow-hidden rounded-full border-2 border-common-minimal bg-common-minimal">
            <Image
              src={previewImage || profilePicture}
              alt="Profile"
              width={160}
              height={160}
              className="h-full w-full object-cover"
              quality={85}
              sizes="(max-width: 768px) 160px, 160px"
              priority
            />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            {...profilePictureRegister}
            ref={(element) => {
              profilePictureRegister.ref(element);
              profileImageInputRef.current = element;
            }}
          />
          {/* Fixed by Codex on 2026-02-24
              Who: Codex
              What: Scoped the profile image picker trigger to this component's file input ref.
              Why: A global query selector can click the wrong input if duplicate field names exist.
              How: Capture react-hook-form's ref and call `.click()` on the local input reference. */}
          {editMode && (
            <button
              type="button"
              onClick={() => {
                profileImageInputRef.current?.click();
              }}
              className="absolute bottom-1 right-1 rounded-full bg-functional-blue p-2 text-primary-foreground transition-colors hover:bg-functional-blueContrast"
              aria-label="Change profile photo"
            >
              <Pencil size={18} className="text-primary-foreground" />
            </button>
          )}
        </div>
      </div>
      <div className="w-full min-w-0 md:w-2/3">
        <h2 className="mb-6 flex items-center font-bold res-text-xl">
          <span className="text-text-primary">Your Profile</span>
          <button
            type={editMode ? 'submit' : 'button'}
            onClick={(e) => {
              if (!editMode) {
                e.preventDefault();
                setEditMode(true);
              }
            }}
            className="ml-4 text-functional-blue hover:text-functional-blueContrast"
            aria-label={editMode ? 'Save profile' : 'Edit profile'}
          >
            {editMode ? <Save size={18} /> : <Edit size={18} />}
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
