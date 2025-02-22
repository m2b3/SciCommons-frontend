import React from 'react';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

interface TextSkeletonProps {
  className?: string;
}

const Skeleton = ({ className, children }: SkeletonProps) => {
  return (
    <div className={cn('flex w-full animate-pulse flex-col gap-2 p-4', className)}>{children}</div>
  );
};

const TextSkeleton = ({ className }: TextSkeletonProps) => {
  return <div className={cn('h-4 w-full rounded bg-common-minimal', className)} />;
};

const BlockSkeleton = ({ className }: SkeletonProps) => {
  return <div className={cn('h-20 w-full rounded-md bg-common-minimal', className)} />;
};

export { Skeleton, TextSkeleton, BlockSkeleton };
