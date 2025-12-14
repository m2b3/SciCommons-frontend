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

  const color =
    status === 'connected'
      ? 'bg-green-500'
      : status === 'connecting' || status === 'reconnecting'
        ? 'bg-yellow-500'
        : status === 'error'
          ? 'bg-red-500'
          : 'bg-gray-400';

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
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white transition-all hover:bg-red-600"
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
