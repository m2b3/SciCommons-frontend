# Frontend Real-time Discussions Integration Requirements

## 🎯 Objective

Implement real-time discussions and comments for articles in private communities. When users create or comment on discussions in private communities, all other members should see updates in real-time without page refresh.

## 🏗️ Backend Changes Summary

### What Was Done

1. **Added Tornado Long-polling Server**

   - **Why**: Django alone cannot handle long-lived connections efficiently. Tornado specializes in async/long-polling.
   - **Port**: 8888 (separate from Django on 8000)
   - **Purpose**: Manages user queues and delivers real-time events

2. **Added Redis Event Queue**

   - **Why**: Decouples Django (event publishing) from Tornado (event delivery)
   - **Database**: Redis DB 3 (separate from cache and Celery)
   - **Purpose**: Bridge between Django and Tornado for event communication

3. **Enhanced Django with Real-time APIs**

   - **Why**: Frontend needs endpoints to register for updates and manage connections
   - **Security**: Only works for private communities, respects user permissions

4. **Automatic Event Publishing**
   - **Why**: Discussions/comments trigger events automatically without code changes in existing flows
   - **Scope**: Only private communities (public discussions don't get real-time updates)

### New Architecture

```
Frontend ↔ Django API (Register/Heartbeat) ↔ Redis Queue ↔ Tornado (Long-polling)
                     ↑ Create Discussion/Comment ↑ Publish Event   ↑ Deliver to Users
```

## 📡 Available APIs

### Django Endpoints (after `yarn generate-api`)

```typescript
// Registration & Management
POST /api/realtime/register
Response: { queue_id: string, last_event_id: number, communities: number[] }

POST /api/realtime/heartbeat?queue_id=<id>
Response: { message: "Heartbeat successful" }

GET /api/realtime/status
Response: { user_id: number, communities: number[], realtime_enabled: boolean }
```

### Tornado Endpoints (Direct Fetch)

```typescript
// Long polling for events (60 second timeout)
GET /realtime/poll?queue_id=<id>&last_event_id=<id>
Response: {
  events: RealtimeEvent[],
  last_event_id: number
} | {
  catchup_required: true
}

// Health check
GET /health
Response: { status: "healthy", active_queues: number, pending_polls: number }
```

### Event Structure

```typescript
interface RealtimeEvent {
  type:
    | 'new_discussion'
    | 'new_comment'
    | 'updated_discussion'
    | 'updated_comment'
    | 'deleted_discussion'
    | 'deleted_comment';
  data: {
    discussion?: Discussion; // Full discussion object
    comment?: DiscussionComment; // Full comment object
    article_id: number;
    community_id: number;
    discussion_id?: number; // For comments
  };
  community_ids: number[]; // Communities that should receive this event
  timestamp: string; // ISO 8601
  event_id: number; // Incremental ID for ordering
}
```

## 🔄 Integration Requirements

### 1. Queue Management Flow

**Registration** (On page load/login):

1. Call `POST /api/realtime/register`
2. Receive `queue_id` and `last_event_id`
3. Store these for polling

**Heartbeat** (Every 60 seconds):

1. Call `POST /api/realtime/heartbeat?queue_id=<id>`
2. Keeps queue alive (expires after 2 minutes without heartbeat)
3. If fails → re-register

**Long Polling** (Continuous):

1. Call `GET /realtime/poll?queue_id=<id>&last_event_id=<id>`
2. Wait up to 60 seconds for events
3. Process any received events
4. Update `last_event_id`
5. Immediately poll again

### 2. Event Processing

**Filter Events**:

- Only process events for the current article/community
- Use `event.data.article_id` and `event.community_ids` for filtering

**Update UI**:

- `new_discussion` → Add to discussions list
- `new_comment` → Add to specific discussion's comments
- `updated_*` → Update existing items in place
- `deleted_*` → Remove items from UI

### 3. Error Handling

**Queue Expired** (404 response):

- Re-register with `POST /api/realtime/register`
- Resume polling with new queue_id

**Network Issues**:

- Implement exponential backoff for reconnection
- Show connection status to user

**Catch-up Required**:

- If `catchup_required: true` → refresh discussions data
- Resume polling with new `last_event_id`

## 🎯 Required Frontend Behavior

### Core Functionality

1. **Instant Updates**: New discussions/comments appear without refresh
2. **Private Communities Only**: Real-time only works for private communities
3. **Multi-tab Support**: Works across multiple browser tabs
4. **Connection Resilience**: Auto-reconnects on failures
5. **Permission Respect**: Only shows events for communities user belongs to

### User Experience

1. **Connection Indicator**: Show real-time connection status
2. **Visual Feedback**: Highlight newly added content briefly
3. **Notifications**: Toast notifications for off-screen updates
4. **Performance**: No unnecessary re-renders or memory leaks

### Technical Requirements

1. **State Management**: Integrate with existing state (TanStack Query, Redux, etc.)
2. **Authentication**: Include JWT tokens in requests
3. **Environment Config**: Support dev/staging/prod Tornado URLs
4. **Cleanup**: Properly cleanup connections on unmount

## 🌐 Environment Setup

### Development

```env
NEXT_PUBLIC_REALTIME_URL=http://localhost:8888
```

### Staging/Production

```env
NEXT_PUBLIC_REALTIME_URL=https://backendtest.scicommons.org
```

## ✅ Success Criteria

### Must Have

- [ ] Users see new discussions appear instantly (< 1 second)
- [ ] Users see new comments appear instantly (< 1 second)
- [ ] Real-time only active for private communities
- [ ] Connection status visible to users
- [ ] Graceful handling of connection failures
- [ ] Works across multiple browser tabs
- [ ] No significant performance impact

### Should Have

- [ ] Visual feedback for newly added content
- [ ] Notifications for off-screen updates
- [ ] Proper error messages for users
- [ ] Connection retry with exponential backoff

### Could Have

- [ ] Sound notifications
- [ ] Desktop notifications when tab inactive
- [ ] Typing indicators
- [ ] User presence indicators

## 🧪 Testing Checklist

### Manual Testing

- [ ] Multi-tab real-time functionality
- [ ] Network disconnect/reconnect scenarios
- [ ] Queue expiration and re-registration
- [ ] Private vs public community behavior
- [ ] Cross-browser compatibility

### Integration Testing

- [ ] Event filtering by article/community
- [ ] State management integration
- [ ] Authentication flow
- [ ] Error handling scenarios

## 📋 Architecture Decisions (Frontend Team)

The following are left to frontend team's architectural decisions:

1. **State Management**: How to integrate with existing state management
2. **Hook Design**: Custom hooks vs existing patterns
3. **UI Components**: How to show connection status and notifications
4. **Error Handling**: User-facing error messages and retry logic
5. **Performance**: Optimization strategies for high-frequency updates
6. **Testing Strategy**: Unit/integration test approach

## 🔧 Technical Notes

- **Long Polling**: 60-second timeout, immediate retry after response
- **Queue TTL**: 2 minutes without heartbeat = queue deletion
- **Event Ordering**: Use `event_id` for proper event ordering
- **Memory Management**: Queues auto-cleanup, events limited to 1000 per queue
- **Security**: JWT required for Django endpoints, community membership enforced

This system provides a scalable foundation for real-time features while maintaining security and performance.
