import React from 'react';

interface RequestLProps {
  name: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  onAccept: () => void;
  onReject: () => void;
}

const RequestL: React.FC<RequestLProps> = ({ name, status, onAccept, onReject }) => {
  return (
    <div className="mb-2 flex items-center justify-between rounded-md border bg-white p-4 shadow-md">
      <div className="flex items-center">
        <div className="mr-4 h-12 w-12 rounded-full bg-gray-300"></div>
        <div>
          <p className="font-bold">{name}</p>
          <p className="cursor-pointer text-green-500">View Profile</p>
        </div>
      </div>
      <div className="flex space-x-4">
        {status === 'Pending' && (
          <>
            <button
              className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              onClick={onAccept}
            >
              Accept
            </button>
            <button
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              onClick={onReject}
            >
              Reject
            </button>
          </>
        )}
        {status === 'Accepted' && (
          <span className="rounded-md bg-green-500 px-4 py-2 text-white">Accepted</span>
        )}
        {status === 'Rejected' && (
          <span className="rounded-md bg-red-500 px-4 py-2 text-white">Rejected</span>
        )}
      </div>
    </div>
  );
};

export default RequestL;
