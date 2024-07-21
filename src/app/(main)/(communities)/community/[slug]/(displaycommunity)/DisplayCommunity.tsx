'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

import '@/api/communities/communities';
import { useCommunitiesApiJoinJoinCommunity } from '@/api/join-community/join-community';
import { CommunityOut } from '@/api/schemas';
import TruncateText from '@/components/common/TruncateText';
import { useAuthStore } from '@/stores/authStore';

import ArticleSubmission from './ArticleSubmission';

interface DisplayCommunityProps {
  community: CommunityOut;
  refetch: () => void;
}

const DisplayCommunity: React.FC<DisplayCommunityProps> = ({ community, refetch }) => {
  const params = useParams<{ slug: string }>();

  const accessToken = useAuthStore((state) => state.accessToken);
  const axiosConfig = { headers: { Authorization: `Bearer ${accessToken}` } };

  const { mutate, data, isSuccess, error } = useCommunitiesApiJoinJoinCommunity({
    request: axiosConfig,
  });

  const handleJoin = () => {
    mutate({ communityId: community.id });
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
    <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
      <div className="relative h-52 w-full">
        <Image
          src={community.banner_pic_url || 'https://picsum.photos/200/300'}
          alt="Community Cover"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="relative p-4">
        <div className="absolute left-4 top-0 -translate-y-1/2 transform">
          <div className="relative h-24 w-24">
            <Image
              src={community.profile_pic_url || 'https://picsum.photos/200/300'}
              alt="Profile"
              layout="fill"
              objectFit="cover"
              className="rounded-full border-4 border-white shadow-md dark:border-gray-700"
            />
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{community.name}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            <TruncateText text={community.description} maxLines={2} />
          </p>
        </div>
        <div className="absolute right-4 top-4">
          <button className="flex items-center space-x-2 rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
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
              <Link href={`/community/${params.slug}/dashboard`}>
                <button className="rounded-full bg-black px-4 py-2 text-white dark:bg-white dark:text-black">
                  Dashboard
                </button>
              </Link>
            </>
          )}
          {!community.is_admin && community.is_member && (
            <>
              <ArticleSubmission communityName={community.name} />
              <button className="rounded-full bg-gray-200 px-4 py-2 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                Joined
              </button>
            </>
          )}
          {!community.is_admin &&
            !community.is_member &&
            community.join_request_status === 'pending' && (
              <button className="rounded-full bg-gray-200 px-4 py-2 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                Requested
              </button>
            )}
          {!community.is_admin &&
            !community.is_member &&
            community.join_request_status !== 'pending' && (
              <button
                onClick={() => handleJoin()}
                className="rounded-full bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
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
