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
            {/* Fixed by Codex on 2026-02-15
                Who: Codex
                What: Label the tooltip trigger for assistive tech.
                Why: Icon-only controls need a readable label.
                How: Add type=button and aria-label tied to the field label. */}
            <button type="button" aria-label={`${label} help`}>
              <Info size={16} aria-hidden="true" />
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
