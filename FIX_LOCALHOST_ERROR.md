# Fix: localhost:27017 Connection Error

## The Problem

If you see this error:
```
ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

It means your `.env` file is either:
- Missing
- Empty
- Not properly configured with the MongoDB Atlas URI

The application is falling back to the default `mongodb://localhost:27017` which doesn't exist on your machine.

## The Solution

You need to create a `.env` file with your MongoDB Atlas connection string.

### Step 1: Create the .env File

In your project root directory (`Netflix-And-Chill/`), create a file named `.env`

**On Windows:**
- Open Notepad or VS Code
- Create a new file
- Save it as `.env` (make sure it's not `.env.txt`)

**On Mac/Linux:**
```bash
touch .env
```

### Step 2: Add the MongoDB Configuration

Open the `.env` file and add this content:

```env
# Database Configuration
DB_TYPE=mongodb

# MongoDB Atlas Connection String
# Get your connection string from MongoDB Atlas
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/netflix-and-chill?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development

# TMDB API Key (optional)
TMDB_API_KEY=
```

### Step 3: Replace Placeholders with Your Credentials

Replace:
- `YOUR_USERNAME` - Your MongoDB Atlas database username
- `YOUR_PASSWORD` - Your MongoDB Atlas database password
- `YOUR_CLUSTER` - Your cluster URL (e.g., `cluster0.xxxxx.mongodb.net`)

**Example** (with fake credentials):
```env
MONGODB_URI=mongodb+srv://myuser:myP@ssw0rd@cluster0.abc123.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
```

### Step 4: Save and Test

1. Save the `.env` file
2. Close and reopen your terminal (to reload environment variables)
3. Run the seeder:
   ```bash
   npm run seed
   ```

You should now see:
```
✅ Database connected
```

## Alternative: Use the Example File

If you pulled the latest code, you can copy the example file:

**Windows:**
```bash
copy .env.mongodb.example .env
```

**Mac/Linux:**
```bash
cp .env.mongodb.example .env
```

Then edit `.env` and replace the placeholder values.

## Verify Your Setup

After creating the `.env` file:

1. **Check it exists:**
   ```bash
   # Windows
   dir .env
   
   # Mac/Linux
   ls -la .env
   ```

2. **Check the contents (be careful not to share your password):**
   ```bash
   # Windows  
   type .env
   
   # Mac/Linux
   cat .env
   ```

## Still Having Issues?

### 1. Check MongoDB Atlas Network Access

Log into https://cloud.mongodb.com:
- Go to "Network Access" (Security section)
- Add your IP address
- Or use `0.0.0.0/0` for testing (allows all IPs)

### 2. Check if Cluster is Active

- The cluster might be paused
- Go to your MongoDB Atlas dashboard
- Resume the cluster if it's paused

### 3. Use File-Based Database Instead

If MongoDB continues to have issues, you can use the local file-based database:

Edit your `.env` file and change:
```env
DB_TYPE=file
```

Then run:
```bash
npm run seed
```

This will create a local JSON file database without needing MongoDB.

## Need Your MongoDB Credentials?

If you don't have MongoDB Atlas credentials:

1. Go to https://cloud.mongodb.com
2. Create a free account (if you don't have one)
3. Create a new cluster (M0 FREE tier)
4. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

See `MONGODB_CONNECTION_SETUP.md` for detailed MongoDB Atlas setup instructions.
