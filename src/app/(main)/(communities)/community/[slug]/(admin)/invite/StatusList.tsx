import React, { useEffect, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { Check, Clock, MailIcon, X } from 'lucide-react';

import { useCommunitiesApiInvitationGetCommunityInvitations } from '@/api/community-invitations/community-invitations';
import { Skeleton, TextSkeleton } from '@/components/common/Skeleton';
import { showErrorToast } from '@/lib/toastHelpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const StatusList = ({ slug }: { slug: string }) => {
  const [filter, setFilter] = useState<'All' | 'Accepted' | 'Pending' | 'Rejected'>('All');

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as 'All' | 'Accepted' | 'Pending' | 'Rejected');
  };

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error, isPending } = useCommunitiesApiInvitationGetCommunityInvitations(slug, {
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const filteredItems = data?.data.filter((item) => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  return (
    <div className="my-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4 text-text-primary">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium res-heading-xs">Status</h2>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="block w-40 rounded-md border-gray-300 px-3 py-2 res-text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
        >
          <option value="All">All</option>
          <option value="Accepted">Accepted</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      {error && <p className="text-functional-red res-text-sm">An error occurred.</p>}
      {isPending && Array.from({ length: 2 }).map((_, index) => filteredItemSkeleton(index))}
      {filteredItems?.length === 0 && (
        <p className="text-text-secondary res-text-sm">No items found.</p>
      )}
      {filteredItems &&
        filteredItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              'mb-2 flex items-center justify-between rounded-xl border border-common-contrast bg-common-cardBackground p-4'
            )}
          >
            <div>
              {item.email ? (
                <div>
                  <div className="flex items-center">
                    <MailIcon className="mr-2 size-4" />
                    <p className="text-text-primary res-text-sm">{item.email}</p>
                  </div>
                  <p className="text-text-tertiary res-text-xs">
                    Sent at {dayjs(item.invited_at).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-text-primary res-text-sm">{item.username}</p>
                  <p className="text-functional-green res-text-sm">View Profile</p>
                  <p className="text-text-tertiary res-text-xs">
                    Sent at {dayjs(item.invited_at).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
              )}
            </div>
            <div>
              <span
                className={clsx(
                  'flex items-center gap-1 res-text-xs',
                  item.status === 'Accepted' && 'text-functional-green',
                  item.status === 'Pending' && 'text-text-secondary',
                  item.status === 'Rejected' && 'text-functional-red'
                )}
              >
                {item.status === 'Accepted' && <Check className="size-3 text-functional-green" />}
                {item.status === 'Pending' && <Clock className="size-3 text-text-secondary" />}
                {item.status === 'Rejected' && <X className="size-3 text-functional-red" />}
                {item.status}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
};

export default StatusList;

const filteredItemSkeleton = (key: number) => {
  return (
    <Skeleton
      className="mb-4 flex flex-col gap-2 rounded-xl border border-common-contrast bg-common-cardBackground p-4"
      key={key}
    >
      <TextSkeleton className="w-28" />
      <TextSkeleton className="w-56" />
    </Skeleton>
  );
};
