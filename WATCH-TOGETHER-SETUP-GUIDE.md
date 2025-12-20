# Watch Together Route - Complete Setup Guide

## Overview

The **Watch Together** feature is **FULLY FUNCTIONAL** and requires **NO additional API keys or authentications** beyond what the base Netflix and Chill app already needs. This guide explains what's needed to run the watch-together route and how it works.

---

## 🎯 Current Implementation Status

✅ **Backend Route:** `/api/watch-invitations` - Fully implemented  
✅ **Controller:** `watchInvitationController.js` - Complete  
✅ **Model:** `WatchInvitation.js` - Working  
✅ **Frontend:** `watch-together.html` + `watch-together.js` - Complete  
✅ **API Integration:** All API methods implemented in `api.js`  
✅ **Data Storage:** File-based JSON storage (no database required)

---

## 🔑 Required APIs & Authentication

### What You NEED (for the entire app):

1. **TMDB API Key** (The Movie Database)
   - **Purpose:** Fetch movie/TV show data for the app
   - **Used by:** Movie search, recommendations, favorites
   - **NOT directly used by watch-together route** (watch-together uses existing user data)
   - **Get it at:** https://www.themoviedb.org/settings/api
   - **Add to `.env`:**
     ```
     TMDB_API_KEY=your_api_key_here
     ```

### What You DON'T NEED (for watch-together to work):

❌ **NO Chat Service API** (SendBird, Twilio, Stream) - Watch-together works independently  
❌ **NO Firebase/Auth0** - The app uses simple user management (no external auth required)  
❌ **NO AWS S3/Cloud Storage** - Watch-together stores data locally  
❌ **NO Email Service** (SendGrid) - Watch-together doesn't send emails  
❌ **NO Payment Processing** (Stripe) - Feature is free  
❌ **NO Third-Party Platform APIs** - We just provide links to external platforms

---

## 📊 Data Storage

### What Data is Stored:

The watch-together route stores invitation data in:
```
/data/watchInvitations.json
```

### Data Structure:
```json
[
  {
    "id": "watch_uuid-here",
    "fromUserId": "user123",
    "toUserId": "user456",
    "platform": "teleparty",
    "platformName": "Teleparty (Netflix Party)",
    "movie": {
      "title": "The Matrix",
      "tmdbId": 603,
      "posterPath": "/path.jpg"
    },
    "scheduledDate": "2024-12-25",
    "scheduledTime": "19:30",
    "joinLink": "https://...",
    "status": "pending",
    "instructions": ["Step 1...", "Step 2..."],
    "createdAt": "2024-12-19T...",
    "updatedAt": "2024-12-19T..."
  }
]
```

### Database Options:

**Current Implementation:** File-based JSON storage (default)
- ✅ No setup required
- ✅ Works immediately
- ⚠️ Not recommended for production with high traffic

**Future Options:**
- **MongoDB:** Set `DB_TYPE=mongodb` in `.env` and provide `MONGODB_URI`
- **PostgreSQL:** Set `DB_TYPE=postgresql` in `.env` and provide `POSTGRES_URI`

---

## 🚀 Quick Start - What You Need to Do

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Environment File
```bash
cp .env.example .env
```

### Step 3: Add Minimum Required Configuration

Edit `.env` and add:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Type (file-based is default, no setup needed)
DB_TYPE=file

# TMDB API Key (Required for movie data in the app)
TMDB_API_KEY=your_tmdb_api_key_here

# JWT Secret (for session management)
JWT_SECRET=your_super_secret_key_change_this_in_production
```

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Access Watch Together Page
1. Navigate to: `http://localhost:3000/watch-together.html`
2. You'll need to be logged in (create an account first at `http://localhost:3000/login.html`)
3. You'll need matches (users who mutually liked each other)

---

## 🎬 How the Watch Together Feature Works

### User Flow:

1. **User logs in** to the app
2. **User finds and likes potential matches** (on matches page)
3. **When two users mutually like each other**, they become matches
4. **User navigates to Watch Together page** (`watch-together.html`)
5. **User creates an invitation:**
   - Selects a match from dropdown
   - Chooses a platform (Teleparty, Amazon Prime, Disney+, Scener, or Zoom)
   - Optionally selects a movie from their favorites
   - Sets date and time
   - Optionally adds a join link
6. **Invitation is saved** to `data/watchInvitations.json`
7. **Match receives the invitation** (visible in their "Received" tab)
8. **Match can accept/decline** the invitation
9. **Users get platform-specific instructions** on how to set up the watch party

### Third-Party Platforms:

The watch-together feature **provides instructions and links** for these platforms:

1. **Teleparty (Netflix Party)**
   - Website: https://www.teleparty.com/
   - Browser extension for synchronized Netflix/Disney+/Hulu viewing
   - **NO API integration** - users install the extension themselves

2. **Amazon Prime Watch Party**
   - Website: https://www.amazon.com/gp/video/watchparty
   - Built into Amazon Prime Video
   - **NO API integration** - users use Amazon's native feature

3. **Disney+ GroupWatch**
   - Built into Disney+
   - **NO API integration** - users use Disney's native feature

4. **Scener**
   - Website: https://scener.com/
   - Virtual theater with video chat
   - **NO API integration** - users install the extension themselves

5. **Zoom**
   - Website: https://zoom.us/
   - Screen sharing as fallback
   - **NO API integration** - users create their own Zoom meetings

**Important:** The app **DOES NOT** create watch parties on these platforms. It only:
- Helps users coordinate and schedule
- Provides setup instructions
- Stores join links that users manually create

---

## 🔌 API Endpoints Available

### Create Watch Invitation
```http
POST /api/watch-invitations
Content-Type: application/json

{
  "fromUserId": "user123",
  "toUserId": "user456",
  "platform": "teleparty",
  "movie": {
    "title": "The Matrix",
    "tmdbId": 603,
    "posterPath": "/path.jpg"
  },
  "scheduledDate": "2024-12-25",
  "scheduledTime": "19:30",
  "joinLink": "https://teleparty.com/join/abc123"
}

Response: 201 Created
{
  "id": "watch_uuid",
  "fromUserId": "user123",
  ...
}
```

### Get User's Invitations
```http
GET /api/watch-invitations/user/:userId

Response: 200 OK
{
  "sent": [...],
  "received": [...],
  "all": [...]
}
```

### Get Specific Invitation
```http
GET /api/watch-invitations/:invitationId

Response: 200 OK
{
  "id": "watch_uuid",
  "fromUserId": "user123",
  ...
}
```

### Update Invitation Status
```http
PUT /api/watch-invitations/:invitationId
Content-Type: application/json

{
  "status": "accepted",
  "joinLink": "https://..."
}

Response: 200 OK
{
  "id": "watch_uuid",
  "status": "accepted",
  ...
}
```

### Delete Invitation
```http
DELETE /api/watch-invitations/:invitationId

Response: 200 OK
{
  "message": "Invitation deleted successfully"
}
```

---

## 🧪 Testing the Feature

### 1. Start the Server
```bash
npm start
```

### 2. Create Test Users
Navigate to: `http://localhost:3000/signup.html`
- Create User A: email@test.com
- Create User B: email2@test.com

### 3. Create Matches
- Log in as User A
- Go to matches page and like User B
- Log out and log in as User B
- Like User A back
- Now they are mutual matches!

### 4. Create Watch Invitation
- Log in as User A
- Navigate to `http://localhost:3000/watch-together.html`
- Fill out the invitation form
- Select User B from dropdown
- Choose a platform
- Set date and time
- Submit

### 5. Verify Invitation
- Log out and log in as User B
- Go to `http://localhost:3000/watch-together.html`
- Click "Received" tab
- See the invitation from User A
- Accept or decline it

### 6. Check Data Storage
```bash
cat data/watchInvitations.json
```

Should show the created invitation in JSON format.

---

## 🛠️ Troubleshooting

### Issue: "No matches yet" message
**Solution:** You need mutual matches. Both users must like each other.
- Go to matches page
- Like potential matches
- Wait for them to like you back

### Issue: Can't create invitation - validation error
**Solution:** Check that all required fields are filled:
- Match selection (required)
- Platform (required)
- Date (required, must be in the future)
- Time (required)

### Issue: Data not persisting
**Solution:** Check that the `data/` directory exists:
```bash
mkdir -p data
```

The app should create this automatically, but if not, create it manually.

### Issue: CORS errors in browser console
**Solution:** Make sure the frontend is served from the same origin as the API:
- Access via: `http://localhost:3000/watch-together.html`
- NOT: `file:///path/to/watch-together.html`

### Issue: "User not found" errors
**Solution:** Users must exist in the system. Create accounts via signup page first.

---

## 📋 Complete Setup Checklist

- [ ] Install Node.js (v14 or higher)
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Add TMDB_API_KEY to `.env` (get from themoviedb.org)
- [ ] Add JWT_SECRET to `.env` (any random string)
- [ ] Run `npm start`
- [ ] Create user accounts (signup.html)
- [ ] Create mutual matches (matches page)
- [ ] Navigate to watch-together.html
- [ ] Create and test invitations

---

## 🔒 Security Notes

### Current Implementation (Development):
- File-based storage (simple, no auth required)
- Basic user management (stored in files)
- No encryption for invitation data

### Production Recommendations:
1. **Use a real database** (MongoDB or PostgreSQL)
2. **Implement proper authentication** (Firebase, Auth0, or JWT-based)
3. **Add rate limiting** to prevent API abuse
4. **Validate all user inputs** on server side
5. **Use HTTPS** for all connections
6. **Sanitize and escape user data** to prevent XSS
7. **Implement proper session management**
8. **Add CSRF protection**

---

## 📚 Related Documentation

- **Full Feature Documentation:** `WATCH-TOGETHER-FEATURE.md`
- **API Keys Guide:** `API_KEYS_GUIDE.md`
- **General Setup:** `QUICKSTART.md`
- **Database Setup:** `MONGODB_SETUP.md`
- **Security Summary:** `SECURITY-SUMMARY-WATCH-TOGETHER.md`

---

## 🎯 Summary

**To make the watch-together route fully functional, you need:**

1. ✅ **Basic app setup** (npm install, .env file)
2. ✅ **TMDB API key** (for movie data in the app)
3. ✅ **User accounts** (create via signup)
4. ✅ **Mutual matches** (users who liked each other)
5. ❌ **NO additional APIs or authentication services**

**The route is ALREADY FUNCTIONAL!** Just:
1. Set up the basic app environment
2. Create some users
3. Make them match each other
4. Start using watch-together!

---

## 💡 Pro Tips

1. **Use Seeder Script** to create test data:
   ```bash
   npm run seed
   ```

2. **Check Backend Health:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **View All Invitations:**
   ```bash
   cat data/watchInvitations.json | jq
   ```

4. **Monitor Server Logs:**
   - Watch console output for errors
   - Check for validation errors
   - Verify API calls are working

---

**Questions?** Check the existing documentation or review the code:
- Backend: `backend/routes/watchInvitations.js`
- Controller: `backend/controllers/watchInvitationController.js`
- Model: `backend/models/WatchInvitation.js`
- Frontend: `frontend/watch-together.html`
- Component: `frontend/src/components/watch-together.js`
