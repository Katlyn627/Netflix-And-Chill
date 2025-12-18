# Password Management and Photo Upload Guide

This guide explains how to update saved passwords and upload photos from your phone or computer to your Netflix and Chill profile.

## Table of Contents
1. [Updating Your Password](#updating-your-password)
2. [Forgot Password / Password Recovery](#forgot-password--password-recovery)
3. [Uploading Photos](#uploading-photos)
4. [Technical Details](#technical-details)

---

## Updating Your Password

### Steps to Change Your Password:

1. **Navigate to Your Profile**
   - Log in to your account
   - Go to your profile view page
   - Scroll down to the "Account Settings" section

2. **Open Password Change Dialog**
   - Click the "Change Password" button
   - A modal dialog will appear

3. **Enter Password Information**
   - **Current Password**: Enter your existing password
   - **New Password**: Enter your new password (minimum 6 characters)
   - **Confirm New Password**: Re-enter your new password to confirm

4. **Submit**
   - Click "Update Password"
   - You'll see a success message when the password is updated
   - The dialog will close automatically

### Password Requirements:
- Minimum 6 characters
- New password must match confirmation
- Must provide correct current password

### Tips:
- Use the "Show/Hide" button next to each password field to toggle visibility
- Make sure you remember your new password or store it securely
- If you forget your password, use the "Forgot Password" feature

---

## Forgot Password / Password Recovery

If you've forgotten your password, you can reset it using your email address.

### Steps to Reset Your Password:

1. **Access Forgot Password Page**
   - Go to the login page
   - Click "Forgot Password?" link
   - You'll be redirected to the password reset page

2. **Enter Your Information**
   - **Email Address**: Enter the email associated with your account
   - **New Password**: Enter your new password (minimum 6 characters)
   - **Confirm New Password**: Re-enter your new password

3. **Submit Reset Request**
   - Click "Reset Password"
   - If successful, you'll see a confirmation message with your User ID
   - You'll be automatically redirected to the login page after 3 seconds

4. **Login with New Password**
   - Use your User ID and new password to log in

### Important Notes:
- You need to know the email address you used when creating your account
- The system will return your User ID upon successful password reset
- Save your User ID in a secure place for future logins

---

## Uploading Photos

You can add photos to your profile gallery in two ways: by providing a URL or by uploading directly from your device.

### Method 1: Upload from Device (Phone/Computer)

This is the easiest method for most users.

1. **Navigate to Photo Gallery**
   - Go to your profile view page
   - Find the "Photo Gallery" section
   - Click "+ Add Photo" button

2. **Select File from Device**
   - In the upload form, locate "Or Upload from Device:"
   - Click "Choose File" button
   - Browse and select a photo from your device:
     - **On Computer**: Navigate through your folders to find the image
     - **On Phone**: Choose from your photo library or camera roll

3. **Supported Formats**
   - JPEG (.jpg, .jpeg)
   - PNG (.png)
   - GIF (.gif)
   - WebP (.webp)

4. **Size Limit**
   - Maximum file size: 5MB
   - If your photo is too large, resize it before uploading

5. **Upload**
   - After selecting your file, click "Add Photo"
   - Wait for the upload to complete
   - You'll see a success message
   - Your photo will appear in the gallery

### Method 2: Upload via URL

If you have a photo hosted online, you can add it by URL.

1. **Navigate to Photo Gallery**
   - Go to your profile view page
   - Find the "Photo Gallery" section
   - Click "+ Add Photo" button

2. **Enter Photo URL**
   - In the "Photo URL" field, paste the complete URL of your image
   - Example: `https://example.com/my-photo.jpg`
   - The URL must start with `http://` or `https://`

3. **Upload**
   - Click "Add Photo"
   - Your photo will be added to the gallery

### Photo Gallery Limits:
- **Maximum Photos**: 6 photos per profile
- Once you reach 6 photos, the "+ Add Photo" button will be hidden
- You can remove existing photos to make room for new ones

### Removing Photos:

1. **Locate the Photo**
   - Go to your profile's photo gallery
   - Find the photo you want to remove

2. **Delete**
   - Click the red "×" button in the top-right corner of the photo
   - Confirm the deletion
   - The photo will be removed immediately

### Tips for Best Results:
- Use clear, well-lit photos
- Recommended dimensions: 400x400 pixels or larger
- Photos are displayed as squares, so square images work best
- Compress large images before uploading to stay under the 5MB limit
- Use JPG format for photos with many colors
- Use PNG format for images with text or sharp edges

---

## Technical Details

### For Developers

#### Password Update API

**Endpoint**: `PUT /api/users/:userId/password`

**Request Body**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response** (Success):
```json
{
  "message": "Password updated successfully",
  "user": { ... }
}
```

**Error Responses**:
- `400`: Missing required fields or password too short
- `401`: Current password is incorrect
- `404`: User not found

#### Password Reset API

**Endpoint**: `POST /api/users/reset-password`

**Request Body**:
```json
{
  "email": "string",
  "newPassword": "string"
}
```

**Response** (Success):
```json
{
  "message": "Password reset successfully",
  "userId": "user_xxx"
}
```

**Error Responses**:
- `400`: Missing required fields or password too short
- `404`: User with email not found

#### Photo Upload API

**Endpoint**: `POST /api/users/:userId/photos`

**Request Body**:
```json
{
  "photoUrl": "string"
}
```

The `photoUrl` can be:
- An HTTP/HTTPS URL: `https://example.com/photo.jpg`
- A base64-encoded data URL: `data:image/png;base64,...`

**Supported Formats**:
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`

**Response** (Success):
```json
{
  "message": "Photo added to gallery successfully",
  "user": { ... }
}
```

**Error Responses**:
- `400`: Invalid URL/format, unsupported image type, or gallery full (6 photos max)
- `404`: User not found

#### Photo Removal API

**Endpoint**: `DELETE /api/users/:userId/photos`

**Request Body**:
```json
{
  "photoUrl": "string"
}
```

**Response** (Success):
```json
{
  "message": "Photo removed from gallery successfully",
  "user": { ... }
}
```

### Frontend Implementation

#### File Upload Process:

1. User selects a file via `<input type="file">`
2. Frontend validates file type and size
3. File is converted to base64 using `FileReader.readAsDataURL()`
4. Base64 data URL is sent to backend in `photoUrl` field
5. Backend validates the base64 format and saves it

#### Password Security Notes:

⚠️ **Important**: The current implementation stores passwords in plain text for demonstration purposes only.

**For Production Use**:
- Implement password hashing using bcrypt or similar
- Add password strength requirements
- Implement rate limiting on password reset endpoints
- Add email verification for password resets
- Consider implementing 2FA (two-factor authentication)

---

## Troubleshooting

### Password Issues

**Problem**: "Current password is incorrect"
- **Solution**: Make sure you're entering your current password correctly. Use the "Show" button to verify. If you've forgotten it, use the "Forgot Password" feature.

**Problem**: "New passwords do not match"
- **Solution**: Make sure the "New Password" and "Confirm New Password" fields contain exactly the same value.

**Problem**: "Password must be at least 6 characters long"
- **Solution**: Choose a longer password with at least 6 characters.

### Photo Upload Issues

**Problem**: "File size must be less than 5MB"
- **Solution**: Resize or compress your image before uploading. Use an online tool or photo editor to reduce the file size.

**Problem**: "Please select a valid image file"
- **Solution**: Make sure you're selecting a supported image format (JPEG, PNG, GIF, or WebP). Other formats like BMP or TIFF are not supported.

**Problem**: "Photo gallery is full"
- **Solution**: You can only have 6 photos. Remove an existing photo before adding a new one.

**Problem**: Upload button doesn't work
- **Solution**: Make sure you've either selected a file OR entered a URL, not both. Clear one field before trying the other method.

### General Issues

**Problem**: Changes don't appear
- **Solution**: Refresh the page. If the problem persists, clear your browser cache.

**Problem**: "User not found" error
- **Solution**: Verify you're logged in with the correct account. Check your User ID.

---

## Need Help?

If you encounter any issues not covered in this guide, please:
1. Check the main README.md for general setup instructions
2. Open an issue on the GitHub repository
3. Contact support with details about your problem

---

**Last Updated**: December 2024
