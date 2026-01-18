# Streaming Service Usage Tracking - User Guide

## Overview

Netflix and Chill now tracks your viewing habits across all your streaming services! See how much you watch, which services you use most, and get matched with people who have similar viewing patterns.

## What's New?

### 📊 Viewing Statistics Page

Access your personal viewing stats at: **viewing-stats.html**

You can also click the "📊 View Stats" button on your profile page when viewing your watch history.

### What You'll See

1. **Summary Cards**
   - Total watch time (in hours)
   - Number of watch sessions
   - Total episodes watched
   - Your viewing frequency badge

2. **Viewing Frequency**
   - **Daily** 🔴: You watch every day
   - **Frequent** 🟠: You watch 3+ times per week
   - **Weekly** 🔵: You watch 1-3 times per week
   - **Occasional** ⚫: You watch less than weekly
   - **Inactive** ⚫: No recent activity

3. **Service Breakdown**
   - See which services you use most
   - View watch time, sessions, and episodes per service
   - Progress bars show percentage of total viewing time
   - Last used date for each service

4. **Recent Activity**
   - See what you've watched in the last 7 days
   - Show titles, duration, and which service you watched on
   - Includes poster images

## How It Works

### Automatic Tracking

When you add content to your watch history through the profile page:

1. **Select the streaming service** from the dropdown
2. **Add duration** (optional) - how many minutes you watched
3. **Add number of episodes** - how many you watched in one session

The system automatically tracks:
- Total time you've spent watching on that service
- Number of times you've used that service
- When you last watched on that service
- Total episodes you've watched

### Manual Updates

You can also update service usage directly via the API if you want to import data from external sources.

## Better Matches

Your viewing habits now influence your match scores!

### Viewing Frequency Compatibility
- Users with similar viewing frequencies get higher match scores
- Daily watchers match better with other daily watchers
- Occasional watchers match better with other occasional watchers

### Active Service Compatibility
- If you and a potential match both actively use the same streaming services, you get bonus points
- "Active" means you've used the service in the last 30 days
- More actively shared services = better match

## Example: Adding Watch History

1. Go to your profile page
2. Navigate to the "Watch History" section
3. Search for the show/movie you watched
4. Select it from the results
5. Choose the type (movie, TV show, series)
6. **Select the streaming service** you watched it on
7. **Enter how many episodes** you watched (default: 1)
8. **Optionally, enter the duration** in minutes (e.g., 150 for 2.5 hours)
9. Click "Add to Watch History"

That's it! The system automatically updates your stats.

## Tips

- **Be consistent**: Try to always select the service when adding watch history for accurate stats
- **Add duration**: If you know how long you watched, add it for better metrics
- **Check regularly**: Visit your stats page to see how your viewing patterns change
- **Privacy**: Your detailed stats are only visible to you, but viewing patterns help find better matches

## Privacy & Data

- Only you can see your detailed viewing statistics
- Match scores consider patterns (frequency, active services) not specific shows
- Your watch history is used to calculate compatibility but isn't shared with other users
- You can always view, update, or remove items from your watch history

## Questions?

For technical details about the API, see: `docs/api/STREAMING_USAGE_API.md`

Happy watching and matching! 🎬❤️
