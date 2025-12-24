# MongoDB Configuration Instructions

Since you already have a `.env` file with your TMDB and API keys, you just need to add the following MongoDB configuration lines to your existing `.env` file.

## Step 1: Add MongoDB Configuration to Your .env File

Open your `.env` file and add these lines:

```env
# Database Configuration
DB_TYPE=mongodb

# MongoDB Atlas Connection String
# Replace <username>, <password>, and <cluster-url> with your actual MongoDB Atlas credentials
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/netflix-and-chill?retryWrites=true&w=majority
```

## Step 2: Get Your MongoDB Atlas Connection String

If you haven't already created a MongoDB Atlas cluster, follow these steps:

1. **Log in to MongoDB Atlas:** https://cloud.mongodb.com
2. **Find your cluster** and click "Connect"
3. **Choose "Connect your application"**
4. **Copy the connection string** - it will look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 3: Update the Connection String

Replace the placeholders in your `.env` file:

**Example:**
```env
# Before (with placeholders)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/netflix-and-chill?retryWrites=true&w=majority

# After (with your actual credentials)
MONGODB_URI=mongodb+srv://myusername:MyPass123@cluster0.abc123.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
```

**Important Notes:**
- `<username>` = Your MongoDB database username (not your Atlas login email)
- `<password>` = Your MongoDB database user password
- `<cluster-url>` = Your cluster URL (e.g., `cluster0.abc123.mongodb.net`)
- Keep `/netflix-and-chill` after the cluster URL - this is the database name
- Keep `?retryWrites=true&w=majority` at the end

## Step 4: Test the Connection

Once you've updated your `.env` file, test the connection by running:

```bash
npm run seed:mongodb
```

You should see:
```
🔌 Connecting to database...
✅ Database connected
```

## Complete .env Example

Your `.env` file should now look something like this:

```env
# TMDB API Key (your existing key)
TMDB_API_KEY=your_actual_tmdb_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_TYPE=mongodb

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://myusername:MyPass123@cluster0.abc123.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
```

## Need More Help?

See [MONGODB_SETUP.md](MONGODB_SETUP.md) for detailed MongoDB Atlas setup instructions.
