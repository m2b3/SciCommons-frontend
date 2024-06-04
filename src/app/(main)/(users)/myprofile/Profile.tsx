import React from 'react';

import Image from 'next/image';

interface ProfileProps {
  profileImage: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

const Profile: React.FC<ProfileProps> = ({
  profileImage,
  username,
  firstName,
  lastName,
  email,
  bio,
}) => {
  return (
    <div className="mx-auto flex max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <div className="mx-auto">
        <Image src={profileImage} alt="Profile" width={150} height={150} className="rounded-full" />
      </div>
      <div className="ml-6">
        <h2 className="flex items-center text-3xl font-bold">
          <span>Your Profile</span>
          <svg className="ml-2 h-6 w-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L13 4.172 15.828 7l1.586-1.586a2 2 0 000-2.828zM11 5.828L2 14.828V18h3.172l9-9L11 5.828zM4 16H3v-1h1v1zm1 1h1v1H5v-1zm0-1H4v-1h1v1zm10.586-10.586L10.828 9.172l.707.707 3.757-3.757-.707-.707z" />
          </svg>
        </h2>
        <div className="mt-4">
          <div className="mb-2">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              readOnly
            />
          </div>
          <div className="mb-2 flex space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                value={firstName}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                readOnly
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                readOnly
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Your Email</label>
            <input
              type="email"
              value={email}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700">Your Bio</label>
            <textarea
              value={bio}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
