import React from 'react';

import Image from 'next/image';

import { Link as LinkIcon, MapPin } from 'lucide-react';

import { BlockSkeleton, Skeleton } from '@/components/common/Skeleton';

interface ProfileHeaderProps {
  name: string;
  image: string;
  bio: string;
  location: string;
  website: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, image, bio, location, website }) => (
  <div className="mb-4 flex items-start gap-4 rounded-xl border border-common-contrast bg-common-cardBackground p-4 md:mb-6 md:gap-6 md:p-6">
    <div className="flex-shrink-0">
      <Image
        src={image}
        alt={`${name}'s profile`}
        width={150}
        height={150}
        className="aspect-square h-10 w-10 rounded-full object-cover sm:h-14 sm:w-14"
      />
    </div>
    <div className="text-left">
      <h2 className="text-xl font-bold text-text-primary">{name}</h2>
      <p className="mt-2 max-w-2xl text-sm text-text-tertiary">{bio}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs sm:justify-start">
        {location && (
          <div className="flex items-center text-text-tertiary">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        {website && (
          <div className="flex items-center text-blue-500">
            <LinkIcon className="mr-1 h-4 w-4" />
            <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Website
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ProfileHeader;

export const ProfileHeaderSkeleton: React.FC = () => (
  <Skeleton className="flex w-full flex-row items-center gap-4 overflow-x-hidden rounded-xl border border-common-contrast bg-common-cardBackground">
    <BlockSkeleton className="h-10 w-10 shrink-0 rounded-full" />
    <div className="flex flex-col gap-2">
      <BlockSkeleton className="h-6 w-32" />
      <BlockSkeleton className="h-4 w-64" />
      <BlockSkeleton className="h-4 w-56" />
    </div>
  </Skeleton>
);
