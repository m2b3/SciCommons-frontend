import React from 'react';

import clsx from 'clsx';
import { Info } from 'lucide-react';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  name: keyof TFieldValues;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  readOnly?: boolean;
  info?: string;
  textArea?: boolean;
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
      readOnly ? 'bg-gray-100' : ''
    ),
  };
  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center space-x-2">
          <span className="font-medium text-gray-700 res-text-xs">{label}</span>
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
      {error && !readOnly && (
        <p className="mt-2 text-red-600 res-text-xs">{String(error.message)}</p>
      )}
    </div>
  );
};

export default FormInput;
