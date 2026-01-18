# Netflix and Chill API Documentation for Mobile Apps

REST API documentation for integrating with Netflix and Chill backend from Flutter, React Native, or other mobile applications.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

**Android Emulator**: Use `http://10.0.2.2:3000/api`  
**iOS Simulator**: Use `http://localhost:3000/api`  
**Physical Device**: Use `http://YOUR_IP:3000/api`

## Authentication

All protected endpoints require an Auth0 JWT token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Get the token by authenticating with Auth0 using the Auth0 SDK for your platform.

---

## API Endpoints

### Authentication

#### Create/Update Auth0 User
```http
POST /users/auth0
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "auth0Id": "auth0|123456789",
  "profilePicture": "https://example.com/picture.jpg"
}
```

**Response (201/200):**
```json
{
  "message": "User created successfully",
  "id": "user_1234_abc",
  "user": {
    "id": "user_1234_abc",
    "username": "johndoe",
    "email": "user@example.com",
    "profilePicture": "https://example.com/picture.jpg",
    "auth0Id": "auth0|123456789",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### User Profile

#### Get User Profile
```http
GET /users/:userId
```

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Response (200):**
```json
{
  "id": "user_1234_abc",
  "username": "johndoe",
  "email": "user@example.com",
  "age": 28,
  "location": "New York, NY",
  "bio": "Movie enthusiast",
  "gender": "male",
  "sexualOrientation": "straight",
  "profilePicture": "https://example.com/picture.jpg",
  "photos": [],
  "streamingServices": [
    {
      "id": 8,
      "name": "Netflix",
      "logoUrl": "https://image.tmdb.org/t/p/original/..."
    }
  ],
  "favoriteGenres": ["Action", "Comedy"],
  "watchHistory": [],
  "isPremium": false
}
```

#### Update User Bio
```http
PUT /users/:userId/bio
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Body:**
```json
{
  "bio": "Updated bio text"
}
```

**Response (200):**
```json
{
  "message": "Bio updated successfully",
  "bio": "Updated bio text"
}
```

#### Update User Profile Details
```http
PUT /users/:userId/profile-details
```

**Body:**
```json
{
  "age": 30,
  "location": "Los Angeles, CA",
  "gender": "male",
  "sexualOrientation": "straight",
  "height": "5'10\"",
  "occupation": "Software Engineer",
  "education": "Bachelor's Degree",
  "relationshipStatus": "single"
}
```

#### Add Photo to Gallery
```http
POST /users/:userId/photos
```

**Body:**
```json
{
  "photoUrl": "https://example.com/photo.jpg"
}
```

**Response (200):**
```json
{
  "message": "Photo added successfully",
  "photos": [...]
}
```

#### Upload Profile Picture
```http
POST /users/:userId/profile-picture
```

**Body (multipart/form-data or JSON):**
```json
{
  "pictureUrl": "https://example.com/picture.jpg"
}
```

---

### Streaming Services

#### Add Streaming Service
```http
POST /users/:userId/streaming-services
```

**Body:**
```json
{
  "id": 8,
  "name": "Netflix",
  "logoUrl": "https://image.tmdb.org/t/p/original/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg"
}
```

**Response (200):**
```json
{
  "message": "Streaming service added successfully",
  "streamingServices": [...]
}
```

#### Update Streaming Services (Replace all)
```http
PUT /users/:userId/streaming-services
```

**Body:**
```json
{
  "streamingServices": [
    {
      "id": 8,
      "name": "Netflix",
      "logoUrl": "..."
    },
    {
      "id": 337,
      "name": "Disney+",
      "logoUrl": "..."
    }
  ]
}
```

#### Connect to Streaming Service (OAuth)
```http
GET /auth/:provider/connect?userId=USER_ID
```

**Providers:** `netflix`, `hulu`, `disney`, `prime`, `hbo`, `appletv`

**Note:** This initiates OAuth flow. Mobile apps should open this URL in a browser or WebView.

#### Get Streaming Service Connection Status
```http
GET /auth/:provider/status?userId=USER_ID
```

**Response (200):**
```json
{
  "provider": "netflix",
  "connected": true,
  "connectedAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-12-31T23:59:59.999Z",
  "expired": false
}
```

#### Disconnect Streaming Service
```http
POST /auth/:provider/disconnect
```

**Body:**
```json
{
  "userId": "user_1234_abc"
}
```

---

### Watch History

#### Add to Watch History
```http
POST /users/:userId/watch-history
```

**Body:**
```json
{
  "id": 550,
  "title": "Fight Club",
  "year": 1999,
  "genre": "Drama",
  "rating": 8.8,
  "posterUrl": "https://image.tmdb.org/t/p/w500/..."
}
```

#### Remove from Watch History
```http
DELETE /users/:userId/watch-history
```

**Body:**
```json
{
  "movieId": 550
}
```

---

### Preferences

#### Update Preferences
```http
PUT /users/:userId/preferences
```

**Body:**
```json
{
  "favoriteGenres": ["Action", "Comedy", "Drama"],
  "ageRangeMin": 25,
  "ageRangeMax": 35,
  "maxDistance": 50,
  "genderPreference": "any",
  "sexualOrientationPreference": "any"
}
```

---

### Favorite Movies

#### Get Favorite Movies
```http
GET /users/:userId/favorite-movies
```

**Response (200):**
```json
{
  "favoriteMovies": [
    {
      "id": 550,
      "title": "Fight Club",
      "posterUrl": "...",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Add Favorite Movie
```http
POST /users/:userId/favorite-movies
```

**Body:**
```json
{
  "movieId": 550,
  "title": "Fight Club",
  "posterUrl": "https://image.tmdb.org/t/p/w500/...",
  "releaseYear": 1999,
  "genres": ["Drama", "Thriller"]
}
```

#### Remove Favorite Movie
```http
DELETE /users/:userId/favorite-movies/:movieId
```

---

### Quiz/Personality

#### Submit Quiz Responses
```http
PUT /users/:userId/quiz
```

**Body:**
```json
{
  "responses": [
    {"questionId": 1, "answer": "Action"},
    {"questionId": 2, "answer": "Friday"}
  ]
}
```

**Response (200):**
```json
{
  "message": "Quiz responses saved successfully",
  "moviePersonality": {
    "type": "Action Hero",
    "description": "...",
    "matchingGenres": ["Action", "Adventure"]
  }
}
```

#### Get Quiz Attempts
```http
GET /users/:userId/quiz/attempts
```

---

### Matches

#### Get User Matches
```http
GET /matches/:userId
```

**Response (200):**
```json
{
  "matches": [
    {
      "userId": "user_5678_def",
      "username": "janedoe",
      "matchScore": 85,
      "matchedAt": "2024-01-01T00:00:00.000Z",
      "commonGenres": ["Action", "Comedy"],
      "mutualLikes": true
    }
  ]
}
```

#### Get Potential Matches
```http
GET /matches/:userId/potential
```

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `minScore`: Minimum match score (default: 50)

---

### Likes/Swipes

#### Like/Dislike User (Swipe)
```http
POST /likes
```

**Body:**
```json
{
  "likerId": "user_1234_abc",
  "likedUserId": "user_5678_def",
  "liked": true
}
```

**Response (200):**
```json
{
  "message": "Like recorded successfully",
  "match": true,
  "matchId": "match_9012_ghi"
}
```

#### Get Users Who Liked You
```http
GET /likes/:userId/liked-by
```

---

### Premium Features

#### Get Premium Status
```http
GET /users/:userId/premium
```

**Response (200):**
```json
{
  "isPremium": true,
  "premiumSince": "2024-01-01T00:00:00.000Z",
  "features": [
    "Unlimited Likes",
    "See Who Liked You",
    "Advanced Filters"
  ]
}
```

#### Update Premium Status
```http
PUT /users/:userId/premium
```

**Body:**
```json
{
  "isPremium": true
}
```

---

### Chat (if enabled)

#### Get User Chats
```http
GET /chat/:userId/conversations
```

#### Send Message
```http
POST /chat/message
```

**Body:**
```json
{
  "senderId": "user_1234_abc",
  "receiverId": "user_5678_def",
  "message": "Hello!",
  "matchId": "match_9012_ghi"
}
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error message here"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Standard endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 10 requests per 15 minutes
- **Chat endpoints**: 50 messages per minute

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination with query parameters:

```
?page=1&perPage=20
```

Response includes pagination info:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "perPage": 20,
    "totalPages": 5,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## WebSocket Support (Real-time Features)

For real-time chat and notifications, connect to WebSocket:

```
ws://localhost:3000
```

**Authentication:**
```javascript
socket.emit('authenticate', { token: 'YOUR_ACCESS_TOKEN' });
```

**Events:**
- `message` - New chat message
- `match` - New match notification
- `like` - Someone liked you
- `typing` - User is typing

---

## Testing with Postman

1. Import this API documentation
2. Set environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `access_token`: Your Auth0 access token
3. Use `{{base_url}}` and `{{access_token}}` in requests

---

## Example Flutter Integration

See [FLUTTER_INTEGRATION_GUIDE.md](./FLUTTER_INTEGRATION_GUIDE.md) for complete Flutter integration examples.

Quick example:

```dart
import 'package:http/http.dart' as http;

// Get user profile
final response = await http.get(
  Uri.parse('$baseUrl/users/$userId'),
  headers: {
    'Authorization': 'Bearer $accessToken',
  },
);

if (response.statusCode == 200) {
  final user = jsonDecode(response.body);
  print(user['username']);
}
```

---

## Support

For issues or questions:
- Check backend server logs
- Test endpoints with Postman
- Review Auth0 logs
- See main documentation: [AUTH0_SETUP_GUIDE.md](./AUTH0_SETUP_GUIDE.md)

---

**API Version**: 1.0.0  
**Last Updated**: January 2026
