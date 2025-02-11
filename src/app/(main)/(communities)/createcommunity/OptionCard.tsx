import React from 'react';

import { cn } from '@/lib/utils';

type OptionType = 'public' | 'private' | 'hidden';

interface OptionCardProps {
  name: string;
  value: OptionType;
  selectedValue: OptionType;
  onChange: (value: OptionType) => void;
  showRadio?: boolean;
}

const OptionCard = ({
  name,
  value,
  selectedValue,
  onChange,
  showRadio = true,
}: OptionCardProps) => {
  return (
    <div
      className={cn(
        'w-fit cursor-pointer rounded-lg border-2 px-4 py-3 res-text-sm md:w-full',
        selectedValue === value
          ? 'border-functional-green bg-functional-green/10'
          : 'border-common-contrast'
      )}
      onClick={() => onChange(value)}
    >
      <div className="flex items-center justify-start gap-4">
        <input
          type="radio"
          name="type"
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
    </div>
  );
};

export default OptionCard;
