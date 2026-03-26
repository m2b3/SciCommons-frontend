import { Suspense } from 'react';

import NotificationsPageClient from './NotificationsPageClient';

/* Fixed by Codex on 2026-02-26
   Who: Codex
   What: Converted `/notifications` route entry to a server wrapper.
   Why: `useSearchParams` in the notifications client page must be rendered under a Suspense boundary during static prerender/export.
   How: Keep page logic in `NotificationsPageClient` and render it through a server-side Suspense shell with a lightweight fallback. */
const NotificationsPage = () => {
  return (
    <Suspense fallback={<NotificationsPageFallback />}>
      <NotificationsPageClient />
    </Suspense>
  );
};

export default NotificationsPage;

const NotificationsPageFallback = () => {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6 sm:my-6">
        <h1 className="text-center text-4xl font-bold text-text-primary">Notifications</h1>
      </div>
      <p className="text-center text-sm text-text-tertiary">Loading notifications...</p>
    </div>
  );
};
