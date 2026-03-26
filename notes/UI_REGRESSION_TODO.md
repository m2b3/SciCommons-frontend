# Manual UI Regression Checklist

Use this checklist after merge changes related to discussions, unread tracking, and bookmarks.

**1. Discussions Page**

1. Open any article discussion list.
2. Verify unread badge “New” appears on new discussions.
3. Scroll a discussion card into view for 2+ seconds; badge should clear.
4. Click discussion title → full thread opens.
5. Click “comments” toggle → inline comments expand/collapse without navigating.
6. If admin or author, resolve/unresolve works and updates UI.

**2. Discussions Sidebar**

1. Sidebar list shows articles sorted by recent activity.
2. Unread counts appear (red badges).
3. Clicking a sidebar item selects the article and opens correct content.
4. Community link in sidebar opens correct community (URL encoded).

**3. Bookmarks**

1. Article card bookmark toggle:
   - Logged out → toast asks to login.
   - Logged in → toggle changes state and persists on refresh.
2. Community card bookmark toggle:
   - Logged out → toast asks to login.
   - Logged in → toggle changes state and persists on refresh.
3. Bookmarked list (if present) reflects changes.

**4. Community Header**

1. Join flow works:
   - Join button for non‑members.
   - Pending state appears correctly.
2. Admin:
   - Requests count badge shows if pending requests exist.
   - Settings shortcut works.

**5. Content Rendering**

1. Community description renders markdown correctly.
2. Long descriptions render without heavy slowdown (LaTeX currently disabled).
