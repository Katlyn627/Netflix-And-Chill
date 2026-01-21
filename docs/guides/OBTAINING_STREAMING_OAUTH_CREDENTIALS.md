# How to Obtain OAuth Credentials for Streaming Services

## 🔐 Overview

This guide explains how to obtain OAuth client credentials (Client ID and Client Secret) for streaming service integrations in the Netflix and Chill app. These credentials enable features like automatic watch history syncing and account verification.

## ⚠️ Important Security Notice

**NEVER commit your actual credentials to version control!**

- ✅ Use `.env` file for your actual credentials (already in `.gitignore`)
- ✅ Use `.env.example` with placeholder values
- ❌ Never commit real Client IDs or Client Secrets to Git
- ❌ Never share your credentials publicly

### Example of CORRECT configuration:

**In `.env.example` (committed to Git):**
```bash
NETFLIX_CLIENT_ID=YOUR_NETFLIX_CLIENT_ID
NETFLIX_CLIENT_SECRET=YOUR_NETFLIX_CLIENT_SECRET
```

**In `.env` (NOT committed to Git):**
```bash
NETFLIX_CLIENT_ID=actual_client_id_here
NETFLIX_CLIENT_SECRET=actual_secret_key_here
```

---

## 🎬 Netflix OAuth Credentials

### Status: **Restricted Access**

Netflix does NOT offer public API access. Their APIs are restricted to enterprise partners and specific business agreements.

### How to Obtain Access:

#### Option 1: Netflix Partner Program (Enterprise Only)

1. **Eligibility Requirements:**
   - Established business entity
   - Valid business use case
   - Enterprise partnership agreement
   - Legal team to review contracts

2. **Application Process:**
   - Visit: https://partner.netflix.com/
   - Click "Become a Partner"
   - Fill out partnership application
   - Provide detailed business plan
   - Explain your integration use case
   - Wait for Netflix review (can take months)

3. **If Approved:**
   - You'll receive developer portal access
   - Access to API documentation
   - Client ID and Client Secret
   - OAuth endpoints and scopes

4. **Add to `.env`:**
   ```bash
   NETFLIX_OAUTH_ENABLED=true
   NETFLIX_CLIENT_ID=your_actual_netflix_client_id
   NETFLIX_CLIENT_SECRET=your_actual_netflix_client_secret
   NETFLIX_REDIRECT_URI=http://localhost:3000/api/auth/netflix/callback
   ```

#### Option 2: For Development/Testing

Since Netflix API access is not publicly available, for development purposes:

1. **Keep OAuth disabled:**
   ```bash
   NETFLIX_OAUTH_ENABLED=false
   ```

2. **Use manual service selection** instead (already implemented in the app)

3. **Use TMDB API** for Netflix content metadata:
   - See: [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md#1-tmdb-the-movie-database-api---required)

### Why Is Netflix API Restricted?

Netflix restricts their API to:
- Protect user privacy and viewing data
- Prevent unauthorized data scraping
- Maintain platform security
- Control business partnerships
- Comply with content licensing agreements

---

## 📺 Hulu OAuth Credentials

### Status: **Partner Access Only**

Hulu's API is restricted to advertising partners, content providers, and approved business partners.

### How to Obtain Access:

#### 1. Contact Hulu Advertising

1. **Visit:** https://www.hulu.com/advertising
2. **Click:** "Get in Touch" or "Contact Us"
3. **Provide:**
   - Business information
   - Use case description
   - Expected integration details
   - Contact information

#### 2. Hulu Developer Program (If Available)

1. Check for developer program: https://developer.hulu.com/ (availability varies)
2. Create account if available
3. Submit API access request
4. Wait for approval

#### 3. If Approved:

Add to `.env`:
```bash
HULU_OAUTH_ENABLED=true
HULU_CLIENT_ID=your_actual_hulu_client_id
HULU_CLIENT_SECRET=your_actual_hulu_client_secret
HULU_REDIRECT_URI=http://localhost:3000/api/auth/hulu/callback
```

#### Alternative for Development:

```bash
HULU_OAUTH_ENABLED=false
```
Use manual service selection instead.

---

## 🏰 Disney+ OAuth Credentials

### Status: **Not Publicly Available**

Disney+ does not currently offer a public API or OAuth system for third-party developers.

### Current Situation:

- **No public API:** Disney has not released public APIs for Disney+
- **No developer program:** No official developer access program exists
- **Restricted access:** Only internal Disney services have API access

### What You Can Do:

#### 1. Monitor for Future Access:

- Check Disney Developer portal periodically: https://developer.disney.com/
- Sign up for notifications if developer programs are announced
- Follow Disney technology blogs for API announcements

#### 2. For Development (Current Solution):

```bash
DISNEY_OAUTH_ENABLED=false
```

Use TMDB API for Disney+ content metadata:
- Search for Disney content via TMDB
- Display Disney+ as a streaming service option
- Allow manual service selection

#### 3. Configuration (If Future Access Becomes Available):

```bash
DISNEY_OAUTH_ENABLED=true
DISNEY_CLIENT_ID=your_future_disney_client_id
DISNEY_CLIENT_SECRET=your_future_disney_client_secret
DISNEY_REDIRECT_URI=http://localhost:3000/api/auth/disney/callback
```

---

## 📦 Amazon Prime Video OAuth Credentials

### Status: **Limited Availability via Amazon Developer Program**

Prime Video access requires Amazon Developer account and may have restrictions.

### How to Obtain Access:

#### 1. Create Amazon Developer Account

1. **Visit:** https://developer.amazon.com/
2. **Click:** "Sign In" or "Create Account"
3. **Complete registration:**
   - Provide email and password
   - Verify email address
   - Accept developer agreement

#### 2. Register Security Profile

1. **Navigate to:** Login with Amazon Console
2. **Click:** "Create a New Security Profile"
3. **Provide:**
   - **Security Profile Name:** "Netflix and Chill App"
   - **Security Profile Description:** "Dating app integration for Prime Video"
   - **Consent Privacy Notice URL:** Your privacy policy URL
   - **Consent Logo:** Your app logo (optional)

#### 3. Configure Web Settings

1. **Click** on your security profile
2. **Go to** "Web Settings" tab
3. **Click** "Edit"
4. **Add Allowed Return URLs:**
   ```
   http://localhost:3000/api/auth/prime/callback
   https://your-production-domain.com/api/auth/prime/callback
   ```
5. **Add Allowed JavaScript Origins:**
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
6. **Click** "Save"

#### 4. Get Your Credentials

1. Go to security profile overview
2. Copy **Client ID**
3. Click "Show Secret" to reveal **Client Secret**
4. Copy both values

#### 5. Add to `.env`:

```bash
PRIME_OAUTH_ENABLED=true
PRIME_CLIENT_ID=amzn1.application-oa2-client.XXXXXXXXXXXXXXXXXXXXXXXX
PRIME_CLIENT_SECRET=YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
PRIME_REDIRECT_URI=http://localhost:3000/api/auth/prime/callback
```

### Important Notes:

- **Login with Amazon** provides user authentication
- **Prime Video API access** may be limited or require additional approval
- Check current Amazon Developer documentation for Prime Video capabilities
- You may need to request additional permissions for viewing history

### Documentation:

- Login with Amazon: https://developer.amazon.com/docs/login-with-amazon/documentation-overview.html
- Amazon Appstore: https://developer.amazon.com/apps-and-games

---

## 🎭 HBO Max OAuth Credentials

### Status: **Restricted Access**

HBO Max (now part of Warner Bros. Discovery / Max) has restricted API access.

### How to Obtain Access:

#### 1. Contact Warner Bros. Discovery

Since HBO Max API is not publicly available:

1. **Business Inquiry:** Contact Warner Bros. Discovery business development
2. **Partnership Request:** Explain your integration use case
3. **Wait for Response:** They will evaluate partnership opportunities

#### 2. Check for Developer Programs

- Monitor: https://www.warnerbros.com/company/divisions
- Look for developer or partner programs
- Subscribe to technology/developer announcements

#### 3. If Access is Granted:

```bash
HBO_OAUTH_ENABLED=true
HBO_CLIENT_ID=your_hbo_client_id
HBO_CLIENT_SECRET=your_hbo_client_secret
HBO_REDIRECT_URI=http://localhost:3000/api/auth/hbo/callback
```

#### Current Solution:

```bash
HBO_OAUTH_ENABLED=false
```
Use manual service selection.

---

## 🍎 Apple TV+ OAuth Credentials

### Status: **Available via Apple Developer Program**

Apple TV+ uses "Sign in with Apple" which is available through the Apple Developer Program.

### How to Obtain Access:

#### 1. Enroll in Apple Developer Program

1. **Visit:** https://developer.apple.com/programs/
2. **Cost:** $99 USD per year
3. **Click:** "Enroll"
4. **Choose Account Type:**
   - **Individual:** Personal development
   - **Organization:** Business development (requires D-U-N-S number)
5. **Complete enrollment:**
   - Provide Apple ID
   - Accept agreements
   - Pay annual fee
   - Wait for approval (typically 24-48 hours)

#### 2. Create App ID

1. **Sign in to:** https://developer.apple.com/account/
2. **Go to:** "Certificates, Identifiers & Profiles"
3. **Click:** "Identifiers" > "+" button
4. **Select:** "App IDs"
5. **Configure:**
   - **Description:** "Netflix and Chill App"
   - **Bundle ID:** com.yourname.netflixandchill (Explicit)
   - **Capabilities:** Check "Sign in with Apple"
6. **Click:** "Continue" and "Register"

#### 3. Create Services ID

1. **Go to:** "Identifiers" > "+" button
2. **Select:** "Services IDs"
3. **Configure:**
   - **Description:** "Netflix and Chill Web Service"
   - **Identifier:** com.yourname.netflixandchill.service
4. **Click:** "Continue" and "Register"
5. **Configure Services ID:**
   - Check "Sign in with Apple"
   - Click "Configure"
   - **Domains and Subdomains:**
     ```
     localhost:3000
     your-production-domain.com
     ```
   - **Return URLs:**
     ```
     http://localhost:3000/api/auth/appletv/callback
     https://your-production-domain.com/api/auth/appletv/callback
     ```
6. **Save** and **Continue**

#### 4. Create Private Key

1. **Go to:** "Keys" > "+" button
2. **Configure:**
   - **Key Name:** "Apple TV+ Sign In Key"
   - Check "Sign in with Apple"
   - Click "Configure"
   - Select your Primary App ID
3. **Click:** "Continue" and "Register"
4. **Download** the `.p8` key file (you can only download once!)
5. **Note the Key ID** (shown on download page)

#### 5. Get Team ID

1. **Go to:** Apple Developer Account > Membership
2. **Copy your Team ID** (format: XXXXXXXXXX)

#### 6. Generate Client Secret

Apple requires a JWT token as the client secret. You can generate it using:

```javascript
// Node.js example using 'jsonwebtoken' package
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('AuthKey_XXXXXXXXXX.p8', 'utf8');

const clientSecret = jwt.sign(
  {},
  privateKey,
  {
    algorithm: 'ES256',
    expiresIn: '6m', // 6 months (maximum)
    audience: 'https://appleid.apple.com',
    issuer: 'YOUR_TEAM_ID', // Your Team ID
    subject: 'com.yourname.netflixandchill.service', // Your Services ID
    header: {
      kid: 'YOUR_KEY_ID', // Your Key ID
      alg: 'ES256'
    }
  }
);

console.log(clientSecret);
```

#### 7. Add to `.env`:

```bash
APPLETV_OAUTH_ENABLED=true
APPLETV_CLIENT_ID=com.yourname.netflixandchill.service
APPLETV_CLIENT_SECRET=eyJhbGciOiJFUzI1NiIsImtpZCI6IlhYWFhYWFhYWFgifQ...
APPLETV_REDIRECT_URI=http://localhost:3000/api/auth/appletv/callback
```

### Documentation:

- Sign in with Apple: https://developer.apple.com/sign-in-with-apple/
- Documentation: https://developer.apple.com/documentation/sign_in_with_apple

### Important Notes:

- Client secret (JWT) expires every 6 months (maximum)
- You'll need to regenerate the JWT token before expiry
- Private key file (.p8) can only be downloaded once - keep it secure!

---

## 🔒 Security Best Practices

### 1. Environment Variables

**Always use environment variables for secrets:**

```bash
# .env file (NEVER commit this)
NETFLIX_CLIENT_ID=actual_value
NETFLIX_CLIENT_SECRET=actual_secret
```

### 2. .gitignore Configuration

Verify your `.gitignore` includes:

```
.env
.env.local
.env.*.local
*.p8
*.pem
secrets/
credentials/
```

### 3. Separate Development and Production Credentials

- **Development:** Use separate OAuth apps/credentials
- **Production:** Different credentials with appropriate URLs
- **Never** use production credentials in development

### 4. Rotate Credentials Regularly

- Change credentials every 3-6 months
- Immediately rotate if compromised
- Keep track of expiration dates

### 5. Limit Scope and Permissions

- Only request necessary OAuth scopes
- Use read-only access when possible
- Follow principle of least privilege

### 6. Secure Credential Storage

- **Never** hardcode credentials in source code
- Use encrypted storage for production secrets
- Consider using secret management services:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
  - Google Cloud Secret Manager

### 7. Monitor for Exposed Secrets

Use tools to scan for accidentally committed secrets:
- `git-secrets`
- `truffleHog`
- GitHub Secret Scanning (automatic)

---

## 🛠️ Configuration Reference

### Complete .env Template

Copy this to your `.env` file and replace with actual values:

```bash
# ========================================
# Streaming Platform OAuth Configuration
# ========================================
# Connect with streaming platforms to sync watch history and viewing preferences
# Note: Most streaming platforms have restricted API access
# You must apply for developer access from each platform

# Base URL for OAuth callbacks (update in production)
BASE_URL=http://localhost:3000

# Netflix OAuth (Requires enterprise partnership)
NETFLIX_OAUTH_ENABLED=false
NETFLIX_CLIENT_ID=your_netflix_client_id_here
NETFLIX_CLIENT_SECRET=your_netflix_client_secret_here
NETFLIX_REDIRECT_URI=http://localhost:3000/api/auth/netflix/callback

# Hulu OAuth (Requires partner access)
HULU_OAUTH_ENABLED=false
HULU_CLIENT_ID=your_hulu_client_id_here
HULU_CLIENT_SECRET=your_hulu_client_secret_here
HULU_REDIRECT_URI=http://localhost:3000/api/auth/hulu/callback

# Disney+ OAuth (Not publicly available)
DISNEY_OAUTH_ENABLED=false
DISNEY_CLIENT_ID=your_disney_client_id_here
DISNEY_CLIENT_SECRET=your_disney_client_secret_here
DISNEY_REDIRECT_URI=http://localhost:3000/api/auth/disney/callback

# Amazon Prime Video OAuth (Available via Amazon Developer)
PRIME_OAUTH_ENABLED=false
PRIME_CLIENT_ID=your_prime_client_id_here
PRIME_CLIENT_SECRET=your_prime_client_secret_here
PRIME_REDIRECT_URI=http://localhost:3000/api/auth/prime/callback

# HBO Max OAuth (Restricted access)
HBO_OAUTH_ENABLED=false
HBO_CLIENT_ID=your_hbo_client_id_here
HBO_CLIENT_SECRET=your_hbo_client_secret_here
HBO_REDIRECT_URI=http://localhost:3000/api/auth/hbo/callback

# Apple TV+ OAuth (Requires Apple Developer Program - $99/year)
APPLETV_OAUTH_ENABLED=false
APPLETV_CLIENT_ID=your_appletv_services_id_here
APPLETV_CLIENT_SECRET=your_generated_jwt_token_here
APPLETV_REDIRECT_URI=http://localhost:3000/api/auth/appletv/callback
```

### Production Configuration

For production (Heroku, AWS, etc.), update BASE_URL and redirect URIs:

```bash
BASE_URL=https://your-app.herokuapp.com

NETFLIX_REDIRECT_URI=https://your-app.herokuapp.com/api/auth/netflix/callback
HULU_REDIRECT_URI=https://your-app.herokuapp.com/api/auth/hulu/callback
# ... update all redirect URIs
```

---

## 🚀 Testing Your OAuth Configuration

### 1. Check if OAuth is Enabled

```bash
curl http://localhost:3000/api/auth/providers
```

Should return list of enabled providers:
```json
{
  "providers": [
    {
      "id": "prime",
      "name": "Amazon Prime Video",
      "enabled": true
    }
  ],
  "count": 1
}
```

### 2. Test OAuth Flow

1. Start the application: `npm start`
2. Navigate to: `http://localhost:3000/streaming-services.html?userId=test_user`
3. Click "Connect" on an enabled provider
4. Should redirect to provider's login page
5. After authorization, redirects back to app

### 3. Verify Connection Status

```bash
curl "http://localhost:3000/api/auth/prime/status?userId=test_user"
```

Should return connection status:
```json
{
  "provider": "prime",
  "connected": true,
  "connectedAt": "2026-01-21T07:00:00Z",
  "expiresAt": "2026-01-21T08:00:00Z",
  "expired": false
}
```

---

## 📋 Troubleshooting

### "OAuth provider not configured"

**Cause:** OAuth is not enabled or credentials are missing

**Solution:**
1. Check `.env` file exists
2. Verify `PROVIDER_OAUTH_ENABLED=true`
3. Ensure Client ID and Secret are set
4. Restart the application

### "Invalid redirect_uri"

**Cause:** Redirect URI mismatch

**Solution:**
1. Check redirect URI in `.env` matches exactly with provider settings
2. Include protocol (http:// or https://)
3. No trailing slashes (unless provider requires it)
4. Update in both `.env` and provider's developer console

### "Invalid client_id or client_secret"

**Cause:** Incorrect credentials

**Solution:**
1. Double-check credentials in provider's developer console
2. Ensure no extra spaces or characters
3. Regenerate credentials if necessary
4. Update `.env` file with new values

### OAuth Flow Redirects to Error Page

**Cause:** Various issues with OAuth configuration

**Solution:**
1. Check browser console for error messages
2. Verify state token hasn't expired (10-minute limit)
3. Ensure cookies are enabled
4. Check CORS configuration
5. Review server logs for detailed errors

---

## 🎯 Quick Start Summary

### For Most Users:

**Since most streaming services don't offer public API access:**

1. Keep all OAuth disabled:
   ```bash
   NETFLIX_OAUTH_ENABLED=false
   HULU_OAUTH_ENABLED=false
   DISNEY_OAUTH_ENABLED=false
   # ... etc
   ```

2. Use **manual service selection** (already implemented and working)

3. Use **TMDB API** for content metadata (see API_KEYS_GUIDE.md)

### If You Have API Access:

1. **Amazon Prime Video:** Most accessible option
   - Follow Amazon Developer setup above
   - Free to start, just needs Amazon account

2. **Apple TV+:** Available but requires paid developer account
   - $99/year Apple Developer Program
   - Follow Apple TV+ setup above

3. **Others:** Contact providers for partnership opportunities

---

## 📚 Additional Resources

- [API Keys Guide](./API_KEYS_GUIDE.md) - Complete guide for all API keys
- [Streaming Services Guide](./STREAMING_SERVICES_GUIDE.md) - User guide for streaming features
- [OAuth Connection Guide](../../OAUTH_CONNECTION_GUIDE.md) - Technical OAuth flow documentation
- [Security Guide](../security/) - Application security best practices

---

## 💡 Alternative Approaches

Since OAuth access is restricted for most platforms, consider these alternatives:

### 1. Manual Service Selection (Implemented)
- Users select which services they use
- No API access required
- Works immediately
- Good for matching algorithm

### 2. Manual Watch History Entry (Implemented)
- Users manually add shows/movies they've watched
- No API access required
- User maintains control

### 3. Browser Extension (Future Feature)
- Captures watch history as users browse
- Works without official API access
- Privacy-friendly (data stays with user)

### 4. Email Parsing (Future Feature)
- Parse viewing confirmation emails
- Some services send watch notifications
- Can extract viewing data

### 5. CSV Import (Future Feature)
- Users download their data from streaming services
- Upload to your app
- Bulk import capability

---

## 🤝 Need Help?

If you have questions or run into issues:

1. Check the troubleshooting section above
2. Review the [API Keys Guide](./API_KEYS_GUIDE.md)
3. Review the [Streaming Services Guide](./STREAMING_SERVICES_GUIDE.md)
4. Check provider's documentation
5. Open an issue on GitHub
6. Contact support

---

**Last Updated:** January 2026

**Note:** Streaming platform APIs and access requirements change frequently. Always check the provider's current documentation for the most up-to-date information.
