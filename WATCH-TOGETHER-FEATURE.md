# Watch-Together Experience Feature

## Overview

The Watch-Together Experience allows users to invite their matches to watch movies or TV shows together using third-party platforms. This feature facilitates coordinated watch parties with scheduling, platform guidance, and invitation management.

## Supported Platforms

### 1. Teleparty (Netflix Party)
- **Best For:** Netflix, Disney+, Hulu, HBO content
- **Features:** Synchronized playback, group chat
- **Requirements:** Browser extension (Chrome, Edge, Opera)
- **Website:** https://www.teleparty.com/

### 2. Amazon Prime Watch Party
- **Best For:** Amazon Prime Video content
- **Features:** Built-in feature, up to 100 participants
- **Requirements:** Amazon Prime membership
- **Website:** https://www.amazon.com/gp/video/watchparty

### 3. Disney+ GroupWatch
- **Best For:** Disney+ content
- **Features:** Native Disney+ feature, up to 7 people
- **Requirements:** Disney+ subscription
- **Website:** https://www.disneyplus.com/

### 4. Scener
- **Best For:** Multiple streaming services
- **Features:** Virtual theater with video chat
- **Requirements:** Browser extension or app
- **Website:** https://scener.com/

### 5. Zoom (Fallback)
- **Best For:** Any streaming service
- **Features:** Screen sharing, video/audio chat
- **Requirements:** Zoom account (free works)
- **Website:** https://zoom.us/

## How to Use

### Creating a Watch Invitation

1. **Navigate to Watch Together Page:**
   - From Matches page, click "🎬 Watch Together" button
   - Or use the navigation menu icon

2. **Fill Out the Invitation Form:**
   - **Select Match:** Choose who you want to invite
   - **Platform:** Pick your preferred watch party platform
   - **Movie/Show (Optional):** Select from your favorites or watch history
   - **Date:** Choose when you want to watch
   - **Time:** Set the start time
   - **Join Link (Optional):** Add the party link if already created

3. **Submit the Invitation:**
   - Click "Create Watch Invitation"
   - The invitation is sent to your match

### Managing Invitations

#### Viewing Invitations
- **Sent Tab:** See all invitations you've sent
- **Received Tab:** See all invitations you've received

#### Invitation Actions
- **View Details:** Click any invitation to see full details
- **Accept/Decline:** Respond to received invitations
- **Cancel:** Cancel pending invitations you've sent
- **Add to Calendar:** Generate Google Calendar reminders
- **Copy Details:** Copy invitation information to clipboard

### Platform-Specific Instructions

Each platform has step-by-step instructions provided automatically:

#### Example: Teleparty Instructions
1. Install the Teleparty browser extension (Chrome, Edge, or Opera)
2. Open Netflix and start playing your selected movie/show
3. Click the Teleparty extension icon
4. Click "Start Party" and share the party link
5. Wait for your partner to join using the link

## API Endpoints

### Create Watch Invitation
```
POST /api/watch-invitations
Body: {
  "fromUserId": "user_id",
  "toUserId": "match_user_id",
  "platform": "teleparty",
  "movie": { "title": "Movie Name", "tmdbId": 123 },
  "scheduledDate": "2024-12-25",
  "scheduledTime": "19:30",
  "joinLink": "https://..."
}
```

### Get User's Invitations
```
GET /api/watch-invitations/user/:userId
Returns: { sent: [], received: [], all: [] }
```

### Update Invitation Status
```
PUT /api/watch-invitations/:invitationId
Body: { "status": "accepted", "joinLink": "https://..." }
```

### Get Specific Invitation
```
GET /api/watch-invitations/:invitationId
```

### Delete Invitation
```
DELETE /api/watch-invitations/:invitationId
```

## Features

✅ **Invitation Flow:**
- Create invitations with match selection
- Schedule date and time
- Optional movie/show selection
- Platform-specific guidance

✅ **Calendar Integration:**
- Generate Google Calendar reminders
- Automatic event creation

✅ **Instructions:**
- Platform-specific setup guides
- Step-by-step instructions
- Requirements checklist

✅ **Status Management:**
- Pending invitations
- Accept/decline functionality
- Cancelled invitations

✅ **User Experience:**
- Responsive design
- Clear validation
- Copy to clipboard
- Modal details view

## Technical Details

### Data Model

```javascript
{
  id: "watch_uuid",
  fromUserId: "user_id",
  toUserId: "match_id",
  platform: "teleparty",
  platformName: "Teleparty (Netflix Party)",
  movie: {
    title: "The Matrix",
    tmdbId: 603,
    posterPath: "/path.jpg"
  },
  scheduledDate: "2024-12-25",
  scheduledTime: "19:30",
  joinLink: "https://...",
  status: "pending",
  instructions: [...],
  createdAt: "2024-12-19T...",
  updatedAt: "2024-12-19T..."
}
```

### Storage

- Uses file-based JSON storage (`data/watchInvitations.json`)
- Compatible with existing app data structure
- Ready for database migration (MongoDB, PostgreSQL)

## Best Practices

1. **Schedule Ahead:** Create invitations at least a day in advance
2. **Test Platform:** Make sure both users have the platform ready
3. **Share Join Link:** Add the join link before the scheduled time
4. **Set Reminders:** Use the calendar integration feature
5. **Communicate:** Use the app's chat feature to coordinate

## Troubleshooting

### Match Not Showing in Dropdown
- Make sure you have mutual matches (both users liked each other)
- Go to Matches page to find and like potential matches

### Platform Not Working
- Verify both users meet platform requirements
- Check internet connection
- Try alternative platform as fallback

### Can't Create Invitation
- Ensure all required fields are filled
- Check that date is in the future
- Verify match is still active

## Future Enhancements

- Push notifications for invitation responses
- Real-time invitation updates
- Recurring watch parties
- Group watch parties (3+ people)
- In-app video chat integration
