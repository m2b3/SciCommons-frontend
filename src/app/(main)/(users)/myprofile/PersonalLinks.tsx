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
      {/* Fixed by Codex on 2026-02-27
          Who: Codex
          What: Use optional URL schemas for profile links.
          Why: Personal links are optional fields and blank values should not block profile saves.
          How: Swap strict URL validators with optional wrappers that allow empty inputs but keep strict checks for non-empty values. */}
      {/* Fixed by Codex on 2026-03-03
          Who: Codex
          What: Remove per-field URL schema wiring from the view component.
          Why: Validation is now centralized in `profileMasterSchema` via `zodResolver`, and keeping both paths risks drift.
          How: Keep `FormInput` focused on rendering/registering while resolver owns URL validation behavior and messages. */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          label="Home Page URL"
          name="homePage"
          type="url"
          register={register}
          errors={errors}
          readOnly={!editMode}
        />
        <FormInput
          label="LinkedIn URL"
          name="linkedIn"
          type="url"
          register={register}
          errors={errors}
          readOnly={!editMode}
        />
        <FormInput
          label="Github URL"
          name="github"
          type="url"
          register={register}
          errors={errors}
          readOnly={!editMode}
        />
        <FormInput
          label="GoogleScholar URL"
          name="googleScholar"
          type="url"
          register={register}
          errors={errors}
          readOnly={!editMode}
        />
      </div>
    </div>
  );
};

export default PersonalLinks;
