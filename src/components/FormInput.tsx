import React from 'react';

import clsx from 'clsx';
import { Info } from 'lucide-react';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Todo: use `useFormContext` to avoid passing `errors` and `register` as props

interface InputProps<TFieldValues extends FieldValues> {
  label?: string;
  type: string;
  placeholder?: string;
  requiredMessage?: string;
  patternMessage?: string;
  patternValue?: RegExp;
  minLengthValue?: number;
  minLengthMessage?: string;
  maxLengthValue?: number;
  maxLengthMessage?: string;
  name: keyof TFieldValues; // Ensure name is a key of the form values
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  readOnly?: boolean; // Optional boolean to enable/disable editing
  info?: string; // Optional info text for the tooltip
  textArea?: boolean; // Optional boolean to render a textarea
}

const FormInput = <TFieldValues extends FieldValues>({
  label,
  name,
  type,
  placeholder,
  register,
  requiredMessage,
  patternMessage,
  patternValue,
  minLengthValue,
  minLengthMessage,
  maxLengthValue,
  maxLengthMessage,
  errors,
  readOnly = false,
  info,
  textArea = false,
}: InputProps<TFieldValues>): JSX.Element => {
  const error = errors[name];
  const commonProps = {
    id: String(name),
    placeholder,
    readOnly,
    ...register(name as Path<TFieldValues>, {
      required: requiredMessage ? { value: true, message: requiredMessage } : undefined,
      pattern:
        patternValue && patternMessage
          ? { value: patternValue, message: patternMessage }
          : undefined,
      minLength:
        minLengthValue && minLengthMessage
          ? { value: minLengthValue, message: minLengthMessage }
          : undefined,
      maxLength:
        maxLengthValue && maxLengthMessage
          ? { value: maxLengthValue, message: maxLengthMessage }
          : undefined,
    }),
    className: clsx(
      'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand res-text-sm',
      error && !readOnly ? 'border-red-500' : 'border-gray-300',
      'dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:focus:ring-brand dark:focus:border-brand',
      readOnly ? 'bg-gray-100 dark:bg-gray-700' : ''
    ),
  };
  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center space-x-2">
          <span className="font-medium text-gray-700 res-text-sm dark:text-gray-300">{label}</span>
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button>
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      {textArea ? <textarea {...commonProps} rows={4} /> : <input {...commonProps} type={type} />}
      {error && !readOnly && (
        <p className="mt-2 text-red-600 res-text-sm dark:text-red-400">{String(error.message)}</p>
      )}
    </div>
  );
};

export default FormInput;
