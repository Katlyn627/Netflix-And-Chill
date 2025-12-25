# Watch Together - Quick Reference Card

## ✅ Is it functional?
**YES!** The watch-together route is fully functional and ready to use.

## 🔑 What API keys do I need?

### Required for the ENTIRE app:
1. **TMDB API Key** (themoviedb.org) - For movie/TV show data

### NOT required for watch-together specifically:
- ❌ NO chat service APIs (SendBird, Twilio, Stream)
- ❌ NO Firebase or Auth0
- ❌ NO AWS S3 or cloud storage
- ❌ NO SendGrid email service
- ❌ NO third-party platform APIs

## 🗄️ What data storage do I need?

**Default:** File-based JSON storage
- Location: `data/watchInvitations.json`
- ✅ Works out of the box, no setup required
- ⚠️ Not recommended for production

**Optional:** MongoDB or PostgreSQL
- Set `DB_TYPE=mongodb` or `DB_TYPE=postgresql` in `.env`
- Provide connection string

## 🎬 What platforms are supported?

The app provides instructions and scheduling for:
1. **Teleparty** (Netflix Party) - Browser extension
2. **Amazon Prime Watch Party** - Built into Prime Video
3. **Disney+ GroupWatch** - Built into Disney+
4. **Scener** - Virtual theater with video chat
5. **Zoom** - Screen sharing fallback

**Important:** The app does NOT create watch parties. It only:
- Helps coordinate and schedule
- Provides setup instructions
- Stores manually-created join links

## 🚀 Quick Setup (3 steps)

1. **Install and configure:**
   ```bash
   npm install
   cp .env.watch-together.example .env
   # Edit .env and add your TMDB_API_KEY
   ```

2. **Start server:**
   ```bash
   npm start
   ```

3. **Use the app:**
   - Create accounts at: http://localhost:3000/signup.html
   - Create matches (mutual likes)
   - Visit: http://localhost:3000/watch-together.html

## 📡 API Endpoints

```
POST   /api/watch-invitations           Create invitation
GET    /api/watch-invitations/user/:id  Get user's invitations
GET    /api/watch-invitations/:id       Get specific invitation
PUT    /api/watch-invitations/:id       Update invitation
DELETE /api/watch-invitations/:id       Delete invitation
```

## 📂 Files to Review

- **Backend Route:** `backend/routes/watchInvitations.js`
- **Controller:** `backend/controllers/watchInvitationController.js`
- **Model:** `backend/models/WatchInvitation.js`
- **Frontend:** `frontend/watch-together.html`
- **Component:** `frontend/src/components/watch-together.js`
- **API Methods:** `frontend/src/services/api.js`

## 🧪 Test It Works

```bash
# Start server
npm start

# In another terminal, test the API:
curl http://localhost:3000/health

# Create a test invitation:
curl -X POST http://localhost:3000/api/watch-invitations \
  -H "Content-Type: application/json" \
  -d '{
    "fromUserId": "user1",
    "toUserId": "user2",
    "platform": "teleparty",
    "scheduledDate": "2024-12-25",
    "scheduledTime": "19:30"
  }'
```

## 📚 Full Documentation

- **Setup Guide:** `WATCH-TOGETHER-SETUP-GUIDE.md`
- **Feature Docs:** `WATCH-TOGETHER-FEATURE.md`
- **API Keys Guide:** `API_KEYS_GUIDE.md`
- **Security:** `SECURITY-SUMMARY-WATCH-TOGETHER.md`

## ❓ Common Questions

**Q: Do I need to integrate with Teleparty/Netflix Party API?**  
A: No. Users install the extension themselves. The app just provides instructions.

**Q: Do I need a database?**  
A: No. File-based storage works by default. Database is optional for production.

**Q: Do I need authentication services?**  
A: No. The app has basic built-in user management (stored in files).

**Q: Can users create watch parties in the app?**  
A: No. Users create parties on the third-party platforms. The app helps coordinate.

**Q: What's the minimum to make it work?**  
A: Just TMDB API key + npm install + npm start. That's it!

## 🎯 Summary

**The watch-together route is already complete and functional!**

You need:
- ✅ Node.js installed
- ✅ TMDB API key
- ✅ `npm install` + `npm start`
- ✅ User accounts in the app
- ✅ Mutual matches

You DON'T need:
- ❌ Additional API services
- ❌ External authentication
- ❌ Cloud storage
- ❌ Database (optional)
- ❌ Third-party platform integrations

**Just follow the Quick Setup above and you're ready to go!** 🎉
