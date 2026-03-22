## 2026-02-24 - Community Admin Requests Split into Pending and Approved Tabs

Problem: The admin `Requests` screen showed a mixed history by default, so pending join requests were buried alongside previously approved entries.

Root Cause: The page used a status dropdown with broad filtering (`All` by default) rather than focused, workflow-oriented tabs.

Solution: Replaced the dropdown with the shared `TabComponent` style used across community/admin pages and mapped two explicit tabs (`Pending`, `Approved`) to strict status filters (`pending`, `approved`).

Result: Admins now get a cleaner workflow: pending requests are isolated for action, while approved requests are available in a separate history tab using consistent site tab styling.

Files Modified: `src/app/(main)/(communities)/community/[slug]/(admin)/requests/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-24 - Login Path Compatibility Redirect

Problem: Session-expiration flows could send users to `/login`, but the actual login page is `/auth/login`, causing a 404 on stale links/routes.

Root Cause: The app’s canonical auth route moved under `/auth/login`, while compatibility handling for legacy `/login` paths was missing.

Solution: Added a dedicated `/login` route that redirects to `/auth/login` and preserves existing query parameters (including redirect targets).

Result: Users who land on `/login` are now safely routed to the correct auth page instead of seeing 404.

Files Modified: `src/app/login/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-24 - Localmodal Delete Confirm Dialog Hardening (Review + Comment)

Problem: The localmodal delete confirmations for reviews/comments could render behind fixed mobile navigation and lacked complete dialog accessibility semantics.

Root Cause: Both overlays used `z-50` while fixed mobile UI uses much higher z-indices, and dialog containers did not declare `role="dialog"`/`aria-modal`/label associations. The comment modal also used ad-hoc button styling instead of shared tokenized button variants.

Solution: Raised modal overlay layers to `z-[1100]`, added ARIA dialog semantics (`role`, `aria-modal`, `aria-labelledby`, `aria-describedby`) in both modals, and switched comment modal actions to shared `Button` components (`gray`/`danger`) for consistency.

Result: Delete confirmations now consistently sit above fixed UI on mobile, are better announced by assistive technologies, and align with existing design-token/button patterns.

Files Modified: `src/components/articles/ReviewForm.tsx`, `src/components/common/Comment.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-24 - Profile Image Picker Targeting Hardening

Problem: The profile photo edit button clicked a globally queried `input[name="profilePicture"]`, which could target the wrong element if another matching input existed.

Root Cause: The trigger logic depended on `document.querySelector(...)` instead of the specific file input rendered by the `Profile` component.

Solution: Replaced global selector usage with a component-local input ref while preserving react-hook-form registration behavior by forwarding the registered ref callback.

Result: The profile image edit action now reliably opens the correct file picker and is resilient to future form composition changes.

Files Modified: `src/app/(main)/(users)/myprofile/Profile.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-23 - My Communities Membership Source + Elevated Role Badges

Problem: The `My Communities` tab needed to be aligned with the new `/my-communities` behavior (membership list) while still showing whether the user is also an Admin, Moderator, or Reviewer in each community.

Root Cause: The tab rendered plain community cards from the base list response only, with no role overlay metadata in card UI.

Solution: Kept `My Communities` list sourcing from unfiltered `/my-communities`, added parallel role-filtered lookups (`admin`, `moderator`, `reviewer`) to build role membership sets, and passed compact role badges (`A`, `M`, `R`) into `CommunityCard` for top-right rendering. Added accessible labeling for each badge.

Result: `My Communities` now reflects membership-focused listing while clearly indicating elevated roles per card in an accessible, compact format.

Follow-up (same day): Extended the same role markers to the `Communities` tab, added member-only `m` marker support, introduced accessible non-member access dots (green for public, red for private), and sorted visible cards in reading order by role priority (`Admin`, `Moderator`, `Reviewer`, `Member`, then non-members with `public` before `private`).

Files Modified: `src/app/(main)/(communities)/communities/page.tsx`, `src/components/communities/CommunityCard.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-23 - Community Article Detail List-View Shortcut

Problem: From community article detail pages (for example `/community/{slug}/articles/{articleSlug}`), returning to the community article listing required breadcrumb navigation without an explicit list-mode shortcut.

Root Cause: The detail page header only rendered breadcrumbs and tabs; it had no direct action to switch back to the community articles list view state.

Solution: Added a right-aligned `List View` button in the community article detail page header. The action routes back to `/community/{slug}` (preserving current `articleId` in query) and sets the shared articles view store to `grid` before navigation so users land in list mode.

Result: Users now have a one-click convenience control to return from article detail pages to community list mode, consistent with existing view-switching patterns.

Follow-up (same day): Made the action icon-only on small screens while retaining the text label on larger screens, added explicit accessibility labeling/tooltip, and switched to `Button asChild` with `Link` to avoid nested interactive elements.

Files Modified: `src/app/(main)/(communities)/community/[slug]/articles/[articleSlug]/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-22 - Professional Status Validation and Mobile Layout Hardening (pr-280 follow-up)

Problem: The professional status update allowed malformed end-year values to pass submit-time validation, and the new single-row layout could compress/overflow on smaller screens.

Root Cause: End-year pattern validation was removed while submit checks relied on loose numeric conversion; the row layout switched from responsive grid to fixed-width flex items without a mobile wrap fallback.

Solution: Restored strict 4-digit `End Year` validation in `ProfessionalStatus`, kept ordering checks, added responsive `flex-wrap` fallback for the row, added an explicit `aria-label` on the icon-only remove action, and aligned submit-time year validation in `page.tsx` to enforce numeric 4-digit years for both start/end.

Result: Invalid year strings are now blocked consistently before mutation, the professional status row behaves better on narrow screens, and icon-only remove controls are explicitly accessible.

Files Modified: `src/app/(main)/(users)/myprofile/ProfessionalStatus.tsx`, `src/app/(main)/(users)/myprofile/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-22 - ProfessionalStatus Type-Safe End-Year Validation Follow-up

Problem: The latest profile status end-year fix introduced a TypeScript compile regression in `ProfessionalStatus.tsx`.

Root Cause: `useFormContext<IProfileForm>()` made nested field paths strongly typed, but `FormInput` currently accepts `name` as `keyof IProfileForm` (top-level keys only), so nested names like `professionalStatuses.0.endYear` failed type-check.

Solution: Kept strict form context typing and introduced explicit field-name constants cast at the `FormInput` boundary for nested array paths. Also made year parsing explicit with base-10 radix to keep validation behavior deterministic.

Result: End-year validation remains in place, and the profile module now passes TypeScript and eslint checks without widening form types back to `any`.

Files Modified: `src/app/(main)/(users)/myprofile/ProfessionalStatus.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-22 - Centered 404 Quick-Link Cards (Home/Go Back)

Problem: On the 404 page, the `Home` and `Go Back` quick-link cards were not visually centered in the "Still need help?" section.

Root Cause: The layout remained `sm:grid-cols-3` after the `Articles` quick-link card was hidden, so only two cards rendered in a three-column grid.

Solution: Updated the quick-links grid in `not-found.tsx` to use a centered, constrained two-column layout (`mx-auto`, `max-w-xl`, `sm:grid-cols-2`).

Result: The `Home` and `Go Back` cards now render centered as a balanced row on small and larger screens.

Files Modified: `src/app/not-found.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-21 - Centralized Reviews Tab Body Across Article, Community, and Discussions

Problem: Review-tab UI behavior (notice text, add/cancel review toggle, review form, loading/empty/list states) was duplicated across multiple routes, so small copy updates and UX tweaks had to be repeated manually.

Root Cause: Route containers evolved separately (`ArticleDisplayPageClient`, community article page, and shared article content used in discussions), but each still embedded its own review-tab rendering instead of composing a shared review body.

Solution: Added `ReviewsTabBody` component to centralize the full review-tab body, including the canonical review notice text (`REVIEW_NOTICE_TEXT`). Rewired `ArticleContentView`, article display route, and community article route to use this shared component while preserving route-specific behavior through props (for example, PDF quote notice in the article route and community scope on community pages).

Result: Review-tab behavior now has one implementation path, the notice copy is managed from one place, and future review UX changes can be made once and propagated consistently across article/community/discussions contexts.

Files Modified: `src/components/articles/ReviewsTabBody.tsx`, `src/components/articles/ArticleContentView.tsx`, `src/app/(main)/(articles)/article/[slug]/(displayarticle)/ArticleDisplayPageClient.tsx`, `src/app/(main)/(communities)/community/[slug]/articles/[articleSlug]/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-20 - Discussion Overflow Follow-up After PR #271

Problem: After merging PR #271, discussion summary/thread text wrapping still had a quality gap: one thread container used malformed JSX attributes instead of `className`, and the shared `TruncateText` helper was globally forced to `break-all`, causing unintended typography changes outside discussions.

Root Cause: The overflow fix mixed local layout constraints with a global text-helper override, and one JSX node used raw utility tokens as attributes (`<div break-all min-w-0 ...>`) so styles did not apply as intended.

Solution: Reverted the global `TruncateText` base class back to neutral behavior, then applied wrapping constraints only where needed in discussion surfaces (`DiscussionCard`, `DiscussionSummary`, `DiscussionThread`) using `break-words` plus `overflow-wrap:anywhere`. Corrected the malformed thread `<div>` to a valid `className` and passed explicit wrap classes into `TruncateText` calls used by discussion previews.

Result: Discussion content/topic previews now wrap consistently in both split and full-page discussion views without container overflow, while non-discussion pages keep their prior text rendering behavior.

Files Modified: `src/components/common/TruncateText.tsx`, `src/components/articles/DiscussionCard.tsx`, `src/components/articles/DiscussionSummary.tsx`, `src/components/articles/DiscussionThread.tsx`

## 2026-02-19 - Ctrl/Cmd+Enter Submit for FormInput Textareas

Problem: Ctrl/Cmd+Enter submission did not consistently work in abstract edit fields and other textarea-based forms.

Root Cause: Keyboard submit behavior depended on form-level hooks, but some textarea flows relied only on `FormInput` without centralized textarea key handling.

Solution: Added direct Ctrl/Cmd+Enter handling for plain `FormInput` textareas to submit their parent form, and updated the global `useSubmitOnCtrlEnter` hook to ignore already-handled key events.

Result: Keyboard submit now works reliably in edit abstract fields and other `FormInput` textarea contexts, without double-submitting in forms that also use the global hook.

Files Modified: `src/components/common/FormInput.tsx`, `src/hooks/useSubmitOnCtrlEnter.ts`

## 2026-02-19 - Faster Article Settings Completion and Context-Preserving Return

Problem: Updating article details from side-panel list views felt slow and redirected users to a different page context instead of returning to where they started.

Root Cause: Settings save flow relied on generic `returnTo` routing and post-save cache work before perceived completion, without an explicit return-path to list/preview context.

Solution: Added explicit `returnPath` propagation from article panel contexts into the settings link, then prioritized immediate redirect to that safe internal path on update success. Moved cache invalidation to asynchronous post-redirect execution and improved pending button feedback text.

Result: After update, users return directly to the originating list/preview context (for example, community/articles/discussions panels with selected `articleId`), and completion feels faster because navigation happens immediately on success.

Files Modified: `src/components/articles/ArticleContentView.tsx`, `src/components/articles/DisplayArticle.tsx`, `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/page.tsx`, `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx`

## 2026-02-19 - Community Article Deep-Link Selection by articleId

Problem: Opening a community URL with `?articleId={id}` loaded the correct community but preview auto-opened the first/top article instead of the requested one.

Root Cause: `CommunityArticles` had no query-param restoration flow for preview selection, while keyboard navigation auto-selected the first article when preview mode was active.

Solution: Added `articleId` parsing from URL query params, restored selected preview article once list data is available, and disabled first-item auto-selection when an explicit `articleId` is present.

Result: Deep links like `/community/GSoC%202026?articleId=318` now open the specified article in the preview panel (when present in the loaded list).

Files Modified: `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/CommunityArticles.tsx`

## 2026-02-19 - Community Articles Left Panel Scrollbar Restoration

Problem: In community `Articles` split/preview view, the left articles list panel did not show a scrollbar and was difficult to scroll through with mouse/trackpad.

Root Cause: `ResizablePanel` applies inline `overflow: hidden`; in `CommunityArticles` this was not overridden, so class-based `overflow-y-auto` did not reliably produce a scrollable panel UI.

Solution: Updated the left panel container to use a fixed height and added explicit `style={{ overflow: 'auto' }}` to override the panel's inline overflow behavior.

Result: The left articles panel now shows a scrollbar and supports normal pointer-based scrolling through long lists.

Files Modified: `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/CommunityArticles.tsx`

## 2026-02-19 - Discussion Entity Artifacts and Vote Label Clarity

Problem: Discussion topic/content text displayed raw HTML entities like `&#x20` at line ends, and thread vote controls showed a bare `0` that appeared as an unclear `< 0 >` marker on the right side.

Root Cause: Discussion fields were rendered/reset as raw strings from API payloads without HTML-entity decoding, and vote UI presented only the numeric likes count with no context when the value was zero.

Solution: Added a shared `decodeHtmlEntities` utility in `src/lib/htmlEntities.ts` and applied it in discussion card/thread render paths plus edit-form reset defaults so escaped entities are normalized before display. Updated thread vote text to an explicit label (`{n} votes` or `Vote`) instead of a standalone number.

Result: Discussion text no longer leaks encoded entity artifacts in list/thread views, and the right-side vote widget now reads clearly rather than appearing as stray symbols around `0`.

Files Modified: `src/lib/htmlEntities.ts`, `src/components/articles/DiscussionCard.tsx`, `src/components/articles/DiscussionThread.tsx`, `src/tests/__tests__/htmlEntities.test.ts`

Follow-up (same day): Temporarily commented out the thread vote value display in `DiscussionThread` per product request, keeping only upvote/downvote buttons visible.

## 2026-02-18 - Home Supporters Strip GSoC Vertical Alignment

Problem: In the homepage supporters row, the GSoC logo appeared slightly lower than KCDHA and DRAC in desktop layout.

Root Cause: The GSoC image asset's internal bounding box/padding produced a visual baseline offset relative to neighboring logos.

Solution: Added a small desktop-only upward translation (`sm:-translate-y-px`) to both dark and light GSoC logo variants in the supporters strip.

Result: The three supporter logos now appear visually aligned on the same row.

Files Modified: `src/app/(home)/page.tsx`

## 2026-02-18 - Add DRAC to Home Supporters Strip

Problem: The homepage supporters row did not include the newly provided DRAC supporter branding.

Root Cause: `src/app/(home)/page.tsx` rendered only KCDHA and GSoC logos, with no DRAC entries in the supporter image list.

Solution: Added DRAC logos to the supporters row using the same light/dark theme switch pattern already used by other supporters (`dark:block` + `dark:hidden` image pair).

Result: DRAC now appears in the "Our Supporters" section on the homepage and switches correctly between dark and light themes.

Files Modified: `src/app/(home)/page.tsx`

## 2026-02-18 - Docker Build Stability Without Google Fonts Network Access

Problem: `docker compose ... up --build` could fail during `next build` in environments where outbound access to Google Fonts is restricted.

Root Cause: `src/app/layout.tsx` used `next/font/google` (`Manrope` and `Space Grotesk`), which triggers build-time requests to `fonts.googleapis.com`.

Solution: Removed `next/font/google` usage from the root layout and defined `--font-sans` / `--font-display` local fallback stacks in `globals.css` so typography remains stable without remote font fetches.

Result: Frontend builds no longer depend on live Google Fonts access, which improves Docker/CI reliability on restricted networks.

Files Modified: `src/app/layout.tsx`, `src/app/globals.css`

## 2026-02-18 - Community Rules Update Payload Type Alignment

Problem: Running `tsc --skipLibCheck --noEmit` failed with TS2353 in admin rules settings because the update payload included unknown properties.

Root Cause: `AddRules.tsx` sent `tags` and `about` inside `payload.details`, but `UpdateCommunityDetails` only accepts `description`, `type`, `rules`, and optional `community_settings`.

Solution: Updated `AddRules` submit payload to match `UpdateCommunityDetails`, removed unsupported properties, and forwarded existing `community_settings` to preserve current configuration while updating rules.

Result: Type-check now succeeds, lint remains clean, and rules updates are aligned with the generated API schema contract.

Files Modified: `src/app/(main)/(communities)/community/[slug]/(admin)/settings/AddRules.tsx`

## 2026-02-17 - Realtime Logout Abort for In-Flight Poll

Problem: Logging out could still leave one realtime long-poll request active for up to the poll timeout window.

Root Cause: `useRealtime` logout teardown disabled future polling and cleared queue state, but did not abort the currently in-flight poll `fetch` request or clear the pending poll timeout callback.

Solution: Updated logout teardown in `useRealtime` to explicitly abort the active `AbortController` and clear/reset `pollTimeoutRef` before releasing leadership and marking realtime disabled.

Result: Logout now cuts the realtime poll connection immediately instead of waiting for the server response or timeout.

Files Modified: `src/hooks/useRealtime.tsx`

## 2026-02-17 - Comment Toolbars Compaction (Discussion/Review/Post)

Problem: Comment sections consumed extra vertical space because controls were split across multiple rows (including a redundant `Comments:` heading in discussion/review views).

Root Cause: Comment UIs were implemented with separate header and control rows instead of a single compact toolbar, and spacing patterns diverged across discussion, review, and post contexts.

Solution: Refactored comment toolbars to a compact single-row pattern: keep `Add Comment` on the left and place `Depth` + `Expand/Collapse All` controls on the same row when comments exist; removed the superfluous `Comments:` heading where present. Followed up with a small margin tweak above expanded review comments so the toolbar sits with clearer separation from the review card's `{n} comments` toggle row.

Result: Discussion, review, and post comment panes now use less vertical space and behave more consistently while preserving all existing thread controls.

Files Modified: `src/components/articles/DiscussionComments.tsx`, `src/components/articles/ReviewComments.tsx`, `src/components/common/PostComments.tsx`, `src/components/articles/ReviewCard.tsx`

## 2026-02-17 - Discussions/Comments NEW Auto-Expand Hardening (Phase 1)

Problem: NEW badges were visible in discussion/comment flows, but unread discussion threads were not consistently auto-expanding to reveal new activity.

Root Cause: Auto-open logic in `DiscussionCard` depended on `comments_count` being present and greater than zero; when that count was omitted, unread cards with NEW badges stayed collapsed.

Solution: Replayed the discussion/comment unread improvements from `combinedarticlediscussionnewtags` and hardened auto-expand behavior. Added unread-aware expansion plumbing (`autoExpandOnUnread`) through `DiscussionComments` and `RenderComments`, restored subtree unread detection and reply-level NEW badges in `Comment`, and updated `DiscussionCard` to auto-open for unread items unless comment count is explicitly `0` while resetting the one-time guard when unread clears. Added realtime propagation in `useRealtime` so `new_comment` events also mark the parent discussion as ephemeral unread. Updated `useMarkAsReadOnView` with discussion-specific realtime handling so parent discussion NEW can reappear after prior reads without passively clearing the article-level NEW summary badge.

Result: Discussion/comment NEW indicators and unread-path expansion now work together more reliably, including cases where backend discussion counts are missing.

Files Modified: `src/components/articles/DiscussionCard.tsx`, `src/components/articles/DiscussionComments.tsx`, `src/components/common/RenderComments.tsx`, `src/components/common/Comment.tsx`, `src/hooks/useRealtime.tsx`, `src/hooks/useMarkAsReadOnView.ts`

## 2026-02-16 - Docker Compose Build Args from .env

Problem: Local Docker Compose workflow required manually passing build args and could miss theme-related variables.

Root Cause: `docker-compose.dev.yml` only referenced an image tag and had no `build.args` mapping; `Dockerfile` did not inject `NEXT_PUBLIC_UI_SKIN` during build.

Solution: Added `build` configuration in `docker-compose.dev.yml` with args mapped from repo `.env` for `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_REALTIME_URL`, and `NEXT_PUBLIC_UI_SKIN`. Updated `Dockerfile` to accept and write `NEXT_PUBLIC_UI_SKIN` into build-time `.env`.

Result: `docker compose` can now rebuild the frontend image using `.env` values consistently, including UI skin selection.

Files Modified: `docker-compose.dev.yml`, `Dockerfile`
