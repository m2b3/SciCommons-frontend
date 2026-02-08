# Prompt for Cursor: Implement Real-time Discussions System with Long Polling

## Overview

We want to implement a **real-time discussions and comments system** for articles inside communities on [SciCommons.org](https://scicommons.org), inspired by Zulip’s architecture.  
The backend is **Django**, frontend is **Next.js** with **TanStack Query**, and we have **Redis** (for queues, not caching right now).  
We will integrate **Tornado** for the real-time queue server.

Our goal:

- Scalable long-polling system for delivering new discussion/comment events to active users.
- Efficient and resilient queue management (avoiding sending events to inactive users).
- Robust catch-up mechanism for users who were offline or missed events.
- Permissions-aware delivery (only send events to users in the same communities).

---

## Features to Implement

### 1. Registration and Queue Management

- **`/register` API**:
  - On initial page load (or when user logs in), the frontend calls `/register`.
  - Backend:
    - Checks which communities the user belongs to (can be multiple).
    - Creates a queue for that user **in Tornado** (only if user belongs to at least one community).
    - Stores:
      - `queue_id` (unique for this connection)
      - `last_event_id` (current server event counter)
      - User's community memberships (in memory for Tornado)
    - Returns:
      ```json
      {
        "queue_id": "abc123",
        "last_event_id": 12345
      }
      ```

---

### 2. Heartbeat

- **`/heartbeat` API**:
  - Called every ~60 seconds from frontend if the user is active.
  - Resets an inactivity timer for the user’s queue.
  - If no heartbeat for 2+ minutes → Tornado deletes the queue and frees resources.

---

### 3. Polling for Events

- **`/poll?queue_id=abc123&last_event_id=12345`**:
  - Long-poll endpoint.
  - Waits until:
    - New events arrive after `last_event_id`, OR
    - A timeout (e.g., 60s) occurs (return empty list).
  - Returns JSON:
    ```json
    {
      "events": [
        {
          "type": "new_comment",
          "article_id": 789,
          "comment_id": 456,
          "text": "Nice article!",
          "author": {...},
          "timestamp": "2025-08-09T12:34:56Z"
        }
      ],
      "last_event_id": 12350
    }
    ```
  - If the user’s `last_event_id` is **too old** (missed buffer), return:
    ```json
    {
      "catchup_required": true
    }
    ```

---

### 4. Event Publishing Flow

- When a discussion or comment is added:
  1. Save to DB in Django.
  2. After commit, call a function like:
     ```python
     send_event_to_tornado(
         community_id=42,
         event={
             "type": "new_comment",
             "article_id": 789,
             ...
         }
     )
     ```
  3. In Tornado:
     - Look up all **active queues** of users who belong to `community_id`.
     - Append event to each user’s queue.
- Redis can be used as the intermediary between Django and Tornado for this event publishing.

---

### 5. Catch-up Flow

**On article page load:**

1. Call:
   ```
   GET /articles/{id}/discussions
   ```
   Returns:
   ```json
   {
     "discussions": [...],
     "last_event_id": 100
   }
   ```
2. Store `last_event_id` in frontend.
3. Start polling:
   ```
   GET /poll?queue_id=abc123&last_event_id=100
   ```
4. If `catchup_required` in response → call `/articles/{id}/discussions` again, update `last_event_id`, resume polling.

---

### 6. Permissions and Filtering

- When a user registers:
  - Query DB once for their community memberships.
  - Store that set in Tornado memory alongside the queue.
- On event push:
  - Match event’s `community_id` to each user’s stored community list.
  - Push only if there’s a match.

---

### 7. Expiry and Inactive Queues

- Each queue has:
  - **TTL** (e.g., 2 minutes without heartbeat).
  - **In-memory event buffer** (e.g., last 1000 events).
- When expired:
  - Delete queue.
  - Free memory.
- If a user reconnects after expiry → `/register` creates a new queue.

---

## Technical Notes

- **Tornado vs Celery**:
  - Tornado will handle real-time delivery.
  - Celery stays for background jobs (emails, heavy async tasks).
  - Celery idle memory (~300MB) is irrelevant for Tornado usage; Tornado workers are lighter.
- **Event Delivery Guarantee**:
  - Use in-memory queue per user for speed.
  - Redis pub/sub can help fan-out to multiple Tornado workers.
- **Data Loss Prevention**:
  - Always store `last_event_id` in frontend.
  - Use `catchup_required` when gap detected, forcing full reload.

---

## Step-by-step Implementation Plan

1. **Set up Tornado** as a separate service in the project.
2. Implement `/register` in Django → sends queue creation request to Tornado → returns `queue_id` + `last_event_id`.
3. Implement `/heartbeat` to keep user queue alive.
4. Implement `/poll` in Tornado for long-polling.
5. Build `send_event_to_tornado` in Django, with Redis as the transport.
6. Modify discussion/comment save logic to publish events.
7. Implement catch-up mechanism in frontend as described.
8. Ensure proper permission filtering by community.
9. Add queue TTL + cleanup logic in Tornado.
10. Load test with simulated 1000+ queues.

---

**Deliverables**:

- Django endpoints: `/register`, `/heartbeat`
- Tornado endpoints: `/poll`, internal event receive handler
- Redis integration between Django and Tornado
- Frontend integration with `last_event_id` and catch-up logic
- Queue cleanup and TTL handling
- Event JSON schema for all event types

---
