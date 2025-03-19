import React from 'react';

import { FieldErrors, useFormContext } from 'react-hook-form';

import FormInput from '@/components/common/FormInput';

import { IProfileForm } from './page';

interface PersonalLinksProps {
  errors: FieldErrors<IProfileForm>;
  editMode: boolean;
}

const PersonalLinks: React.FC<PersonalLinksProps> = ({ errors, editMode }) => {
  const { register } = useFormContext();

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:p-6">
      <h2 className="font-bold text-text-primary res-text-xl">Personal Links</h2>
      <p className="mt-2 text-sm text-text-tertiary">
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
          patternValue={/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/}
          patternMessage="Invalid URL format"
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
          patternValue={/^https:\/\/[a-z]{2,3}\.linkedin\.com\/.*$/}
          patternMessage="Invalid LinkedIn URL"
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
          patternValue={/^https:\/\/github\.com\/.*$/}
          patternMessage="Invalid GitHub URL"
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
          patternValue={/^https:\/\/scholar\.google\.com\/.*$/}
          patternMessage="Invalid Google Scholar URL"
          requiredMessage="Google Scholar URL is required"
          readOnly={!editMode}
        />
      </div>
    </div>
  );
};

export default PersonalLinks;
