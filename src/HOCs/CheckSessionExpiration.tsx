'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';

export const SessionExpirationDialog: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Session expiry is handled by server 401 responses in the request layer.
    setShowDialog(false);
  }, []);

  const handleDialogClose = () => {
    setShowDialog(false);
    logout();
    router.push('/auth/login');
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row items-center justify-end">
          <Button onClick={handleDialogClose} className="w-full max-w-20 text-white res-text-xs">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
