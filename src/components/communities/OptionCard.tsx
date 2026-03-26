import React, { useId } from 'react';

import { cn } from '@/lib/utils';

type OptionType = 'public' | 'private' | 'hidden';

interface OptionCardProps {
  name: string;
  value: OptionType;
  selectedValue: OptionType;
  onChange: (value: OptionType) => void;
  showRadio?: boolean;
  groupName?: string;
}

const OptionCard = ({
  name,
  value,
  selectedValue,
  onChange,
  showRadio = true,
  groupName = 'type',
}: OptionCardProps) => {
  const optionId = useId();
  return (
    <label
      htmlFor={optionId}
      className={cn(
        'w-fit cursor-pointer rounded-lg border-2 px-4 py-3 res-text-sm md:w-full',
        selectedValue === value
          ? 'border-functional-green bg-functional-green/10'
          : 'border-common-contrast'
      )}
    >
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Convert card wrapper to a label tied to the radio input.
          Why: Clickable divs are not keyboard accessible.
          How: Use a real form control with a label and keep the full card clickable. */}
      <div className="flex items-center justify-start gap-4">
        {/* Fixed by Codex on 2026-02-15
            Who: Codex
            What: Allow distinct radio group names via groupName.
            Why: Separate option sets must not share the same radio group.
            How: Default to "type" but let callers override the name. */}
        <input
          id={optionId}
          type="radio"
          name={groupName}
          value={value}
          checked={selectedValue === value}
          onChange={() => onChange(value)}
          className={cn(
            'form-radio aspect-square h-4 w-4 bg-functional-green text-functional-green',
            {
              hidden: !showRadio,
            }
          )}
        />
        <div className="whitespace-nowrap font-semibold text-text-primary res-text-sm">{name}</div>
      </div>
    </label>
  );
};

export default OptionCard;
