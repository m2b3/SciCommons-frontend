import React from 'react';

type OptionType = 'public' | 'locked' | 'hidden';

interface OptionCardProps {
  name: string;
  description: string;
  value: OptionType;
  selectedValue: OptionType;
  onChange: (value: OptionType) => void;
}

const OptionCard = ({ name, description, value, selectedValue, onChange }: OptionCardProps) => {
  return (
    <div
      className={`cursor-pointer rounded-lg border p-4 res-text-sm ${selectedValue === value ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
      onClick={() => onChange(value)}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">{name}</div>
        <input
          type="radio"
          name="type"
          value={value}
          checked={selectedValue === value}
          onChange={() => onChange(value)}
          className="form-radio h-5 w-5 text-green-600"
        />
      </div>
      <div className="text-gray-500">{description}</div>
    </div>
  );
};

export default OptionCard;
