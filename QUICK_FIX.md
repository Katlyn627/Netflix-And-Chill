# Quick Fix for MongoDB Connection

## The Problem

You're getting `ECONNREFUSED localhost:27017` error because:
- Your `.env` file either doesn't exist or doesn't have the MongoDB Atlas URI
- The application is using the default `localhost:27017` instead

## The Solution

### Option 1: Quick Fix (Copy and Paste)

1. **Create or edit the `.env` file** in the root of your project:
   ```
   C:\Users\katly\OneDrive\Documents\GitHub\Netflix-And-Chill\.env
   ```

2. **Add this content** (copy everything below):
   ```env
   # Database Configuration
   DB_TYPE=mongodb

   # MongoDB Atlas Connection String
   MONGODB_URI=mongodb+srv://katlynboches_db_user:rtZPzfsrDNMSQ4mQ@cluster0.ipameo2.mongodb.net/netflix-and-chill?retryWrites=true&w=majority&appName=Cluster0
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # TMDB API Key (optional)
   TMDB_API_KEY=
   ```

3. **Save the file** and run the seeder again:
   ```bash
   npm run seed
   ```

### Option 2: Using PowerShell (Automated)

Open PowerShell in your project directory and run:

```powershell
@"
# Database Configuration
DB_TYPE=mongodb

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://katlynboches_db_user:rtZPzfsrDNMSQ4mQ@cluster0.ipameo2.mongodb.net/netflix-and-chill?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=3000
NODE_ENV=development

# TMDB API Key (optional)
TMDB_API_KEY=
"@ | Out-File -FilePath .env -Encoding utf8
```

Then run:
```bash
npm run seed
```

### Option 3: Using the Example File

If you pulled the latest code, run:

```bash
copy .env.mongodb.example .env
```

Then edit `.env` to use the MongoDB Atlas credentials instead of placeholders.

## Verify It's Working

After creating the `.env` file, you should see the correct URI being loaded. Run:

```bash
npm run seed
```

You should see:
```
✅ Database connected
```

Instead of the `ECONNREFUSED` error.

## If You Still Have Issues

1. **Check the `.env` file exists**:
   ```bash
   dir .env
   ```

2. **Check its contents**:
   ```bash
   type .env
   ```

3. **Make sure there are no extra spaces** before or after the `MONGODB_URI=` line

4. **Restart your terminal** after creating the `.env` file

## Network Issues?

If you're still having connection issues after fixing the `.env` file:

1. **Check MongoDB Atlas Network Access**:
   - Log into https://cloud.mongodb.com
   - Go to "Network Access"
   - Make sure your IP address is whitelisted (or use `0.0.0.0/0` for testing)

2. **Check if the cluster is active**:
   - The cluster might be paused
   - Resume it in the MongoDB Atlas dashboard

3. **Use the file-based database** as a fallback:
   Edit `.env` and change:
   ```
   DB_TYPE=file
   ```
