import React from 'react';

interface RequestLProps {
  name: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  onAccept: () => void;
  onReject: () => void;
}

const RequestL: React.FC<RequestLProps> = ({ name, status, onAccept, onReject }) => {
  /* Fixed by Codex on 2026-02-15
     Problem: Admin request list used fixed white/gray/green/red utilities.
     Solution: Replace hard-coded colors with semantic tokens for surfaces and status states.
     Result: Request cards now honor the active skin palette. */
  return (
    <div className="mb-2 flex items-center justify-between rounded-md border border-common-contrast bg-common-cardBackground p-4 text-text-primary shadow-md">
      <div className="flex items-center">
        <div className="mr-4 h-12 w-12 rounded-full bg-common-contrast"></div>
        <div>
          <p className="font-bold">{name}</p>
          <p className="cursor-pointer text-functional-green">View Profile</p>
        </div>
      </div>
      <div className="flex space-x-4">
        {status === 'Pending' && (
          <>
            <button
              className="rounded-md bg-functional-green px-4 py-2 text-primary-foreground hover:bg-functional-greenContrast"
              onClick={onAccept}
            >
              Accept
            </button>
            <button
              className="rounded-md bg-common-minimal px-4 py-2 text-text-secondary hover:bg-common-contrast"
              onClick={onReject}
            >
              Reject
            </button>
          </>
        )}
        {status === 'Accepted' && (
          <span className="rounded-md bg-functional-green px-4 py-2 text-primary-foreground">
            Accepted
          </span>
        )}
        {status === 'Rejected' && (
          <span className="rounded-md bg-functional-red px-4 py-2 text-primary-foreground">
            Rejected
          </span>
        )}
      </div>
    </div>
  );
};

export default RequestL;
