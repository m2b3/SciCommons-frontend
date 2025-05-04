import React from 'react';

import Image from 'next/image';

import { Link as LinkIcon, MapPin } from 'lucide-react';

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
  <div className="mb-8 flex animate-pulse flex-col items-center space-y-4 rounded-lg bg-white p-6 shadow-md sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
    <div className="flex-shrink-0">
      <div className="h-32 w-32 rounded-full bg-gray-300"></div>
    </div>
    <div className="text-center sm:text-left">
      <div className="h-6 w-32 rounded bg-gray-300"></div>
      <div className="mt-2 h-4 w-64 rounded bg-gray-300"></div>
      <div className="mt-2 h-4 w-56 rounded bg-gray-300"></div>
      <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
        <div className="h-4 w-24 rounded bg-gray-300"></div>
        <div className="h-4 w-24 rounded bg-gray-300"></div>
      </div>
    </div>
  </div>
);
