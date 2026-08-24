import { useEffect, useMemo, useState } from 'react';

import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';

export const useDeleteWindow = (createdAt?: string | null, isEligible = true): boolean => {
  const expiresAt = useMemo(() => {
    if (!createdAt) return null;

    const parsedCreatedAt = Date.parse(createdAt);
    if (!Number.isFinite(parsedCreatedAt)) return null;

    return parsedCreatedAt + FIVE_MINUTES_IN_MS;
  }, [createdAt]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isEligible || expiresAt === null) return;

    const remainingMs = expiresAt - Date.now();
    if (remainingMs <= 0) {
      setNow(Date.now());
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, remainingMs + 1);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [expiresAt, isEligible]);

  return Boolean(isEligible && expiresAt !== null && now <= expiresAt);
};
