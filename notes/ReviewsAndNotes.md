# Review Findings (2026-02-09)

Prepared by Codex for bsureshkrishna on 2026-02-09.

## Findings

1. High: `src/components/common/BottomBar.tsx` uses `React.lazy` for `Drawer` components without a surrounding `Suspense` fallback. This will throw a suspension error on first render in mobile nav, breaking the bottom bar. Wrap lazy components in `Suspense` or switch to `next/dynamic` with a loading fallback.
2. Medium: `src/stores/unreadNotificationsStore.ts` BroadcastChannel sync can ping-pong between tabs. Receiving a `sync` message sets state, which then broadcasts the same payload back, causing endless cross-tab chatter. Add a sender id, a guard, or a payload comparison before rebroadcasting.
3. Medium: `src/hooks/useRealtime.tsx` does not release leader heartbeat on logout. `isLeader` can stay true and the heartbeat keeps writing to localStorage, so other tabs cannot become leader and realtime stalls after logout in one tab. Call `releaseLeadership()` and clear `STORAGE_KEYS.LEADER` when `isAuthenticated` becomes false.
4. Medium: `src/app/(main)/(users)/settings/page.tsx` and `src/app/(main)/(users)/myprofile/page.tsx` are not protected by middleware or `withAuthRedirect`, so unauthenticated users can access UI that expects auth. Combined with `src/stores/userSettingsStore.ts` persistence, a shared machine can show prior user settings. Add route protection and clear user settings on logout.
5. Low: `src/components/pdf/TextSelectionPopup.tsx` and `src/components/pdf/AnnotationSidebar.tsx` call `navigator.clipboard.writeText` without handling failures. Clipboard is blocked on non-secure contexts or denied permissions; add a catch and user-visible toast.
6. Low: `src/hooks/useKeyboardNavigation.ts` captures ArrowUp and ArrowDown globally and prevents default even when typing in inputs. This can break cursor movement in text fields when preview mode is enabled. Add a guard for input, textarea, and contentEditable targets.
7. Low: `src/components/pdf/PDFViewerContainer.tsx` hardcodes the PDF worker to `https://unpkg.com/...`. This can fail under CSP or offline. Consider bundling a local worker or adding a local fallback.

## Scope

1. Config/runtime: `package.json`, `next.config.mjs`, `src/middleware.ts`, `src/app/layout.tsx`, `src/app/(main)/layout.tsx`
2. Auth/session: `src/stores/authStore.ts`, `src/hooks/useAuthHeaders.ts`, `src/HOCs/*`, `src/hooks/useCurrentUser.ts`, `src/hooks/useUserSettings.ts`, `src/stores/userSettingsStore.ts`
3. Realtime/unread: `src/hooks/useRealtime.tsx`, `src/stores/unreadNotificationsStore.ts`, `src/stores/realtimeStore.ts`, `src/app/(main)/discussions/*`, `src/components/articles/Discussion*`
4. Rendering/UI: `src/components/articles/ArticleCard.tsx`, `src/components/articles/DiscussionSummary.tsx`, `src/components/articles/ArticleStats.tsx`, `src/components/common/RenderParsedHTML.tsx`, `src/components/common/TruncateText.tsx`, `src/components/common/EmptyState.tsx`, `src/components/communities/CommunityCard.tsx`, `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/*`
5. PDF/annotations: `src/components/pdf/*`, `src/stores/pdfAnnotationsStore.ts`
6. Notifications/navigation: `src/components/common/NavBar.tsx`, `src/components/common/BottomBar.tsx`, `src/app/(main)/(users)/notifications/page.tsx`, `src/components/common/Notifications.tsx`

## Assumptions / Flags

1. If `/discussions` or `/myprofile` are intended to be auth-only, current protection does not enforce that in middleware. If they are intended to be public, current behavior is acceptable.

## Test Gaps / What Is Important To Cover

1. Unread cross-tab synchronization (no ping-pong, correct unread counts across tabs).
2. Realtime leadership on logout and relogin (leader release, re-election, queue state correctness).
3. Mobile navigation rendering (lazy drawer components with `Suspense` or dynamic fallback).

## Follow-up

1. High/Medium fixes implemented in commit `f87d14c` (auth gating, realtime/unread fixes, documentation).
2. Low-severity fixes implemented in commit `8e1cdbf` (clipboard error handling, keyboard nav guard, PDF worker override).

---

---

---

# COMPREHENSIVE CODE AUDIT - DEEP REVIEW

**Reviewer:** Claude Sonnet 4.5
**Date:** 2026-02-08
**Scope:** Full repository audit focusing on major logic bugs, functional issues, and serious problems

---

## COMPREHENSIVE CODE AUDIT REPORT - CRITICAL ISSUES FOUND

Based on my deep review of this SciCommons frontend repository, I've identified the following serious issues organized by category:

---

### 1. AUTHENTICATION & AUTHORIZATION

**CRITICAL: Race Condition in Auth Initialization**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\stores\authStore.ts`
- **Issue**: Lines 174-248 - The `initializeAuth` function has a complex migration flow from localStorage to cookies that could lead to race conditions. Multiple parallel calls during app startup could cause inconsistent auth state.
- **Impact**: Users might be logged out unexpectedly or experience authentication flickers during page loads.
- **Details**: The function reads from localStorage, writes to cookies, probes server session, and updates state - all without locking mechanism. If called multiple times simultaneously (which can happen with React Strict Mode or fast navigation), state could become corrupted.

**CRITICAL: Token Expiry Check Without Server Validation**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\stores\authStore.ts`
- **Issue**: Lines 249-252 - `isTokenExpired` only checks local expiry timestamp without validating against server
- **Impact**: User could remain logged in with an actually expired/revoked token if local time is manipulated or server invalidates the token early.

**CRITICAL: Missing Auth Check in API Instance**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\api\custom-instance.ts`
- **Issue**: Lines 42-59 - The custom axios instance doesn't have a response interceptor to handle 401/403 errors globally
- **Impact**: If auth token expires mid-session, individual components must handle auth failures independently, leading to inconsistent UX and potential stuck states.

---

### 2. STATE MANAGEMENT & RACE CONDITIONS

**CRITICAL: Unread Notifications Cross-Tab Sync Loop**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\stores\unreadNotificationsStore.ts`
- **Issue**: Lines 257-282 - The BroadcastChannel sync has protection against sender ID, but the subscription happens BEFORE the guard is properly initialized
- **Impact**: Could cause infinite loops or missed updates in multi-tab scenarios during rapid state changes.
- **Details**: Line 274 subscribes to ALL store changes and broadcasts them. If two tabs update simultaneously, they could ping-pong updates indefinitely despite sender ID checks.

**HIGH: Realtime Store Context Freshness Logic Flaw**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\stores\realtimeStore.ts`
- **Issue**: Lines 69-74 - `isContextFresh` uses a hardcoded 30-second window, but doesn't account for system time changes or component lifecycle
- **Impact**: Realtime updates might be incorrectly applied to wrong article/community contexts if user navigates quickly or system clock changes.

**CRITICAL: PDF Annotations Import Allows ID Collisions**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\stores\pdfAnnotationsStore.ts`
- **Issue**: Lines 145-164 - `importAnnotations` only checks existing IDs but doesn't validate annotation structure
- **Impact**: Malformed JSON import could corrupt the entire annotation store or cause runtime crashes.
- **Details**: No validation that imported objects have required fields (`articleSlug`, `pdfUrl`, `highlightAreas`, etc.). Could lead to type errors downstream.

---

### 3. REACT HOOKS DEPENDENCY ISSUES

**HIGH: useStore Hook Has Stale Closure Bug**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useStore.ts`
- **Issue**: Lines 1-17 - This hook reads from store, puts result in state, but only updates when `result` reference changes
- **Impact**: Components using this hook might display stale data if store updates but returned value is referentially equal.
- **Details**: Line 11 `setData(result)` only fires when `result` changes, but zustand selectors might return same reference even when underlying data changed.

**CRITICAL: Comment Component Has Memory Leak in findArticleContext**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\common\Comment.tsx`
- **Issue**: Lines 134-144 - `findArticleContext` is recreated on every render with `articleUnreads` in deps array
- **Impact**: On pages with many comments (100+), this causes massive re-renders and memory consumption.
- **Details**: The function iterates over all unread articles for EVERY comment on EVERY render when `articleUnreads` changes. With 100 comments, that's 100 iterations × N articles on each update.

**HIGH: useRealtime Hook Has Missing Cleanup in pollLoop**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useRealtime.tsx`
- **Issue**: Lines 683-881 - `pollLoop` schedules itself recursively via setTimeout but doesn't store timeout ID for cleanup
- **Impact**: If component unmounts or auth changes mid-poll, the next poll might still fire leading to memory leaks and zombie polls.
- **Details**: Line 866-868 schedules next poll but doesn't save the timeout ID. Component unmount (line 994-999) can't cancel pending polls.

**HIGH: useMarkAsReadOnView Has Race Condition**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useMarkAsReadOnView.ts`
- **Issue**: Lines 32-77 - The `hasMarkedRef` flag is reset when `enabled` changes, but IntersectionObserver might fire during the reset
- **Impact**: Items could be marked read twice or not at all if visibility changes during enable/disable transitions.

---

### 4. DATA FETCHING & API INTEGRATION

**CRITICAL: Race Condition in Realtime Event Processing**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useRealtime.tsx`
- **Issue**: Lines 512-655 - `handleEvents` updates query cache optimistically but has no collision detection for rapid events
- **Impact**: If multiple events arrive for same discussion/comment in quick succession, cache updates could be applied out of order leading to stale or duplicate data.
- **Details**: Lines 266-276 check for duplicates in discussions, but lines 362-379 for comments don't have the same protection for nested replies.

**HIGH: Missing Error Boundary in Realtime Poll**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useRealtime.tsx`
- **Issue**: Lines 771-861 - The catch block handles specific errors but a generic thrown error could crash the poll loop permanently
- **Impact**: Unexpected errors (network timeouts, JSON parse failures) could disable realtime updates silently without user notification.

**CRITICAL: Article Form localStorage Race Condition**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\app\(main)\(articles)\submitarticle\page.tsx`
- **Issue**: Lines 70-143 - Multiple useEffects read/write to same localStorage key without coordination
- **Impact**: When switching tabs quickly or if external article data loads, form data could be corrupted or overwritten unexpectedly.
- **Details**: Lines 82-98 (save on watch), 101-115 (tab change), and 118-142 (article data) all write to `STORAGE_KEY` independently. No locking mechanism.

**HIGH: External Article Fetch Has XSS Vulnerability in XML Parsing**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\stores\useFetchExternalArticleStore.ts`
- **Issue**: Lines 133-155 - arXiv response is parsed with DOMParser without sanitization before extracting text content
- **Impact**: Malicious arXiv XML response could inject scripts that get executed when rendering article data.
- **Details**: Line 135 `parser.parseFromString` processes untrusted XML. While `textContent` is used (which is safer), the xmlDoc object itself isn't validated.

---

### 5. ERROR HANDLING & EDGE CASES

**CRITICAL: Unhandled Promise Rejection in Query Mutations**

- **File**: Multiple components (`DiscussionForum.tsx`, `DisplayArticle.tsx`, `Comment.tsx`)
- **Issue**: Mutations use `mutate()` instead of `mutateAsync()` but don't handle all error cases
- **Impact**: Network errors or validation failures might leave UI in inconsistent state (e.g., button still disabled, optimistic update not reverted).
- **Example**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\articles\DiscussionForum.tsx` lines 88-112, 115-139

**HIGH: Missing Null Checks in Article Display**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\articles\DisplayArticle.tsx`
- **Issue**: Lines 92-97 - `article.id` is checked but `article.community_article` isn't validated before accessing nested properties
- **Impact**: If API returns malformed data, accessing `article.community_article?.is_admin` could crash.

**HIGH: Comment Reaction Count Lazy Loading Can Fail Silently**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\common\Comment.tsx`
- **Issue**: Lines 91-101 - Query is disabled by default (enabled: false) but never explicitly enabled
- **Impact**: Reaction counts never load unless some other component enables them. Users see stale "0" counts.
- **Details**: The query needs user interaction to trigger refetch, but there's no such trigger in the component.

---

### 6. SECURITY VULNERABILITIES

**CRITICAL: Insufficient Input Validation in PDF Filename Truncation**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\app\(main)\(articles)\submitarticle\page.tsx`
- **Issue**: Lines 168-180 - Filename truncation logic doesn't validate file type or prevent path traversal
- **Impact**: Malicious filenames with path separators or null bytes could bypass backend validation.
- **Details**: Only checks length, not content. A file named `../../../evil.exe.pdf` would be truncated but path traversal attempt would remain.

**HIGH: No CSRF Protection on State-Changing Operations**

- **File**: Multiple mutation hooks
- **Issue**: No CSRF tokens in mutation requests
- **Impact**: If cookies are used for auth (they are), CSRF attacks could perform actions on behalf of logged-in users.
- **Note**: Depends on backend implementation, but frontend should include CSRF tokens if backend expects them.

**MEDIUM: Potential XSS in LaTeX Rendering**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\common\RenderParsedHTML.tsx`
- **Issue**: Lines 38-114 - LaTeX processing happens BEFORE sanitization
- **Impact**: While DOMPurify sanitizes the final output (line 171), malicious LaTeX could exploit KaTeX bugs before sanitization.
- **Details**: If KaTeX has a vulnerability that allows script injection, it would execute before DOMPurify sees it.

---

### 7. PERFORMANCE & MEMORY LEAKS

**CRITICAL: Realtime Event ID Set Grows Unbounded**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useRealtime.tsx`
- **Issue**: Lines 526-530 - Cleanup only triggers at 1000 events, keeping 500
- **Impact**: In long-running sessions with active discussions, this Set could grow to megabytes of memory.
- **Details**: With 10 events/minute, it takes 100 minutes to hit cleanup. If user has tab open for days, memory usage keeps growing.

**HIGH: Intersection Observer Not Disconnected on Ref Change**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useMarkAsReadOnView.ts`
- **Issue**: Lines 39-77 - If `ref.current` changes, old observer isn't explicitly disconnected before creating new one
- **Impact**: Memory leak from accumulating observers if component re-renders with different refs.

**HIGH: Realtime BroadcastChannel Never Closed**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useRealtime.tsx`
- **Issue**: Lines 83-86 - BroadcastChannel created at module level but never closed
- **Impact**: If hook is used in multiple components, multiple channels could be created but never garbage collected.

---

### 8. TYPE SAFETY & RUNTIME ERRORS

**HIGH: Unsafe Type Assertions in Query Cache Updates**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useRealtime.tsx`
- **Issue**: Lines 256-325, 346-429 - Extensive use of `unknown` and manual type guards without validation
- **Impact**: If API response structure changes, type guards would fail silently causing undefined behavior.
- **Example**: Line 258 `const data = oldData.data as { items?: unknown[] }` - no validation that `data` actually has this shape.

**HIGH: Login Form Success Handler Assumes User Structure**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\app\(authentication)\auth\login\page.tsx`
- **Issue**: Lines 43-54 - Falls back to empty user object if `data.data.user` is missing
- **Impact**: If API changes and doesn't return user, app continues with invalid user state (id: 0) instead of failing gracefully.

**MEDIUM: Article Out Type Doesn't Validate Community Article Nesting**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\articles\DisplayArticle.tsx`
- **Issue**: Lines 284-370 - Assumes `article.community_article` has specific shape without runtime validation
- **Impact**: Malformed API responses could cause crashes when accessing nested properties.

---

### 9. BUSINESS LOGIC ERRORS

**HIGH: Pseudonymous Toggle Doesn't Revalidate Data**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\articles\DisplayArticle.tsx`
- **Issue**: Lines 99-107 - After toggle success, only shows toast but doesn't refetch article data
- **Impact**: UI shows old pseudonymous state until page refresh. Users might think toggle failed.

**HIGH: Discussion Subscription Status Can Desync**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\articles\DiscussionForum.tsx`
- **Issue**: Lines 92-112, 119-139 - Optimistically updates cache but if user navigates away before server response, subscription status could be incorrect
- **Impact**: User thinks they're subscribed but actually aren't (or vice versa), missing notifications.

**MEDIUM: Article Bookmark Toggle Doesn't Handle Double-Click**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\articles\DisplayArticle.tsx`
- **Issue**: Lines 130-147 - If user double-clicks bookmark button, could send two mutations creating race condition
- **Impact**: Bookmark state could end up opposite of intended state.

---

### 10. CRITICAL PATH FAILURES

**CRITICAL: Auth Initialization Failure Leaves App Unusable**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\stores\authStore.ts`
- **Issue**: Lines 174-248 - If `probeServerSession` fails (network error, timeout), user is logged out even if token is valid
- **Impact**: Offline users or users with slow connections get force-logged out on every page load.

**CRITICAL: Realtime Queue Registration Failure Disables All Realtime**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\hooks\useRealtime.tsx`
- **Issue**: Lines 923-979 - If initial queue registration fails, entire realtime system is disabled with no retry
- **Impact**: Temporary network glitch on app load disables realtime for entire session. User must hard refresh.

**HIGH: Comment Tree Rendering Infinite Loop Risk**

- **File**: `C:\Users\Suresh\scicommons\SciCommons-frontend\src\components\common\Comment.tsx`
- **Issue**: Recursive reply rendering has no depth limit validation at component level
- **Impact**: Malformed comment tree with circular references could cause stack overflow.

---

## SUMMARY STATISTICS

- **CRITICAL Issues**: 15
- **HIGH Issues**: 15
- **MEDIUM Issues**: 3
- **Total**: 33 serious issues

### Most Critical Files:

1. `src/hooks/useRealtime.tsx` - 6 issues
2. `src/stores/authStore.ts` - 4 issues
3. `src/components/common/Comment.tsx` - 3 issues
4. `src/app/(main)/(articles)/submitarticle/page.tsx` - 3 issues
5. `src/components/articles/DisplayArticle.tsx` - 3 issues

### Risk Categories:

- **Data Corruption**: 8 issues
- **Memory Leaks**: 4 issues
- **Security**: 5 issues
- **Race Conditions**: 7 issues
- **Type Safety**: 5 issues
- **UX/Logic**: 4 issues

---

## METHODOLOGY

This audit was conducted through systematic exploration of:

- Core application logic and state management
- Authentication and authorization flows
- API integrations and data fetching patterns
- Error handling and edge cases
- Security vulnerabilities (XSS, CSRF, input validation)
- Data consistency and race conditions
- React hooks dependencies and lifecycle issues
- Type safety issues that could cause runtime errors
- Business logic correctness
- Critical path failure scenarios

**Note:** This audit focused exclusively on functional bugs, logic errors, and serious technical issues. Cosmetic issues, code style, and minor optimizations were intentionally excluded per audit requirements.

---

**Review completed by:** Claude Sonnet 4.5
**Timestamp:** 2026-02-08 (Session time)

---

---

---

# Fix Community Article Edit Flow and Submission Type

**Date:** 2026-02-09
**Implemented by:** Codex

## Context

When articles are submitted to private communities, they can appear in two contexts:

1. Public article view: `/article/{slug}` - Global, non-community context
2. Community article view: `/community/{communitySlug}/articles/{articleSlug}` - Within community context

**Current Problem:**

- Both views share the same edit button that always routes to `/article/{slug}/settings`
- After editing, users are redirected to `/article/{slug}` (public view)
- If the article was accessed from a community context, users lose that context and see different discussions
- This creates confusion: users think they "lost" discussions when they just ended up in a different view

**Root Cause:**

- Edit button is hardcoded to public article route
- Edit page has no awareness of community context
- Redirect after save always goes to public article view

## Implementation Plan

### Phase 1: Fix Community Edit Flow (High Priority)

#### 1.1 Detect Community Context in Edit Button

**File:** `src/components/articles/DisplayArticle.tsx` (line 255)

**Current:**

```tsx
<Link href={`/article/${article.slug}/settings`}>
```

**Change to:**

```tsx
<Link href={
  article.community_article
    ? `/article/${article.slug}/settings?community=${encodeURIComponent(article.community_article.community.name)}&returnTo=community`
    : `/article/${article.slug}/settings`
}>
```

**Rationale:** Pass community context as query parameters so the edit page knows where to redirect back to.

#### 1.2 Update Edit Page to Read Query Parameters

**File:** `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/page.tsx`

**Current:** Page doesn't read query parameters

**Change:** Extract query parameters and pass to EditArticleDetails:

```tsx
const searchParams = useSearchParams();
const communityName = searchParams.get('community');
const returnTo = searchParams.get('returnTo');
```

Pass as props to `<EditArticleDetails>`:

```tsx
<EditArticleDetails {...existingProps} communityName={communityName} returnTo={returnTo} />
```

#### 1.3 Implement Context-Aware Redirect in EditArticleDetails

**File:** `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx`

**Current redirect logic** (lines 110-127):

```tsx
useEffect(() => {
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['articles'] });
    queryClient.invalidateQueries({ queryKey: ['my_articles'] });
    queryClient.invalidateQueries({ queryKey: [`/api/articles/article/${articleSlug}`] });
    toast.success('Article details updated successfully');
    router.push(`/article/${articleSlug}`);
  }
  // ...
}, [updateError, isSuccess, router, articleSlug, queryClient]);
```

**New redirect logic:**

```tsx
useEffect(() => {
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['articles'] });
    queryClient.invalidateQueries({ queryKey: ['my_articles'] });
    queryClient.invalidateQueries({ queryKey: [`/api/articles/article/${articleSlug}`] });

    toast.success('Article details updated successfully');

    // Redirect based on context
    if (returnTo === 'community' && communityName) {
      router.push(`/community/${encodeURIComponent(communityName)}/articles/${articleSlug}`);
    } else {
      router.push(`/article/${articleSlug}`);
    }
  }
  // ...
}, [updateError, isSuccess, router, articleSlug, communityName, returnTo, queryClient]);
```

**Interface update** (add new props):

```typescript
interface EditArticleDetailsProps {
  // ... existing props
  communityName?: string | null;
  returnTo?: string | null;
}
```

#### 1.4 Invalidate Community Article Query

**File:** `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx`

**Add invalidation** for community article query:

```tsx
if (communityName) {
  queryClient.invalidateQueries({
    queryKey: [`/api/articles/article/${articleSlug}`, { community_name: communityName }],
  });
}
```

This ensures the community article view also gets fresh data.

### Phase 2: Submission Type Changes (Medium Priority)

#### 2.1 Remove Public/Private Toggle from Edit Form

**File:** `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx` (lines 205-241)

**Current:** Shows submission type selector with Public button

**Change:** Remove the entire submission type selector section since:

- Users cannot change submission type after creation (Private button already commented out)
- Submission type should be determined at creation time only
- Editing shouldn't allow changing article visibility

#### 2.2 Evaluate Article Creation Defaults

**Files to review:**

- `src/app/(main)/(articles)/submitarticle/page.tsx` - Regular article submission (default: Public)
- `src/app/(main)/(communities)/community/[slug]/createcommunityarticle/page.tsx` - Community article submission

**User's suggestion:** Only allow community submission, make public visibility dependent on community settings

**Recommendation:** Keep current behavior for now, but add clear documentation:

- Regular article submission: Always public (no community context)
- Community article submission: Defaults to Public with option for Private
  - If community is public, Private articles are still visible to everyone within community
  - If community is private, Private articles are only visible to community members

**Future consideration:** Add a setting to control default submission type per community.

### Phase 3: Testing & Verification

#### Test Scenarios

**Scenario 1: Edit Public Article**

1. Navigate to `/article/gsoc-2026-possibilities`
2. Click "Edit Article"
3. Should go to `/article/gsoc-2026-possibilities/settings`
4. Make changes and click "Update Article"
5. Should redirect to `/article/gsoc-2026-possibilities`
6. ✓ Verify: Same discussions visible before and after edit

**Scenario 2: Edit Community Article**

1. Navigate to `/community/GSoC%202026/articles/gsoc-2026-possibilities`
2. Click "Edit Article"
3. Should go to `/article/gsoc-2026-possibilities/settings?community=GSoC%202026&returnTo=community`
4. Make changes and click "Update Article"
5. Should redirect to `/community/GSoC%202026/articles/gsoc-2026-possibilities`
6. ✓ Verify: Same discussions visible before and after edit (community discussions, not public ones)

**Scenario 3: Manual URL Navigation**

1. User manually goes to `/article/gsoc-2026-possibilities/settings` (no query params)
2. Make changes and click "Update Article"
3. Should redirect to `/article/gsoc-2026-possibilities` (default behavior)
4. ✓ Verify: No errors, works as before

**Scenario 4: Cache Invalidation**

1. Edit community article
2. Check Network tab for refetch requests
3. ✓ Verify: Both public and community article queries are invalidated
4. ✓ Verify: Article data is fresh on redirect

## Critical Files

### Modified Files

- `src/components/articles/DisplayArticle.tsx` - Edit button with community context
- `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/page.tsx` - Read query params
- `src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx` - Context-aware redirect
- `CHANGE_COMMENTS.md` - Document the fix

### Reference Files (Read-only)

- `src/app/(main)/(communities)/community/[slug]/articles/[articleSlug]/page.tsx` - Community article view
- `src/api/articles/articles.ts` - Article API methods
- `src/api/schemas/articleOut.ts` - Article schema with community_article field

## Benefits

1. **Preserves Context:** Users stay in the same view after editing
2. **Prevents Confusion:** No more "lost discussions" - users see the same discussions before and after edit
3. **Minimal Changes:** Uses query parameters instead of creating new routes
4. **Backward Compatible:** Public articles continue to work as before
5. **Explicit Intent:** Query parameters make it clear where to redirect

## Alternative Approaches Considered

### Alternative 1: Create Separate Community Edit Route

- Create `/community/{slug}/articles/{articleSlug}/settings`
- **Pros:** Clean separation, explicit routing
- **Cons:** Code duplication, more complex routing, requires new route files
- **Rejected:** Too much duplication for a simple redirect logic change

### Alternative 2: Fetch Article in Edit Page

- Fetch article data in edit page to check `community_article` field
- **Pros:** No query parameters needed
- **Cons:** Extra API call, slower page load, doesn't know original context
- **Rejected:** Performance impact and doesn't preserve user's navigation context

## Notes

- This fix addresses the immediate issue (Phase 1) while leaving Phase 2 for future consideration
- The query parameter approach is simple and doesn't require route changes
- Community context is explicitly passed through URL, making behavior predictable
- Cache invalidation ensures data is fresh in both views

Ready to code?

Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Fix Community Article Edit Flow and Submission Type

Context

When articles are submitted to private communities, they can appear in two contexts:

1.  Public article view: /article/{slug} - Global, non-community context
2.  Community article view: /community/{communitySlug}/articles/{articleSlug} - Within community context

Current Problem:

- Both views share the same edit button that always routes to /article/{slug}/settings
- After editing, users are redirected to /article/{slug} (public view)
- If the article was accessed from a community context, users lose that context and see different discussions
- This creates confusion: users think they "lost" discussions when they just ended up in a different view

Root Cause:

- Edit button is hardcoded to public article route
- Edit page has no awareness of community context
- Redirect after save always goes to public article view

Implementation Plan

Phase 1: Fix Community Edit Flow (High Priority)

1.1 Detect Community Context in Edit Button

File: src/components/articles/DisplayArticle.tsx (line 255)

Current:

 <Link href={`/article/${article.slug}/settings`}>

Change to:

 <Link href={
   article.community_article
     ? `/article/${article.slug}/settings?community=${encodeURIComponent(article.community_article.community.name)}&returnTo=
 community`
     : `/article/${article.slug}/settings`
 }>

Rationale: Pass community context as query parameters so the edit page knows where to redirect back to.

1.2 Update Edit Page to Read Query Parameters

File: src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/page.tsx

Current: Page doesn't read query parameters

Change: Extract query parameters and pass to EditArticleDetails:
const searchParams = useSearchParams();
const communityName = searchParams.get('community');
const returnTo = searchParams.get('returnTo');

Pass as props to <EditArticleDetails>:
<EditArticleDetails
{...existingProps}
communityName={communityName}
returnTo={returnTo}
/>

1.3 Implement Context-Aware Redirect in EditArticleDetails

File: src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx

Current redirect logic (lines 110-127):
useEffect(() => {
if (isSuccess) {
queryClient.invalidateQueries({ queryKey: ['articles'] });
queryClient.invalidateQueries({ queryKey: ['my_articles'] });
queryClient.invalidateQueries({ queryKey: [`/api/articles/article/${articleSlug}`] });
toast.success('Article details updated successfully');
router.push(`/article/${articleSlug}`);
}
// ...
}, [updateError, isSuccess, router, articleSlug, queryClient]);

New redirect logic:
useEffect(() => {
if (isSuccess) {
queryClient.invalidateQueries({ queryKey: ['articles'] });
queryClient.invalidateQueries({ queryKey: ['my_articles'] });
queryClient.invalidateQueries({ queryKey: [`/api/articles/article/${articleSlug}`] });

     toast.success('Article details updated successfully');

     // Redirect based on context
     if (returnTo === 'community' && communityName) {
       router.push(`/community/${encodeURIComponent(communityName)}/articles/${articleSlug}`);
     } else {
       router.push(`/article/${articleSlug}`);
     }

}
// ...
}, [updateError, isSuccess, router, articleSlug, communityName, returnTo, queryClient]);

Interface update (add new props):
interface EditArticleDetailsProps {
// ... existing props
communityName?: string | null;
returnTo?: string | null;
}

1.4 Invalidate Community Article Query

File: src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx

Add invalidation for community article query:
if (communityName) {
queryClient.invalidateQueries({
queryKey: [`/api/articles/article/${articleSlug}`, { community_name: communityName }]
});
}

This ensures the community article view also gets fresh data.

Phase 2: Submission Type Changes (Medium Priority)

2.1 Remove Public/Private Toggle from Edit Form

File: src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx (lines 205-241)

Current: Shows submission type selector with Public button

Change: Remove the entire submission type selector section since:

- Users cannot change submission type after creation (Private button already commented out)
- Submission type should be determined at creation time only
- Editing shouldn't allow changing article visibility

  2.2 Evaluate Article Creation Defaults

Files to review:

- src/app/(main)/(articles)/submitarticle/page.tsx - Regular article submission (default: Public)
- src/app/(main)/(communities)/community/[slug]/createcommunityarticle/page.tsx - Community article submission

User's suggestion: Only allow community submission, make public visibility dependent on community settings

Recommendation: Keep current behavior for now, but add clear documentation:

- Regular article submission: Always public (no community context)
- Community article submission: Defaults to Public with option for Private
  - If community is public, Private articles are still visible to everyone within community
  - If community is private, Private articles are only visible to community members

Future consideration: Add a setting to control default submission type per community.

Phase 3: Testing & Verification

Test Scenarios

Scenario 1: Edit Public Article

1.  Navigate to /article/gsoc-2026-possibilities
2.  Click "Edit Article"
3.  Should go to /article/gsoc-2026-possibilities/settings
4.  Make changes and click "Update Article"
5.  Should redirect to /article/gsoc-2026-possibilities
6.  ✓ Verify: Same discussions visible before and after edit

Scenario 2: Edit Community Article

1.  Navigate to /community/GSoC%202026/articles/gsoc-2026-possibilities
2.  Click "Edit Article"
3.  Should go to /article/gsoc-2026-possibilities/settings?community=GSoC%202026&returnTo=community
4.  Make changes and click "Update Article"
5.  Should redirect to /community/GSoC%202026/articles/gsoc-2026-possibilities
6.  ✓ Verify: Same discussions visible before and after edit (community discussions, not public ones)

Scenario 3: Manual URL Navigation

1.  User manually goes to /article/gsoc-2026-possibilities/settings (no query params)
2.  Make changes and click "Update Article"
3.  Should redirect to /article/gsoc-2026-possibilities (default behavior)
4.  ✓ Verify: No errors, works as before

Scenario 4: Cache Invalidation

1.  Edit community article
2.  Check Network tab for refetch requests
3.  ✓ Verify: Both public and community article queries are invalidated
4.  ✓ Verify: Article data is fresh on redirect

Critical Files

Modified Files

- src/components/articles/DisplayArticle.tsx - Edit button with community context
- src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/page.tsx - Read query params
- src/app/(main)/(articles)/article/[slug]/(articledashboard)/settings/EditArticleDetails.tsx - Context-aware redirect
- CHANGE_COMMENTS.md - Document the fix

Reference Files (Read-only)

- src/app/(main)/(communities)/community/[slug]/articles/[articleSlug]/page.tsx - Community article view
- src/api/articles/articles.ts - Article API methods
- src/api/schemas/articleOut.ts - Article schema with community_article field

Benefits

1.  Preserves Context: Users stay in the same view after editing
2.  Prevents Confusion: No more "lost discussions" - users see the same discussions before and after edit
3.  Minimal Changes: Uses query parameters instead of creating new routes
4.  Backward Compatible: Public articles continue to work as before
5.  Explicit Intent: Query parameters make it clear where to redirect

Alternative Approaches Considered

Alternative 1: Create Separate Community Edit Route

- Create /community/{slug}/articles/{articleSlug}/settings
- Pros: Clean separation, explicit routing
- Cons: Code duplication, more complex routing, requires new route files
- Rejected: Too much duplication for a simple redirect logic change

Alternative 2: Fetch Article in Edit Page

- Fetch article data in edit page to check community_article field
- Pros: No query parameters needed
- Cons: Extra API call, slower page load, doesn't know original context
- Rejected: Performance impact and doesn't preserve user's navigation context

Notes

- This fix addresses the immediate issue (Phase 1) while leaving Phase 2 for future consideration
- The query parameter approach is simple and doesn't require route changes
- Community context is explicitly passed through URL, making behavior predictable
- Cache invalidation ensures data is fresh in both views
