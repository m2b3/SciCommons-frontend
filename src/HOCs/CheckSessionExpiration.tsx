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
  const { isAuthenticated, isTokenExpired, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkExpiration = () => {
      if (isAuthenticated && isTokenExpired()) {
        setShowDialog(true);
      }
    };

    // Check initially
    checkExpiration();

    // Set up interval to check periodically
    const intervalId = setInterval(checkExpiration, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [isAuthenticated, isTokenExpired]);

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
