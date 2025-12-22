# Quick Start: Finding Seeded Data

## 🎯 Quick Reference

### Where is the data?
```
📁 Repository Root
├── 📄 TEST_CREDENTIALS.md     ← Login credentials for all seeded users
├── 📄 TEST_CREDENTIALS.json   ← Same data in JSON format
└── 📁 data/
    ├── users.json             ← All user profile data
    ├── matches.json           ← Saved matches
    └── messages.json          ← Chat messages
```

### Default login info
- **Password for ALL users**: `password123`
- **Emails**: See `TEST_CREDENTIALS.md`

---

## 📋 Step-by-Step Examples

### 1️⃣ View Login Credentials
```bash
cat TEST_CREDENTIALS.md
```
**Shows**: Table with username, email, age, and location for each user

### 2️⃣ Count Total Users
```bash
cat data/users.json | grep '"id":' | wc -l
```
**Output**: Number of seeded users (e.g., 50)

### 3️⃣ View a User's Profile
```bash
# Basic info
cat data/users.json | jq '.[0] | {username, email, age, location, bio}'

# Preferences
cat data/users.json | jq '.[0].preferences'

# Streaming services
cat data/users.json | jq '.[0].streamingServices'

# Favorite movies
cat data/users.json | jq '.[0].favoriteMovies'
```

### 4️⃣ Test Matching via API
```bash
# Start server
npm start

# Get first user's matches
USER_ID=$(cat data/users.json | jq -r '.[0].id')
curl http://localhost:3000/api/matches/find/$USER_ID | jq '.matches | length'
```
**Output**: Number of matches found for the user

### 5️⃣ Login to Web Interface
1. Start server: `npm start`
2. Open: `http://localhost:8080/login.html`
3. Use any credentials from `TEST_CREDENTIALS.md`
4. Password: `password123`

---

## 🔍 Common Searches

### Find user by email
```bash
cat data/users.json | jq '.[] | select(.email == "reese_white@gmail.com")'
```

### Find users in a specific location
```bash
cat data/users.json | jq '.[] | select(.location | contains("Raleigh"))'
```

### Find users with specific age
```bash
cat data/users.json | jq '.[] | select(.age >= 40 and .age <= 50)'
```

### Check user's age range preferences
```bash
cat data/users.json | jq '.[0].preferences.ageRange'
```

### View all usernames
```bash
cat data/users.json | jq '.[].username'
```

---

## 📊 Verification Commands

### Verify data completeness
```bash
node backend/scripts/testSeeding.js
```

### Debug matching issues
```bash
node backend/scripts/debugMatching.js
```

### Test multiple users
```bash
node backend/scripts/testMultipleUsers.js
```

---

## 🔄 Reseed Data

### Delete and reseed
```bash
rm -rf data/ TEST_CREDENTIALS.*
npm run seed -- --count=50
```

---

## 📸 Real Example Output

### TEST_CREDENTIALS.md
```
# Netflix and Chill - Test User Credentials

Generated: 2025-12-22T20:58:12.990Z
Total Users: 50
Default Password: password123

| # | Username | Email | Password | Age | Location |
|---|----------|-------|----------|-----|----------|
| 1 | reese_white | reese_white@gmail.com | password123 | 44 | Raleigh, NC |
| 2 | walker_rowan | walker_rowan@hotmail.com | password123 | 30 | Los Angeles, CA |
...
```

### User Profile (JSON)
```json
{
  "username": "reese_white",
  "email": "reese_white@gmail.com",
  "age": 44,
  "location": "Raleigh, NC",
  "gender": "female",
  "bio": "Netflix addict ready to find my streaming soulmate",
  "preferences": {
    "ageRange": { "min": 31, "max": 58 },
    "locationRadius": 1000,
    "genderPreference": ["male"]
  },
  "streamingServices": ["Peacock Premium", "Max", "Hulu"],
  "favoriteMovies": [
    {"title": "Pulp Fiction"},
    {"title": "Fight Club"},
    {"title": "Inception"}
  ]
}
```

### API Response (Matches)
```json
{
  "userId": "user_1766437092406_hu37nrjgq",
  "matchCount": 10,
  "matches": [
    {
      "matchScore": 100,
      "user": {
        "username": "micahw26",
        "age": 46,
        "location": "Raleigh, NC"
      }
    }
  ]
}
```

---

## 💡 Pro Tips

1. **jq is your friend**: Install jq for easy JSON parsing
   ```bash
   # Ubuntu/Debian
   sudo apt-get install jq
   ```

2. **Use grep for quick searches**:
   ```bash
   cat TEST_CREDENTIALS.md | grep "gmail.com"
   ```

3. **Check server logs** when testing:
   ```bash
   npm start | tee server.log
   ```

4. **Bookmark common queries** in your terminal history

---

## 🆘 Troubleshooting

### Can't find TEST_CREDENTIALS.md?
→ Run `npm run seed` to generate data

### No matches showing?
→ Check `SEEDED_DATA_GUIDE.md` Step 6 for verification

### API returning errors?
→ Ensure server is running: `npm start`

---

For detailed documentation, see: **SEEDED_DATA_GUIDE.md**
