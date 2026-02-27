# Authentication & Token Management Deep Dive (2026-02-10)
## Expanded Analysis and Recommendations (Based on logoutNotes.md and logoutNotes2.md)

---

## Executive Summary

This document expands the prior analysis with additional technical detail, sharper risk assessment, and concrete implementation guidance. The core diagnosis is unchanged: `isTokenExpired()` is overloaded and produces false "session expired" signals after a 5-minute validation interval, leading to unnecessary logout prompts. The recommended fix is still to split concerns into `needsRevalidation()` and `revalidateSession()`, but this version adds clarity around concurrency, error semantics, UX flows, and backend contract requirements.

**Key conclusions:**
- ✅ The 403 logout bug is already fixed and should remain fixed (logout only on 401).
- ⚠️ The auth guard false-positive issue is still unaddressed in code.
- ✅ A separation-of-concerns approach remains the best design.
- ⚠️ The original recommended approach in logoutNotes2 needs stronger handling for concurrent revalidation, 403 semantics, and offline behavior.
- ✅ This document provides a concrete, testable blueprint with minimal behavior regression risk.

---

## Scope and Assumptions

This analysis assumes:
- Auth sessions are validated using a server probe (e.g., `/api/users/me`).
- The client maintains `accessToken`, `expiresAt`, and `lastServerValidation`.
- `SERVER_VALIDATION_INTERVAL_MS` is 5 minutes.
- 401 always means "session invalid or expired."
- 403 meaning is **not** fully clarified for `/users/me` and must be confirmed with backend.

If any of these assumptions are incorrect, the recommendations should be adjusted.

---

## Current State (Verified)

### Fixed: 403 Logout Bug (2026-02-09)
- Global interceptor now logs out only on 401, not on 403.
- This prevents permission errors from ejecting valid sessions.

### Not Implemented Yet
- `withAuthRedirect` still treats `isTokenExpired()` as "session expired."
- No separation between "needs revalidation" and "session is expired."
- No concurrency guard for repeated revalidation requests.
- No explicit UX state during revalidation.

---

## Root Cause: Semantic Overload in `isTokenExpired()`

The existing `isTokenExpired()` function is used for two different meanings:
1. "The access token is actually expired."
2. "We have not validated with server in 5 minutes."

The function returns `true` after 5 minutes even if the session is still valid. The auth guard interprets `true` as "session expired," triggering a dialog and logout flow. This is a semantic mismatch, not an authentication failure.

---

## Behavioral Timeline (Current vs Desired)

### Current (Broken)
1. User logs in at `T0`.
2. `lastServerValidation` is set at `T0`.
3. At `T0 + 5min`, `isTokenExpired()` returns `true`.
4. `withAuthRedirect` shows "session expired" dialog and logs user out.

### Desired
1. User logs in at `T0`.
2. At `T0 + 5min`, `needsRevalidation()` returns `true`.
3. App silently revalidates with server.
4. If valid, user continues uninterrupted.
5. If invalid, show expiration dialog and logout.

---

## Design Goals

1. Correct semantics: revalidation should not mean "expired."
2. Predictable UX: no false expiration dialogs.
3. Clear API: method names indicate intent.
4. Safe concurrency: avoid multiple overlapping probes.
5. Graceful offline handling: keep session if network fails.
6. Measurable behavior: log outcomes for monitoring.

---

## Recommended Architecture

### State and Methods

Use explicit, intention-revealing methods:
- `needsRevalidation(): boolean`
- `revalidateSession(): Promise<RevalidationResult>`
- `isRevalidating: boolean`

Avoid boolean flags on `initializeAuth()` to prevent mixed responsibilities.

### Revalidation Result Shape

Return a structured result instead of a bare boolean:

```ts
type RevalidationResult =
  | { status: 'ok' }
  | { status: 'expired'; code: 401 | 403 }
  | { status: 'error'; code?: number; reason: 'network' | 'server' | 'unknown' };
```

This keeps decision logic explicit in the auth guard.

---

## Concurrency: Use a Shared In-Flight Promise

The logoutNotes2 recommendation to return `true` when a revalidation is in progress is risky. It allows the UI to proceed even if the in-flight revalidation ends with `401`.

Preferred approach:
- Use a module-scoped `revalidationPromise`.
- If in-flight, return that same promise.
- All callers await the same result.

This prevents both duplicated server calls and inconsistent outcomes.

---

## 403 Semantics Must Be Clarified

There is ambiguity around `403` for `/users/me`:
- Some backends treat `/users/me` 403 as "authenticated but forbidden."
- Others treat it as a token invalidation or revocation.

Required action:
- Confirm with backend whether `/users/me` can ever return 403 for a valid session.
- If yes, **do not logout on 403** for revalidation.
- If no, treat 403 as equivalent to 401 for session validity.

Until this is confirmed, **do not make revalidation logout decisions based on 403**.

---

## Error Handling Matrix (Recommended)

| Scenario | Example | Result | User Feedback |
|---------|---------|--------|---------------|
| Valid session | 200 | Continue | None |
| Session expired | 401 | Logout | Expired dialog |
| Forbidden (unknown meaning) | 403 | Depends on backend contract | Possibly dialog |
| Network offline | fetch failed | Keep session | Optional banner |
| Server error | 500 | Keep session | Optional banner |
| Rate limited | 429 | Keep session | Optional banner |

Key principle: only logout when there is explicit proof the session is invalid.

---

## UX Recommendations

### Loader During Revalidation
- Show a minimal loader when revalidation is in progress.
- Prevent double rendering or route flicker.

### Dialog Timing
- Show "Session Expired" dialog **only after** server confirms invalid session.
- Avoid showing it preemptively when revalidation is merely due.

### Optional Banner for Offline/Server Errors
- Use a lightweight banner or toast:
  "Unable to verify session, working offline."
- This keeps users informed without forcing logout.

---

## Revalidation Algorithm (Proposed)

1. If `isRevalidating`, return the shared in-flight promise.
2. If not, set `isRevalidating = true`, start revalidation.
3. Call server probe `/users/me`.
4. Interpret response using the error matrix.
5. Update `lastServerValidation` only on success.
6. Clear `isRevalidating` in `finally`.

---

## Handling `expiresAt` When Missing

If `expiresAt` is null, `needsRevalidation()` should not return `true` immediately. Instead:
- Treat it as a "session without explicit expiry."
- Rely on `lastServerValidation` interval alone.

Otherwise the app will revalidate on every protected route.

---

## Suggested Minimal Change (Low Risk)

If scope must be small, do this minimum:
1. Rename `isTokenExpired` to `needsRevalidation`.
2. Add `revalidateSession` with shared in-flight promise.
3. Update `withAuthRedirect` to call revalidate before dialog.
4. Show loader while `isRevalidating`.

This fixes the UX issue without deep refactors.

---

## Preferred Full Change (Best Long-Term)

1. Implement new revalidation methods as above.
2. Add result type to clarify error handling.
3. Confirm `/users/me` 403 semantics with backend.
4. Add telemetry hooks for revalidation outcomes.
5. Add throttling or backoff for repeated failures.

---

## Testing Plan

### Unit Tests
- Should reuse in-flight promise for concurrent calls.
- Should not logout on network error.
- Should logout on 401.
- Should not revalidate every navigation when `expiresAt` is null.

### Integration Tests
- Load protected route after 5 minutes idle.
- Slow network: loader appears, no dialog on success.
- Expired session: dialog appears, logout follows.

---

## Telemetry Recommendations

Track:
- Revalidation frequency per user session.
- Revalidation latency.
- Outcome counts by status (ok, expired, network, server).
- Number of concurrent revalidation attempts avoided.

This data validates whether the fix reduces false logouts.

---

## Open Questions (Must Resolve)

1. What does a 403 from `/users/me` mean in backend semantics?
2. Does the system ever rely on `expiresAt` being null for any user type?
3. Is there a backend refresh token strategy planned?

---

## Final Recommendation

Implement `needsRevalidation()` and `revalidateSession()` with a shared in-flight promise, update `withAuthRedirect` to revalidate before showing the expiration dialog, and show a loader during revalidation. This is the lowest risk change that resolves false session expiration while improving UX and preserving security. Confirm the 403 semantics before finalizing logout behavior.

---

Prepared by: Codex (GPT-5)
Date: 2026-02-10
