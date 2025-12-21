# Movie Quiz Enhancement Feature

## Overview

The enhanced movie quiz functionality provides a comprehensive personality assessment system that analyzes user preferences, viewing habits, and movie tastes to improve matching between users.

## Key Features

### 1. **Comprehensive Quiz System**
- 50-question quiz covering multiple categories:
  - Viewing Style & Preferences
  - Viewing Habits
  - Social Viewing
  - Movie Preferences
  - Franchises & Series
  - Storytelling Preferences
  - Content Preferences
  - And more...

### 2. **Personality Analysis**
The system computes personality archetypes based on quiz responses:

- **The Cinephile**: Deep appreciation for film as an art form
- **The Casual Viewer**: Enjoys movies for entertainment and relaxation
- **The Binge Watcher**: Loves marathon viewing sessions
- **The Social Butterfly**: Prefers watching and discussing with others
- **The Genre Specialist**: Strong preferences for specific genres
- **The Critic**: Analytical viewer who pays attention to details
- **The Collector**: Passionate about physical media and memorabilia
- **The Tech Enthusiast**: Values high-quality viewing experience

### 3. **Personality-Based Biography**
Automatically generates a personalized bio based on quiz results, highlighting the user's dominant viewing traits and personality archetypes.

### 4. **Enhanced Matching**
Quiz compatibility is integrated into the matching algorithm:
- Compares category scores between users
- Analyzes shared personality archetypes
- Evaluates answer similarities
- Adds up to 15 points to overall match score
- Includes personality insights in match descriptions

## Architecture

### Models

#### QuizAttempt Model
```javascript
{
  id: "quiz_xxx",
  userId: "user_xxx",
  attemptDate: "ISO timestamp",
  quizVersion: "v1",
  answers: [
    {
      questionId: "q1",
      selectedValue: "subtitles",
      points: 1
    }
  ],
  categoryScores: {
    viewing_style: 75.5,
    movie_preferences: 82.3
  },
  personalityTraits: {
    archetypes: [...],
    traits: {...},
    dominantTraits: [...]
  },
  compatibilityFactors: {
    viewingStyle: 75.5,
    contentPreferences: 68.4,
    socialViewing: 71.2,
    engagement: 79.8
  },
  completedAt: "ISO timestamp"
}
```

#### User Model Extensions
```javascript
{
  quizAttempts: [],           // Array of QuizAttempt objects
  personalityProfile: {},      // Latest personality profile
  personalityBio: "",          // Auto-generated bio
  lastQuizCompletedAt: null    // Timestamp
}
```

### Scoring System

#### Category Score Calculation
1. Each question belongs to a category
2. Each answer has a point value
3. Scores are normalized to 0-100 scale per category
4. Categories include: viewing_style, content, social_viewing, engagement, etc.

#### Personality Trait Derivation
1. Analyze category score patterns
2. Match against archetype indicators
3. Assign archetypes with strength scores (65+ threshold)
4. Select top 3 archetypes and 5 dominant traits

#### Compatibility Calculation
```
Total Quiz Compatibility = 
  (40% × Category Compatibility) +
  (30% × Archetype Compatibility) +
  (30% × Answer Similarity)
```

Match bonus: Quiz compatibility × 0.15 (max 15 points)

## API Endpoints

### Submit Quiz
**PUT** `/users/:userId/quiz`

Submits quiz responses and generates personality profile.

**Request:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "selectedValue": "subtitles"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Quiz responses submitted successfully",
  "user": { ... },
  "personalityProfile": { ... },
  "personalityBio": "..."
}
```

### Get Quiz Attempts
**GET** `/users/:userId/quiz/attempts`

Retrieves quiz history and personality data.

## Database Schema

### MongoDB Collections

#### quiz_questions
Stores all quiz questions with categories and options.

```javascript
{
  id: "q1",
  question: "Do you prefer subtitles or dubbing?",
  category: "viewing_style",
  options: [
    { value: "subtitles", label: "...", points: 1 }
  ]
}
```

#### quiz_config
Stores quiz configuration and metadata.

```javascript
{
  version: "v1",
  name: "Movie Personality Quiz - 25 Questions",
  description: "...",
  categories: {...},
  personalityArchetypes: {...}
}
```

#### users
Extended with quiz-related fields:
- `quizAttempts`: Array of quiz attempts
- `personalityProfile`: Latest personality data
- `personalityBio`: Generated biography
- `lastQuizCompletedAt`: Timestamp

### Indexes
- `quiz_questions.id` (unique)
- `quiz_questions.category`
- `quiz_config.version` (unique)
- `users.quizAttempts.completedAt`
- `users.lastQuizCompletedAt`

## Seeding

### Seed Quiz Data
```bash
# Seed quiz questions and configuration to MongoDB
node backend/scripts/seedQuiz.mongosh.js
```

### Seed Users with Quiz Data
```bash
# Regular seeding (file-based)
npm run seed

# MongoDB seeding with quiz attempts (70% of users)
npm run seed:mongodb
```

The user seeder automatically generates quiz attempts for approximately 70% of test users, providing diverse personality profiles for testing.

## Usage Examples

### 1. Complete Quiz
```javascript
const answers = [
  { questionId: 'q1', selectedValue: 'subtitles' },
  { questionId: 'q2', selectedValue: '90_120' },
  // ... all 50 questions
];

const response = await fetch(`/api/users/${userId}/quiz`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers })
});

const { personalityProfile, personalityBio } = await response.json();
```

### 2. Get Personality Profile
```javascript
const response = await fetch(`/api/users/${userId}/quiz/attempts`);
const { personalityProfile, personalityBio } = await response.json();
```

### 3. Match with Quiz Compatibility
```javascript
const MatchingEngine = require('./backend/utils/matchingEngine');

// Both users have completed the quiz
const matchResult = MatchingEngine.calculateMatch(user1, user2);
console.log('Match Score:', matchResult.score);
console.log('Quiz Compatibility:', matchResult.quizCompatibility);
console.log('Description:', matchResult.matchDescription);
```

## Backward Compatibility

The system maintains full backward compatibility:

1. **Users without quiz data**: Matching works normally without quiz bonus
2. **Legacy quiz format**: Old `quizResponses` object format still supported
3. **Partial data**: System gracefully handles missing or incomplete quiz data
4. **Mixed scenarios**: Users with and without quiz data can be matched together

## Testing

### Unit Tests
```bash
# Test quiz scoring
node -e "
  const MovieQuizScoring = require('./backend/utils/movieQuizScoring');
  const { QUIZ_QUESTIONS } = require('./backend/constants/quizQuestions');
  const answers = QUIZ_QUESTIONS.map(q => ({
    questionId: q.id,
    selectedValue: q.options[0].value
  }));
  const attempt = MovieQuizScoring.processQuizCompletion('test', answers);
  console.log('Personality:', attempt.personalityTraits.archetypes[0]);
"
```

### Integration Tests
```bash
# Test full workflow
npm run seed:mongodb
node backend/scripts/testSeeding.js
```

## Files Modified/Created

### Created
- `backend/models/QuizAttempt.js` - Quiz attempt model
- `backend/utils/movieQuizScoring.js` - Scoring and personality analysis
- `backend/constants/quiz.movie-personality-25.v1.json` - Quiz configuration
- `backend/scripts/seedQuiz.mongosh.js` - Quiz data seeder

### Modified
- `backend/models/User.js` - Added quiz-related fields
- `backend/controllers/userController.js` - Enhanced quiz endpoint
- `backend/routes/users.js` - Added quiz attempts endpoint
- `backend/utils/matchingEngine.js` - Integrated quiz compatibility
- `backend/utils/fakeDataGenerator.js` - Added quiz attempt generator
- `backend/scripts/seedUsers.js` - Generate quiz data for test users
- `API.md` - Documented quiz endpoints

## Performance Considerations

1. **Quiz Processing**: O(n) where n is number of questions (50)
2. **Compatibility Calculation**: O(m) where m is number of categories (~14)
3. **Matching**: Quiz adds minimal overhead (~10-20ms per match calculation)
4. **Storage**: ~2-3KB per quiz attempt (50 questions with full analysis)

## Future Enhancements

Potential improvements for future iterations:

1. **Adaptive Quiz**: Shorter quiz versions based on category importance
2. **Quiz Evolution**: Update questions based on trends and feedback
3. **Archetype Recommendations**: Suggest content based on personality type
4. **Compatibility Reports**: Detailed reports on why users match/don't match
5. **Group Compatibility**: Analyze compatibility for group watch sessions
6. **Machine Learning**: Use ML to improve archetype classification

## Support

For issues or questions:
- Check API documentation in `API.md`
- Review code comments in source files
- Test with provided examples
- Ensure MongoDB connection is configured (if using MongoDB)
