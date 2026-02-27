'use client';

import React, { useState } from 'react';

import { X } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtime } from '@/hooks/useRealtime';
import { cn } from '@/lib/utils';

type Props = { className?: string };

export const RealtimeStatus: React.FC<Props> = ({ className }) => {
  const { status, isLeader } = useRealtime();
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  /* Fixed by Codex on 2026-02-15
     Who: Codex
     What: Replace realtime status colors with functional tokens.
     Why: Keep status dot palettes consistent across skins.
     How: Map connection states to functional color tokens. */
  const color =
    status === 'connected'
      ? 'bg-functional-green'
      : status === 'connecting' || status === 'reconnecting'
        ? 'bg-functional-yellow'
        : status === 'error'
          ? 'bg-functional-red'
          : 'bg-functional-gray';

  const label = `${status}${isLeader ? ' · leader' : ''}`;

  if (!isVisible) return null;

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-common-minimal bg-transparent px-2 py-1 text-xs',
                className
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', color)} />
              <span className="text-xs font-medium text-text-tertiary">{label}</span>

              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(false);
                  }}
                  /* Fixed by Codex on 2026-02-15
                     Who: Codex
                     What: Tokenize realtime badge close-button colors.
                     Why: Align state styling with skin palettes.
                     How: Use functional red + tokenized foreground. */
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-functional-red text-primary-foreground transition-all hover:bg-functional-redContrast"
                  aria-label="Close"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Please Ignore. This is for testing purpose.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default RealtimeStatus;
