• When discussions have unread items, the UI does this:

- In the Discussions sidebar (article list), any article with unread events shows a New pill and a darker background. Clicking the article marks it read locally and clears that badge.
- In the discussion list and comments, unread items show a small New badge and a subtle blue highlight. The badge is shown for both backend unread flags and realtime-only events.
- Read tracking is automatic: if an unread discussion/comment is at least 50% visible for 2 seconds, it’s marked read locally and the New badge disappears 1 second later. Clicking a discussion thread also
  marks it read and clears the article-level unread badge.
- Realtime events don’t show toast/sound; they only update the unread indicators.
- The navbar “Discussions” link shows a New badge and the browser tab title gets a count prefix, but those counts are driven by realtime unread events (not strictly all backend unreads).
