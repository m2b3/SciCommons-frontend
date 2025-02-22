import React from 'react';

import Image from 'next/image';

import dayjs from 'dayjs';
import { Check, X } from 'lucide-react';

import { BlockSkeleton, Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import { Button, ButtonTitle } from '@/components/ui/button';

interface RequestListItemProps {
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  profilePicture?: string;
  handleAction: (id: number, action: 'approve' | 'reject', communityId: number) => void;
  isPending: boolean;
  joinRequestId: number;
  requestedAt: string;
  communityId: number;
}

const RequestListItem: React.FC<RequestListItemProps> = ({
  name,
  status,
  handleAction,
  isPending,
  joinRequestId,
  profilePicture,
  requestedAt,
  communityId,
}) => {
  return (
    <div className="mb-2 flex items-start justify-between rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:items-center">
      <div className="flex flex-col items-start gap-4 md:flex-row">
        <Image
          src={profilePicture ? profilePicture : '/images/default-avatar.png'}
          alt={name}
          width={48}
          height={48}
          className="aspect-square shrink-0 rounded-full"
        />
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-bold text-text-primary">{name}</p>
            <p className="text-sm text-text-tertiary">
              Requested on {dayjs(requestedAt).format('DD MMM YYYY')}
            </p>
          </div>
          {/* <p className="cursor-pointer text-green-500">View Profile</p> */}
        </div>
      </div>
      <div className="flex space-x-4">
        {status === 'pending' && (
          <>
            <Button
              variant={'default'}
              onClick={() => handleAction(joinRequestId, 'approve', communityId)}
              disabled={isPending}
              type="button"
            >
              <ButtonTitle>Accept</ButtonTitle>
            </Button>
            <Button
              variant={'danger'}
              onClick={() => handleAction(joinRequestId, 'reject', communityId)}
              disabled={isPending}
              type="button"
            >
              <ButtonTitle>Reject</ButtonTitle>
            </Button>
          </>
        )}
        {status === 'approved' && (
          <span className="flex items-center gap-1 text-functional-green res-text-xs">
            <Check className="size-3" /> Approved
          </span>
        )}
        {status === 'rejected' && (
          <span className="flex items-center gap-1 text-functional-red res-text-xs">
            <X className="size-3" /> Rejected
          </span>
        )}
      </div>
    </div>
  );
};

export default RequestListItem;

export const RequestListItemSkeleton = () => {
  return (
    <Skeleton className="flex flex-row gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4">
      <BlockSkeleton className="aspect-square size-12 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <TextSkeleton className="w-24" />
        <TextSkeleton className="w-56" />
        <TextSkeleton className="mt-2 w-32" />
      </div>
    </Skeleton>
  );
};
