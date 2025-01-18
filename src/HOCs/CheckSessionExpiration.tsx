'use client';

import React, { useEffect, useState } from 'react';

import { signOut, useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const SessionExpirationDialog: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Handle refresh token error
    if (session?.error === 'RefreshAccessTokenError') {
      // toast.error('Your session has expired. Please log in again.');
      // signOut({ callbackUrl: '/auth/login' });
      // return;
      setShowDialog(true);
    }
  }, [session]);

  const handleDialogClose = () => {
    setShowDialog(false);
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleDialogClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
