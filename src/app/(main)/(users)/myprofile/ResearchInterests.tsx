import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import MultiLabelSelector from '@/components/common/MultiLabelSelector';

interface ResearchInterestsProps {
  editMode: boolean;
}

const ResearchInterests: React.FC<ResearchInterestsProps> = ({ editMode }) => {
  const { control } = useFormContext();

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-bold">Research Interests</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Select or add keywords that represent your research interests.
      </p>
      <Controller
        name="researchInterests"
        control={control}
        rules={{ required: 'Research interests are required' }}
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
    </div>
  );
};

export default ResearchInterests;
