import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import MultiLabelSelector from '@/components/common/MultiLabelSelector';

interface ResearchInterestsProps {
  editMode: boolean;
}

const ResearchInterests: React.FC<ResearchInterestsProps> = ({ editMode }) => {
  const { control, formState: { errors } } = useFormContext();
  const researchErrors = errors.researchInterests as unknown as any[];
  const firstError = researchErrors?.find?.((err) => err?.label?.message)?.label?.message;

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
      {firstError && (
        <div className="mt-2 text-functional-red res-text-xs">
          {firstError}
        </div>
      )}
    </div>
  );
};

export default ResearchInterests;
