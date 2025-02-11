import React from 'react';

import { Info } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LabeledTooltipProps {
  label: string;
  info: string;
}

const LabeledTooltip: React.FC<LabeledTooltipProps> = ({ label, info }) => {
  return (
    <div className="mb-2 flex items-center space-x-2 res-text-sm">
      <span className="font-medium text-text-secondary res-text-xs">{label}</span>
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
