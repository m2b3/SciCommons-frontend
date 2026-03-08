Kept from Armaan (test):

- All new flag-based stores (readItemsStore, subscriptionUnreadStore, useUnreadFlags)
- New flags API (src/api/flags/)
- Updated Comment.tsx with useMarkAsReadOnView hook
- Updated DiscussionsSidebar.tsx with subscriptionUnreadStore-based unread dots
- All other auto-merged files (DiscussionCard, DiscussionComments, DiscussionSummary, BottomBar, NavBar, RenderComments, etc.)
- Deleted unreadNotificationsStore.ts

Kept from your branch (non-conflicting):

- Auth hardening (race condition lock, server probing, JWT parsing, network error tolerance)
- clearRegisteredQueryCache() and useUserSettingsStore.clearSettings() in logout
- All your other non-conflicting work (front page, footer, about page, etc.)

# Delta From Commit 0732ee1e6ed6dcc57ef2ff32625b77504fa4c4fe

This document captures what was present in the working commit above that is now removed or behaviorally changed after the merge. It is focused on _potentially lost behaviors_ so we can decide what to reintroduce without discarding merged test-branch changes.

1. Per-item unread tracking store removed and replaced

- Removed: `src/stores/unreadNotificationsStore.ts`
- Previous behavior: persistent per-item unread list (discussion/comment/reply), per-article counts, total unread count, lastActivity timestamps, 7-day cleanup, and cross-tab BroadcastChannel sync.
- Current behavior: `readItemsStore` + `subscriptionUnreadStore` track article-level unread state plus read sync to backend flags.
- Net loss: per-item unread counts, lastActivityAt sorting source, and cross-tab unread item syncing.

2. Discussions sidebar sorting and unread count badges removed

- File: `src/app/(main)/discussions/DiscussionsSidebar.tsx`
- Previous behavior: sort by `lastActivityAt` and show numeric unread count per article.
- Current behavior: unread dot only via `has_unread_event` + store; order is backend order; community link is URL-encoded.
- Net loss: numeric badges and local activity-based sorting.

3. Scroll persistence changed

- File: `src/app/(main)/discussions/DiscussionsSidebar.tsx`
- Previous behavior: scroll position persisted to `sessionStorage`, restored on mount and on selection changes.
- Current behavior: scroll stored in an in-memory ref and restored for in-session navigation.
- Net loss: scroll restoration across refresh/reload and the explicit restore on selection change.

4. Realtime no longer creates per-item unread entries

- File: `src/hooks/useRealtime.tsx`
- Previous behavior: realtime events added unread items per discussion/comment.
- Current behavior: realtime marks only article-level "has new event".
- Net loss: item-level unread state for realtime arrivals.

5. "NEW" badge logic changed for discussions and comments

- Files: `src/components/articles/DiscussionCard.tsx`, `src/components/common/Comment.tsx`
- Previous behavior: NEW badges could be driven by local unread store, including realtime-only arrivals.
- Current behavior: NEW badges depend on API unread flags + read-items store; realtime-only arrivals may not show NEW unless backend flags them.
- Additional change: "mark read on expand comments" behavior was removed from discussion cards.

6. Global badges and tab title counts changed

- Files: `src/components/common/NavBar.tsx`, `src/components/common/BottomBar.tsx`, `src/hooks/useTabTitleNotification.ts`
- Previous behavior: numeric badges and tab title based on total unread item count.
- Current behavior: dot indicator and tab title based on count of articles with new events.
- Net loss: total unread counts in UI.

7. Comment reaction count fallback removed

- File: `src/components/common/Comment.tsx`
- Previous behavior: `data?.data.likes ?? upvotes ?? 0` fallback.
- Current behavior: uses `data?.data.likes` only.
- Net loss: fallback count when query is delayed or fails. Reaction counts are also no longer lazy-loaded, which changes performance behavior.
