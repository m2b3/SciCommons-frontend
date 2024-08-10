import React from 'react';

import { Info } from 'lucide-react';
import { ControllerFieldState } from 'react-hook-form';

import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  }) => {
    return (
      <div>
        <label className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          <span className="ml-2 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={16} />
                </TooltipTrigger>
                <TooltipContent className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </label>
        <MultipleSelector
          value={value}
          onChange={onChange}
          hidePlaceholderWhenSelected
          placeholder={placeholder}
          creatable={creatable}
          disabled={disabled}
          emptyIndicator={
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              no results found.
            </p>
          }
        />
        {fieldState.error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{fieldState.error.message}</p>
        )}
      </div>
    );
  }
);

MultiLabelSelector.displayName = 'MultiLabelSelector';

export default MultiLabelSelector;
