// hooks/usePathTracker.ts
'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

// hooks/usePathTracker.ts

export function usePathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const storage = globalThis?.sessionStorage;
    if (!storage) return;

    const currentPath = storage.getItem('currentPath');

    // Always update both current and previous paths
    if (pathname !== currentPath) {
      storage.setItem('prevPath', currentPath || '/');
      storage.setItem('currentPath', pathname as string);
    }
  }, [pathname]);

  const getPreviousPath = () => {
    const storage = globalThis?.sessionStorage;
    return storage ? storage.getItem('prevPath') || '/' : '/';
  };

  return { getPreviousPath };
}
