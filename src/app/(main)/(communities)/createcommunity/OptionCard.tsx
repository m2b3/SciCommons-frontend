import React, { useId } from 'react';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type OptionType = 'public' | 'private' | 'hidden';

interface OptionCardProps {
  name: string;
  value: OptionType;
  selectedValue: OptionType;
  onChange: (value: OptionType) => void;
  showRadio?: boolean;
  showSwitch?: boolean;
  groupName?: string;
}

const OptionCard = ({
  name,
  value,
  selectedValue,
  onChange,
  showRadio = true,
  showSwitch = false,
  groupName = 'type',
}: OptionCardProps) => {
  const showRadioFinal = showRadio && !showSwitch;
  const showSwitchFinal = showSwitch && !showRadio;
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
          What: Replace div click handler with a labeled form control.
          Why: Ensures keyboard users can select options without relying on mouse.
          How: Tie the label to the radio input via a generated id. */}
      <div className="flex items-center justify-start gap-4">
        {/* Fixed by Codex on 2026-02-15
            Who: Codex
            What: Allow callers to pass a radio group name.
            Why: The public settings and type options should be separate radio groups.
            How: Default to "type" but accept a groupName override. */}
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
              hidden: !showRadioFinal,
            }
          )}
        />
        <Switch
          className={cn('', {
            hidden: !showSwitchFinal,
          })}
        />
        <div className="whitespace-nowrap font-semibold text-text-primary res-text-sm">{name}</div>
      </div>
    </label>
  );
};

export default OptionCard;
