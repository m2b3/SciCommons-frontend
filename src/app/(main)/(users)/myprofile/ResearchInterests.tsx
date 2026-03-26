import React from 'react';

import { Controller, get, useFormContext } from 'react-hook-form';

import MultiLabelSelector from '@/components/common/MultiLabelSelector';

import { IProfileForm } from './page';

interface ResearchInterestsProps {
  editMode: boolean;
}

const ResearchInterests: React.FC<ResearchInterestsProps> = ({ editMode }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<IProfileForm>();
  /* Fixed by Codex on 2026-03-03
     Who: Codex
     What: Remove `any` casting in research-interest nested error lookup.
     Why: The previous cast triggered lint warnings and weakened safety around array error shape handling.
     How: Read nested array errors as `unknown`, narrow with `Array.isArray`, then extract the first label message safely. */
  const researchErrorList = get(errors, 'researchInterests') as unknown;
  const firstError = Array.isArray(researchErrorList)
    ? researchErrorList.find(
        (err): err is { label?: { message?: string } } =>
          typeof err === 'object' && err !== null && 'label' in err
      )?.label?.message
    : undefined;

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:p-6">
      <h2 className="mb-2 font-bold text-text-primary res-text-xl">Research Interests</h2>
      <p className="mb-6 text-sm text-text-tertiary">
        Select or add keywords that represent your research interests.
      </p>
      <Controller
        name="researchInterests"
        control={control}
        render={({ field, fieldState }) => (
          <MultiLabelSelector
            disabled={!editMode}
            label="Research Interests"
            tooltipText="Select or add keywords for your research interests."
            placeholder="Add Research Interests"
            creatable
            {...field}
            fieldState={fieldState}
          />
        )}
      />
      {firstError && <div className="mt-2 text-functional-red res-text-xs">{firstError}</div>}
    </div>
  );
};

export default ResearchInterests;
