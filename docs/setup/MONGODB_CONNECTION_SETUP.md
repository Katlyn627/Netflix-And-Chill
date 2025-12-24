# MongoDB Connection Setup

This project can be configured to connect to MongoDB Atlas cluster.

## Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
./setup-mongodb.sh
```

This will:
1. Create the `.env` file with MongoDB configuration template
2. Prompt you to enter your MongoDB connection string
3. Test the connection
4. Seed the database with 100 fake users

### Option 2: Manual Setup

1. Copy the MongoDB configuration template:
   ```bash
   cp .env.mongodb.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/netflix-and-chill?retryWrites=true&w=majority
   ```
   
   Replace:
   - `YOUR_USERNAME` with your MongoDB Atlas username
   - `YOUR_PASSWORD` with your MongoDB Atlas password  
   - `YOUR_CLUSTER` with your cluster URL (e.g., `cluster0.xxxxx.mongodb.net`)

3. Seed the database:
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Getting MongoDB Atlas Credentials

1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click **"Connect"**
4. Choose **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Add `/netflix-and-chill` after the cluster URL to specify the database name

## Connection Details

- **Database Type**: MongoDB Atlas (Cloud)
- **Database Name**: netflix-and-chill
- **Collections**: users, matches, likes, chats

## Troubleshooting

### Error: "querySrv EREFUSED" or "ENOTFOUND"

This error can occur due to:

1. **Network/Firewall Issues**: Your network may be blocking MongoDB Atlas connections
   - Try from a different network
   - Check if your organization has firewall rules blocking MongoDB

2. **IP Whitelist**: MongoDB Atlas requires IP whitelisting
   - Log into MongoDB Atlas
   - Go to Network Access
   - Add your current IP address or use `0.0.0.0/0` (for development only)

3. **Cluster Not Active**: The MongoDB cluster may be paused or inactive
   - Log into MongoDB Atlas
   - Check if the cluster is running
   - Resume the cluster if paused

4. **DNS Resolution Issues**: The environment may not support SRV record lookup
   - This can happen in some containerized or sandboxed environments
   - Contact the cluster owner to verify the cluster is accessible

### Fallback: Use File-Based Database

If MongoDB connection fails, you can use the file-based database instead:

1. Edit `.env` and change:
   ```
   DB_TYPE=file
   ```

2. Or remove the `DB_TYPE` line entirely (defaults to file)

3. Run the seeder:
   ```bash
   npm run seed
   ```

## Security Note

⚠️ **Important**: The `.env` file contains sensitive credentials and is excluded from git via `.gitignore`. Never commit credentials to version control in production environments.

For this development/demo project, an example configuration is provided in `.env.mongodb.example`.

## Viewing Your Data

After seeding, you can view your data:

1. **In MongoDB Atlas**:
   - Log into https://cloud.mongodb.com
   - Browse Collections → netflix-and-chill database
   
2. **In the Application**:
   - Start the server: `npm start`
   - Open http://localhost:3000
   - Check `TEST_CREDENTIALS.md` for login information

## Running the Application

Once MongoDB is connected and seeded:

```bash
npm start
```

Then open your browser to: http://localhost:3000

All test users have the password: `password123`

See `TEST_CREDENTIALS.md` for the complete list of test users.
