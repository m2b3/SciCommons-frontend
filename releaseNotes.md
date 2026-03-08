# Release Notes (`sureshDev`)

Scope: January 1, 2026 onward.  
Source: `sureshDev` git history and `CHANGE_COMMENTS.md`.  
Included: major feature additions only.  
Excluded: bugfixes, lint/format/chore-only commits, and reverted feature work.

## February 2026

### `94a6005` (2026-02-25) - Mention UX and Discussions Auto-Load Improvements

- Improved `@mention` dropdown behavior (viewport-aware placement and better long-list keyboard handling).
- Added discussions panel auto-population behavior from stored context instead of leaving the panel blank on first interaction.

### `27e6dfa` (2026-02-25) - Community Member `@mention` Support in Discussions

- Added member-targeted `@mention` support in discussion input flows.

### `6c86438` (2026-02-25) - Community Members Data Exposure

- Added/updated community API payload usage to include member lists needed by mention-aware discussion UI.

### `7bfea76` (2026-02-25) - INCF Supporter Addition

- Added INCF supporter presence to the homepage supporter section.

### `7e2198b` (2026-02-25) - Supporter Links and Home Supporter Expansion

- Added outbound links from supporter logos to their official pages.
- Finalized supporter block updates around INCF and supporter presentation.

### `7c62664` (2026-02-24) - Community Admin Requests Workflow Tabs

- Added tabbed admin requests workflow (Pending vs Approved) for community administration.

### `a376697` (2026-02-23) - My Communities API Shift

- Switched "My Communities" experience to use the newer membership-oriented API behavior.

### `f1239d8` (2026-02-23) - Communities Tab Role/Access Visualization

- Added role markers in community listings.
- Added role-priority ordering and richer access/status indicators in communities list UX.

### `bd636f4` (2026-02-22) - Community Article Detail List Shortcut

- Added direct "List View" return shortcut from community article detail pages.

### `282cf04` (2026-02-21) - Centralized Review Tab Architecture

- Unified review-tab rendering logic across article, community article, and discussions contexts.
- Reduced duplicated review UI flow by introducing a shared review-tab body pattern.

### `0fd30ac` (2026-02-18) - DRAC Supporter Addition

- Added DRAC branding to homepage supporters section.

### `42e9036` (2026-02-16) - Docker Compose Environment-Driven Build

- Added Docker Compose build flow support that maps environment values into frontend build args.

### `a806a8a` (2026-02-16) - Side-Panel Review Creation Flow

- Added review creation capability directly in side-panel preview contexts.

### `e63ea23` (2026-02-16) - Discussion/Comment Unread UX Expansion

- Added expanded NEW/unread behavior across discussion/comment flows.
- Added auto-expand style unread guidance behavior for nested thread visibility.

### `8e63d45` (2026-02-15) - Discussion Subscription Controls in Article Context

- Added subscribe/unsubscribe controls for discussions in community article contexts.

### `b894a59` (2026-02-15) - Discussion Editing Capability

- Added author-side discussion editing (parity with existing comment edit behavior).

### `d609a9a` (2026-02-15) - Discussions-First Tab Entry

- Added route behavior that opens article discussion flows directly in the Discussions tab.

### `7643af2` (2026-02-09) - Articles Page Tabbed Experience

- Added tabbed interaction model to the main Articles page.

### `bbb985a` (2026-02-09) - Navbar Bookmark Entry

- Added logged-in bookmark access from navbar/profile navigation flow.

### `a524813` (2026-02-08) - Article Card Action Expansion

- Added bookmark action affordance on article cards.
- Added preview action affordance on article cards.

### `70a890e` (2026-02-08) - Hover Preview Interaction Model

- Switched article preview UX from click/drawer behavior to hover popover behavior.

## January 2026

### `dc648ff` (2026-01-26) - Unread Message Banner

- Added unread message banner UX for better awareness of incoming discussion activity.

### `f66c5b6` (2026-01-25) - Discussions Sidebar Redesign

- Redesigned discussions sidebar layout/interaction.
- Added community breadcrumbs in the relevant community/discussion paths.

### `c72b77b` (2026-01-17) - Custom 404 Experience

- Added dedicated custom 404 page.

### `8bf181c` (2026-01-07) - Discussion Summaries and Resolution State

- Added discussion summary capability.
- Added resolved-state indicator/flag handling for discussions.

### `c46bf84` (2026-01-06) - User Settings Surface

- Added user settings surface and related account-facing UI flow updates.

### `336cd1f` (2026-01-03) - Reviews in Article Preview

- Added review rendering in article preview panel experience.
