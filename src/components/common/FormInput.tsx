import React from 'react';

import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

import { cn } from '@/lib/utils';

import CustomTooltip from './CustomTooltip';

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
  isSubmitting?: boolean;
  readOnly?: boolean;
  info?: string;
  textArea?: boolean;
  helperText?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
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
  isSubmitting = false,
  readOnly = false,
  info,
  textArea = false,
  helperText,
  inputClassName,
  labelClassName,
  helperTextClassName,
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
    className: cn(
      'mt-1 block w-full px-3 py-2 ring-1 ring-common-contrast rounded-md shadow-sm focus:outline-none focus:ring-functional-green res-text-sm focus:ring-1 placeholder:text-text-tertiary text-text-primary',
      inputClassName,
      error && !readOnly && !isSubmitting ? 'border-functional-red' : 'border-common-minimal',
      readOnly ? 'bg-common-cardBackground md:bg-common-minimal focus:ring-common-contrast' : ''
    ),
  };

  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center space-x-2">
          <span className={cn('font-medium text-text-secondary res-text-xs', labelClassName)}>
            {label}
          </span>
          {info && <CustomTooltip info={info} />}
        </div>
      )}
      {textArea ? <textarea {...commonProps} rows={4} /> : <input {...commonProps} type={type} />}
      {error && !readOnly && !isSubmitting && (
        <p className="mt-2 text-functional-red res-text-xs">{String(error.message)}</p>
      )}

      {!error && helperText && !isSubmitting && (
        <p className={cn('mt-2 text-gray-500 res-text-xs', helperTextClassName)}>{helperText}</p>
      )}
    </div>
  );
};

export default FormInput;
