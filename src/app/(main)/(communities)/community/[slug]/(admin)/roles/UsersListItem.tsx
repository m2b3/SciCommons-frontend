import React from 'react';

import Image from 'next/image';

import { CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { useCommunitiesMembersApiManageCommunityMember } from '@/api/community-members/community-members';
import { Button, ButtonTitle } from '@/components/ui/button';
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
  reviewedArticles?: number;
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
    <div className="mb-2 flex items-center justify-between rounded-xl border border-common-contrast bg-common-cardBackground p-4 text-text-primary res-text-sm">
      <div className="flex flex-col items-start">
        <div className="flex items-center">
          <Image
            src={profilePicture || `data:image/png;base64,${imageData}`}
            alt={name}
            width={42}
            height={42}
            className="mr-4 aspect-square shrink-0 rounded-full"
          />
          <div className="flex flex-col">
            <p className="font-bold text-text-primary">{name}</p>
            <p className="text-text-tertiary res-text-xs">Member since {memberSince}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-text-secondary res-text-xs">
          {reviewedArticles != 0 && (
            <div className="flex items-center">
              <CheckCircle size={16} className="mr-1" />
              <p>{reviewedArticles} Articles Reviewed</p>
            </div>
          )}
          <div className="flex items-center">
            <FileText size={16} className="mr-1" />
            <p>{submittedArticles} Articles Submitted</p>
          </div>
        </div>
      </div>
      {activeTab === 'Members' && (
        <div className="flex space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isPending} variant="default">
                <ButtonTitle>Promote</ButtonTitle>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => !isPending && handleAction(Action.PromoteModerator)}
                className="cursor-pointer"
              >
                Moderator
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => !isPending && handleAction(Action.PromoteReviewer)}
                className="cursor-pointer"
              >
                Reviewer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button disabled={isPending} variant="danger" onClick={() => handleAction(Action.Remove)}>
            <ButtonTitle>Remove</ButtonTitle>
          </Button>
        </div>
      )}
      {activeTab === 'Moderators' && (
        <Button
          loading={isPending}
          variant="gray"
          onClick={() => handleAction(Action.DemoteModerator)}
        >
          <ButtonTitle>{isPending ? 'Demoting...' : 'Demote'}</ButtonTitle>
        </Button>
      )}
      {activeTab === 'Reviewers' && (
        <Button
          loading={isPending}
          variant="gray"
          onClick={() => handleAction(Action.DemoteReviewer)}
        >
          <ButtonTitle>{isPending ? 'Demoting...' : 'Demote'}</ButtonTitle>
        </Button>
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
