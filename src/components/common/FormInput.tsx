import React from 'react';

import { Info } from 'lucide-react';
import { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { ZodSchema, z } from 'zod';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
  schema?: ZodSchema<any>;
}

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' });

export const matchPassword = (reg: RegExp) =>
  z.string().regex(reg, { message: 'Passwords do not match' });

export const emailSchema = z.string().email();
export const emailOrUsernameSchema = z
  .string()
  .min(1, { message: 'This field is required' }) // Ensure input is not empty
  .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$|^\w+$/, {
    message: 'Enter a valid email or username (only letters, numbers, dots, underscores allowed)',
  });

export const usernameSchema = z
  .string({
    required_error: 'Username is required', // Custom message for required field
    invalid_type_error: 'Username must be a string', // Custom message for invalid type
  })
  .min(3, { message: 'Username must be at least 3 characters' }) // Custom message for min length
  .max(30, { message: 'Username cannot exceed 30 characters' }) // Custom message for max length
  .regex(/^[a-z0-9._]+$/, {
    message: 'Username must only contain lowercase letters, numbers, dots, and underscores.',
  }) // Custom message for regex pattern
  .regex(/^[a-z0-9]/, {
    message: 'Username must start with a lowercase letter or number.',
  }) // Custom message for starting character
  .regex(/[a-z0-9]$/, {
    message: 'Username must end with a lowercase letter or number.',
  }); // Custom message for ending character

const FormInput = <TFieldValues extends FieldValues>({
  label,
  name,
  type,
  placeholder,
  register,
  requiredMessage,
  patternMessage,
  // patternValue,
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
  schema,
}: InputProps<TFieldValues>): JSX.Element => {
  const error = errors[name];

  const commonProps = {
    id: String(name),
    placeholder,
    readOnly,
    ...register(name as Path<TFieldValues>, {
      required: requiredMessage ? { value: true, message: requiredMessage } : undefined,
      // pattern:
      //   patternValue && patternMessage
      //     ? { value: patternValue, message: patternMessage }
      //     : undefined,
      // minLength:
      //   minLengthValue && minLengthMessage
      //     ? { value: minLengthValue, message: minLengthMessage }
      //     : undefined,
      // maxLength:
      //   maxLengthValue && maxLengthMessage
      //     ? { value: maxLengthValue, message: maxLengthMessage }
      //     : undefined,
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
