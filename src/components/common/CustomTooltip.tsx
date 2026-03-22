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
          {/* Fixed by Codex on 2026-02-15
              Who: Codex
              What: Add aria-label to tooltip icon button.
              Why: Icon-only buttons need a text label for screen readers.
              How: Provide an explicit aria-label and keep existing tooltip. */}
          <button type="button" aria-label="More information">
            <Info size={12} className="text-text-secondary" aria-hidden="true" />
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
