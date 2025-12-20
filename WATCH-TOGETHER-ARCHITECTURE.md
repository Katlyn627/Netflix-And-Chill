# Watch Together - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         watch-together.html (Frontend Page)                   │  │
│  │  - Form to create invitations                                 │  │
│  │  - View sent/received invitations                             │  │
│  │  - Accept/decline invitations                                 │  │
│  │  - View platform instructions                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↕ (API Calls)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         watch-together.js (Frontend Logic)                    │  │
│  │  - Event handlers                                             │  │
│  │  - Form validation                                            │  │
│  │  - UI updates                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↕ (uses)                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         api.js (API Client Methods)                           │  │
│  │  - createWatchInvitation()                                    │  │
│  │  - getUserInvitations()                                       │  │
│  │  - updateWatchInvitation()                                    │  │
│  │  - deleteWatchInvitation()                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ (HTTP Requests)
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         server.js (Express App)                               │  │
│  │  - Routes: /api/watch-invitations                             │  │
│  │  - Middleware: CORS, JSON parser                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↕                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         watchInvitations.js (Route Handler)                   │  │
│  │  POST   /                                                     │  │
│  │  GET    /user/:userId                                         │  │
│  │  GET    /:invitationId                                        │  │
│  │  PUT    /:invitationId                                        │  │
│  │  DELETE /:invitationId                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↕                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         watchInvitationController.js (Business Logic)         │  │
│  │  - createWatchInvitation()                                    │  │
│  │  - getUserInvitations()                                       │  │
│  │  - getInvitation()                                            │  │
│  │  - updateInvitationStatus()                                   │  │
│  │  - deleteInvitation()                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↕ (uses)                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         WatchInvitation.js (Data Model)                       │  │
│  │  - Schema definition                                          │  │
│  │  - Validation logic                                           │  │
│  │  - Platform instructions                                      │  │
│  │  - Helper methods                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↕ (reads/writes)
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA STORAGE                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         data/watchInvitations.json                            │  │
│  │  [                                                            │  │
│  │    {                                                          │  │
│  │      "id": "watch_uuid",                                      │  │
│  │      "fromUserId": "user1",                                   │  │
│  │      "toUserId": "user2",                                     │  │
│  │      "platform": "teleparty",                                 │  │
│  │      "status": "pending",                                     │  │
│  │      ...                                                      │  │
│  │    }                                                          │  │
│  │  ]                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Creating an Invitation

```
User Action              Frontend                Backend                 Storage
────────────────────────────────────────────────────────────────────────

1. Fill form       →   2. Validate input
                        
                    3. Create request   →   4. Receive POST
                        payload                /api/watch-invitations
                                          
                                          5. Validate data
                                          
                                          6. Create WatchInvitation
                                             object with UUID
                                          
                                          7. Read existing    →   8. Load JSON
                                             invitations              file
                                          
                                          ←   9. Return data
                                          
                                          10. Append new
                                              invitation
                                          
                                          11. Write to file   →   12. Save JSON
                                          
                                          ←   13. Confirm save
                        
                    ←   14. Return new
                            invitation JSON
                        
15. Display         
    success &       
    update UI       
```

### Accepting an Invitation

```
User Action              Frontend                Backend                 Storage
────────────────────────────────────────────────────────────────────────

1. Click           →   2. Send PUT request
   "Accept"            with status="accepted"
                                          
                                          3. Receive PUT
                                             /api/watch-invitations/:id
                                          
                                          4. Read file        →   5. Load JSON
                                          
                                          ←   6. Return data
                                          
                                          7. Find invitation
                                             by ID
                                          
                                          8. Update status
                                             and timestamp
                                          
                                          9. Write to file    →   10. Save JSON
                                          
                                          ←   11. Confirm save
                        
                    ←   12. Return updated
                            invitation
                        
13. Update UI       
    status badge    
```

## Component Dependencies

```
Frontend Components:
├── watch-together.html
│   ├── Imports: api.js
│   ├── Imports: watch-together.js
│   └── Imports: navigation.js
│
├── watch-together.js
│   ├── Uses: API object from api.js
│   ├── Manages: Form state
│   ├── Manages: Invitation display
│   └── Manages: Modal interactions
│
└── api.js
    └── Exports: API methods for HTTP requests

Backend Components:
├── server.js
│   ├── Imports: watchInvitations route
│   ├── Mounts: /api/watch-invitations
│   └── Middleware: CORS, JSON parsing
│
├── routes/watchInvitations.js
│   ├── Imports: controller methods
│   └── Defines: 5 route handlers
│
├── controllers/watchInvitationController.js
│   ├── Imports: WatchInvitation model
│   ├── Imports: fs.promises for file I/O
│   └── Exports: 5 controller functions
│
└── models/WatchInvitation.js
    ├── Uses: crypto for UUID generation
    └── Exports: WatchInvitation class
```

## Integration Points

### What the App DOES integrate with:
```
┌─────────────────────────────────────────────────────┐
│  Netflix & Chill App                                │
│                                                     │
│  ┌─────────────────────┐                           │
│  │  Watch Together     │                           │
│  │  Feature            │                           │
│  └─────────────────────┘                           │
│           ↓ (uses data from)                       │
│  ┌─────────────────────┐                           │
│  │  User Management    │  (existing users)         │
│  └─────────────────────┘                           │
│           ↓ (uses data from)                       │
│  ┌─────────────────────┐                           │
│  │  Match System       │  (mutual likes)           │
│  └─────────────────────┘                           │
│           ↓ (optionally uses)                      │
│  ┌─────────────────────┐                           │
│  │  Favorite Movies    │  (user's favorites)       │
│  └─────────────────────┘                           │
└─────────────────────────────────────────────────────┘
```

### What the App DOES NOT integrate with:
```
❌ Teleparty API       - Users install extension themselves
❌ Amazon Prime API    - Users use native Watch Party feature
❌ Disney+ API         - Users use native GroupWatch feature
❌ Scener API          - Users install extension themselves
❌ Zoom API            - Users create meetings themselves

The app only provides:
✅ Instructions on how to use these platforms
✅ Links to download/access these platforms
✅ A place to store join links created by users
```

## Security Boundaries

```
┌────────────────────────────────────────────────────────────┐
│  User's Browser                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  watch-together.html                                 │ │
│  │  - User inputs (validated client-side)               │ │
│  │  - LocalStorage for userId                           │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                         ↕ HTTPS (production)
┌────────────────────────────────────────────────────────────┐
│  Express Server                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Controller                                          │ │
│  │  - Validates all inputs (server-side)                │ │
│  │  - Checks required fields                            │ │
│  │  - Validates platform values                         │ │
│  │  - Validates status values                           │ │
│  │  - Sanitizes user data                               │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                         ↕ File system
┌────────────────────────────────────────────────────────────┐
│  File Storage                                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  data/watchInvitations.json                          │ │
│  │  - Stored on server                                  │ │
│  │  - Not publicly accessible                           │ │
│  │  - No encryption (development)                       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Platform Instructions Flow

```
User selects platform → Frontend displays platform info
                                   ↓
                        Backend generates instructions
                                   ↓
                        Instructions stored with invitation
                                   ↓
                        Displayed in modal when viewed
                                   ↓
                        User follows instructions on
                        third-party platform
```

## No External API Required

```
┌──────────────────────────────────────────────────────┐
│  Third-Party Platforms (External)                    │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Teleparty   │  │ Amazon Prime │  │ Disney+   │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│  ┌─────────────┐  ┌──────────────┐                 │
│  │ Scener      │  │ Zoom         │                 │
│  └─────────────┘  └──────────────┘                 │
│                                                      │
│  NO API integration ❌                               │
│  Users interact directly with these platforms        │
└──────────────────────────────────────────────────────┘
                         ↑
                    User goes to
                    (manually)
                         ↑
┌──────────────────────────────────────────────────────┐
│  Netflix & Chill App                                 │
│                                                      │
│  Provides:                                           │
│  ✅ Instructions on how to use platforms             │
│  ✅ Links to platform websites                       │
│  ✅ Storage for manually-created join links          │
│  ✅ Scheduling and coordination tools                │
└──────────────────────────────────────────────────────┘
```

## Summary

**Key Architectural Points:**

1. **Simple 3-tier architecture:** Frontend → Backend → Storage
2. **File-based storage:** No database required (optional upgrade)
3. **No external API integrations:** Just provides links and instructions
4. **RESTful API design:** Standard HTTP methods for CRUD operations
5. **Self-contained:** All code is in the repository
6. **Minimal dependencies:** Uses only Express, CORS, and dotenv
7. **Easy to extend:** Can migrate to database without changing API

**Why it's already functional:**
- ✅ All routes implemented
- ✅ All controllers implemented
- ✅ Data model complete
- ✅ Frontend complete
- ✅ API methods implemented
- ✅ No external dependencies
- ✅ Works with file storage

**What you need to do:**
1. Install dependencies: `npm install`
2. Configure environment: Add TMDB API key to `.env`
3. Start server: `npm start`
4. Use the app: Create users, make matches, create invitations
