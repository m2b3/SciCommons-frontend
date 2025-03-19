import React from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { FieldErrors, useFieldArray, useFormContext } from 'react-hook-form';

import FormInput from '@/components/common/FormInput';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';

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
    <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:p-6">
      <h2 className="font-bold text-text-primary res-text-xl">Academic or Professional Status</h2>
      <p className="mb-4 pt-2 text-sm text-text-tertiary">
        Provide your academic or professional status to help us ensure relevant content.
      </p>
      {fields.map((field, index) => (
        <div key={field.id} className="border-b pb-6 last:border-b-0">
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
            <div className="flex h-full w-full items-end justify-center">
              {fields.length < 3 && editMode && (
                <Button
                  variant={'blue'}
                  className="w-full py-2.5"
                  onClick={addNewStatus}
                  title="Add new status"
                  type="button"
                >
                  <ButtonIcon>
                    <Plus size={16} />
                  </ButtonIcon>
                  <ButtonTitle>Add Status</ButtonTitle>
                </Button>
              )}
              {index > 0 && editMode && (
                <Button
                  variant={'danger'}
                  className="w-full py-2.5"
                  onClick={() => remove(index)}
                  title="Remove this status"
                  type="button"
                >
                  <ButtonIcon>
                    <Trash2 size={16} />
                  </ButtonIcon>
                  <ButtonTitle>Remove Status</ButtonTitle>
                </Button>
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
              className="flex items-center text-sm text-functional-blue hover:text-functional-blueContrast"
              title="Add new status"
            >
              <Plus size={14} />
              &nbsp;Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalStatus;
