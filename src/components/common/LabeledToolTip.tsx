import React from 'react';

import { Info } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LabeledTooltipProps {
  label: string;
  info: string;
}

const LabeledTooltip: React.FC<LabeledTooltipProps> = ({ label, info }) => {
  return (
    <div className="mb-2 flex items-center space-x-2">
      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>
              <Info size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{info}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default LabeledTooltip;
