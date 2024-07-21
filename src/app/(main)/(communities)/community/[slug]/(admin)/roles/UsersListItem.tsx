import React from 'react';

import Image from 'next/image';

import { CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCommunitiesMembersApiManageCommunityMember } from '@/api/community-members/community-members';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';
import { Action } from '@/types';

interface UsersListItemProps {
  communityId: number;
  name: string;
  memberSince: string;
  reviewedArticles: number;
  submittedArticles: number;
  profilePicture?: string | null;
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
  const imageData = useIdenticon(60);

  const { mutate, isPending } = useCommunitiesMembersApiManageCommunityMember({
    request: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const handleAction = (action: Action) => {
    mutate(
      {
        communityId,
        userId,
        action,
      },
      {
        onSuccess: (data) => {
          toast.success(`${data.data.message}`);
          refetch();
        },
        onError: (error) => {
          showErrorToast(error);
        },
      }
    );
  };

  return (
    <div className="mb-2 flex items-center justify-between rounded-md border bg-white p-4 shadow-md">
      <div className="flex items-center">
        <Image
          src={profilePicture || `data:image/png;base64,${imageData}`}
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
