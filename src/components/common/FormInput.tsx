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

export const testSchema = z
  .string()
  .min(5, { message: 'Minimum Length of 5 required' })
  .max(10, { message: 'Maximum Length of 10 required' })
  .regex(/test/, 'Invalid pattern');

export const yearSchema = z
  .string()
  .regex(/^\d{4}$/, { message: "Invalid Year Format (e.g., '2025')" });

export const yearOrPresentSchema = z
  .string()
  .regex(
    /^\d{4}$|^Present$/i,
    "Invalid year format (e.g., '2025') or 'Present' for current positions"
  );

export const scholarUrlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https:\/\//.test(url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL must start with 'https://'",
    });
  }

  const match = url.match(/^https:\/\/scholar\.google\.com\/(.*)$/);
  if (!match) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "URL must be a valid Google Scholar link (e.g., 'https://scholar.google.com/citations?user=xyz')",
    });
  } else {
    const path = match[1];

    if (!path || path.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Google Scholar URL must have a valid path after 'scholar.google.com/'",
      });
    }
  }
});

export const githubUrlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https:\/\//.test(url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL must start with 'https://'",
    });
  }

  const match = url.match(/^https:\/\/github\.com\/(.*)$/);
  if (!match) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL must be a valid GitHub link (e.g., 'https://github.com/username')",
    });
  } else {
    const path = match[1];

    if (!path || path.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GitHub URL must have a valid path after 'github.com/'",
      });
    }
  }
});

export const linkedInUrlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https:\/\//.test(url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL must start with 'https://'",
    });
  }

  const domainMatch = url.match(/^https:\/\/([a-z]{2,3})\.linkedin\.com\/(.*)$/);
  if (!domainMatch) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid LinkedIn domain format (e.g., 'https://in.linkedin.com/...')",
    });
  } else {
    const [, subdomain, path] = domainMatch;

    if (!/^[a-z]{2,3}$/.test(subdomain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid LinkedIn subdomain (should be 2-3 lowercase letters, e.g., 'in', 'us')",
      });
    }

    if (!path || path.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'LinkedIn URL must have a valid path after the domain',
      });
    }
  }
});

export const urlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https?:\/\//.test(url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "URL must start with 'http://' or 'https://'",
    });
  }

  if (/\s/.test(url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'URL cannot contain spaces',
    });
  }

  const domainMatch = url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})/);
  if (!domainMatch) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid domain format (e.g., 'example.com')",
    });
  } else {
    const [, , subdomain, tld] = domainMatch;

    if (!/^[\da-z\.-]+$/.test(subdomain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid characters in subdomain',
      });
    }

    if (!/^[a-z\.]{2,6}$/.test(tld)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid TLD (e.g., '.com', '.org')",
      });
    }
  }

  if (!/^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})([\/\w\.-]*)*\/?$/.test(url)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid path format in URL',
    });
  }
});

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' });

export const matchPassword = (reg: RegExp) =>
  z.string().regex(reg, { message: 'Passwords do not match' });

export const emailSchema = z.string().superRefine((email, ctx) => {
  if (!email.includes('@')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email must contain '@'",
    });
  }

  const [localPart, domain] = email.split('@');

  if (!localPart) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email must have characters before '@'",
    });
  }

  if (!domain) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email must have a domain after '@' (e.g., 'example.com')",
    });
  } else {
    if (!domain.includes('.')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Domain must contain a '.' (e.g., 'gmail.com')",
      });
    }

    const domainParts = domain.split('.');
    if (domainParts.some((part) => part.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Domain cannot have empty parts (e.g., 'example..com' is invalid)",
      });
    }

    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Domain contains invalid characters',
      });
    }
  }
});

export const emailOrUsernameSchema = z
  .string()
  .min(1, { message: 'This field is required' }) // Ensure input is not empty
  .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$|^\w+$/, {
    message: 'Enter a valid email or username (only letters, numbers, dots, underscores allowed)',
  });

export const usernameSchema = z
  .string({
    required_error: 'Username is required',
    invalid_type_error: 'Username must be a string',
  })
  .min(3, { message: 'Username must be at least 3 characters' })
  .max(30, { message: 'Username cannot exceed 30 characters' })
  .regex(/^[a-z0-9._]+$/, {
    message: 'Username must only contain lowercase letters, numbers, dots, and underscores.',
  })
  .regex(/^[a-z0-9]/, {
    message: 'Username must start with a lowercase letter or number.',
  })
  .regex(/[a-z0-9]$/, {
    message: 'Username must end with a lowercase letter or number.',
  });

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
