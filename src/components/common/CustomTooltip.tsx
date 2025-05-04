import React from 'react';

import { Info } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CustomTooltipProps {
  info: string;
}

const CustomTooltip = ({ info }: CustomTooltipProps) => {
  return (
    <TooltipProvider delayDuration={10}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">
            <Info size={12} className="text-text-secondary" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="res-text-xs">{info}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CustomTooltip;
