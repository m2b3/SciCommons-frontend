import React, { useEffect } from 'react';

import Image from 'next/image';

import { CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCommunitiesApiAdminManageCommunityMember } from '@/api/community-admin/community-admin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { Action } from '@/types';

interface UsersListItemProps {
  communityId: number;
  name: string;
  memberSince: string;
  reviewedArticles: number;
  submittedArticles: number;
  profilePicture?: string;
  userId: number;
  activeTab: string;
  refetch: () => void;
}

const UsersListItem: React.FC<UsersListItemProps> = ({
  name,
  communityId,
  memberSince,
  reviewedArticles,
  submittedArticles,
  profilePicture,
  activeTab,
  userId,
  refetch,
}) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data, mutate, isSuccess, error, isPending } = useCommunitiesApiAdminManageCommunityMember(
    {
      axios: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );

  const handleAction = (action: Action) => {
    mutate({
      communityId,
      userId,
      action,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(`${data.data.message}`);
      refetch();
    }
    if (error) {
      toast.error(`${error.response?.data.message}`);
    }
  }, [isSuccess, error, data, refetch]);

  return (
    <div className="mb-2 flex items-center justify-between rounded-md border bg-white p-4 shadow-md">
      <div className="flex items-center">
        <Image
          src={profilePicture ? profilePicture : '/images/default-profile.png'}
          alt={name}
          width={48}
          height={48}
          className="mr-4 rounded-full"
        />
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-gray-500">Member since {memberSince}</p>
          <div className="mt-2 flex items-center text-gray-500">
            <div className="mr-4 flex items-center">
              <CheckCircle size={16} className="mr-1" />
              <p>{reviewedArticles} Articles Reviewed</p>
            </div>
            <div className="flex items-center">
              <FileText size={16} className="mr-1" />
              <p>{submittedArticles} Articles Submitted</p>
            </div>
          </div>
        </div>
      </div>
      {activeTab === 'Members' && (
        <div className="flex space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                {isPending ? 'Promoting...' : 'Promote'}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleAction(Action.PromoteModerator)}
                className="cursor-pointer"
              >
                Moderator
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction(Action.PromoteReviewer)}
                className="cursor-pointer"
              >
                Reviewer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            onClick={() => handleAction(Action.Remove)}
          >
            {isPending ? 'Removing...' : 'Remove'}
          </button>
        </div>
      )}
      {activeTab === 'Moderators' && (
        <button
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          onClick={() => handleAction(Action.DemoteModerator)}
        >
          {isPending ? 'Demoting...' : 'Demote'}
        </button>
      )}
      {activeTab === 'Reviewers' && (
        <button
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          onClick={() => handleAction(Action.DemoteReviewer)}
        >
          {isPending ? 'Demoting...' : 'Demote'}
        </button>
      )}
      {/* {activeTab === 'Admins' && (
        <button
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          onClick={() => handleAction(Action.DemoteAdmin)}
        >
          Demote
        </button>
      )} */}
    </div>
  );
};

export default UsersListItem;
