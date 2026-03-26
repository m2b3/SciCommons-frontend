'use client';

import { useRealtime } from '@/hooks/useRealtime';

/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Added a realtime bootstrapper component that mounts useRealtime without UI.
   Why: Removing the realtime HUD also removed the only useRealtime call, disabling unread indicators.
   How: Invoke the hook and render nothing so realtime logic stays active without a badge. */
const RealtimeBootstrap = () => {
  useRealtime();
  return null;
};

export default RealtimeBootstrap;
