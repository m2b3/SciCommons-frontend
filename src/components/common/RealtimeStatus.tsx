'use client';

import React from 'react';

import { useRealtime } from '@/hooks/useRealtime';
import { cn } from '@/lib/utils';

type Props = { className?: string };

export const RealtimeStatus: React.FC<Props> = ({ className }) => {
  const { status, isLeader } = useRealtime();

  const color =
    status === 'connected'
      ? 'bg-green-500'
      : status === 'connecting' || status === 'reconnecting'
        ? 'bg-yellow-500'
        : status === 'error'
          ? 'bg-red-500'
          : 'bg-gray-400';

  const label = `${status}${isLeader ? ' · leader' : ''}`;

  return (
    <div
      className={cn(
        'flex w-fit items-center gap-2 whitespace-nowrap rounded-full border border-common-minimal bg-transparent px-2 py-1 text-xs',
        className
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', color)} />
      <span className="text-xs font-medium text-text-tertiary">{label}</span>
    </div>
  );
};

export default RealtimeStatus;
