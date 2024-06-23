import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';

function UserEmailContainer({ user, handleDeleteEmail }) {
  return (
    <div
      className="relative group flex flex-row items-center px-3 py-1 rounded-full border border-gray-700 bg-gray-800 shadow-md"
      key={user}>
      <span className="text-sm font-thin truncate text-gray-300">{user}</span>
      <div className="w-20 absolute right-0 top-1/2 -translate-y-1/2 ml-2 bg-gradient-to-r from-gray-800/30 to-gray-800 p-2 rounded-full cursor-pointer group-hover:flex group-hover:flex-row items-end justify-end hidden">
        <MdClose
          className="text-white"
          onClick={() => {
            handleDeleteEmail(user);
          }}
        />
      </div>
    </div>
  );
}

export default UserEmailContainer;
