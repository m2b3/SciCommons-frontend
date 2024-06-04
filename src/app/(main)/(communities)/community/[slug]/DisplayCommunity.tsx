import React from 'react';

import Image from 'next/image';

import { Bell, Newspaper, Users } from 'lucide-react';

interface DisplayCommunityProps {
  profileImage: string;
  coverImage: string;
  communityName: string;
  description: string;
  members: number;
  articlesPublished: number;
}

const DisplayCommunity: React.FC<DisplayCommunityProps> = ({
  profileImage,
  coverImage,
  communityName,
  description,
  members,
  articlesPublished,
}) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="relative h-56 w-full">
        <Image src={coverImage} alt="Community Cover" layout="fill" objectFit="cover" />
      </div>
      <div className="relative p-4">
        <div className="absolute left-4 top-0 -translate-y-1/2 transform">
          <div className="relative h-24 w-24">
            <Image
              src={profileImage}
              alt="Profile"
              layout="fill"
              objectFit="cover"
              className="rounded-full border-4 border-white shadow-md"
            />
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold">{communityName}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
        <div className="absolute right-4 top-4">
          <button className="flex items-center space-x-2 rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between border-gray-200 px-4 py-2">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span>{members} Members</span>
          </div>
          <div className="flex items-center space-x-2">
            <Newspaper className="h-5 w-5 text-gray-500" />
            <span>Published {articlesPublished} Articles so far</span>
          </div>
        </div>
        <button className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">
          Join Community
        </button>
      </div>
    </div>
  );
};

export default DisplayCommunity;
