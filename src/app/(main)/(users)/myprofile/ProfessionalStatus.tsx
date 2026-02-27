import React from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { FieldErrors, useFieldArray, useFormContext } from 'react-hook-form';

import FormInput from '@/components/common/FormInput';
import { Button, ButtonIcon, ButtonTitle } from '@/components/ui/button';
import { yearSchema, statusSchema } from '@/constants/zod-schema';

import { IProfileForm } from './page';

interface ProfessionalStatusProps {
  errors: FieldErrors<IProfileForm>;
  editMode: boolean;
}

const ProfessionalStatus: React.FC<ProfessionalStatusProps> = ({ errors, editMode }) => {
  const { register, control, watch } = useFormContext<IProfileForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'professionalStatuses',
  });

  const addNewStatus = () => {
    append({ status: '', startYear: '', endYear: '', isOngoing: false });
  };

  return (
    <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:p-6">
      <h2 className="font-bold text-text-primary res-text-xl">Academic or Professional Status</h2>
      <p className="mb-4 pt-2 text-sm text-text-tertiary">
        Provide your academic or professional status to help us ensure relevant content.
      </p>
      {fields.map((field, index) => {
        const statusFieldName = `professionalStatuses.${index}.status` as keyof IProfileForm;
        const startYearFieldName = `professionalStatuses.${index}.startYear` as keyof IProfileForm;
        const endYearFieldName = `professionalStatuses.${index}.endYear` as keyof IProfileForm;

        const watchedOngoing = watch(`professionalStatuses.${index}.isOngoing`);
        const startYearValue = watch(`professionalStatuses.${index}.startYear`);

        const isOngoing = watchedOngoing;

        return (
          <div key={field.id} className="border-b py-4 last:border-b-0">
            <div className="flex flex-wrap items-end gap-4 md:flex-nowrap">
              <div className="flex-1">
                <FormInput
                  label="Status"
                  name={statusFieldName}
                  type="text"
                  register={register}
                  errors={errors}
                  schema={statusSchema}
                  readOnly={!editMode}
                />
              </div>

              <div className="w-28">
                <FormInput
                  label="Start Year"
                  name={startYearFieldName}
                  type="text"
                  register={register}
                  errors={errors}
                  schema={yearSchema}
                  readOnly={!editMode}
                />
              </div>

              <div className="w-28">
                {!isOngoing ? (
                  <FormInput
                    label="End Year"
                    name={endYearFieldName}
                    type="text"
                    register={register}
                    errors={errors}
                    schema={yearSchema}
                    readOnly={!editMode}
                    validateFn={(value: string) => {
                      if (isOngoing) return true;
                      if (!value) return 'End year is required';
                      const start = parseInt(startYearValue, 10);
                      const end = parseInt(value, 10);
                      if (!isNaN(start) && !isNaN(end) && end < start) {
                        return 'End year must be after start year';
                      }
                      return true;
                    }}
                  />
                ) : (
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm text-text-secondary">End Year</label>
                    <input
                      value="Ongoing"
                      disabled
                      className="cursor-not-allowed rounded-md border border-common-contrast bg-common-cardBackground px-3 py-2 text-text-primary opacity-80"
                    />
                  </div>
                )}
              </div>

              {editMode && (
                <div className="flex items-center gap-2 pb-1">
                  <input
                    type="checkbox"
                    {...register(`professionalStatuses.${index}.isOngoing`)}
                    className="h-4 w-4"
                  />
                  <label className="text-sm text-text-secondary">Ongoing</label>
                </div>
              )}

              {editMode && (
                <Button
                  variant={'danger'}
                  className="rounded-md bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                  onClick={() => remove(index)}
                  title="Remove this status"
                  aria-label="Remove this status"
                  type="button"
                >
                  <ButtonIcon>
                    <Trash2 size={16} />
                  </ButtonIcon>
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {fields.length > 0 && fields.length < 3 && editMode && (
        <div className="mt-4">
          <Button
            variant={'blue'}
            className="py-2.5"
            onClick={addNewStatus}
            title="Add new status"
            type="button"
          >
            <ButtonIcon>
              <Plus size={16} />
            </ButtonIcon>
            <ButtonTitle>Add Status</ButtonTitle>
          </Button>
        </div>
      )}

      {fields.length === 0 && editMode && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-common-contrast py-10 text-center">
          <button
            type="button"
            onClick={addNewStatus}
            className="flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-functional-blue ring-1 ring-functional-blue hover:bg-functional-blue/10"
          >
            <Plus size={14} />
            Add Status
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalStatus;