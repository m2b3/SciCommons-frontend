import React from 'react';

import { ControllerFieldState } from 'react-hook-form';
import { toast } from 'sonner';

import MultipleSelector, { Option } from '@/components/ui/multiple-selector';

import CustomTooltip from './CustomTooltip';

interface LabeledSelectorProps {
  label: string;
  tooltipText: string;
  value: Option[];
  onChange: React.Dispatch<React.SetStateAction<Option[]>>;
  placeholder: string;
  creatable?: boolean;
  disabled?: boolean;
  options?: string[];
  fieldState: ControllerFieldState;
  maxOptions?: number;
  readonly?: boolean;
}

const MultiLabelSelector: React.FC<LabeledSelectorProps> = React.memo(
  ({
    label,
    tooltipText,
    placeholder,
    creatable = false,
    disabled,
    value,
    onChange,
    fieldState,
    maxOptions,
    readonly = false,
  }) => {
    return (
      <div>
        <label className="mb-2 flex items-center font-medium text-text-secondary res-text-xs">
          {label}
          <div className="ml-2">
            <CustomTooltip info={tooltipText} />
          </div>
        </label>
        <MultipleSelector
          value={value}
          onChange={onChange}
          hidePlaceholderWhenSelected
          placeholder={placeholder}
          creatable={creatable}
          disabled={disabled}
          maxSelected={maxOptions || undefined}
          onMaxSelected={(maxLimit) => {
            toast.error(`You can only create ${maxLimit} options.`);
          }}
          emptyIndicator={
            <p className="text-center leading-10 text-text-tertiary res-text-xs">
              no results found.
            </p>
          }
          readOnly={readonly}
        />
        {fieldState.error && (
          <p className="mt-1 text-xs text-functional-red">{fieldState.error.message}</p>
        )}
      </div>
    );
  }
);

MultiLabelSelector.displayName = 'MultiLabelSelector';

export default MultiLabelSelector;
