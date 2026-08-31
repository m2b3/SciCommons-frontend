'use client';

/* Added by Claude on 2026-08-10
   What: Chip-style list input used by the Feed Preferences form.
   Why: Each preference field is a list of free-text entries (a keyword can be a whole
        boolean expression), so a plain text input or a fixed dropdown does not fit.
   How: Enter adds the typed value, Backspace on an empty input removes the last chip. */
import React, { useState } from 'react';

import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PreferenceChipInputProps {
  id: string;
  label: string;
  description: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

const PreferenceChipInput: React.FC<PreferenceChipInputProps> = ({
  id,
  label,
  description,
  placeholder,
  values,
  onChange,
  disabled = false,
}) => {
  const [draft, setDraft] = useState('');

  const addDraft = () => {
    const value = draft.trim();
    if (!value) return;

    // Same duplicate rule as the backend, so what you see is what gets stored.
    const isDuplicate = values.some((entry) => entry.toLowerCase() === value.toLowerCase());
    if (!isDuplicate) {
      onChange([...values, value]);
    }

    setDraft('');
  };

  const removeAt = (indexToRemove: number) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Keep Enter from submitting the surrounding form.
      event.preventDefault();
      addDraft();
      return;
    }

    if (event.key === 'Backspace' && !draft && values.length > 0) {
      removeAt(values.length - 1);
    }
  };

  return (
    <div className="border-b border-common-minimal py-5 last:border-b-0">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <p className="mt-0.5 text-xs text-text-tertiary">{description}</p>

      <div
        className={cn(
          'mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-input bg-common-cardBackground px-3 py-2',
          disabled && 'opacity-50'
        )}
      >
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-full bg-functional-green/10 py-1 pl-3 pr-2 text-xs text-functional-green"
          >
            <span className="truncate">{value}</span>
            <button
              type="button"
              aria-label={`Remove ${value}`}
              disabled={disabled}
              onClick={() => removeAt(index)}
              className="rounded-full p-0.5 hover:bg-functional-green/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-functional-green/60"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        <input
          id={id}
          type="text"
          value={draft}
          disabled={disabled}
          placeholder={values.length ? 'Add another…' : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          // Don't silently drop something the user typed but never pressed Enter on.
          onBlur={addDraft}
          className="h-8 min-w-[12rem] flex-1 bg-transparent text-sm text-text-primary caret-text-primary placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>

      <p className="mt-1.5 text-[11px] text-text-tertiary">Press Enter to add each entry.</p>
    </div>
  );
};

export default PreferenceChipInput;
