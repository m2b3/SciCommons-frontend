'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Bell } from 'lucide-react';
import { toast } from 'sonner';

import '@/api/communities/communities';
import { useCommunitiesApiJoinJoinCommunity } from '@/api/join-community/join-community';
import { CommunityOut } from '@/api/schemas';
import TruncateText from '@/components/common/TruncateText';
import useIdenticon from '@/hooks/useIdenticons';
import { showErrorToast } from '@/lib/toastHelpers';

import ArticleSubmission from './ArticleSubmission';

interface DisplayCommunityProps {
  community: CommunityOut;
  refetch: () => void;
}

const DisplayCommunity: React.FC<DisplayCommunityProps> = ({ community, refetch }) => {
  const params = useParams<{ slug: string }>();
  const imageData = useIdenticon(60);

  const { mutate, data, isSuccess, error } = useCommunitiesApiJoinJoinCommunity();

  const handleJoin = () => {
    mutate({ communityId: community.id });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(`${data.data.message}`);
      refetch();
    }
    if (error) {
      showErrorToast(error);
    }
  }, [isSuccess, error, data, refetch]);

  return (
    <div className="overflow-hidden rounded-lg bg-white-secondary shadow-md">
      <div className="relative h-52 w-full">
        <Image
          src={community.banner_pic_url || `data:image/png;base64,${imageData}`}
          alt="Community Cover"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="relative p-4">
        <div className="absolute left-4 top-0 -translate-y-1/2 transform">
          <div className="relative h-24 w-24">
            <Image
              src={community.profile_pic_url || `data:image/png;base64,${imageData}`}
              alt="Profile"
              layout="fill"
              objectFit="cover"
              className="rounded-full border-4 border-white shadow-md"
            />
          </div>
        </div>
        <div className="mt-12">
          <h2 className="font-bold text-gray-900 res-heading-sm">{community.name}</h2>
          <p className="mt-2 text-gray-600 res-text-sm">
            <TruncateText text={community.description} maxLines={2} />
          </p>
        </div>
        <div className="absolute right-4 top-4">
          <button className="flex items-center space-x-2 rounded-md bg-gray-200 px-3 py-1 text-gray-700 res-text-xs hover:bg-gray-300">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="ml-auto flex items-center justify-end space-x-4 p-4">
          {community.is_admin && (
            <>
              <ArticleSubmission communityName={community.name} />
              <Link href={`/community/${params?.slug}/dashboard`}>
                <button className="rounded-full bg-black px-4 py-2 text-white res-text-sm">
                  Dashboard
                </button>
              </Link>
            </>
          )}
          {!community.is_admin && community.is_member && (
            <>
              <ArticleSubmission communityName={community.name} />
              <button className="rounded-full bg-gray-200 px-4 py-2 text-gray-700 res-text-sm">
                Joined
              </button>
            </>
          )}
          {!community.is_admin &&
            !community.is_member &&
            community.join_request_status === 'pending' && (
              <button className="rounded-full bg-gray-200 px-4 py-2 text-gray-700 res-text-sm">
                Requested
              </button>
            )}
          {!community.is_admin &&
            !community.is_member &&
            community.join_request_status !== 'pending' && (
              <button
                onClick={() => handleJoin()}
                className="rounded-full bg-green-500 px-4 py-2 text-white res-text-sm hover:bg-green-600"
              >
                Join Community
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default DisplayCommunity;

export const DisplayCommunitySkeleton: React.FC = () => {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg bg-white-secondary shadow-md">
      <div className="relative h-60 w-full bg-gray-300"></div>
      <div className="relative p-4">
        <div className="absolute left-4 top-0 -translate-y-1/2 transform">
          <div className="relative h-24 w-24 rounded-full border-4 bg-gray-300 shadow-md"></div>
        </div>
        <div className="mt-12">
          <div className="h-6 w-2/3 rounded bg-gray-300"></div>
          <div className="mt-2 h-4 w-full rounded bg-gray-300"></div>
          <div className="mt-1 h-4 w-5/6 rounded bg-gray-300"></div>
        </div>
        <div className="absolute right-4 top-4">
          <div className="flex items-center space-x-2 rounded-md bg-gray-200 px-3 py-1 text-gray-700">
            <div className="h-5 w-5 rounded-full bg-gray-300"></div>
            <span className="h-5 w-20 rounded bg-gray-300"></span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-gray-200 px-4 py-2">
        <div className="flex space-x-6"></div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-full bg-gray-300"></div>
          <div className="h-10 w-28 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};
