# Quick Fix Guide: Re-seed MongoDB Atlas Database

## The Problem
Your MongoDB Atlas database has users with empty arrays for matching data (streamingServices, favoriteMovies, swipedMovies, etc.), which prevents matches from being found.

## The Fix
We've fixed the bug in the User model that was causing arrays to not be properly initialized. Now you need to re-seed your database with the fixed code.

## Steps to Fix Your MongoDB Atlas Database

### Option 1: Quick Fix - Drop and Re-seed (Recommended for Development)

1. **Drop the existing users collection** in MongoDB Atlas:
   - Go to your MongoDB Atlas dashboard
   - Navigate to your cluster → Collections
   - Find the `users` collection
   - Click the trash icon to drop it
   - Confirm the deletion

2. **Re-seed the database** with the fixed code:
   ```bash
   # Make sure you have your .env file configured with MongoDB credentials
   DB_TYPE=mongodb node backend/scripts/seedUsers.js
   ```

3. **Verify the data**:
   - Go back to MongoDB Atlas → Collections
   - Check the `users` collection
   - Click on any user document
   - Verify that arrays like `streamingServices`, `favoriteMovies`, `swipedMovies`, and `preferences.genres` now contain data

### Option 2: Manual Migration Script (If you want to keep existing users)

If you have manually created users or data you want to preserve, you'll need to update them:

1. **Create a migration script** (`backend/scripts/migrateExistingUsers.js`):
   ```javascript
   require('dotenv').config();
   const DatabaseFactory = require('../database/databaseFactory');
   const User = require('../models/User');

   async function migrateUsers() {
     const database = await DatabaseFactory.createDatabase();
     const users = await database.loadUsers();
     
     console.log(`Found ${users.length} users to migrate`);
     
     for (const userData of users) {
       // Reconstruct user with fixed model (this applies defaults)
       const user = new User(userData);
       const fixedData = user.toJSON();
       fixedData.password = userData.password; // Preserve password
       
       // Update in database
       await database.updateUser(userData.id, fixedData);
     }
     
     console.log('Migration complete!');
     await database.disconnect();
   }

   migrateUsers().catch(console.error);
   ```

2. **Run the migration**:
   ```bash
   DB_TYPE=mongodb node backend/scripts/migrateExistingUsers.js
   ```

### Option 3: Keep Empty Arrays and Just Re-seed New Users

If you want to keep existing users as-is:

1. Just add new users with proper data:
   ```bash
   DB_TYPE=mongodb node backend/scripts/seedUsers.js --count=50
   ```

2. The new users will have properly populated arrays
3. Old users will still have empty arrays (but the fix prevents new users from having this issue)

## Verifying the Fix

After re-seeding, test that matches work:

1. **Test the MongoDB insertion** (optional):
   ```bash
   DB_TYPE=mongodb node backend/scripts/testMongoDBInsert.js
   ```

2. **Start your server**:
   ```bash
   npm start
   ```

3. **Log in and check matches**:
   - Use credentials from `TEST_CREDENTIALS.md` (generated during seeding)
   - Navigate to the discover/matches page
   - You should now see matches based on shared movies, genres, and streaming services

## Understanding What Was Fixed

The bug was in `backend/models/User.js` where the `preferences` object initialization was using faulty logic. The old code:

```javascript
// OLD (BUGGY)
this.preferences = data.preferences || { /* default object */ }
```

This meant if `data.preferences` existed (even partially), it would use it as-is without applying defaults to missing nested properties.

The new code:

```javascript
// NEW (FIXED)
this.preferences = {
  genres: data.preferences?.genres || [],
  bingeWatchCount: data.preferences?.bingeWatchCount !== undefined ? data.preferences.bingeWatchCount : 0,
  // ... etc for each property
}
```

Now each nested property gets its own fallback value, ensuring arrays are never undefined.

## Need Help?

If you encounter issues:
1. Check that your `.env` file has the correct `MONGODB_URI`
2. Make sure `DB_TYPE=mongodb` is set
3. Verify your MongoDB Atlas cluster is running
4. Check the console output for any error messages

## Summary

- ✅ Bug fixed in User model
- ✅ Re-seed required for existing data
- ✅ New users will automatically have properly populated arrays
- ✅ Matches will work after re-seeding
