import React from 'react';

import clsx from 'clsx';
import { Info } from 'lucide-react';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Updated interface to include info
interface InputProps<TFieldValues extends FieldValues> {
  label?: string;
  name: keyof TFieldValues; // Ensure name is a key of the form values
  type: string;
  placeholder: string;
  register: UseFormRegister<TFieldValues>;
  requiredMessage: string;
  patternMessage?: string;
  patternValue?: RegExp;
  minLengthValue?: number;
  minLengthMessage?: string;
  maxLengthValue?: number;
  maxLengthMessage?: string;
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
  readOnly = false, // Default to true if not provided
  info,
  textArea = false, // Default to false if not provided
}: InputProps<TFieldValues>): JSX.Element => {
  const error = errors[name];
  const commonProps = {
    id: String(name),
    placeholder,
    readOnly,
    ...register(name as Path<TFieldValues>, {
      required: requiredMessage,
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
      'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand focus:border-brand sm:text-sm',
      error && !readOnly ? 'border-red-500' : 'border-gray-300'
    ),
  };
  return (
    <div className="">
      {label && (
        <div className="mb-2 flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
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
        </div>
      )}
      {textArea ? <textarea {...commonProps} rows={4} /> : <input {...commonProps} type={type} />}
      {error && !readOnly && <p className="mt-2 text-sm text-red-600">{String(error.message)}</p>}
    </div>
  );
};

export default FormInput;
