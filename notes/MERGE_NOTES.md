# Merge Notes

**Context**

- User: bsureshkrishna.
- Goal: make `codexfix-fullhistory` include the latest `origin/test` changes while preserving full pre-squash history and keeping your post-squash work.
- `codexfix-before-squash` is a descendant of `test` and contains 50 test commits + 19 of your commits.
- Squash commit `1717158` has the same tree as `codexfix-before-squash`, but its parent is `de604aa`, so it is not a descendant of `test`.
- `codexfix-fullhistory` was created by rebasing the post-squash commits onto `codexfix-before-squash` and is now a descendant of `test`.
- A merge with `origin/test` is in progress on `codexfix-fullhistory`.

**Objective**

- Preserve `test` history for maintainers.
- Incorporate your post-squash work.
- Merge in any newer `origin/test` changes.
- Resolve conflicts deliberately, keeping security and UX fixes.

**Current State**

- Branch: `codexfix-fullhistory`.
- Merge in progress with conflicts in these files:
  - `next.config.mjs`
  - `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/DisplayCommunity.tsx`
  - `src/app/(main)/(users)/mycontributions/ProfileHeader.tsx`
  - `src/app/(main)/about/page.tsx`
  - `src/app/(main)/discussions/DiscussionsSidebar.tsx`
  - `src/app/layout.tsx`
  - `src/components/articles/ArticleCard.tsx`
  - `src/components/articles/ArticleStats.tsx`
  - `src/components/articles/DiscussionCard.tsx`
  - `src/components/common/EmptyState.tsx`
  - `src/components/common/TruncateText.tsx`
  - `src/components/communities/CommunityCard.tsx`
  - `src/hooks/useRealtime.tsx`
  - `src/stores/authStore.ts`
  - `yarn.lock`

**Decisions (Conflict Resolutions)**

- `next.config.mjs`: combine. Keep your PWA caching settings and image remote patterns, add test security/perf additions, and use `disable: isDev`.
- `src/app/layout.tsx`: keep yours. `<html>` must wrap `<body>`; providers go inside `<body>`.
- `src/app/(main)/about/page.tsx`: keep test (new About page).
- `src/app/(main)/discussions/DiscussionsSidebar.tsx`: keep test (activity-sorted flattened list + unread badges). Ensure `encodeURIComponent` for community URLs.
- `src/hooks/useRealtime.tsx`: keep test. Add TODO comment to re-validate multi-tab leader logic, retries, and unread/notification sync.
- `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/DisplayCommunity.tsx`: combine. Keep test join-requests + bookmarks + admin controls. Keep your description styling and allow LaTeX. Add TODO comment to re-check LaTeX safety/perf.
- `src/app/(main)/(users)/mycontributions/ProfileHeader.tsx`: combine. Keep test rich fields but sanitize all external URLs with `getSafeExternalUrl`.
- `src/components/articles/ArticleCard.tsx`: keep test (new bookmark UX and preview). Preserve `encodeURIComponent` for community name in URL.
- `src/components/articles/ArticleStats.tsx`: keep yours (no functional delta).
- `src/components/articles/DiscussionCard.tsx`: keep test and reintroduce title click to call `handleDiscussionClick` (open thread). Keep inline comments toggle for quick expand.
- `src/components/common/EmptyState.tsx`: keep test (DOMPurify for `subcontent`).
- `src/components/common/TruncateText.tsx`: combine. Keep `ENABLE_SHOW_MORE` gating and DOMPurify sanitization.
- `src/components/communities/CommunityCard.tsx`: combine. Keep test layout + bookmark + Ashoka badge. Keep your markdown rendering via `RenderParsedHTML`.
- `src/stores/authStore.ts`: combine. Keep hardened auth flow + `clearRegisteredQueryCache()` and add unread-notifications cleanup on logout.
- `yarn.lock`: regenerate after resolving conflicts.

**Planned Code Changes**

- Apply the conflict resolutions above.
- Add a TODO comment in `src/hooks/useRealtime.tsx` about re-validating multi-tab behavior, retries, and unread sync.
- Add a TODO comment near community description rendering about LaTeX safety/perf.
- Fix community URLs with `encodeURIComponent` where `community_name` is used in routes.
- Reintroduce `handleDiscussionClick` in `DiscussionCard` for thread navigation.
- Regenerate `yarn.lock` after conflict resolution.

**Notes**

- This merge is intended to keep all latest `origin/test` changes while preserving your history and post-squash commits.
- Any differences remaining vs `origin/test` should be deliberate per the decisions above.

**Post-merge Checks / Test Gaps**

- Re-validate realtime leader election, retry/backoff, and unread sync in `src/hooks/useRealtime.tsx`.
- LaTeX rendering: disabled in community description for now; if re-enabled, add a length guard
  and fall back to markdown-only rendering for large descriptions (see inline note).
- Run targeted tests:
  - `src/tests/__tests__/useRealtime.test.tsx`
  - `src/tests/__tests__/authStore.test.tsx`
  - UI regression checks for discussions and bookmark flows.
