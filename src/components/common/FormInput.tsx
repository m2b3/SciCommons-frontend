import React from 'react';

import { Info } from 'lucide-react';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { ZodSchema } from 'zod';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InputProps<TFieldValues extends FieldValues> {
  label?: string;
  type: string;
  placeholder?: string;
  requiredMessage?: string;
  minLengthValue?: number;
  minLengthMessage?: string;
  maxLengthValue?: number;
  maxLengthMessage?: string;
  name: keyof TFieldValues;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  isSubmitting?: boolean;
  readOnly?: boolean;
  info?: string;
  textArea?: boolean;
  helperText?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  schema?: ZodSchema<unknown>;
}

const FormInput = <TFieldValues extends FieldValues>({
  label,
  name,
  type,
  placeholder,
  register,
  requiredMessage,
  errors,
  isSubmitting = false,
  readOnly = false,
  info,
  textArea = false,
  helperText,
  inputClassName,
  labelClassName,
  helperTextClassName,
  schema,
}: InputProps<TFieldValues>): JSX.Element => {
  const error = errors[name];

  const commonProps = {
    id: String(name),
    placeholder,
    readOnly,
    ...register(name as Path<TFieldValues>, {
      required: requiredMessage ? { value: true, message: requiredMessage } : undefined,
      validate: (value) => {
        if (schema) {
          const validationResult = schema.safeParse(value);
          console.log(validationResult?.error);
          if (!validationResult.success) {
            return validationResult.error.errors[0]?.message || 'Invalid input';
          }
        }
        return true;
      },
    }),
    className: cn(
      'mt-1 block w-full px-3 py-2 ring-1 ring-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand res-text-sm focus:ring-1',
      inputClassName,
      error && !readOnly && !isSubmitting ? 'border-red-500' : 'border-gray-300',
      readOnly ? 'bg-gray-100' : ''
    ),
  };

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center space-x-2">
          <span className={cn('font-medium text-gray-700 res-text-xs', labelClassName)}>
            {label}
          </span>
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button>
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="res-text-xs">{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      {textArea ? <textarea {...commonProps} rows={4} /> : <input {...commonProps} type={type} />}
      {error && !readOnly && !isSubmitting && (
        <p className="mt-2 text-red-600 res-text-xs">{String(error.message)}</p>
      )}

      {!error && helperText && !isSubmitting && (
        <p className={cn('mt-2 text-gray-500 res-text-xs', helperTextClassName)}>{helperText}</p>
      )}
    </div>
  );
};

export default FormInput;
