'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import { Edit, Pencil, Save } from 'lucide-react';
import { FieldErrors, useFormContext } from 'react-hook-form';

import FormInput from '@/components/common/FormInput';
import { emailSchema, nameSchema } from '@/constants/zod-schema';

import { IProfileForm } from './page';
import ImageCropper from '@/components/common/ImageCropper';

interface ProfileProps {
  errors: FieldErrors<IProfileForm>;
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  profilePicture: string;
  isPending: boolean;
  isActuallyDirty: boolean;
}

const Profile: React.FC<ProfileProps> = ({
  errors,
  editMode,
  setEditMode,
  profilePicture,
  isPending,
  isActuallyDirty,
}) => {
  const { register, setValue } = useFormContext<IProfileForm>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const profileImageInputRef = React.useRef<HTMLInputElement | null>(null);

  const profilePictureRegister = register('profilePicture');

  useEffect(() => {
    if (!editMode) {
      setPreviewImage(null);
      setRawImage(null);
      setShowCropper(false);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  }, [editMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:flex-row md:p-6">
      {showCropper && rawImage && (
        <ImageCropper
          image={rawImage}
          onCancel={() => {
            setShowCropper(false);
            if (profileImageInputRef.current) profileImageInputRef.current.value = '';
          }}
          onCropComplete={(croppedFile) => {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(croppedFile);
            setValue('profilePicture', dataTransfer.files, { shouldDirty: true });
            setPreviewImage(URL.createObjectURL(croppedFile));
            setShowCropper(false);
          }}
        />
      )}
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
            name={profilePictureRegister.name}
            onBlur={profilePictureRegister.onBlur}
            onChange={handleFileChange}
            ref={(element) => {
              profilePictureRegister.ref(element);
              profileImageInputRef.current = element;
            }}
          />
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
            disabled={editMode && (!isActuallyDirty || isPending)}
            className={`ml-4 ${
              editMode && (!isActuallyDirty || isPending)
                ? 'cursor-not-allowed text-text-tertiary opacity-50'
                : 'text-functional-blue hover:text-functional-blueContrast'
            }`}
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
              schema={nameSchema}
              readOnly={!editMode}
            />
            <FormInput
              label="Last Name"
              name="lastName"
              type="text"
              register={register}
              errors={errors}
              schema={nameSchema}
              readOnly={!editMode}
            />
          </div>
          <FormInput
            label="Your Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
            schema={emailSchema}
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