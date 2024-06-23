import React, { useEffect, useState } from 'react';

import clsx from 'clsx';
import dayjs from 'dayjs';
import { MailIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCommunitiesApiInvitationGetCommunityInvitations } from '@/api/community-invitations/community-invitations';
import { useAuthStore } from '@/stores/authStore';

const StatusList: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Accepted' | 'Pending' | 'Rejected'>('All');

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as 'All' | 'Accepted' | 'Pending' | 'Rejected');
  };

  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, error, isPending } = useCommunitiesApiInvitationGetCommunityInvitations(1, {
    axios: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  useEffect(() => {
    if (error) {
      console.log(error);
      toast.error(`Error: ${error.response?.data.message}`);
    }
  }, [error]);

  const filteredItems = data?.data.filter((item) => {
    if (filter === 'All') return true;
    return item.status === filter;
  });

  return (
    <div className="my-4 rounded-lg bg-white p-4 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Status</h2>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="block w-40 rounded-md border-gray-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value="All">All</option>
          <option value="Accepted">Accepted</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      {error && <p className="text-red-500">An error occurred.</p>}
      {isPending && Array.from({ length: 2 }).map(() => filteredItemSkeleton())}
      {filteredItems?.length === 0 && <p className="text-gray-500">No items found.</p>}
      {filteredItems &&
        filteredItems.map((item, index) => (
          <div key={index} className="mb-2 flex items-center justify-between rounded-md border p-4">
            <div>
              {item.email ? (
                <div>
                  <div className="flex items-center">
                    <MailIcon className="mr-2" />
                    <p>{item.email}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Sent at {dayjs(item.invited_at).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold">{item.username}</p>
                  <p className="text-green-500">View Profile</p>
                  <p className="text-sm text-gray-500">
                    Sent at {dayjs(item.invited_at).format('YYYY-MM-DD HH:mm:ss')}
                  </p>
                </div>
              )}
            </div>
            <div>
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-white',
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

const filteredItemSkeleton = () => {
  return (
    <div className="mb-2 flex animate-pulse items-center justify-between rounded-md border bg-gray-200 p-4">
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
