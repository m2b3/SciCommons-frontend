import React, { useEffect, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { MailIcon } from 'lucide-react';

import { useCommunitiesApiInvitationGetCommunityInvitations } from '@/api/community-invitations/community-invitations';
import { showErrorToast } from '@/lib/toastHelpers';
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
      {error && <p className="text-red-500 res-text-sm">An error occurred.</p>}
      {isPending && Array.from({ length: 2 }).map((_, index) => filteredItemSkeleton(index))}
      {filteredItems?.length === 0 && <p className="text-gray-500 res-text-sm">No items found.</p>}
      {filteredItems &&
        filteredItems.map((item, index) => (
          <div
            key={index}
            className="mb-2 flex items-center justify-between rounded-md border border-gray-200 p-4"
          >
            <div>
              {item.email ? (
                <div>
                  <div className="flex items-center">
                    <MailIcon className="mr-2" />
                    <p className="res-text-sm">{item.email}</p>
                  </div>
                  <p className="text-gray-500 res-text-xs">
                    Sent at {dayjs(item.invited_at).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold res-text-sm">{item.username}</p>
                  <p className="text-green-500 res-text-sm">View Profile</p>
                  <p className="text-gray-500 res-text-xs">
                    Sent at {dayjs(item.invited_at).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
              )}
            </div>
            <div>
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-white res-text-xs',
                  item.status === 'Accepted' && 'bg-green-500',
                  item.status === 'Pending' && 'bg-gray-400',
                  item.status === 'Rejected' && 'bg-red-500'
                )}
              >
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
    <div
      key={key}
      className="mb-2 flex animate-pulse items-center justify-between rounded-md border border-gray-200 bg-gray-100 p-4"
    >
      <div>
        <div className="flex items-center">
          <div className="h-6 w-20 bg-gray-200"></div>
        </div>
        <div className="h-4 w-10 bg-gray-200"></div>
      </div>
      <div>
        <div className="rounded-full bg-gray-200 px-3 py-1"></div>
      </div>
    </div>
  );
};
