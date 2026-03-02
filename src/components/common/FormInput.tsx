import React, { useEffect, useState } from 'react';

import { MDXEditorMethods } from '@mdxeditor/editor';
import { Eye, EyeOff } from 'lucide-react';
import {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
  useWatch,
} from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';

import CustomTooltip from './CustomTooltip';
import { ForwardRefEditor } from './MarkdownEditor/ForwardRefEditor';

interface InputProps<TFieldValues extends FieldValues> {
  label?: string;
  type: string;
  placeholder?: string;
  requiredMessage?: string;
  name: keyof TFieldValues;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  control?: Control<TFieldValues>;
  isSubmitting?: boolean;
  readOnly?: boolean;
  info?: string;
  textArea?: boolean;
  helperText?: string;
  inputClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  eyeBtnClassName?: string;
  supportMarkdown?: boolean;
  supportLatex?: boolean;
  isSuccess?: boolean;
  validateFn?: (value: string) => true | string;
  autoFocus?: boolean;
  schema?: z.ZodTypeAny;
  mentionCandidates?: string[];
}

// Wrapper component that uses useWatch - only rendered when control is provided
function WatchedFieldSync<TFieldValues extends FieldValues>({
  control,
  name,
  onValueChange,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  onValueChange: (value: string) => void;
}) {
  const fieldValue = useWatch({ control, name });

  useEffect(() => {
    // Always call onValueChange to sync the value, including on initial mount
    onValueChange(String(fieldValue || ''));
  }, [fieldValue, onValueChange]);

  return null;
}

const FormInput = <TFieldValues extends FieldValues>({
  label,
  name,
  type,
  placeholder,
  register,
  requiredMessage,
  errors,
  control,
  isSubmitting = false,
  readOnly = false,
  info,
  textArea = false,
  helperText,
  inputClassName,
  labelClassName,
  helperTextClassName,
  eyeBtnClassName,
  supportMarkdown = false,
  supportLatex = false,
  isSuccess = false,
  validateFn,
  autoFocus = false,
  schema,
  mentionCandidates = [],
}: InputProps<TFieldValues>): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[name];
  const isPasswordField = type === 'password';
  const [markdown, setMarkdown] = useState<string>('');
  const reviewEditorRef = React.useRef<MDXEditorMethods>(null);
  const markdownRef = React.useRef<string>(markdown || '');

  // Determine if we need to watch field values (only for markdown/latex editors with control)
  const needsWatch = (supportMarkdown || supportLatex) && !!control;

  // Callback for when watched field value changes
  const handleWatchedValueChange = React.useCallback((value: string) => {
    setMarkdown(value);
    markdownRef.current = value;
    // Also update the editor ref if it exists (for when form is reset externally)
    if (reviewEditorRef.current && reviewEditorRef.current.getMarkdown() !== value) {
      reviewEditorRef.current.setMarkdown(value);
    }
  }, []);

  // Get the registered field with validation rules
  const registeredField = register(name as Path<TFieldValues>, {
    required: requiredMessage ? { value: true, message: requiredMessage } : undefined,
    validate: (value) => {
      /* Fixed by Codex on 2026-02-27
         Who: Codex
         What: Chain custom and schema validators instead of returning from the first one.
         Why: Fields that need both rules (for example, year format + start/end ordering) were skipping schema checks.
         How: Run custom validation first, and only continue to schema validation when custom validation passes. */
      if (validateFn) {
        const customValidationResult = validateFn(value);
        if (customValidationResult !== true) {
          return customValidationResult;
        }
      }
      if (schema) {
        const result = schema.safeParse(value);
        if (!result.success) {
          return result.error.issues[0]?.message ?? 'Invalid input';
        }
      }
      return true;
    },
  });

  // Create a wrapper for onChange that updates both form and markdown state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    registeredField.onChange(e);
    if (supportMarkdown || supportLatex) {
      setMarkdown(e.target.value);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  /* Fixed by Codex on 2026-02-19
     Who: Codex
     What: Add Ctrl/Cmd+Enter submit support for plain textarea inputs.
     Why: Abstract/note fields built with FormInput should submit quickly from keyboard.
     How: On modifier+Enter, prevent default newline and submit the owning form. */
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey) || e.key !== 'Enter') return;
    if (readOnly || isSubmitting) return;
    const parentForm = e.currentTarget.form;
    if (!parentForm) return;

    e.preventDefault();
    e.stopPropagation();
    parentForm.requestSubmit();
  };

  useEffect(() => {
    if (isSuccess) {
      setMarkdown('');
    }
  }, [isSuccess]);

  // Get support text based on markdown and latex support
  const getSupportText = () => {
    switch (true) {
      case supportMarkdown && supportLatex:
        return 'Markdown & Latex Supported';
      case supportMarkdown:
        return 'Markdown Supported';
      case supportLatex:
        return 'Latex Supported';
      default:
        return '';
    }
  };

  const commonProps = {
    id: String(name),
    placeholder,
    readOnly,
    autoFocus,
    ...registeredField,
    onChange: handleChange,
    className: cn(
      'mt-1 block w-full px-3 py-2 ring-1 ring-common-contrast rounded-md shadow-sm focus:outline-none focus:ring-functional-green res-text-sm focus:ring-1 placeholder:text-text-tertiary text-text-primary bg-common-background break-words [overflow-wrap:anywhere] min-w-0',
      inputClassName,
      error && !readOnly && !isSubmitting ? 'border-functional-red' : 'border-common-minimal',
      readOnly ? 'bg-common-cardBackground md:bg-common-minimal focus:ring-common-contrast' : '',
      isPasswordField ? 'pr-10' : ''
    ),
  };

  return (
    <div className="w-full">
      {/* Only render the watch component when needed - this avoids useWatch errors when control is not provided */}
      {needsWatch && control && (
        <WatchedFieldSync
          control={control}
          name={name as Path<TFieldValues>}
          onValueChange={handleWatchedValueChange}
        />
      )}
      {label && (
        <div className="mb-2 flex items-center space-x-2">
          <span className={cn('font-medium text-text-secondary res-text-xs', labelClassName)}>
            {label}
          </span>
          {info && <CustomTooltip info={info} />}
        </div>
      )}
      <div className="relative">
        {(supportMarkdown || supportLatex) && (
          <div className="absolute -top-6 right-2 flex items-center">
            <span className="ml-2 hidden text-xxs text-text-tertiary/70 sm:block">
              {getSupportText()}
            </span>
          </div>
        )}
        <div>
          {textArea ? (
            supportMarkdown || supportLatex ? (
              <ForwardRefEditor
                markdown={markdown}
                ref={reviewEditorRef}
                onChange={(newMarkdown) => {
                  markdownRef.current = newMarkdown;
                  // Notify react-hook-form of the value change
                  registeredField.onChange({
                    target: {
                      name: name as string,
                      value: newMarkdown,
                    },
                  });
                  // Update local markdown state for preview
                  setMarkdown(newMarkdown);
                }}
                onBlur={registeredField.onBlur}
                hideToolbar
                placeholder={placeholder || commonProps.placeholder}
                readOnly={readOnly}
                mentionCandidates={mentionCandidates}
              />
            ) : (
              <textarea {...commonProps} rows={4} onKeyDown={handleTextareaKeyDown} />
            )
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
                  /* Fixed by Codex on 2026-02-15
                     Who: Codex
                     What: Allow keyboard access to the password visibility toggle.
                     Why: tabIndex -1 hides the control from keyboard users.
                     How: Remove the negative tabIndex so it can receive focus. */
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && !readOnly && !isSubmitting && (
        <p className="mt-2 text-functional-red res-text-xs">{String(error.message)}</p>
      )}

      {!error && helperText && !isSubmitting && (
        <>
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Tokenize helper text color.
              Why: Ensure input helper text adapts to skin palettes.
              How: Replace gray utility with text-tertiary token. */}
          <p className={cn('mt-2 text-text-tertiary res-text-xs', helperTextClassName)}>
            {helperText}
          </p>
        </>
      )}
    </div>
  );
};

export default FormInput;
