# Seeded Matches Verification Guide

## Overview

This guide explains how seeded matches work and how to verify they're showing correctly on both users' profiles.

## How Seeded Matches Work

When you run `npm run seed:matches`, the system:

1. **Creates bidirectional matches**: Each match is stored ONCE with `user1Id` and `user2Id`
2. **Checks for duplicates**: Before creating a match, it checks if one already exists (in either direction)
3. **Makes matches visible to both users**: The `findMatchesForUser()` function queries for matches where the user is EITHER `user1Id` OR `user2Id`

### Example

If User A and User B are matched:
- **Database storage**: One match record with `user1Id=A` and `user2Id=B`
- **User A's profile**: Shows this match (because `user1Id=A`)
- **User B's profile**: Shows the SAME match (because `user2Id=B`)

Both users see the exact same match record - there's no duplication!

## Verifying Seeded Matches

### Quick Verification

Run the comprehensive verification script:

```bash
node backend/scripts/verifySeededMatches.js
```

Or for MongoDB:

```bash
DB_TYPE=mongodb node backend/scripts/verifySeededMatches.js
```

This script will test:
- ✅ All matches are visible to both users
- ✅ No users have zero matches
- ✅ No duplicate matches exist
- ✅ Sample users can see their mutual matches

### Manual Verification

#### 1. Check via API

Start the server:
```bash
npm start
```

In another terminal, check matches for a user:
```bash
# Get user IDs from data/users.json or TEST_CREDENTIALS.md
USER_ID="user_1234567890_abcdef"

# Get matches for this user
curl "http://localhost:3000/api/matches/${USER_ID}/history"
```

#### 2. Check Database Directly

**File-based storage:**
```bash
# Count total matches
cat data/matches.json | grep '"id":' | wc -l

# View matches for first user
cat data/users.json | python3 -c "
import json, sys
users = json.load(sys.stdin)
print('First user ID:', users[0]['id'])
"

# Then search for that ID in matches
cat data/matches.json | grep "user_ID_HERE"
```

**MongoDB:**
```javascript
// In MongoDB Compass or mongosh
use('netflix-and-chill');

// Count total matches
db.matches.countDocuments();

// Find matches for a specific user
const userId = "user_1234567890_abcdef";
db.matches.find({
  $or: [
    { user1Id: userId },
    { user2Id: userId }
  ]
}).count();
```

## Common Questions

### Q: Why don't I see any matches?

**A:** This could mean:
1. You haven't run the match seeder yet:
   ```bash
   npm run seed:matches
   ```

2. You need to reseed after changing the database:
   ```bash
   npm run seed        # Seed users first
   npm run seed:matches  # Then seed matches
   ```

### Q: Do I need to create matches in both directions?

**A:** No! The system automatically handles bidirectional visibility. When you create a match between User A and User B:
- Store it ONCE with `user1Id=A, user2Id=B`
- Query for User A's matches: `WHERE user1Id=A OR user2Id=A`
- Query for User B's matches: `WHERE user1Id=B OR user2Id=B`

Both queries will find the same match!

### Q: How do I know if matches are deduplicated?

**A:** Run the verification script:
```bash
node backend/scripts/verifySeededMatches.js
```

It will report: "No duplicate matches found (N unique pairs)"

### Q: Can users see different match records?

**A:** No, they see the exact same match record. The match has a unique ID that both users share. This ensures:
- Consistent match scores
- Same shared content list
- Same compatibility scores
- Same creation timestamp

### Q: What if I need to reseed?

```bash
# Option 1: Keep users, reseed matches only
rm data/matches.json  # or drop MongoDB matches collection
npm run seed:matches

# Option 2: Fresh start
rm -rf data/
npm run seed
npm run seed:matches
```

## Database Implementation

### File-based Storage (DataStore)

```javascript
async findMatchesForUser(userId) {
  const matches = await this.loadMatches();
  return matches.filter(m => 
    m.user1Id === userId || m.user2Id === userId
  );
}
```

### MongoDB

```javascript
async findMatchesForUser(userId) {
  return await this.db.collection('matches').find({
    $or: [
      { user1Id: userId },
      { user2Id: userId }
    ]
  }).toArray();
}
```

Both implementations check BOTH fields, ensuring bidirectional visibility!

## Troubleshooting

### Matches not showing after seeding

1. **Verify seeding completed successfully:**
   ```bash
   npm run seed:matches
   ```
   Look for: "✅ Successfully generated all matches!"

2. **Check the data exists:**
   ```bash
   # File-based
   ls -lh data/matches.json
   
   # MongoDB
   # Use MongoDB Compass to check matches collection
   ```

3. **Run verification:**
   ```bash
   node backend/scripts/verifySeededMatches.js
   ```

4. **Check API is working:**
   ```bash
   # Start server
   npm start
   
   # Test health endpoint
   curl http://localhost:3000/health
   
   # Test matches endpoint (use real user ID)
   curl http://localhost:3000/api/matches/USER_ID/history
   ```

### Different counts for different users

This is normal! The seeder generates up to N matches per user (default 10), but:
- Some users might have fewer matches due to compatibility scores
- Not all match attempts succeed (duplicates are skipped)
- The first users processed get more matches than the last ones

Run verification to confirm all matches are bidirectional:
```bash
node backend/scripts/verifySeededMatches.js
```

### Matches show in database but not in UI

1. **Check browser console for errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for API errors or CORS issues

2. **Verify API endpoints:**
   - Check server logs for errors
   - Test API directly with curl (see above)

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear localStorage and reload

## Success Criteria

Your seeded matches are working correctly if:

✅ Verification script passes all tests  
✅ Both users can query the same match via API  
✅ No duplicate matches exist in database  
✅ All users have at least one match  
✅ Match counts are reasonable (not all zero or all max)

## Additional Resources

- `backend/scripts/testMatchVisibilityFix.js` - Tests match visibility
- `backend/scripts/seedMatches.js` - Match seeding logic
- `docs/MATCH_AND_LOGIN_FIXES.md` - Technical implementation details
- `TEST_CREDENTIALS.md` - Login credentials for testing

## Support

If you've verified everything above and matches still aren't showing:

1. Check the GitHub issues for similar problems
2. Run all verification scripts and include output
3. Provide your database type (file/MongoDB) and environment details
4. Include server logs and browser console errors
