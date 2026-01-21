# Auth0 MFA Troubleshooting Guide

## Error: "invalid_request: No MFA factors enabled for enrollment"

This error occurs when Auth0 is configured to require Multi-Factor Authentication (MFA), but no MFA factors are actually enabled in your Auth0 tenant. This is a **configuration issue in your Auth0 dashboard**, not a code problem.

---

## Understanding the Error

When you see this error, it means:
- Auth0's authentication profile is set to require or allow MFA enrollment
- BUT: No MFA factors (SMS, OTP, Email, etc.) are enabled in your tenant
- Users cannot complete the MFA enrollment step because there's nothing to enroll in

---

## Quick Fix (Step-by-Step)

### Option 1: Disable MFA (Recommended for Development)

If you don't need MFA for your application:

1. **Log in to Auth0 Dashboard**
   - Go to https://manage.auth0.com/dashboard

2. **Navigate to MFA Settings**
   - Click **Security** in the left sidebar
   - Click **Multi-factor Auth**

3. **Disable MFA**
   - Set "Require Multi-factor Auth" to **"Never"**
   - Click **Save**

4. **Update Authentication Profile**
   - Click **Authentication** in the left sidebar
   - Click **Authentication Profile**
   - Select **"Identifier + Password"** (even if already selected)
   - Click **Save**
   - This resets the authentication profile and clears any stale MFA settings

5. **Test Login**
   - Try logging in again - the error should be gone

---

### Option 2: Enable MFA Properly (For Production)

If you want to use MFA:

1. **Log in to Auth0 Dashboard**
   - Go to https://manage.auth0.com/dashboard

2. **Navigate to MFA Settings**
   - Click **Security** in the left sidebar
   - Click **Multi-factor Auth**

3. **Enable at least one MFA factor**
   - Enable **One-time Password** (recommended - uses Google Authenticator, Authy, etc.)
   - OR enable **SMS** (requires Twilio setup)
   - OR enable **Email** (simplest option)
   - Click **Save**

4. **Configure MFA Policy**
   - Set "Require Multi-factor Auth" to:
     - **"Always"** - All users must use MFA
     - **"Adaptive"** - Auth0 decides based on risk
     - **"Optional"** - Users can choose to enable MFA

5. **Update Authentication Profile**
   - Click **Authentication** in the left sidebar
   - Click **Authentication Profile**
   - Select **"Identifier + Password"**
   - Click **Save**

6. **Test Login**
   - Try logging in - you should now be prompted to set up MFA
   - Follow the prompts to enroll in your chosen factor

---

## Advanced Troubleshooting

### Check for MFA-Enforcing Rules or Actions

Sometimes custom code forces MFA even when you don't intend it:

1. **Go to Actions**
   - Click **Actions** in the left sidebar
   - Click **Flows**
   - Check **Login** flow

2. **Look for MFA enforcement**
   - Review any Actions in your Login flow
   - Look for code like:
     ```javascript
     api.multifactor.enable('any');
     api.authentication.challengeWith({ type: 'mfa' });
     ```
   - If you don't want MFA, remove or disable these Actions

3. **Check Legacy Rules**
   - Click **Auth Pipeline** > **Rules** (if you have legacy rules)
   - Look for rules that call `context.multifactor`
   - Disable or remove these rules if not needed

---

### Reset Universal Login Settings

Sometimes the Universal Login page gets out of sync:

1. **Go to Branding**
   - Click **Branding** in the left sidebar
   - Click **Universal Login**

2. **Reset the Login Page**
   - Click the **Advanced Options** tab
   - Click the **Login** tab
   - If you have a custom login page enabled:
     - Toggle it **OFF**
     - Click **Save**
     - Toggle it back **ON** (if you need custom login)
     - Click **Save**

3. **Test Login Again**

---

### Check Application Grant Types

1. **Go to Applications**
   - Click **Applications** > **Applications**
   - Select your application

2. **Check Grant Types**
   - Scroll to **Advanced Settings**
   - Click the **Grant Types** tab
   - Ensure you don't have MFA-specific grants checked unless you need them
   - Standard grants for Single Page Application:
     - ✅ **Authorization Code**
     - ✅ **Refresh Token**
     - ❌ **MFA** (uncheck unless specifically needed)

---

## Verification Steps

After making changes:

1. **Clear Browser Cache**
   - Clear cookies and cache for localhost or your domain
   - This ensures old Auth0 sessions are cleared

2. **Test Login Flow**
   - Go to your login page
   - Click "Login with Auth0"
   - You should NOT see the MFA error anymore

3. **Check Logs**
   - In Auth0 Dashboard, go to **Monitoring** > **Logs**
   - Look for any failed login attempts
   - Check for detailed error messages

---

## Common Scenarios

### Scenario 1: Just Started Development
**Problem**: Brand new Auth0 tenant, immediately get MFA error

**Solution**:
- Auth0 may have MFA enabled by default in new tenants
- Follow **Option 1: Disable MFA** above
- This is the quickest fix for development

---

### Scenario 2: Worked Before, Broken Now
**Problem**: Auth0 login worked before, suddenly getting MFA error

**Likely Cause**:
- Someone enabled MFA in dashboard but didn't enable any factors
- An Action or Rule was added that triggers MFA
- Auth0 tenant settings were changed

**Solution**:
1. Check **Security > Multi-factor Auth** - verify settings
2. Check **Actions > Flows** - look for new Actions
3. Update Authentication Profile (see Option 1, step 4)

---

### Scenario 3: Want MFA for Some Users Only
**Problem**: Want MFA for certain users/roles, not everyone

**Solution**:
1. Enable MFA factors (Option 2, step 3)
2. Set "Require Multi-factor Auth" to **"Never"**
3. Create an Action in the Login flow:
   ```javascript
   exports.onExecutePostLogin = async (event, api) => {
     // Only require MFA for admin users
     if (event.user.app_metadata && event.user.app_metadata.role === 'admin') {
       api.multifactor.enable('any');
     }
   };
   ```
4. This way, only specific users are prompted for MFA

---

## Still Having Issues?

### Debug Checklist
- [ ] Verified MFA settings: **Security > Multi-factor Auth**
- [ ] At least one MFA factor enabled (if using MFA)
- [ ] OR MFA set to "Never" (if not using MFA)
- [ ] Updated Authentication Profile: **Authentication > Authentication Profile**
- [ ] Checked Actions/Rules for MFA enforcement
- [ ] Cleared browser cache and cookies
- [ ] Checked Auth0 Logs for detailed errors

### Get More Help
- Check [Auth0 Community Forums](https://community.auth0.com/)
- Review [Auth0 MFA Documentation](https://auth0.com/docs/secure/multi-factor-authentication)
- See our [AUTH0_SETUP_GUIDE.md](AUTH0_SETUP_GUIDE.md) for general Auth0 setup

---

## Summary

✅ **The Fix**: This error is **always** a configuration issue in your Auth0 dashboard, never a code problem

✅ **For Development**: Disable MFA completely (Option 1)

✅ **For Production**: Enable at least one MFA factor before requiring MFA (Option 2)

✅ **Remember**: Always update your Authentication Profile after changing MFA settings

---

**Last Updated**: January 2026  
**Related Docs**: 
- [AUTH0_SETUP_GUIDE.md](AUTH0_SETUP_GUIDE.md)
- [AUTH0_ERRORS_QUICK_FIX.md](AUTH0_ERRORS_QUICK_FIX.md)
