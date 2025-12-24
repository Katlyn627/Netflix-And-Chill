# Quiz Enhancement API Documentation

## Overview
This document describes the new API endpoints added for the quiz enhancement features including adaptive quizzes, compatibility reports, archetype recommendations, and feedback tracking.

## New Endpoints

### Adaptive Quiz

#### Get Adaptive Quiz
Get a customized quiz with a specific number of questions.

**Endpoint:** `GET /api/users/quiz/adaptive?questionCount={count}`

**Query Parameters:**
- `questionCount` (optional): Number of questions (15, 25, or 50). Default: 25

**Response:**
```json
{
  "version": "v1",
  "questionCount": 25,
  "quizType": "standard",
  "questions": [...],
  "categories": {...},
  "description": "Standard 25-question movie personality assessment"
}
```

**Example:**
```bash
curl http://localhost:5000/api/users/quiz/adaptive?questionCount=15
```

---

#### Get Quiz Options
Get information about all available quiz lengths.

**Endpoint:** `GET /api/users/quiz/options`

**Response:**
```json
{
  "availableQuizzes": [
    {
      "questionCount": 15,
      "type": "quick",
      "estimatedTime": "3-5 minutes",
      "description": "Quick personality snapshot",
      "recommended": "returning users or time-constrained"
    },
    {
      "questionCount": 25,
      "type": "standard",
      "estimatedTime": "5-8 minutes",
      "description": "Balanced assessment",
      "recommended": "most users"
    },
    {
      "questionCount": 50,
      "type": "full",
      "estimatedTime": "10-15 minutes",
      "description": "Complete personality analysis",
      "recommended": "new users seeking optimal matches"
    }
  ],
  "message": "Choose a quiz length that fits your schedule"
}
```

---

### Compatibility Reports

#### Get Two-User Compatibility Report
Generate detailed compatibility report between two users.

**Endpoint:** `GET /api/users/:userId/compatibility/report?otherUserId={otherUserId}`

**URL Parameters:**
- `userId`: ID of the first user

**Query Parameters:**
- `otherUserId`: ID of the second user to compare with

**Response:**
```json
{
  "users": {
    "user1": { "id": "user_123", "username": "Alice" },
    "user2": { "id": "user_456", "username": "Bob" }
  },
  "overallCompatibility": 75,
  "quizCompatibility": {
    "score": 75,
    "details": {
      "categoryCompatibility": 72,
      "archetypeCompatibility": 80,
      "answerCompatibility": 73
    }
  },
  "archetypeAnalysis": {
    "shared": [...],
    "complementary": [...],
    "different": [...],
    "compatibility": 80
  },
  "categoryBreakdown": [...],
  "strengths": [
    {
      "type": "category",
      "title": "Aligned Viewing Style",
      "description": "Both users have similar preferences...",
      "score": 85
    }
  ],
  "challenges": [...],
  "recommendations": [...],
  "summary": "🎬 Excellent compatibility! You share 2 personality archetypes...",
  "generatedAt": "2024-12-21T04:50:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:5000/api/users/user_123/compatibility/report?otherUserId=user_456
```

---

#### Get Group Compatibility Report
Analyze compatibility for a group of users (e.g., for group watch sessions).

**Endpoint:** `POST /api/users/compatibility/group`

**Request Body:**
```json
{
  "userIds": ["user_123", "user_456", "user_789"]
}
```

**Response:**
```json
{
  "groupSize": 3,
  "users": [
    { "id": "user_123", "username": "Alice" },
    { "id": "user_456", "username": "Bob" },
    { "id": "user_789", "username": "Charlie" }
  ],
  "overallCompatibility": 68,
  "pairwiseCompatibility": [
    { "user1": "Alice", "user2": "Bob", "score": 75 },
    { "user1": "Alice", "user2": "Charlie", "score": 65 },
    { "user1": "Bob", "user2": "Charlie", "score": 64 }
  ],
  "commonArchetypes": [
    {
      "type": "cinephile",
      "name": "The Cinephile",
      "description": "Deep appreciation for film",
      "count": 2,
      "users": ["Alice", "Bob"]
    }
  ],
  "recommendations": [...],
  "summary": "Group of 3 users has good compatibility...",
  "generatedAt": "2024-12-21T04:50:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/users/compatibility/group \
  -H "Content-Type: application/json" \
  -d '{"userIds": ["user_123", "user_456", "user_789"]}'
```

---

### Archetype Recommendations

#### Get Archetype-Based Recommendations
Get personalized content recommendations based on user's personality archetype.

**Endpoint:** `GET /api/users/:userId/recommendations/archetype`

**URL Parameters:**
- `userId`: User ID

**Response:**
```json
{
  "archetype": {
    "type": "cinephile",
    "name": "The Cinephile",
    "description": "Deep appreciation for film as an art form"
  },
  "recommendedGenres": [
    { "id": 18, "name": "Drama", "priority": "high" },
    { "id": 878, "name": "Science Fiction", "priority": "high" },
    { "id": 10749, "name": "Romance", "priority": "medium" }
  ],
  "keywords": [
    "award-winning",
    "critically acclaimed",
    "auteur",
    "arthouse",
    "criterion collection"
  ],
  "recommendedDirectors": [
    "Christopher Nolan",
    "Denis Villeneuve",
    "Wes Anderson"
  ],
  "viewingStyle": "Appreciates complex narratives, cinematography, and directorial vision",
  "contentSuggestions": [
    "Classic cinema from different eras",
    "International films with subtitles",
    "Director retrospectives"
  ],
  "searchQueries": [
    {
      "type": "genre",
      "query": "Drama",
      "description": "Top Drama films"
    }
  ],
  "generatedAt": "2024-12-21T04:50:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:5000/api/users/user_123/recommendations/archetype
```

---

#### Get Mood-Based Recommendations
Get content recommendations based on user's archetype and current mood.

**Endpoint:** `GET /api/users/:userId/recommendations/mood?mood={mood}`

**URL Parameters:**
- `userId`: User ID

**Query Parameters:**
- `mood`: Current mood (relaxed, excited, thoughtful, social)

**Response:**
```json
{
  "archetype": {
    "type": "cinephile",
    "name": "The Cinephile"
  },
  "mood": "excited",
  "recommendedGenres": [
    { "id": 28, "name": "Action", "priority": "high" }
  ],
  "keywords": [
    "thrilling",
    "fast-paced",
    "adrenaline",
    "award-winning"
  ],
  "moodMessage": "The Cinephile recommendations for a excited mood",
  "generatedAt": "2024-12-21T04:50:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:5000/api/users/user_123/recommendations/mood?mood=excited
```

---

### Quiz Feedback

#### Submit Quiz Feedback
Submit overall feedback about the quiz experience.

**Endpoint:** `POST /api/users/:userId/quiz/feedback`

**URL Parameters:**
- `userId`: User ID

**Request Body:**
```json
{
  "quizVersion": "v1",
  "overallRating": 5,
  "lengthRating": 4,
  "clarityRating": 5,
  "relevanceRating": 5,
  "comments": "Great quiz! Very insightful.",
  "suggestedImprovements": [
    "Add more questions about modern streaming platforms"
  ]
}
```

**Response:**
```json
{
  "message": "Quiz feedback submitted successfully",
  "feedback": {
    "userId": "user_123",
    "quizVersion": "v1",
    "ratings": {
      "overall": 5,
      "length": 4,
      "clarity": 5,
      "relevance": 5
    },
    "comments": "Great quiz! Very insightful.",
    "suggestedImprovements": [...],
    "submittedAt": "2024-12-21T04:50:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/users/user_123/quiz/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "overallRating": 5,
    "lengthRating": 4,
    "clarityRating": 5,
    "relevanceRating": 5,
    "comments": "Great quiz!"
  }'
```

---

#### Submit Question Feedback
Submit feedback about a specific quiz question.

**Endpoint:** `POST /api/users/:userId/quiz/question-feedback`

**URL Parameters:**
- `userId`: User ID

**Request Body:**
```json
{
  "questionId": "q15",
  "rating": 4,
  "comment": "Good question but could be more specific"
}
```

**Response:**
```json
{
  "message": "Question feedback submitted successfully",
  "feedback": {
    "questionId": "q15",
    "userId": "user_123",
    "rating": 4,
    "comment": "Good question but could be more specific",
    "submittedAt": "2024-12-21T04:50:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/users/user_123/quiz/question-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q15",
    "rating": 4,
    "comment": "Good question but could be more specific"
  }'
```

---

## Updated Endpoints

### Submit Quiz Responses
The existing quiz submission endpoint now assigns a primary archetype to the user.

**Endpoint:** `PUT /api/users/:userId/quiz`

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "selectedValue": "subtitles"
    },
    {
      "questionId": "q2",
      "selectedValue": "90_120"
    }
    // ... all questions
  ]
}
```

**Response:**
```json
{
  "message": "Quiz responses submitted successfully",
  "user": {...},
  "personalityProfile": {...},
  "personalityBio": "Deep appreciation for film as an art form...",
  "archetype": {
    "type": "cinephile",
    "name": "The Cinephile",
    "description": "Deep appreciation for film as an art form",
    "strength": 85,
    "confidence": 0.82
  }
}
```

**Note:** The response now includes the assigned archetype which becomes the user's primary personality type.

---

## User Model Updates

The User model now includes:
- `archetype`: Primary personality archetype object
  ```json
  {
    "type": "cinephile",
    "name": "The Cinephile",
    "description": "Deep appreciation for film as an art form",
    "strength": 85,
    "confidence": 0.82
  }
  ```

This archetype is automatically assigned when a user completes the quiz and is used for:
- Generating personalized content recommendations
- Calculating compatibility with other users
- Displaying personality-based profile information

---

## Features Overview

### 1. Adaptive Quiz System
- **15-question quiz**: Quick snapshot (3-5 minutes)
- **25-question quiz**: Standard assessment (5-8 minutes)
- **50-question quiz**: Complete analysis (10-15 minutes)
- Questions selected based on category importance
- Maintains ~93% category coverage even with reduced questions

### 2. Compatibility Reports
- **Two-user reports**: Detailed analysis with strengths, challenges, and recommendations
- **Group reports**: Analyze compatibility for 2+ users
- Identifies shared and complementary archetypes
- Provides actionable insights for improving compatibility

### 3. Archetype Recommendations
- Genre recommendations based on personality
- Director suggestions matching viewing style
- Mood-based content filtering
- Personalized search queries

### 4. Quiz Evolution System
- Track question performance
- Collect user feedback
- Identify trending preferences
- Version management for quiz updates

### 5. ML-Inspired Scoring
- Weighted category importance
- Confidence scoring for archetype assignments
- Pattern recognition in answer selections
- Enhanced personality trait computation

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "error": "Description of what was wrong with the request"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Notes

1. **Quiz Completion Required**: Most new features require users to have completed the quiz. Users without quiz data will receive appropriate messages.

2. **Archetype Assignment**: Archetypes are automatically assigned upon quiz completion and update with each new quiz attempt.

3. **Compatibility Calculations**: Compatibility reports require both users to have completed the quiz for accurate results.

4. **Feedback Storage**: Feedback endpoints currently return success but would need database storage implementation for production use.

5. **ML Scoring**: The ML-inspired scoring is enabled by default but can be disabled by passing `useMLScoring: false` when processing quiz completion (backend only).

---

## Integration Examples

### Complete User Flow

1. **User takes adaptive quiz:**
```javascript
// Get quiz options
const options = await fetch('/api/users/quiz/options');

// Get 25-question quiz
const quiz = await fetch('/api/users/quiz/adaptive?questionCount=25');

// Submit answers
const result = await fetch(`/api/users/${userId}/quiz`, {
  method: 'PUT',
  body: JSON.stringify({ answers: userAnswers })
});

// User now has archetype assigned
```

2. **Get personalized recommendations:**
```javascript
const recommendations = await fetch(
  `/api/users/${userId}/recommendations/archetype`
);
```

3. **Check compatibility with potential match:**
```javascript
const compatibility = await fetch(
  `/api/users/${userId}/compatibility/report?otherUserId=${matchId}`
);
```

4. **Plan group watch session:**
```javascript
const groupCompat = await fetch('/api/users/compatibility/group', {
  method: 'POST',
  body: JSON.stringify({
    userIds: [userId1, userId2, userId3]
  })
});
```

5. **Submit feedback:**
```javascript
await fetch(`/api/users/${userId}/quiz/feedback`, {
  method: 'POST',
  body: JSON.stringify({
    overallRating: 5,
    comments: 'Great quiz!'
  })
});
```
