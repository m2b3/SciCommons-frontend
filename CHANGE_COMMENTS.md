## 2026-03-15 - Navbar Discussions NEW Badge Subscription Alignment

Problem: The top navbar `Discussions` link could miss `New` even when discussion surfaces (sidebar/tab/cards) were already showing unread activity.

Root Cause: Navbar badge logic depended only on realtime event count and did not include backend subscription unread state (`has_unread_event` with read-state reconciliation).

Solution: Added subscription unread evaluation in `NavBar` using `useArticlesDiscussionApiGetUserSubscriptions` plus `useSubscriptionUnreadStore.isArticleUnread`, and combined it with realtime count fallback before rendering the navbar `New` pill.

Result: The top-of-page `Discussions` link now advertises unread discussion activity more consistently, matching the same unread sources used by discussion panels.

Files Modified: `src/components/common/NavBar.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-14 - Frontend Comment Length Validation Shift to 1000 Words

Problem: Comment entry on the frontend was enforcing an outdated 500-character cap, but product wanted a longer limit expressed in words instead of characters.

Root Cause: The shared `CommentInput` component applied a client-side `maxLength` validator to the `content` field, so every discussion/review/post comment flow inherited the same 500-character cap.

Solution: Replaced the shared character-based validator with a 1000-word validator that counts whitespace-delimited tokens. Kept required and minimum-length validation, and added a focused `CommentInput` test covering both the 1000-word allowed case and the 1001-word rejection case.

Result: The frontend now allows substantially longer comments while still enforcing a consistent cap across discussion, review, and post comment flows. The UI limit is now 1000 words instead of 500 characters.

Files Modified: `src/components/common/CommentInput.tsx`, `src/tests/__tests__/CommentInput.test.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-14 - Non-Article Posting Success Toast Suppression

Problem: Success toasts were firing for secondary posting actions like discussions, reviews, summaries, and posts, which added noise after the UI had already updated inline.

Root Cause: Several non-article create flows still showed success notifications by default even though the surrounding UI already provided immediate confirmation through reset, refetch, collapse, or redirect behavior.

Solution: Removed success toasts from non-article create flows while keeping their existing UI follow-up behavior intact. Article submission success toasts were left in place per product direction.

Result: Users still get explicit success feedback when posting articles, but discussion/review/post creation flows now complete more quietly and rely on the visible UI change instead of redundant toast confirmations.

Files Modified: `src/components/articles/DiscussionForm.tsx`, `src/components/articles/ReviewForm.tsx`, `src/components/articles/DiscussionSummary.tsx`, `src/app/(main)/(posts)/posts/createpost/page.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-14 - Jest Canvas Native Dependency Bypass

Problem: `yarn test` could fail before running any suites because `jest-environment-jsdom` detected the transitive `canvas` package and then crashed when the local native binary `canvas.node` was missing.

Root Cause: `jsdom` probes `require.resolve('canvas')` during environment startup, which happens before Jest setup files run. Because `pdfjs-dist` pulls in `canvas`, a half-installed Windows native module caused all tests to abort even though the app test suite does not rely on native canvas features.

Solution: Added a custom Jest environment that redirects the exact `canvas` module specifier to a local stub before `jest-environment-jsdom` loads, and mirrored that stub in `moduleNameMapper` so direct test-time imports also avoid the native package.

Result: Jest now boots through the standard `jsdom` environment without depending on a compiled local `canvas.node` binary, eliminating the recurring native-install failure class from normal frontend test runs.

Files Modified: `jest.config.ts`, `jest.canvas-safe-environment.cjs`, `src/tests/__mocks__/canvas.cjs`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-14 - Discussions Tab NEW Badge Propagation

Problem: On the discussions split view, unread discussion activity already showed `New` on sidebar article tiles and individual discussion topics, but the top `Discussions` tab stayed static and gave no summary signal.

Root Cause: Unread state stopped at the sidebar/discussion-card level. `ArticleContentView` rendered a fixed tab label, and nothing aggregated child discussion unread state back up to that tab title on initial load, after topic scans, or during realtime updates.

Solution: Added unread badge rendering to the shared tab title in `ArticleContentView`, propagated discussion-card `New` visibility upward through `DiscussionForum`, and combined that with fetched discussion unread flags plus subscription-summary/realtime store state so the top `Discussions` tab reflects unread activity on first load, after sidebar clears, and when realtime discussions/comments arrive.

Result: The main `Discussions` tab now shows `New` whenever the selected article's discussions panel contains unread activity, including initial discussions-page loads and live realtime updates that also mark the left sidebar.

Files Modified: `src/components/articles/ArticleContentView.tsx`, `src/components/articles/DiscussionForum.tsx`, `src/components/articles/DiscussionCard.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

Follow-up (same day): Removed the unread-only dark tile background in `src/app/(main)/discussions/DiscussionsSidebar.tsx` so sidebar background emphasis remains reserved for the currently selected article, while unread items continue to rely on the `New` pill and stronger title weight.

## 2026-03-12 - Discussion Thread Markdown Spacing Alignment

Problem: After switching discussion thread content to the shared markdown renderer, mobile thread view showed extra vertical space before the actions/comments row.

Root Cause: `DiscussionThread` used `RenderParsedHTML` without overriding its default wrapper spacing, so the component inherited the shared `mb-10 sm:mb-0` margin intended for expandable content surfaces.

Solution: Added a local `containerClassName="mb-0"` override in `DiscussionThread` and documented the reason inline so thread view matches the spacing contract already used by discussion cards and summaries.

Result: Thread view keeps the markdown-rendering fix while removing the unintended mobile gap, bringing layout behavior back in line with the rest of the discussion UI.

Files Modified: `src/components/articles/DiscussionThread.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-11 - Community Article Draft Discard Persistence Fix

Problem: Clicking `Discard draft` on the community article create page could still lead to a draft being restored on later visits.

Root Cause: The discard flow called `reset(defaultFormValues)`, and `react-hook-form` watch callbacks persisted form state during reset-driven updates, recreating an empty draft immediately after clearing storage.

Solution: Added a discard-specific autosave pause gate in `createcommunityarticle/page.tsx` so reset-triggered watch events are ignored after discard, and autosave resumes only after the next explicit field edit.

Result: Discarding a community article draft now reliably removes persisted draft state instead of recreating it through reset side effects.

Files Modified: `src/app/(main)/(communities)/community/[slug]/createcommunityarticle/page.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-09 - Remove Unused TipTap Stack

Problem: TipTap packages and related editor files were still present even though the TipTap editor path is no longer used by the app.

Root Cause: Legacy TipTap artifacts (dependencies, components, CSS placeholder styling, and docs tree references) remained after editor direction moved away from TipTap.

Solution: Removed all `@tiptap/*` dependencies from `package.json` and corresponding lockfile entries from `yarn.lock`, deleted the unused `src/components/richtexteditor` TipTap files, removed the TipTap-specific CSS block in `src/app/globals.css`, and removed the obsolete `richtexteditor` folder listing from docs project structure.

Result: The repository no longer includes TipTap dependency or source artifacts, reducing dependency footprint and eliminating dead editor code paths.

Files Modified: `package.json`, `yarn.lock`, `src/components/richtexteditor/CommentEditor.tsx`, `src/components/richtexteditor/MenuBar.tsx`, `src/components/richtexteditor/TipTap.tsx`, `src/app/globals.css`, `src/pages/docs/project-structure.mdx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-08 - Intermediary Update Boilerplate Suppression Rule

Problem: Progress updates repeatedly included a boilerplate sentence about final-response logging, which made routine status messages noisy and repetitive.

Root Cause: Repository instructions required final-response logging but did not explicitly forbid repeating that requirement in interim commentary.

Solution: Added a new `AGENTS.md` rule under repository notes instructing agents to avoid repeating boilerplate status lines about `codexOutput.md` logging and to keep intermediary updates task-specific.

Result: Intermediary updates can stay concise and relevant while preserving the existing mandatory final-response logging behavior.

Files Modified: `AGENTS.md`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-08 - MDX Editor Ctrl/Cmd+Enter Submit Restoration

Problem: `Ctrl/Cmd+Enter` stopped submitting forms from markdown editor fields, even though keyboard submit worked in plain textarea flows.

Root Cause: `useSubmitOnCtrlEnter` was intentionally updated to skip already-handled key events (`defaultPrevented`) to avoid duplicate submissions, but the MDX editor path did not have its own local modifier+enter submit handler.

Solution: Added MDX-local `Ctrl/Cmd+Enter` handling in `InitializedMDXEditor` that submits the nearest parent form with `requestSubmit()` after preventing default editor behavior.

Result: Markdown editor forms regain keyboard submit behavior without reintroducing global double-submit risk in other textarea/form flows.

Files Modified: `src/components/common/MarkdownEditor/InitializedMDXEditor.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-08 - Communities Card Role Marker Regression Fix (Role Parsing + Legacy Fallback)

Problem: Community cards stopped showing role markers (`A/M/R/m`) reliably after switching to list-payload role wiring, so users could not quickly see whether they were admin/moderator/reviewer/member.

Root Cause: Role normalization only matched a narrow set of exact role strings and did not account for variant tokenized role payloads (for example underscored or prefixed names) or legacy boolean membership flags that can still appear in some responses.

Solution: Updated `communities/page.tsx` to (1) parse role strings by tokens with broader role matching, and (2) fall back to legacy `is_admin` / `is_moderator` / `is_reviewer` / `is_member` flags when role strings are missing or unmatched.

Result: Role/access markers are restored with pre-disappearance behavior: `Communities` shows `A/M/R/m` plus non-member access dots, while `My Communities` continues showing `A/M/R` role badges.

Files Modified: `src/app/(main)/(communities)/communities/page.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-08 - Communities Role Lookup Fan-out Removal (Use List Payload `role`)

Problem: Community cards required extra client-side role fan-out calls (`admin`, `moderator`, `reviewer`, `member`) to render badges/sorting, causing unnecessary request overhead on page entry.

Root Cause: Older client logic did not rely on per-item role data in list payloads, so it fetched role slices separately and merged IDs on the frontend.

Solution: Refactored `communities/page.tsx` to use the generated `CommunityListOut.role` field directly for both `Communities` and `My Communities` tabs. Removed `useQueries` role fan-out flow and replaced it with normalized role mapping (`admin/moderator/reviewer/member`) for badge rendering, member-state detection, and deterministic sort tiers.

Result: Entering communities views now avoids the 4 extra role queries while preserving card badges (`A/M/R/m`), non-member access indicators, and priority ordering.

Files Modified: `src/app/(main)/(communities)/communities/page.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-08 - Tab Title Navigation Consistency Fix (Unread Prefix + Bookmarks Query Titles)

Problem: Route titles could appear stale when navigating between pages (for example Home/Communities) and `/mycontributions?tab=bookmarks` did not consistently show a bookmarks-specific title.

Root Cause: `useTabTitleNotification` captured a one-time base title and could reapply stale values on later state updates; `mycontributions` lacked query-aware metadata title mapping.

Solution: Refactored `useTabTitleNotification` to resync base titles from current route metadata on unread-count/path/query changes before applying the unread prefix. Added tab-aware `generateMetadata` to `mycontributions/page.tsx` so tabs like `bookmarks` map to route-specific titles through the shared title helper.

Result: Browser top-bar titles now follow route changes more reliably, while unread-count prefix behavior remains intact and Bookmarks uses `Bookmarks: SciCommons`.

Files Modified: `src/hooks/useTabTitleNotification.ts`, `src/app/(main)/(users)/mycontributions/page.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

Follow-up (same day): Removed `useSearchParams` from `useTabTitleNotification` after build/export failures (`missing-suspense-with-csr-bailout`) showed that the globally mounted navbar hook forced Suspense requirements across prerendered routes. Kept route-title sync keyed to `usePathname` + unread count so static prerender pages continue to build while preserving route-level tab-title updates.

Follow-up (same day): Hardened slug fallback formatting in `pageTitle` by decoding URL-encoded route params before humanization (for example `GSoC%202026` -> `GSoC 2026`) and added regression tests for encoded slugs (`%20` and `+`).

## 2026-03-08 - Community Admin Route Title Coverage (Invite/Roles/Requests/Dashboard/Submissions)

Problem: Community admin subsections still had incomplete tab-title coverage after the first create/edit title pass.

Root Cause: Admin route folders under `community/[slug]/(admin)` lacked route-segment metadata layouts, so pages inherited broader parent titles.

Solution: Added dedicated metadata layouts for each remaining admin section with explicit `<Section>: SciCommons` titles: `Community Dashboard`, `Community Invite`, `Community Roles`, `Community Requests`, and `Community Submissions`.

Result: All community admin tabs now show route-specific browser titles, matching the same naming convention as the rest of the title standardization work.

Files Modified: `src/app/(main)/(communities)/community/[slug]/(admin)/dashboard/layout.tsx`, `src/app/(main)/(communities)/community/[slug]/(admin)/invite/layout.tsx`, `src/app/(main)/(communities)/community/[slug]/(admin)/requests/layout.tsx`, `src/app/(main)/(communities)/community/[slug]/(admin)/roles/layout.tsx`, `src/app/(main)/(communities)/community/[slug]/(admin)/submissions/layout.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-08 - Create/Edit Route Tab Title Coverage

Problem: After adding title patterns for list/detail routes, several create/edit flows still inherited generic or list-level browser tab titles.

Root Cause: These routes are mostly client pages without direct metadata exports, and they lacked route-segment layouts that define explicit metadata titles.

Solution: Added metadata layouts for key create/edit flows to keep naming consistent with the new `<Section>: SciCommons` convention. Covered submit/create routes (`Submit Article`, `Create Community`, `Create Post`, `Create Community Article`) and edit/settings routes (`Edit Article`, article-dashboard submit, `Community Settings`, user `Settings`, and `My Profile`).

Result: Create and edit pages now open with clear, route-specific tab labels instead of falling back to `SciCommons` or unrelated parent titles.

Files Modified: `src/app/(main)/(articles)/submitarticle/layout.tsx`, `src/app/(main)/(communities)/createcommunity/layout.tsx`, `src/app/(main)/(posts)/posts/createpost/layout.tsx`, `src/app/(main)/(communities)/community/[slug]/createcommunityarticle/layout.tsx`, `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/layout.tsx`, `src/app/(main)/(articles)/article/[slug]/(articledashboard)/submit/layout.tsx`, `src/app/(main)/(communities)/community/[slug]/(admin)/settings/layout.tsx`, `src/app/(main)/(users)/settings/layout.tsx`, `src/app/(main)/(users)/myprofile/layout.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-08 - Route-Specific Browser Tab Titles (Communities/Discussions/Articles/Posts)

Problem: Many app routes used a generic browser tab title (`SciCommons`), so pages like community details, discussions, and content detail views did not expose contextual titles.

Root Cause: Most route entries are client components without route metadata exports, and dynamic title formatting/truncation behavior was not centralized.

Solution: Added a shared title utility (`src/lib/pageTitle.ts`) to standardize `<Segment>: SciCommons` formatting, slug fallback humanization, and word-aware truncation for long dynamic segments. Added route metadata layouts for Discussions, Communities, Articles, and Posts list pages; added fallback metadata for community and post detail route segments; and updated dynamic detail pages (article metadata, community detail, community article detail, post detail) to apply consistent title updates with truncation.

Result: Browser tab titles now align with route context (for example, `Discussions: SciCommons`, `Communities: SciCommons`, `<Community Name>: SciCommons`, `<Article/Post Title>: SciCommons`) while preventing overly long tab labels.

Files Modified: `src/lib/pageTitle.ts`, `src/app/(main)/discussions/layout.tsx`, `src/app/(main)/(communities)/communities/layout.tsx`, `src/app/(main)/(articles)/articles/layout.tsx`, `src/app/(main)/(posts)/posts/layout.tsx`, `src/app/(main)/(posts)/posts/[postId]/layout.tsx`, `src/app/(main)/(communities)/community/[slug]/layout.tsx`, `src/app/(main)/(articles)/article/[slug]/(displayarticle)/page.tsx`, `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/page.tsx`, `src/app/(main)/(communities)/community/[slug]/articles/[articleSlug]/page.tsx`, `src/app/(main)/(posts)/posts/[postId]/page.tsx`, `src/tests/__tests__/pageTitle.test.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-03 - Profile Validation Consolidation Follow-up (Regression Fixes)

Problem: The profile Zod-resolver refactor improved architecture but introduced behavioral regressions and consistency issues (optional URL whitespace handling mismatch, dropped status max-length guard, mixed validation sources, and lint/type-safety drift).

Root Cause: Centralization changes were applied partially across form components and schemas, leaving duplicated validation paths and one simplified preprocess rule that did not preserve prior whitespace-empty semantics.

Solution: Updated optional URL preprocess to treat whitespace-only values as optional while keeping URL-specific errors, restored professional status max-length validation via shared `statusSchema`, aligned read-only username validation with profile UX safety, removed per-field profile/personal-links schema wiring in favor of resolver-owned validation, and replaced `any`-based nested error extraction with typed narrowing.

Result: Validation remains centralized and predictable, previously reported nested-array improvements are preserved, optional links behave consistently, status limits are enforced again, and lint/type quality is improved without re-fragmenting logic.

Files Modified: `src/constants/zod-schema.tsx`, `src/app/(main)/(users)/myprofile/PersonalLinks.tsx`, `src/app/(main)/(users)/myprofile/Profile.tsx`, `src/app/(main)/(users)/myprofile/ResearchInterests.tsx`, `src/tests/__tests__/zodSchema.test.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-03 - Profile Crop Preview Object URL Cleanup

Problem: Profile image crop previews used `URL.createObjectURL` without revoking prior object URLs, which could leak browser memory when users cropped repeatedly.

Root Cause: The preview URL was replaced directly in component state on each crop completion, but there was no tracked URL lifecycle cleanup on replace/edit-exit/unmount.

Solution: Added object URL lifecycle management in profile editing: store the active blob URL in a ref, revoke it before creating a new preview URL, revoke it when edit mode closes, and revoke on component unmount.

Result: Repeated crop attempts no longer accumulate stale blob URLs, reducing memory growth during profile editing sessions.

Files Modified: `src/app/(main)/(users)/myprofile/Profile.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-01 - Email-or-Username Validator ReDoS-Resilient Refactor

Problem: `emailOrUsernameSchema` still relied on a regex with repeated groups (`([\w-]+\.)+`) in a high-frequency auth validation path.

Root Cause: The Zod validator used a single alternation regex for both email and username forms, which is concise but less transparent for worst-case regex complexity analysis.

Solution: Replaced the regex with deterministic parser-style validation in `superRefine`: split email vs username by `@`, validate local/domain labels with linear character checks, and enforce explicit TLD length (`2-63`) without repeated-group regex matching.

Result: Login/resend validation behavior remains aligned (dot usernames allowed, long-TLD emails allowed), while removing the repeated-group regex construct from this path.

Files Modified: `src/constants/zod-schema.tsx`, `src/tests/__tests__/zodSchema.test.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-03-01 - URL Schema ReDoS Hardening for CodeQL `js/redos`

Problem: Code scanning flagged `urlSchema` with `js/redos` because the URL path regex could trigger inefficient backtracking on crafted input.

Root Cause: The previous URL validator used a complex, nested-quantifier regex (`([\/\w\.-]*)*`) over overlapping character classes, which can cause super-linear match time in backtracking regex engines.

Solution: Replaced the final URL-format regex path check with deterministic parsing via `new URL(url)`, then validated hostname structure (domain parts, subdomain label characters, TLD length) and pathname using simple linear checks. Kept existing scheme and whitespace validations intact.

Result: URL validation still supports query/hash URLs, rejects malformed domains, and removes the CodeQL-flagged ReDoS-prone regex pattern from `urlSchema`.

Files Modified: `src/constants/zod-schema.tsx`, `src/tests/__tests__/zodSchema.test.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-02-28 - Upload Proxy Origin Handling Audit and Simplification

Problem: Follow-up localhost-oriented upload fixes introduced extra proxy complexity (multi-context retries and backend-origin fallback), which increased maintenance burden and could create policy inconsistency against backend origin checks.

Root Cause: The quick 403 mitigations focused on bypassing origin-block symptoms instead of preserving the request's true frontend origin context end-to-end.

Solution: Performed a post-change audit and simplified `src/app/api/uploads/image/route.ts` to one deterministic strategy: forward browser `Origin`/`Referer` to backend, with a safe fallback to `request.nextUrl.origin` when browser origin is missing. Removed backend-origin spoof fallback and origin-retry loops.

Result: Upload behavior is now consistent with backend allowlist policy, robust for real deployments behind approved frontend domains (for example `https://test.scicommons.org`), and lower risk for regression/security drift.

Files Modified: `src/app/api/uploads/image/route.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-02-28 - MDX JPG Paste Upload 403 Hardening (Proxy + MIME Alias)

Problem: Pasting JPG images into the markdown editor could fail with `403` upload errors and user-facing "request failed" messages.

Root Cause: The editor upload path sent multipart uploads directly from the browser to backend image upload API, which is sensitive to origin/restriction checks. Also, some clipboard JPEG payloads use the `image/jpg` alias, which can be rejected when only canonical `image/jpeg` is accepted.

Solution: Added a same-origin upload proxy route at `src/app/api/uploads/image/route.ts` to forward authenticated multipart uploads server-side to the backend and return backend error details cleanly. Updated `InitializedMDXEditor` to upload through that proxy route instead of direct generated-client calls. Added MIME normalization for `image/jpg` -> `image/jpeg` in both editor validation and `/api/compress-image` validation.

Result: Markdown editor image uploads now stay on same-origin browser requests, backend-origin 403 risks are reduced, and pasted JPG clipboard aliases are accepted consistently.

Files Modified: `src/components/common/MarkdownEditor/InitializedMDXEditor.tsx`, `src/app/api/uploads/image/route.ts`, `src/app/api/compress-image/route.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-02-28 - MDX Editor Image Upload Pipeline + Per-User Throttle

Problem: All `InitializedMDXEditor` usages lacked a real image upload pipeline, so users could not upload editor images directly and there was no frontend-side limit for upload bursts.

Root Cause: `imagePlugin` was configured with a placeholder `imageUploadHandler` that returned an empty URL, and there was no shared throttle logic keyed by the authenticated user.

Solution: Added a new Next.js route handler at `src/app/api/compress-image/route.ts` to validate/resize/compress uploads with `sharp` and return optimized AVIF files. Updated `InitializedMDXEditor` to validate files, enforce a shared per-user `10 uploads / 60 seconds` sliding-window throttle across all editor instances, call `/api/compress-image`, then upload via `myappUploadApiUploadImage` and return `public_url`. Re-enabled the toolbar image insert action so uploads are reachable from editor UI.

Result: Image upload now works consistently across all pages using `InitializedMDXEditor`, while frontend throttling prevents users from exceeding 10 image uploads per minute before backend upload calls are sent.

Files Modified: `src/components/common/MarkdownEditor/InitializedMDXEditor.tsx`, `src/app/api/compress-image/route.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

Follow-up (same day): Adjusted MDX editor aesthetics to match site visual language by re-theming MDXEditor token variables and control surfaces in `globals.css`, and by styling the custom editor toolbar wrapper with existing card/border utilities. This keeps upload behavior unchanged while making toolbar, popovers, and dialogs consistent with SciCommons design tokens.

Follow-up (same day): Updated the helper note above editable markdown editors to match enforced runtime constraints (`3MB` source image limit and `10 uploads/minute` throttle) instead of the earlier "Up to 5 images" wording.

## 2026-02-27 - Article Card Title Overflow Without Wide Link Hitbox

Problem: Very long/unbroken article titles in card lists could crowd the right-side bookmark/preview actions.

Root Cause: The title row did not isolate layout width constraints from clickable link sizing, so attempts to fix overflow could either push actions or make the link click target too wide.

Solution: Updated `ArticleCard` title row to use a non-clickable `min-w-0 flex-1` wrapper for layout constraints while keeping the title link itself `inline-block max-w-full`. Added robust wrapping for long tokens (`break-words` + `overflow-wrap:anywhere`) while preserving existing compact-mode multi-line clamping and minimal-mode styling.

Result: Long titles no longer crowd action icons, and the title link remains scoped to title text rather than expanding across most of the row.

Files Modified: `src/components/articles/ArticleCard.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

Follow-up (same day): Applied the same overflow-safe width/click-target pattern to contribution cards with trailing columns. Updated `ItemCard` (title + role icon row) and `ContributionCard` (title + count row) to use `min-w-0` layout wrappers, robust word wrapping, and shrink-protected trailing elements so long titles no longer crowd right-side metadata.

## 2026-02-27 - Auth Revalidation vs Hard Expiry Separation

Problem: Auth-guarded pages could show "Session Expired" even when the token itself had not expired.

Root Cause: `isTokenExpired()` mixed two signals (hard token expiry + 5-minute server revalidation window), while `withAuthRedirect` interpreted any `true` result as immediate session expiry/logout.

Solution: Separated responsibilities in auth store logic by moving periodic server revalidation into `initializeAuth` and limiting forced logout to explicit auth failures (`401`/`403`) during revalidation. Simplified `isTokenExpired()` to hard-expiry only. Added a regression test that advances time past 5 minutes but before token expiry and asserts no hard-expiry state.

Result: Frontend auth guards no longer force false "session expired" flows on stale revalidation windows; users are only logged out on actual token expiry or backend auth failure.

Files Modified: `src/stores/authStore.ts`, `src/tests/__tests__/authStore.test.ts`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

Follow-up (same day): Added a tiny development-only auth debug logger in `authStore` to trace hard-expiry validation and periodic server-revalidation decisions during QA without affecting production behavior.

## 2026-02-27 - Zod Validation Follow-up Hardening (Email/URL/Profile Normalization)

Problem: After the initial Zod migration fixes, several validation gaps remained: login/resend rejected valid long-TLD emails, URL validation rejected valid query/hash URLs, optional profile links could be submitted as whitespace-only raw strings, and professional status accepted whitespace-only values.

Root Cause: `emailOrUsernameSchema` still used a short TLD cap (`2-4`), `urlSchema` path regex excluded `?` and `#`, optional-link validation accepted trimmed-empty strings but submit payload still used untrimmed form values, and `statusSchema` lacked `.trim()`.

Solution: Expanded email TLD range in `emailOrUsernameSchema` to `2-63`, updated `urlSchema` final path-format regex to allow optional query/hash segments, trimmed profile link/status/year values in profile submit payload before API mutation and year checks, and added `.trim()` to `statusSchema`. Added regression tests for long-TLD emails, query/hash URL acceptance, whitespace normalization behavior, and whitespace-only status rejection.

Result: Auth and profile forms now accept modern valid email/URL inputs without false negatives, optional links persist as clean empty strings instead of whitespace payloads, and status fields block blank-space submissions reliably.

Files Modified: `src/constants/zod-schema.tsx`, `src/app/(main)/(users)/myprofile/page.tsx`, `src/tests/__tests__/zodSchema.test.ts`, `src/components/articles/SubmitArticleForm.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-27 - Zod Migration Regression Fixes (Auth + Profile Validation)

Problem: The Zod migration branch introduced multiple regressions: confirm-password checks could throw runtime regex errors, login/resend blocked dot usernames, profile end-year format validation was bypassed, optional profile links became effectively required, signup password complexity checks were weakened, and password-visibility icon semantics were inverted.

Root Cause: Validation behavior depended on regex construction from user input, username regex was narrowed too far, `FormInput` short-circuited validation when `validateFn` existed, strict URL schemas were applied directly to optional profile fields, password schema dropped the complexity regex, and visibility icon rendering used reversed conditions.

Solution: Replaced regex-based password matching with direct string comparison in `matchPassword`, widened `emailOrUsernameSchema` username handling to accept dots, chained `validateFn` and schema validation in `FormInput`, introduced optional URL schema variants and wired them into `PersonalLinks`, restored password complexity checks in `passwordSchema` using the existing shared regex, and swapped visibility icons to `Eye` (hidden) / `EyeOff` (visible) semantics. Added targeted schema regression tests for these fixes.

Result: Auth and profile validation behavior now aligns with expected UX and prior constraints, runtime regex exceptions are removed, optional profile links no longer block saves when blank, and visual password-toggle semantics are corrected.

Files Modified: `src/constants/zod-schema.tsx`, `src/components/common/FormInput.tsx`, `src/app/(authentication)/auth/register/page.tsx`, `src/app/(authentication)/auth/resetpassword/[token]/page.tsx`, `src/app/(main)/(users)/myprofile/PersonalLinks.tsx`, `src/tests/__tests__/zodSchema.test.ts`, `CHANGE_COMMENTS.md`

## 2026-02-27 - Discussion Summary Delete Dialog UX/A11y Hardening

Problem: The new in-app delete confirmation for discussion summaries closed immediately after clicking `Delete`, even before API success, and lacked robust keyboard/focus behavior.

Root Cause: The dialog close state was triggered inside the delete-click handler rather than mutation success, and the modal had no Escape/backdrop-close handling or focus restoration lifecycle.

Solution: Updated `DiscussionSummary` to close the dialog only on successful delete mutation, added guarded Escape key and backdrop-click dismissal, focused the cancel button on open, restored focus on close, and cleaned up dialog markup/loading behavior for consistency.

Result: Delete confirmation now behaves predictably (stays open during API work and errors), keyboard/mouse dismissal is more accessible, and dialog interaction is aligned with expected app UX patterns.

Files Modified: `src/components/articles/DiscussionSummary.tsx`, `CHANGE_COMMENTS.md` (commit reference: pending local commit)

## 2026-02-27 - Zod v4 Compatibility Fix for Profile Validation Build

Problem: After adding `zod` as a direct dependency, Docker/Next builds failed in profile validation with TypeScript errors on `ZodError.errors`.

Root Cause: The code used `result.error.errors[0].message`, which is not available in Zod v4 (uses `issues`).

Solution: Updated profile validation error extraction in `FormInput` and `ResearchInterests` to use `result.error.issues[0]?.message` with safe fallback messages.

Result: Profile validation now compiles correctly with direct `zod@4` and no longer blocks `next build`/Docker build on this API mismatch.

Files Modified: `src/components/common/FormInput.tsx`, `src/app/(main)/(users)/myprofile/ResearchInterests.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-27 - Profile Validation Consistency Follow-up (Zod + International Names)

Problem: The latest profile-validation commits introduced two consistency issues: name validation still rejected many international names, and the new `schema` prop typing in `FormInput` triggered lint warnings (`no-explicit-any`).

Root Cause: `nameSchema` used an ASCII-only regex (`[a-zA-Z]`), and `FormInput` typed schemas as `ZodSchema<any>`.

Solution: Updated `nameSchema` to use trim + Unicode-aware validation that supports letters/combining marks with internal spaces, apostrophes, and hyphens. Replaced `FormInput` schema typing with `ZodTypeAny` to remove explicit `any`. Added a new regression test suite for valid/invalid `nameSchema` cases.

Result: Profile name validation now aligns with the intended international-name support, lint consistency is restored in shared form input types, and test coverage now guards against future regex regressions.

Files Modified: `src/constants/zod-schema.tsx`, `src/components/common/FormInput.tsx`, `src/tests/__tests__/zodSchema.test.ts`, `CHANGE_COMMENTS.md`

## 2026-02-26 - Profile Save/Cancel Consistency and Dirty-State Hardening

Problem: The profile edit flow could show stale pre-save data right after a successful save, and dirty-state logic introduced lint/type issues while cancel controls were duplicated in two locations.

Root Cause: The success handler called `reset()` with implicit defaults before refetched user data arrived, dirty checks depended on `any` casting, and both header and footer exposed cancel actions for the same behavior.

Solution: Removed eager post-save `reset()` and kept cache invalidation as the source of truth refresh, made `profilePicture` optional for typed reset defaults, replaced `any`-based dirty checks with typed partial-default comparison, and standardized to a single footer cancel button.

Result: Save now preserves submitted values until canonical refetch, profile dirty-state checks remain lint-clean/type-safe, and edit actions are more consistent with one cancel path.

Files Modified: `src/app/(main)/(users)/myprofile/page.tsx`, `src/app/(main)/(users)/myprofile/Profile.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-26 - Notifications Tab-Aware "New" Indicators + Mention Cleanup Controls

Problem: Notifications UX could not distinguish unseen tab activity across System vs Mentions, bell "New" behavior was mention-only and persisted until read, and Mentions lacked a way to clear historical read entries.

Root Cause: The app tracked unread item state, but did not track per-tab/per-bell seen timestamps for activity acknowledgment; tab titles were count-based only, and mention store exposed no read-mentions bulk cleanup action.

Solution: Added a persisted, user-scoped notification activity store to track seen timestamps for the bell, System tab, and Mentions tab. Updated navbar notifications routing and badge logic to: open Mentions only when Mentions has new activity and System does not; otherwise open System (including both-new and system-only cases). Bell "New" now clears on bell click. Updated notifications page to show tab labels as `System (New)` / `Mentions (New)` for unseen activity on non-active tabs only, and clear those labels when a tab is opened. Added `clearReadMentions` in mention store and a `Clear Read Mentions` button in the Mentions tab.

Result: Notification entry behavior now follows activity-aware tab selection and labeling rules, "New" indicators clear at the expected acknowledgment moments, and users can one-click clear read mentions while keeping unread mentions intact.

Files Modified: `src/stores/notificationActivityStore.ts`, `src/components/common/NavBar.tsx`, `src/app/(main)/(users)/notifications/page.tsx`, `src/stores/mentionNotificationsStore.ts`, `src/components/ui/tab-navigation.tsx`, `CHANGE_COMMENTS.md`

Follow-up (same day): Resolved static-export prerender failure for `/notifications` by moving route entry to a server `page.tsx` Suspense wrapper and shifting client logic (including `useSearchParams`) into `NotificationsPageClient.tsx`.

Follow-up (same day): Removed a redundant nested Suspense wrapper from `NotificationsPageClient.tsx` after introducing the server-level `page.tsx` Suspense boundary, so the route now has a single canonical boundary without behavior changes.

Follow-up (same day): Updated manager join-request actions in System notifications to move cards to the Read section after `Accept`/`Reject` succeeds (success-based transition, no extra manual mark-read step).

Follow-up (same day): Updated Notifications tab "New" labels from plain text suffixes to the existing pill badge style used elsewhere (e.g., navbar/discussions), for consistent visual language.

Follow-up (same day): Refined navbar notifications deep-link routing to choose default tab based on activity since the bell was last seen (not tab-seen history), so mention-only new activity opens `Mentions` while mixed/ system activity opens `System`.

Follow-up (same day): Made the top "Mark All as Read" control active-tab aware: on `System` it marks unread system notifications; on `Mentions` it marks unread mentions, preventing a misleading disabled state when mentions are the only unread items.

Follow-up (same day): Seeded new-owner notification activity timestamps to current time instead of epoch (`0`) so legacy/historical system notifications no longer force `System` tab on first click when current bell activity is mention-only.

Follow-up (same day): Implemented mention deep-link v2 for comment targets. Comment mentions now include `commentId` in navigation links, discussions route parses and propagates that target, comment trees auto-expand the target branch once, scroll to the exact comment, and then clear one-shot target state to avoid repeated forced expansions. Added backward-compatible fallback so older stored mention rows (without `commentId`) still route to the correct comment.

Follow-up (same day): Prevented stale mention regeneration from old threads by enforcing retention against source `createdAt` during mention capture/storage. Mentions older than 30 days are now skipped instead of being re-added after local history cleanup.

Follow-up (same day): Moved mention-retention duration into a shared constant (`src/constants/notifications.constants.ts`) so the 30-day window is centrally configurable and easier to audit.

## 2026-02-26 - Discussions Guest Empty-State Redirect + Private Access Notice

Problem: Logged-out users could open `/discussions` and see an empty sidebar state that looked stale/broken, with no clear direction about private-community access.

Root Cause: The discussions route is intentionally public-routable, while discussion subscriptions are auth-gated; when guest users had no loadable articles, the UI showed a generic empty state.

Solution: Added guest-aware handling in `DiscussionsSidebar`: after auth initialization, if a logged-out user has zero loaded discussion articles, redirect to `/auth/login`. Also added a top informational banner for guests explaining that login unlocks private communities and private discussion subscriptions.

Result: Empty guest discussions states now move users directly to login, and guest users get explicit context about private-access benefits when discussions content is visible.

Files Modified: `src/app/(main)/discussions/DiscussionsSidebar.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - System Notifications Unread/Read Piles + Inline Join-Request Actions

Problem: In the notifications System tab, unread and read items were mixed in one list, and manager-facing join requests required opening a separate page via `View` before admins could approve or reject.

Root Cause: The System tab rendered a uniform notification card without role-aware action handling, and read state changes were only represented as a single per-card button.

Solution: Split System notifications into explicit unread (top) and read (bottom) sections while preserving chronological order inside each section. Added manager join-request detection from notification type/message/link/content metadata, showed target group name on the card, removed `View` for those cards, and added inline `Accept`/`Reject` actions wired to the join-request management endpoint. After action success, the card is marked read, moved to the read section, and displays the final decision state (`Approved`/`Rejected`) on the button.

Result: Users now get clearer System triage with unread-first ordering, own-request notifications naturally move to the lower read pile when marked read, and community admins can process incoming join requests directly from notifications without navigating away.

Follow-up (same day): Kept both manager decision buttons (`Accept` + `Reject`) visible and actionable even after a choice is made, and changed the selected state to button highlighting so admins can revise their decision from the same card. Added a top-level `Mark All as Read` action to bulk-clear unread System notifications in one click.

Files Modified: `src/app/(main)/(users)/notifications/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Notifications Button Mention Indicator

Problem: New discussion mentions appeared in the Mentions inbox, but the top notifications button had no visible cue that unread mentions existed.

Root Cause: Navbar notifications icon was static and not connected to mention unread state.

Solution: Wired navbar to the mention notification store, scoped entries to the active user, cleaned expired mention records on load, and rendered a compact "New" badge on the notifications button when unread mentions are present.

Result: Users now get a lightweight visual alert for new mentions without numeric counts, and the badge clears once mentions are marked read.

Files Modified: `src/components/common/NavBar.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Notifications "View" Link Routing Fix (System Tab)

Problem: "View" links in non-mention notifications could open dead destinations instead of navigating to the intended in-app page.

Root Cause: Notification links were always rendered as external anchors after URL sanitization, so relative app paths were treated like off-site URLs.

Solution: Added a safe navigable URL resolver that classifies links as internal vs external, then updated notifications UIs to render Next `Link` for internal paths and external anchors only for off-origin URLs.

Result: System notification "View" links now navigate correctly for in-app routes while retaining safe handling for external links.

Files Modified: `src/lib/safeUrl.ts`, `src/app/(main)/(users)/notifications/page.tsx`, `src/components/common/Notifications.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Discussion Mention Capture + Mentions Inbox Tab

Problem: Discussion/comment `@member` mentions were composable in the editor, but there was no in-app mention inbox for recipients, no backend-payload scanning for mentions, and no one-time suppression to avoid duplicate mention alerts.

Root Cause: Mention autocomplete existed only at input time; incoming discussion payloads (initial loads + realtime) were not parsed for current-user mentions, and the notifications page had no mention-specific view/state model.

Solution: Added shared mention parsing and capture helpers, plus a persisted per-user mention store with unread/read state, dedupe-by-source keys, and 30-day retention cleanup. Wired mention scanning into discussion list fetches, recursive discussion comment-tree fetches, and realtime `new_*`/`updated_*` discussion-comment events. Added discussion-thread deep-link support via `discussionId` query param in discussions split view (`/discussions?articleId=...&discussionId=...`). Reworked `/notifications` into a tabbed interface with `System` and `Mentions`; mention items are grouped into unread/read sections and move to read when clicked.

Result: Mention recipients now get durable, non-toast mention entries with one-click navigation to the relevant discussion thread, and each mention source is surfaced only once within a rolling 30-day window.

Files Modified: `src/lib/discussionMentions.ts`, `src/lib/mentionNotifications.ts`, `src/stores/mentionNotificationsStore.ts`, `src/components/articles/DiscussionForum.tsx`, `src/components/articles/DiscussionComments.tsx`, `src/components/articles/DiscussionCard.tsx`, `src/components/articles/DiscussionThread.tsx`, `src/hooks/useRealtime.tsx`, `src/app/(main)/discussions/DiscussionsPageClient.tsx`, `src/components/articles/ArticleContentView.tsx`, `src/app/(main)/(users)/notifications/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Discussions Split View Default Selection on First Load

Problem: On initial load of the discussions page, the right panel could remain empty until the user manually selected an article from the left sidebar.

Root Cause: Selection restore logic only handled explicit `articleId` URL params and had no fallback for first-load scenarios without that param.

Solution: Updated discussions initialization to select an article once in deterministic priority order: URL `articleId`, session-stored last selected discussion article, previously read article from `readItemsStore.clearedArticles`, then the top article. Persisted selected article id in session storage during both initialization and manual selection.

Result: The discussions right panel now auto-populates reliably on first load, while still honoring deep links and previous context when available.

Files Modified: `src/app/(main)/discussions/DiscussionsPageClient.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Community Split-View Preview Selection Override Fix

Problem: In the community two-panel articles view, clicking a non-top article could still show the top article in the right preview panel.

Root Cause: URL-driven restoration logic re-applied selection too aggressively and could override manual click selection during subsequent state/query-param updates.

Solution: Hardened preview selection sync in `CommunityArticles`: read current query params from `window.location.search` when updating `articleId`, restore from URL only when the requested id actually changes, reset restore state on search, and key the right-panel `ArticleContentView` by selected article id.

Result: Clicking any article in community preview mode now keeps the right panel aligned with the clicked card instead of snapping back to the first item.

Files Modified: `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/CommunityArticles.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Community-Member `@mention` Suggestions in Discussion Comments

Problem: Discussion comments/replies did not provide guided `@name` tagging, so users had to guess exact member names and could not reliably mention the intended community member.

Root Cause: Discussion comment inputs were plain textareas with no mention-token parsing or candidate source from the community API.

Solution: Added mention-autocomplete behavior to the shared discussion comment input flow: typing `@` followed by letters now parses an active mention token, filters candidates in real time, and inserts the selected name via keyboard or mouse. Wired `DiscussionForum` to fetch the active community payload and derive `members` as normalized mention candidates, then passed those candidates through discussion-only comment components (new comment, reply, edit, nested replies).

Result: In community discussions, users now get continuously filtered `@member` suggestions while typing in comments/replies, with no impact on non-discussion comment surfaces.

Follow-up (same day): Extended `@mention` suggestions to discussion markdown content editors (new + edit) by wiring mention candidates through `DiscussionForm`/discussion edit forms -> `FormInput` -> MDX editor wrapper and adding caret-based mention detection + suffix insertion in the markdown editor component.

Follow-up (same day): Hardened mention menu UX near viewport edges by adding dynamic above/below placement and constrained max-height in both textarea and markdown editors, and synchronized arrow-key highlight with list scrolling so the active option stays visible.

Files Modified: `src/components/common/CommentInput.tsx`, `src/components/articles/DiscussionForum.tsx`, `src/components/articles/DiscussionCard.tsx`, `src/components/articles/DiscussionThread.tsx`, `src/components/articles/DiscussionComments.tsx`, `src/components/common/RenderComments.tsx`, `src/components/common/Comment.tsx`, `src/components/articles/DiscussionForm.tsx`, `src/components/common/FormInput.tsx`, `src/components/common/MarkdownEditor/ForwardRefEditor.tsx`, `src/components/common/MarkdownEditor/InitializedMDXEditor.tsx`, `src/components/articles/ArticleContentView.tsx`, `src/components/articles/ArticlePreviewSection.tsx`, `src/app/(main)/(communities)/community/[slug]/articles/[articleSlug]/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Add External Destination Links for Home Supporter Logos

Problem: The four supporter logos on the homepage were visual-only and did not navigate to the supporters' websites.

Root Cause: The supporters block rendered plain image components without outbound anchor/link wrappers.

Solution: Wrapped each supporter logo group with an external link and mapped URLs as follows: KCDHA -> Ashoka Koita Centre, DRAC -> Digital Research Alliance of Canada, GSoC -> Google Summer of Code, INCF -> INCF.

Result: Users can now click/tap each supporter logo to open the correct supporter page in a new tab.

Files Modified: `src/app/(home)/page.tsx`, `CHANGE_COMMENTS.md`

## 2026-02-25 - Add INCF to Home Supporters and Split Supporters into Two Rows

Problem: The homepage supporters section did not include the newly provided INCF logo, and a single desktop row was becoming visually long.

Root Cause: The supporters block in `src/app/(home)/page.tsx` was hard-coded as a horizontal row at `sm` breakpoints and had no INCF image entry.

Solution: Moved the provided `incf.png` asset into `public/images/INCF.png`, added an INCF logo image in the supporters list, and changed the supporters logo layout to a responsive grid (1 column on mobile, 2 columns from `sm` onward).

Result: INCF now appears in the front-page "Our Supporters" section, and desktop/tablet rendering is balanced across two rows instead of one long strip.

Files Modified: `public/images/INCF.png`, `src/app/(home)/page.tsx`, `CHANGE_COMMENTS.md`

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

## 2026-03-16 - LinkedIn Profile-Only Validation Test Coverage

Problem: LinkedIn URL validation was intentionally narrowed to personal profile paths (`/in/...`), but test coverage did not explicitly lock that behavior.

Root Cause: `zodSchema.test.ts` had no dedicated LinkedIn schema cases for accepted profile URLs versus rejected non-profile URLs.

Solution: Added regression tests for `linkedInUrlSchema` that accept `/in/...` profile URLs and reject `/company/...` and `/pub/...` URLs.

Result: The profile-only LinkedIn requirement is now enforced by tests and less likely to regress silently.

Files Modified: `src/tests/__tests__/zodSchema.test.ts`
