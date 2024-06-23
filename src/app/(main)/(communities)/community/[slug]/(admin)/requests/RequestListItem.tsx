import React from 'react';

import Image from 'next/image';

import clsx from 'clsx';
import dayjs from 'dayjs';

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
    <div className="mb-2 flex items-center justify-between rounded-md border bg-white p-4 shadow-md">
      <div className="flex items-center">
        <Image
          src={profilePicture ? profilePicture : '/images/default-avatar.png'}
          alt={name}
          width={48}
          height={48}
          className="mr-4 rounded-full"
        />
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-bold">{name}</p>
            <p className="text-sm text-gray-500">
              Requested on {dayjs(requestedAt).format('DD MMM YYYY')}
            </p>
          </div>
          <p className="cursor-pointer text-green-500">View Profile</p>
        </div>
      </div>
      <div className="flex space-x-4">
        {status === 'pending' && (
          <>
            <button
              className={clsx(
                'rounded-md px-4 py-2',
                isPending
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
              )}
              onClick={() => handleAction(joinRequestId, 'approve', communityId)}
              disabled={isPending}
            >
              Accept
            </button>
            <button
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              onClick={() => handleAction(joinRequestId, 'reject', communityId)}
              disabled={isPending}
            >
              Reject
            </button>
          </>
        )}
        {status === 'approved' && (
          <span className="rounded-md bg-green-500 px-4 py-2 text-white">Approved</span>
        )}
        {status === 'rejected' && (
          <span className="rounded-md bg-red-500 px-4 py-2 text-white">Rejected</span>
        )}
      </div>
    </div>
  );
};

export default RequestListItem;

export const RequestListItemSkeleton = () => {
  return (
    <div className="mb-2 flex animate-pulse items-center justify-between rounded-md border bg-white p-4 shadow-md">
      <div className="flex items-center">
        <div className="mr-4 h-12 w-12 rounded-full bg-gray-300"></div>
        <div className="flex flex-col gap-2">
          <div>
            <div className="h-4 w-24 rounded bg-gray-300"></div>
            <div className="mt-2 h-3 w-32 rounded bg-gray-300"></div>
          </div>
          <div className="h-4 w-16 rounded bg-gray-300"></div>
        </div>
      </div>
      <div className="flex space-x-4">
        <div className="h-8 w-20 rounded bg-gray-300"></div>
        <div className="h-8 w-20 rounded bg-gray-300"></div>
      </div>
    </div>
  );
};
