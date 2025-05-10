import React, { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';

// Using lucide-react icons

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
  eyeBtnClassName?: string;
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
  eyeBtnClassName,
}: InputProps<TFieldValues>): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name];
  const isPasswordField = type === 'password';

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
      readOnly
        ? 'bg-common-cardBackground md:bg-common-minimal focus:ring-common-contrast'
        : 'bg-common-background',
      isPasswordField ? 'pr-10' : '' // Add padding on the right for the eye icon only for password fields
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

      {textArea ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <div className="relative">
          <input {...commonProps} type={isPasswordField && showPassword ? 'text' : type} />
          {isPasswordField && (
            <button
              type="button"
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none',
                eyeBtnClassName
              )}
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      )}

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
