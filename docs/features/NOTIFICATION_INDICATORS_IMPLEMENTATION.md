# Notification Indicators Implementation

## Overview

This document describes the implementation of fully functional notification indicators for chat messages, watch together invitations, and likes in the Netflix and Chill dating app.

## Features Implemented

### 1. Like Notifications ("Liked You" Badge)

When a user receives a like from another user, a badge appears on the "Liked You" icon in the bottom navigation.

**Backend Implementation:**
- Added `read` field to the `Like` model (default: `false`)
- Created `PUT /api/likes/:likeId/read` endpoint to mark likes as read
- Updated `GET /api/likes/:userId/received` to return `unreadCount`
- Implemented `markLikeAsRead()` in all database adapters (file-based, MongoDB, PostgreSQL)

**Frontend Implementation:**
- Liked You page automatically marks likes as read when premium users view them
- Bottom navigation displays unread count as a badge
- Badge updates in real-time via polling

### 2. Chat Message Notifications

When a user receives a new message, a badge appears on the "Chats" icon in the bottom navigation.

**Backend Implementation:**
- Chat model already had `read` field
- `PUT /api/chat/read/:userId/:senderId` endpoint marks messages as read
- Endpoint counts unread messages per sender

**Frontend Implementation:**
- Chat component marks messages as read when viewing a conversation
- Bottom navigation displays total unread message count as a badge
- Badge clears when messages are viewed

### 3. Watch Together Invitation Notifications

When a user receives a watch together invitation, a badge appears on the "Watch" icon in the bottom navigation.

**Backend Implementation:**
- WatchInvitation model already had `read` field
- `PUT /api/watch-invitations/:invitationId/read` endpoint marks invitations as read
- Only counts invitations with status "pending" and `read: false`

**Frontend Implementation:**
- Watch Together page marks invitations as read when viewing invitation details
- Bottom navigation displays unread invitation count as a badge
- Badge clears when invitation is viewed

## Unified Notification Endpoint

All three notification types are retrieved from a single endpoint:

```
GET /api/chat/notifications/:userId
```

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "totalUnreadMessages": 5,
  "unreadInvitations": 2,
  "unreadLikes": 3,
  "unreadCounts": {
    "user_456": 3,
    "user_789": 2
  }
}
```

## Bottom Navigation Integration

The bottom navigation component (`frontend/src/components/bottom-nav.js`) polls the unified endpoint every 5 seconds and updates all three badges:

- **Liked You Badge**: Shows `unreadLikes` count
- **Chats Badge**: Shows `totalUnreadMessages` count
- **Watch Badge**: Shows `unreadInvitations` count

Badges only appear when the count is greater than 0.

## Notification Manager Utility

The `NotificationManager` class (`frontend/src/utils/notifications.js`) provides a centralized way to manage notifications across pages:

- Polls the unified endpoint
- Tracks counts for all three notification types
- Provides callbacks for UI updates
- Supports marking items as read

## Database Support

The implementation supports all three database types:

1. **File-based storage** (default): `backend/utils/dataStore.js`
2. **MongoDB**: `backend/database/mongodbAdapter.js`
3. **PostgreSQL**: `backend/database/postgresqlAdapter.js`

All adapters implement the `markLikeAsRead(likeId)` method.

## Testing

### Test with curl:

```bash
# Get user IDs from seeded data
USER1="user_xxx"
USER2="user_yyy"

# Create a like
curl -X POST http://localhost:3000/api/likes \
  -H "Content-Type: application/json" \
  -d "{\"fromUserId\": \"$USER2\", \"toUserId\": \"$USER1\", \"type\": \"like\"}"

# Create a message
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -d "{\"senderId\": \"$USER2\", \"receiverId\": \"$USER1\", \"message\": \"Hello!\"}"

# Create a watch invitation
curl -X POST http://localhost:3000/api/watch-invitations \
  -H "Content-Type: application/json" \
  -d "{
    \"fromUserId\": \"$USER2\",
    \"toUserId\": \"$USER1\",
    \"platform\": \"teleparty\",
    \"scheduledDate\": \"2026-01-20\",
    \"scheduledTime\": \"19:30\"
  }"

# Check notifications
curl http://localhost:3000/api/chat/notifications/$USER1

# Expected output:
# {
#   "totalUnreadMessages": 1,
#   "unreadInvitations": 1,
#   "unreadLikes": 1
# }
```

### Test in Browser:

1. Seed test users: `npm run seed -- --count=5`
2. Login as user 1
3. In another browser/tab, login as user 2
4. As user 2:
   - Like user 1 (swipe right or click like button)
   - Send a message to user 1
   - Create a watch invitation to user 1
5. As user 1:
   - Observe badges appear on bottom navigation
   - Click "Liked You" - badge should clear (for premium users)
   - Click "Chats" and open conversation - badge should clear
   - Click "Watch" and view invitation - badge should clear

## Files Modified

### Backend:
- `backend/models/Like.js` - Added `read` field
- `backend/routes/likes.js` - Added mark as read endpoint and unreadCount
- `backend/utils/dataStore.js` - Added `markLikeAsRead()` method
- `backend/database/mongodbAdapter.js` - Added `markLikeAsRead()` method
- `backend/database/postgresqlAdapter.js` - Added `markLikeAsRead()` method
- `backend/controllers/chatController.js` - Added `unreadLikes` to notifications endpoint

### Frontend:
- `frontend/src/components/bottom-nav.js` - Updated to poll unified endpoint and display all badges
- `frontend/src/components/liked-you.js` - Added automatic mark as read when viewing
- `frontend/src/services/api.js` - Added `markLikeAsRead()` method
- `frontend/src/utils/notifications.js` - Added `unreadLikesCount` tracking

## Future Enhancements

- WebSocket support for real-time notifications (no polling needed)
- Push notifications for mobile apps
- Email/SMS notifications for important events
- Notification preferences (allow users to customize what they're notified about)
- Notification history page showing all past notifications
