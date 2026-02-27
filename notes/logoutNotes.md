# Logout Investigation Report (2026-02-09)

## Reasoning and Trace (This Discussion)

Goal: Analyze intermittent logout when navigating to communities/groups and fix the auth/logout/403/404 handling.

Key observations from repo scan:
- Global axios interceptor already handled 401 only (403 not logging out) in `src/api/custom-instance.ts`.
- Community display route already gated queries on `accessToken` and rendered 403/404 states in `src/app/(main)/(communities)/community/[slug]/(displaycommunity)/page.tsx`.
- Auth store introduced server-validation logic: `isTokenExpired()` returns true when the server validation interval elapses (5 minutes), not just when the token truly expires.
- `withAuthRedirect` used `isTokenExpired()` to display a session-expired dialog and call `logout()` without revalidating.

Conclusion:
- The intermittent logout was caused by treating "needs revalidation" as "expired session" in `withAuthRedirect`.
- That meant any navigation after the 5-minute validation window could trigger logout even with a valid session, especially on community routes.

Fix strategy:
- Add a `forceServerValidation` option to `initializeAuth` so the guard can revalidate instead of logging out.
- Update `withAuthRedirect` to revalidate on `isTokenExpired()` and only logout if the server says the session is invalid.
- Remove the session-expired dialog that was firing on false positives.

Additional context:
- `git remote remove origin` was attempted per `AGENTS.md`. It failed with "origin not found"; this was acceptable per instructions.
- No generated API files were edited.

## Code Changes Made

1) `src/stores/authStore.ts`
- Added `InitializeAuthOptions` with `forceServerValidation?: boolean`.
- Updated `initializeAuth` signature to accept the options.
- Added a new flow that forces a server probe when validation is due.
- Ensured valid token expiry is preserved when revalidating; only extend expiry on actual expiry.
- Added inline comment with Who/What/Why/How per repo rules.

2) `src/HOCs/withAuthRedirect.tsx`
- Removed the session-expired dialog flow that was triggered by `isTokenExpired()`.
- Added a revalidation path that calls `initializeAuth({ forceServerValidation: true })` when validation is due.
- Logs out and redirects only if revalidation fails.
- Added inline comment with Who/What/Why/How per repo rules.

3) `CHANGE_COMMENTS.md`
- Added entry "Auth Guard Revalidation Fix (2026-02-09)" describing problem, root cause, solution, and files.

## Proposed Changes (Not Implemented)

None in this iteration.

## Notes and Risks

Notes:
- This fix keeps existing behavior for real 401/403 failures while preventing false logouts triggered by validation timers.
- `isTokenExpired()` still signals "revalidate needed"; the guard now treats that as a revalidation trigger instead of a logout.
- The session-expired dialog was removed to avoid false prompts; if desired, it can be reintroduced safely after revalidation.

Risks:
- If server revalidation endpoint is slow or flaky, guarded pages may briefly delay while revalidation runs. There is no UI spinner for that path.

## Next Steps (From Above)

1) Run `yarn test:fix` or `run-all-checks-fix.bat` before committing (required by AGENTS.md).
2) Manual verification:
   - Let the session sit idle > 5 minutes, then navigate to a private community.
   - Confirm you stay logged in and see the "member required" message instead of being logged out.
   - Confirm actual 401/403 still logs out and redirects to `/auth/login`.

## Files Modified

- `src/stores/authStore.ts`
- `src/HOCs/withAuthRedirect.tsx`
- `CHANGE_COMMENTS.md`


Claude


❯ look at logoutnotes.md. what do you think of this analysis and these proposed changes ?

● I'll read the logoutNotes.md file to review the analysis and proposed changes.

● Read 1 file (ctrl+o to expand)

● This is a well-structured and well-reasoned analysis. The investigation shows good understanding of the codebase and the
  root cause is clearly identified. Here are my thoughts:

  Strengths of the Analysis

  ✅ Correct Root Cause: The key insight is spot-on - isTokenExpired() returns true after 5 minutes (validation interval), not
   actual token expiry. Treating this as "session expired" would cause false logouts.

  ✅ Good Fix Strategy: Revalidating instead of immediately logging out is the right approach. It maintains security while
  preventing false positives.

  ✅ Follows Project Conventions: Proper inline comments, CHANGE_COMMENTS.md update, and adheres to AGENTS.md rules.

  ✅ Clear Documentation: The flow from diagnosis → fix → risks → next steps is well organized.

  Potential Concerns

  ⚠️ UX Gap During Revalidation: You noted there's no UI spinner during server revalidation. If the endpoint is slow, users
  might experience a brief "freeze" on navigation. Consider adding a subtle loading indicator.

  ⚠️ Race Conditions: If a user rapidly navigates between protected pages after the 5-minute mark, could this trigger multiple
   simultaneous revalidation calls? Might need a mutex/flag to prevent this.

  ⚠️ Session-Expired Dialog: Completely removing it might not be ideal. Perhaps show it after failed revalidation rather than
  before? This way users still get feedback when their session actually expires.

  ⚠️ Error Handling Clarity: Does the revalidation distinguish between:
  - Network failure (should retry, not logout)
  - 401/403 from server (should logout)

  Recommendations

  Would you like me to:
  1. Review the actual code changes in authStore.ts and withAuthRedirect.tsx to validate the implementation?
  2. Check for potential race conditions in the revalidation logic?
  3. Suggest UX improvements for the revalidation flow (loading states, better error messages)?

  The analysis is solid, but I'd want to see the actual implementation to ensure the edge cases are handled correctly. Want me
   to dig deeper?

✻ Crunched for 32s
