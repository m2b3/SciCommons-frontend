import React from 'react';

import { FieldErrors, useFormContext } from 'react-hook-form';

import FormInput from '@/components/common/FormInput';
import {
  githubUrlSchema,
  linkedInUrlSchema,
  scholarUrlSchema,
  urlSchema,
} from '@/constants/zod-schema';

import { IProfileForm } from './page';

interface PersonalLinksProps {
  errors: FieldErrors<IProfileForm>;
  editMode: boolean;
}

const PersonalLinks: React.FC<PersonalLinksProps> = ({ errors, editMode }) => {
  const { register } = useFormContext();

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white-secondary p-6 shadow-md">
      <h2 className="font-bold res-text-xl">Personal Links</h2>
      <p className="mt-2 text-gray-600">
        These are the professional profiles you have provided. We have verified them to ensure the
        legitimacy of your account.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          label="Home Page URL"
          placeholder="https://example.com"
          name="homePage"
          type="url"
          register={register}
          errors={errors}
          schema={urlSchema}
          requiredMessage="Home page URL is required"
          readOnly={!editMode}
        />
        <FormInput
          label="LinkedIn URL"
          placeholder="https://linkedin.com/in/username"
          name="linkedIn"
          type="url"
          register={register}
          errors={errors}
          schema={linkedInUrlSchema}
          requiredMessage="LinkedIn URL is required"
          readOnly={!editMode}
        />
        <FormInput
          label="Github URL"
          placeholder="https://github.com/username"
          name="github"
          type="url"
          register={register}
          errors={errors}
          schema={githubUrlSchema}
          requiredMessage="GitHub URL is required"
          readOnly={!editMode}
        />
        <FormInput
          label="GoogleScholar URL"
          placeholder="https://scholar.google.com/citations?user=..."
          name="googleScholar"
          type="url"
          register={register}
          errors={errors}
          schema={scholarUrlSchema}
          requiredMessage="Google Scholar URL is required"
          readOnly={!editMode}
        />
      </div>
    </div>
  );
};

export default PersonalLinks;
