# Streaming Services Setup & Login Guide

## 📺 How to Connect Your Streaming Services

This guide provides **step-by-step instructions** on how to sign into and connect all of your streaming services within the Netflix and Chill app, so your watch history can be used for better matches.

---

## 🎯 Overview

The Netflix and Chill app supports **two ways** to connect your streaming services:

1. **OAuth Login (Automatic)** - Sign in directly with your streaming account (when configured)
2. **Manual Selection (Available Now)** - Select services you use manually

Both methods help improve your match compatibility by showing which platforms you use. OAuth additionally syncs your watch history automatically.

---

## 📋 Step-by-Step Guide: Connecting Streaming Services

### Step 1: Access Your Profile

1. Log into the Netflix and Chill app
2. Click on your **Profile** or **Settings** icon
3. Navigate to your profile page (`profile-view.html`)

### Step 2: Open Streaming Services Manager

1. On your profile page, scroll to the **"Streaming Services"** section
2. Click the **"Update Streaming Services"** button
3. You will be redirected to the Streaming Services Management page (`streaming-services.html`)

### Step 3: Choose Your Connection Method

The Streaming Services page has two sections:

#### **Option A: OAuth Connection (If Available)** 🔐

If you see the "Connect with OAuth" section:

1. **Browse Available Services**: Services with OAuth enabled will appear at the top
   - Netflix
   - Hulu
   - Disney+
   - Amazon Prime Video
   - HBO Max
   - Apple TV+

2. **Click "Connect" Button**: 
   - Click the red "Connect" button next to the service
   - You'll be redirected to the streaming service's login page

3. **Sign In with Your Account**:
   - Enter your streaming service username/password
   - Grant permission for Netflix and Chill to access your data
   - Review the permissions requested

4. **Authorization Complete**:
   - You'll be redirected back to Netflix and Chill
   - The service will now show as "Connected" with a green checkmark
   - Your watch history will automatically sync

5. **Repeat for Other Services**:
   - Connect as many streaming services as you use
   - Each service connection is independent

#### **Option B: Manual Selection (Always Available)** ✓

The manual selection section always appears:

1. **Browse All Services**: Scroll through the grid of available streaming services
   - Netflix
   - Hulu
   - Disney+
   - Amazon Prime Video
   - HBO Max
   - Apple TV+
   - Paramount+
   - Peacock
   - Showtime
   - Starz
   - And more...

2. **Select Your Services**:
   - Click on each service you currently subscribe to
   - Selected services will show a checkmark and highlight
   - Click again to deselect

3. **Save Your Selections**:
   - Click the **"Save Selected Services"** button at the bottom
   - Your services will be saved to your profile
   - You'll be redirected back to your profile page

### Step 4: View Your Connected Services

1. Return to your profile page
2. Scroll to the **"Streaming Services"** section
3. You'll see all your connected services displayed with logos
4. Services connected via OAuth will show additional sync information

---

## 🔄 How Watch History Syncing Works

### Automatic Sync (OAuth Connected Services)

When you connect a service via OAuth:

1. **Initial Sync**: Your watch history is automatically imported during connection
2. **Data Imported**:
   - Movies and TV shows you've watched
   - Watch dates and times
   - Episode counts for TV series
   - Viewing duration

3. **Match Benefits**:
   - Better match compatibility scores
   - Find users who watched the same content
   - Recommendations based on viewing patterns

### Manual Watch History Entry

If OAuth isn't available:

1. Go to your profile page
2. Scroll to the **"Watch History"** section
3. Click **"Add to Watch History"**
4. Search for and select content you've watched
5. Specify the service you watched it on
6. Save the entry

---

## 🔓 Managing Your Connections

### Disconnecting a Service

To disconnect an OAuth-connected service:

1. Go to Streaming Services page (`streaming-services.html?userId=YOUR_ID`)
2. Find the connected service (shows "Connected" status)
3. Click the **"Disconnect"** button
4. Confirm the disconnection
5. The service will be removed from your profile
6. Your watch history data remains but won't sync updates

### Removing Manually Selected Services

To remove a manually selected service:

1. Go to Streaming Services page
2. Click on the selected service (has checkmark)
3. It will be deselected
4. Click **"Save Selected Services"** to apply changes

### Re-syncing Watch History

To manually sync watch history from an OAuth service:

1. Ensure the service is connected
2. Use the API endpoint: `/api/auth/{provider}/sync-history`
3. Or disconnect and reconnect the service

---

## 🚨 Important Notes About OAuth Access

### Why OAuth Might Not Be Available

Most streaming platforms have **highly restricted API access**:

- **Netflix**: Enterprise partnership required
- **Hulu**: Advertiser/partner access only
- **Disney+**: No public API available
- **Prime Video**: Limited via Amazon Developer Program
- **HBO Max**: Restricted access
- **Apple TV+**: Requires Apple Developer Program

### What This Means

1. **Default Behavior**: Most users will use manual selection
2. **OAuth Benefits**: If you have API access, OAuth provides automatic syncing
3. **Match Quality**: Manual selection still provides excellent matching

---

## 🔧 Alternative Approaches

Since most streaming platforms restrict API access, consider these alternatives:

### 1. Browser Extension (Future Feature)
- Install a browser extension
- Automatically capture watch history while you browse
- Sync data to Netflix and Chill

### 2. Email Parsing (Future Feature)
- Forward viewing confirmation emails
- Parse watch history from email data
- Import to your profile

### 3. Manual CSV Import (Future Feature)
- Download watch history from streaming platform
- Upload CSV file to Netflix and Chill
- Bulk import watch data

### 4. Regular Manual Updates
- Periodically update your watch history manually
- Takes 2-3 minutes per week
- Still provides great matching results

---

## 📱 Complete User Workflow

Here's the **complete end-to-end process**:

### First Time Setup

```
1. Create Account → 2. Complete Profile → 3. Connect Streaming Services
     ↓                       ↓                            ↓
Login Page          Profile Setup              Streaming Services Page
(login.html)        (profile.html)            (streaming-services.html)
```

### Streaming Services Connection Flow

```
Profile Page → Click "Update Streaming Services" → Streaming Services Page
                                                              ↓
                                               ┌──────────────┴──────────────┐
                                               ↓                             ↓
                                        OAuth Section                  Manual Section
                                        (if enabled)                  (always available)
                                               ↓                             ↓
                                    Click "Connect" Button          Click on Service Logo
                                               ↓                             ↓
                                    Redirect to Service           Service Gets Checkmark
                                               ↓                             ↓
                                    Login with Credentials         Click "Save Services"
                                               ↓                             ↓
                                    Grant Permissions                  Profile Updated
                                               ↓                             ↓
                                    Redirect Back                     Services Displayed
                                               ↓                             ↓
                                    Auto-Sync History              Manual History Entry
                                               ↓                             ↓
                                    Profile Updated                 Profile Updated
```

### Using Your Connected Services

```
Connected Services → Better Matches → View Shared Content → Start Conversations
        ↓                   ↓                  ↓                      ↓
Displayed on Profile   Match Algorithm    See What You Have      Chat About Shows
                       Uses Your Services   in Common
```

---

## 🎨 Visual Flow Diagram

### OAuth Connection Flow

```
┌─────────────────┐
│  Profile Page   │
│  (Your Profile) │
└────────┬────────┘
         │ Click "Update Streaming Services"
         ↓
┌─────────────────────────────┐
│  Streaming Services Page    │
│  ┌─────────────────────┐   │
│  │ OAuth Services      │   │
│  │ - Netflix           │   │
│  │ - Hulu              │   │
│  │ - Disney+           │   │
│  │ - Prime Video       │   │
│  │ - HBO Max           │   │
│  │ - Apple TV+         │   │
│  └─────────────────────┘   │
└───────────┬─────────────────┘
            │ Click "Connect" on Netflix
            ↓
┌─────────────────────────────┐
│  Netflix Login Page         │
│  (netflix.com/login)        │
│                             │
│  Email: [________]          │
│  Password: [________]       │
│  [Sign In]                  │
└───────────┬─────────────────┘
            │ Successful Login
            ↓
┌─────────────────────────────┐
│  Permission Request         │
│                             │
│  Netflix and Chill wants to:│
│  ✓ View your watch history  │
│  ✓ View your profile        │
│                             │
│  [Deny]  [Allow]           │
└───────────┬─────────────────┘
            │ Click "Allow"
            ↓
┌─────────────────────────────┐
│  Streaming Services Page    │
│  ┌─────────────────────┐   │
│  │ ✅ Netflix          │   │
│  │    Connected        │   │
│  │    [Disconnect]     │   │
│  └─────────────────────┘   │
│                             │
│  Success! Netflix connected │
│  Watch history synced: 127  │
└───────────┬─────────────────┘
            │ Automatic Redirect
            ↓
┌─────────────────────────────┐
│  Your Profile               │
│                             │
│  Streaming Services:        │
│  🎬 Netflix ✓              │
│                             │
│  Watch History:             │
│  - Stranger Things          │
│  - The Crown                │
│  - Breaking Bad             │
│  + 124 more                 │
└─────────────────────────────┘
```

### Manual Selection Flow

```
┌─────────────────┐
│  Profile Page   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│  Streaming Services Page    │
│  ┌─────────────────────┐   │
│  │ Select Your Services│   │
│  │                     │   │
│  │ [ ] Netflix         │   │
│  │ [ ] Hulu            │   │
│  │ [ ] Disney+         │   │
│  │ [ ] Prime Video     │   │
│  └─────────────────────┘   │
└───────────┬─────────────────┘
            │ Click on Netflix, Hulu, Disney+
            ↓
┌─────────────────────────────┐
│  Streaming Services Page    │
│  ┌─────────────────────┐   │
│  │ Select Your Services│   │
│  │                     │   │
│  │ [✓] Netflix         │   │
│  │ [✓] Hulu            │   │
│  │ [✓] Disney+         │   │
│  │ [ ] Prime Video     │   │
│  └─────────────────────┘   │
│                             │
│  [Save Selected Services]  │
└───────────┬─────────────────┘
            │ Click "Save"
            ↓
┌─────────────────────────────┐
│  Your Profile               │
│                             │
│  Streaming Services:        │
│  🎬 Netflix                │
│  📺 Hulu                   │
│  🏰 Disney+                │
└─────────────────────────────┘
```

---

## 🔍 How Services Are Used for Matching

Your connected services improve matches in several ways:

### 1. Shared Services (10 points per service)
```javascript
// You use: Netflix, Hulu, Disney+
// Match uses: Netflix, Disney+, HBO Max
// Shared: Netflix, Disney+ = 20 points
```

### 2. Shared Watch History (20 points per shared item)
```javascript
// You watched: Stranger Things, The Crown, Breaking Bad
// Match watched: Stranger Things, Breaking Bad, The Office
// Shared: Stranger Things, Breaking Bad = 40 points
```

### 3. Viewing Frequency Match (12 points max)
```javascript
// You: Daily viewer
// Match: Daily viewer
// Same frequency = 12 points
```

### 4. Total Match Score
```javascript
Total Score = Shared Services + Shared History + Frequency + Other Factors
            = 20 + 40 + 12 + ...
            = Normalized to 0-100
```

---

## 📊 Data Privacy & Security

### What Data Is Collected

**OAuth Connected Services:**
- Watch history (titles, dates, episodes)
- Viewing preferences
- Profile information (if available)

**Manual Selection:**
- Which services you subscribe to
- No watch history unless manually added

### Data Security

- OAuth tokens are encrypted and stored securely
- Data is never shared with third parties
- You can disconnect services anytime
- Watch history remains private to your profile

### Data Usage

Your streaming data is used to:
- Calculate match compatibility scores
- Show shared interests with matches
- Provide personalized recommendations
- Display your profile information

---

## ❓ Troubleshooting

### Service Won't Connect

**Problem**: Clicking "Connect" doesn't work

**Solutions**:
1. Check if OAuth is enabled for that service
2. Verify environment variables are configured
3. Ensure you have developer API access
4. Try manual selection instead

### Watch History Not Syncing

**Problem**: OAuth connected but no watch history

**Solutions**:
1. Disconnect and reconnect the service
2. Check token expiration status
3. Use manual sync endpoint
4. Add history manually as workaround

### Services Not Saving

**Problem**: Manual selections don't save

**Solutions**:
1. Ensure you clicked "Save Selected Services"
2. Check browser console for errors
3. Verify you're logged in
4. Try refreshing the page

### Can't See OAuth Option

**Problem**: Only manual selection is available

**Solution**: This is expected! Most streaming platforms don't provide public API access. Manual selection works great for matching.

---

## 🚀 Getting Started Checklist

Use this checklist for your first setup:

- [ ] Create your Netflix and Chill account
- [ ] Complete your basic profile information
- [ ] Navigate to profile page
- [ ] Click "Update Streaming Services"
- [ ] Try OAuth connection (if available)
- [ ] Or select services manually
- [ ] Save your selections
- [ ] Add watch history manually (optional)
- [ ] Start finding matches!

---

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review the API Keys Guide: `docs/guides/API_KEYS_GUIDE.md`
3. Check Streaming Services Guide: `docs/guides/STREAMING_SERVICES_GUIDE.md`
4. Open an issue on GitHub
5. Contact support

---

## 🎯 Summary

**What You Need to Know:**

1. **Two Methods**: OAuth (automatic) or Manual (always works)
2. **How to Connect**: Profile → Update Services → Select/Connect → Save
3. **Watch History**: Syncs automatically with OAuth, manual entry otherwise
4. **Matching**: Your services improve match quality significantly
5. **Privacy**: Your data is secure and used only for matching

**Quick Start:**
1. Go to your profile
2. Click "Update Streaming Services"
3. Select the services you use
4. Click "Save Selected Services"
5. Done! Start matching!

---

**Next Steps:**
- Add your watch history for even better matches
- Complete your profile preferences
- Start swiping to find compatible matches
- Chat with users who share your streaming interests!

Happy streaming! 🎬❤️
