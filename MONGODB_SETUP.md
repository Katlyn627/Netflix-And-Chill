# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas and connect it to your Netflix and Chill application.

## Prerequisites

- A MongoDB Atlas account (free tier available)
- Internet connection

## Step-by-Step Setup

### 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign In" if you already have an account
3. Create a new account or log in with existing credentials

### 2. Create a New Cluster

1. Once logged in, you'll see the Atlas dashboard
2. Click **"Build a Database"** or **"Create"** button
3. Choose the **FREE** tier (M0 Sandbox)
   - Select your cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region close to your location
   - Click **"Create Cluster"**
4. Wait a few minutes for your cluster to be created

### 3. Create Database User

1. In the left sidebar, click **"Database Access"** (under Security)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter a username (e.g., `netflixuser`)
5. Click **"Autogenerate Secure Password"** or enter your own password
   - **IMPORTANT:** Copy and save this password - you'll need it later!
6. Under "Database User Privileges", select **"Read and write to any database"**
7. Click **"Add User"**

### 4. Configure Network Access

1. In the left sidebar, click **"Network Access"** (under Security)
2. Click **"Add IP Address"**
3. For development, you can:
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - OR enter your specific IP address
4. Click **"Confirm"**

### 5. Get Your Connection String

1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select:
   - Driver: **Node.js**
   - Version: **4.1 or later** (or latest)
5. Copy the connection string - it will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Configure Your Application

1. Open the `.env` file in the root of your project
2. Find the `MONGODB_URI` line
3. Replace the placeholder with your actual connection string:
   - Replace `<username>` with your database username (from Step 3)
   - Replace `<password>` with your database password (from Step 3)
   - Replace `<cluster-url>` with your actual cluster URL (e.g., `cluster0.abcde.mongodb.net`)
   - Add `/netflix-and-chill` after the cluster URL to specify the database name

**Example:**
```env
# Before (template)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/netflix-and-chill?retryWrites=true&w=majority

# After (with your actual credentials)
MONGODB_URI=mongodb+srv://netflixuser:MySecurePass123@cluster0.abcde.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
```

### 7. Test the Connection

Run the seeder script to test your MongoDB connection:

```bash
npm run seed:mongodb
```

If everything is configured correctly, you should see:
```
✅ Database connected
```

And the seeder will populate your MongoDB with 100 fake users!

## Troubleshooting

### Error: "querySrv ENOTFOUND"

This error means the connection string is incorrect or contains placeholders.

**Solution:**
- Make sure you replaced `<username>`, `<password>`, and `<cluster-url>` with your actual values
- Check that there are no spaces or extra characters in the connection string
- Verify your cluster URL is correct in MongoDB Atlas

### Error: "Authentication failed"

**Solution:**
- Double-check your username and password
- Make sure you're using the database user credentials (not your Atlas account credentials)
- Password may contain special characters - try URL-encoding them

### Error: "IP not whitelisted"

**Solution:**
- Go to Network Access in MongoDB Atlas
- Add your current IP address or allow access from anywhere (0.0.0.0/0)

### Connection Timeout

**Solution:**
- Check your internet connection
- Verify Network Access settings in MongoDB Atlas
- Try a different region for your cluster

## Viewing Your Data

1. In MongoDB Atlas, click **"Browse Collections"** on your cluster
2. Select the `netflix-and-chill` database
3. You'll see collections for:
   - `users` - All user profiles
   - `matches` - Match data
   - `likes` - Like/super like data

## Next Steps

Once your MongoDB is connected and seeded:

1. Start the server:
   ```bash
   npm start
   ```

2. Open the app in your browser: `http://localhost:3000`

3. Check `TEST_CREDENTIALS.md` for user login information

4. All users have password: `password123`

## Security Best Practices

- **Never commit your `.env` file** to Git (it's already in `.gitignore`)
- **Use strong passwords** for database users
- **Restrict IP access** in production environments
- **Rotate credentials** regularly
- **Use environment variables** for different environments (dev, staging, production)

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver Docs](https://www.mongodb.com/docs/drivers/node/)
- [Connection String URI Format](https://www.mongodb.com/docs/manual/reference/connection-string/)

---

**Questions?** Check the [main README](README.md) or open an issue on GitHub.
