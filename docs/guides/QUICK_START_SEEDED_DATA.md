# Quick Start: Seeded Data and Matches

## Overview

This guide helps you quickly set up test data with seeded users and matches.

## TL;DR - Fast Setup

```bash
npm run seed:all          # Seed users and matches
npm run verify:matches    # Verify everything works
npm start                 # Start the server
```

Login with any user from `TEST_CREDENTIALS.md` (password: `password123`)

## Detailed Setup

### 1. Seed Users

```bash
npm run seed
```

Creates 100 test users with complete profiles.

### 2. Seed Matches

```bash
npm run seed:matches
```

Generates ~950 pre-matched pairs (up to 10 matches per user).

### 3. Verify Matches

```bash
npm run verify:matches
```

Confirms all matches are visible to both users.

## Understanding Seeded Matches

### How They Work

✅ **Single Storage**: Each match stored once with user1Id and user2Id  
✅ **Bidirectional Visibility**: Both users see the same match  
✅ **No Duplicates**: System checks before creating matches  
✅ **Complete Data**: Match score, shared content, compatibility

### Example

```
Match: UserA (id: abc123) ↔ UserB (id: def456)
Storage: { user1Id: "abc123", user2Id: "def456", matchScore: 85 }

UserA queries matches: Finds this match (user1Id = abc123) ✓
UserB queries matches: Finds this match (user2Id = def456) ✓
```

Both see the SAME match with the SAME ID and data!

## Verification

The `npm run verify:matches` command tests:

1. **Bidirectional Visibility**: All matches visible to both users
2. **No Missing Matches**: All users have at least one match
3. **No Duplicates**: Each user pair matched only once
4. **Sample Test**: Verifies specific users can see mutual matches

### Expected Output

```
🎉 ALL TESTS PASSED!
   Seeded matches are working correctly and showing on both users' profiles.

📝 VERIFICATION SUMMARY
Total Users:           100
Total Matches:         945
Users with no matches: 0
Duplicate matches:     0
Visibility issues:     0
```

## Common Commands

```bash
# Everything at once
npm run seed:all

# With MongoDB
npm run seed:all:mongodb
npm run verify:matches:mongodb

# Custom match count
node backend/scripts/seedMatches.js --matches-per-user=15

# Reseed matches only
rm data/matches.json
npm run seed:matches
```

## Testing

### Via UI
1. `npm start`
2. Login (see `TEST_CREDENTIALS.md`)
3. Go to Matches page
4. See pre-generated matches!

### Via API
```bash
npm start  # Start server

# In another terminal
USER_ID="user_1234567890_abcdef"  # Get from TEST_CREDENTIALS.md
curl "http://localhost:3000/api/matches/${USER_ID}/history"
```

### Via Database

**File-based:**
```bash
cat data/matches.json | python3 -m json.tool | less
cat data/matches.json | grep '"id":' | wc -l
```

**MongoDB:**
```javascript
use('netflix-and-chill');
db.matches.find().limit(5);
db.matches.countDocuments();
```

## Troubleshooting

### No matches showing?

```bash
# 1. Verify they exist
npm run verify:matches

# 2. Reseed if needed
npm run seed:matches

# 3. Check server
npm start
```

### Matches in database but not UI?

1. Hard refresh browser (Ctrl+Shift+R)
2. Check browser console (F12) for errors
3. Check server logs for errors
4. Verify API: `curl http://localhost:3000/health`

### Start completely fresh?

```bash
rm -rf data/
npm run seed:all
npm run verify:matches
```

## What You Get

- **100 test users** with full profiles
- **~950 match pairs** (varies slightly)
- **Average ~19 matches per user**
- **All matches bidirectionally visible**
- **Test credentials** in `TEST_CREDENTIALS.md`

## More Documentation

- 📖 **Full Verification Guide**: `docs/guides/SEEDED_MATCHES_VERIFICATION.md`
- 📖 **Technical Details**: `docs/MATCH_AND_LOGIN_FIXES.md`
- 📖 **Credentials**: `TEST_CREDENTIALS.md`

## Need Help?

1. Run: `npm run verify:matches`
2. Check output and logs
3. See documentation above
4. Open GitHub issue with details
