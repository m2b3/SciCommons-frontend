import React from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { FieldErrors, useFieldArray, useFormContext } from 'react-hook-form';

import FormInput from '@/components/FormInput';

import { IProfileForm } from './page';

interface ProfessionalStatusProps {
  errors: FieldErrors<IProfileForm>;
  editMode: boolean;
}

const ProfessionalStatus: React.FC<ProfessionalStatusProps> = ({ errors, editMode }) => {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'professionalStatuses',
  });

  const addNewStatus = () => {
    append({ status: '', startYear: '', endYear: '' });
  };

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-4 font-bold res-text-xl">Academic or Professional Status</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Provide your academic or professional status to help us ensure relevant content.
      </p>
      {fields.map((field, index) => (
        <div key={field.id} className="mb-6 border-b pb-6 last:border-b-0">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-6">
            <div className="md:col-span-3">
              <FormInput
                label="Status"
                name={`professionalStatuses.${index}.status`}
                type="text"
                register={register}
                errors={errors}
                requiredMessage="Status is required"
                readOnly={!editMode}
              />
            </div>
            <FormInput
              label="Start Year"
              name={`professionalStatuses.${index}.startYear`}
              type="text"
              register={register}
              errors={errors}
              requiredMessage="Start year is required"
              patternValue={/^\d{4}$/}
              patternMessage="Invalid year format"
              readOnly={!editMode}
            />
            <FormInput
              label="End Year"
              name={`professionalStatuses.${index}.endYear`}
              type="text"
              register={register}
              errors={errors}
              patternValue={/^\d{4}$|^Present$/i}
              patternMessage="Invalid year format (use 'Present' for current positions)"
              readOnly={!editMode}
            />
            <div className="flex justify-center space-x-2">
              {fields.length < 3 && editMode && (
                <button
                  type="button"
                  onClick={addNewStatus}
                  className="text-blue-600 hover:text-blue-800"
                  title="Add new status"
                >
                  <Plus size={20} />
                </button>
              )}
              {index > 0 && editMode && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                  title="Remove this status"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {fields.length === 0 && editMode && (
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-8">
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={addNewStatus}
              className="flex text-blue-600 hover:text-blue-800"
              title="Add new status"
            >
              <Plus size={20} /> Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalStatus;
