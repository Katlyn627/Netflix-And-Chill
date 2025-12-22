# Quick Start Guide

This guide will help you get Netflix and Chill running on your local machine.

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Katlyn627/Netflix-And-Chill.git
   cd Netflix-And-Chill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm startn
   ```
   
   You should see: `Netflix and Chill server running on port 3000`

4. **Open the app in your browser**
   
   Navigate to: http://localhost:3000

## Using the App

### Step 1: Create Your Profile
- Fill in your username, email, age, and location
- Write a bio about yourself and your watching habits
- Click "Create Profile"

### Step 2: Connect Streaming Services
- Select the streaming services you use (Netflix, Hulu, Disney+, etc.)
- Click "Add Services"

### Step 3: Add Your Watch History
- Enter shows and movies you've watched
- Specify the type (movie, TV show, or series)
- Add genre and service information
- Enter how many episodes you watched (for TV shows)
- Click "Add to History"
- You can add multiple items
- Click "Skip to Preferences" when done

### Step 4: Set Your Preferences
- Select your favorite genres
- Enter your typical binge-watching count
- Click "Save Preferences"

### Step 5: Find Matches!
- Click "Find My Matches"
- See users who share your streaming interests
- Match scores show compatibility (0-100%)
- View shared content and services

## Testing with Multiple Users

To test the matching functionality, you can:

1. Create your first profile through the UI
2. Use the API to create additional test users
3. Find matches for your first user

### Example: Creating a Test User via API

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_doe",
    "email": "jane@example.com",
    "age": 26,
    "location": "San Francisco",
    "bio": "Love sci-fi and documentaries!"
  }'
```

Save the returned `user.id` for the next steps.

### Adding Streaming Services

```bash
curl -X POST http://localhost:3000/api/users/USER_ID_HERE/streaming-services \
  -H "Content-Type: application/json" \
  -d '{"serviceName": "Netflix"}'
```

### Adding Watch History

```bash
curl -X POST http://localhost:3000/api/users/USER_ID_HERE/watch-history \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Stranger Things",
    "type": "tvshow",
    "genre": "Sci-Fi",
    "service": "Netflix",
    "episodesWatched": 8
  }'
```

### Setting Preferences

```bash
curl -X PUT http://localhost:3000/api/users/USER_ID_HERE/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "genres": ["Sci-Fi", "Horror", "Thriller"],
    "bingeWatchCount": 5
  }'
```

### Finding Matches

```bash
curl http://localhost:3000/api/matches/USER_ID_HERE
```

## API Endpoints

For complete API documentation, see [API.md](API.md)

### Quick Reference

- `POST /api/users` - Create user
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId/bio` - Update bio
- `POST /api/users/:userId/streaming-services` - Add service
- `POST /api/users/:userId/watch-history` - Add watch history
- `PUT /api/users/:userId/preferences` - Update preferences
- `GET /api/matches/:userId` - Find matches

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can change it:

```bash
PORT=3001 npm start
```

Then access the app at http://localhost:3001

### Data Not Persisting

Data is stored in the `data/` directory. If you want to reset:

```bash
rm -rf data/
```

The directory will be recreated automatically.

### Browser Cache Issues

If you see old content, hard refresh:
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

## Development

### Project Structure

```
Netflix-And-Chill/
├── backend/           # Server-side code
│   ├── controllers/   # Request handlers
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── utils/         # Utilities
│   └── server.js      # Main server file
├── frontend/          # Client-side code
│   ├── index.html     # Main HTML
│   └── src/
│       ├── components/  # JavaScript
│       ├── services/    # API client
│       └── styles/      # CSS
└── data/              # Data storage (auto-generated)
```

### Making Changes

1. Make your code changes
2. Restart the server (Ctrl+C then `npm start`)
3. Refresh your browser

## Next Steps

- Read the full [README.md](README.md) for more details
- Check [API.md](API.md) for API documentation
- Review [SECURITY.md](SECURITY.md) for security considerations

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy matching! 🎬❤️**
