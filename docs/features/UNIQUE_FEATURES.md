# Unique Dating App Features

This document describes the unique features that make Netflix & Chill stand out from other dating apps.

## 🎭 Movie Personality Archetypes

Users are automatically categorized into one of 8 unique viewing personality archetypes based on their watching patterns, preferences, and behavior. This helps create more meaningful matches by understanding not just what people watch, but *how* they watch.

### The 8 Archetypes

1. **🎯 Binge Warrior**
   - Masters of marathon viewing who can finish entire seasons in a weekend
   - High episode count, long viewing sessions, fast completion rate
   - Compatible with: Binge Warriors, Loyal Fans, Genre Explorers

2. **🌙 Casual Viewer**
   - Enjoys watching at their own pace, one or two episodes at a time
   - Moderate viewing frequency, balanced content consumption
   - Compatible with: Casual Viewers, Critics, Comfort Watchers

3. **🎭 The Critic**
   - Appreciates quality over quantity, seeking thought-provoking content
   - Selective choices, high-rated content, documentary preference
   - Compatible with: Critics, Indie Lovers, Casual Viewers

4. **🗺️ Genre Explorer**
   - Adventurous viewer who loves discovering new genres and styles
   - Wide genre variety, international content, experimental choices
   - Compatible with: Genre Explorers, Indie Lovers, Binge Warriors

5. **☕ Comfort Watcher**
   - Rewatches favorites and seeks familiar, cozy content
   - Rewatches favorites, feel-good content, nostalgic choices
   - Compatible with: Comfort Watchers, Casual Viewers, Loyal Fans

6. **⭐ Loyal Fan**
   - Dedicates to specific franchises, actors, or directors
   - Franchise completion, actor/director following, deep knowledge
   - Compatible with: Loyal Fans, Binge Warriors, Genre Explorers

7. **🎬 Indie Lover**
   - Seeks hidden gems and independent productions
   - Obscure content, festival films, unique storytelling
   - Compatible with: Indie Lovers, Critics, Genre Explorers

8. **🌊 Trend Surfer**
   - Always watching what's trending and currently popular
   - Popular content, social media influenced, current releases
   - Compatible with: Trend Surfers, Binge Warriors, Genre Explorers

### How It Works

The archetype system analyzes:
- **Binge patterns**: How many episodes watched in one sitting
- **Genre diversity**: Variety of content consumed
- **Watch history size**: Total content watched
- **Rewatching behavior**: Whether users rewatch favorites
- **Genre preferences**: Specific genre inclinations

### API Endpoints

```javascript
// Get all archetypes
GET /api/archetypes/all

// Get user's archetype
GET /api/archetypes/user/:userId

// Get compatible archetypes
GET /api/archetypes/recommendations/:archetype
```

### Matching Integration

Archetype compatibility adds up to 15 points to the overall match score:
- Same archetype: 95% compatibility (14.25 points)
- Compatible archetype: 85% compatibility (12.75 points)
- Neutral match: 60% compatibility (9 points)

## 🔥 Debate Prompts

Spark engaging conversations with controversial movie and TV show opinions! Users can answer debate prompts to showcase their viewing perspectives and find matches who share (or hilariously oppose) their takes.

### Prompt Categories

1. **Hot Takes** (20 prompts)
   - Controversial opinions about popular shows
   - Examples: "Breaking Bad is overrated", "Marvel movies are killing cinema"

2. **Viewing Habits** (6 prompts)
   - How people watch: subtitles, spoilers, binge vs. episodic
   - Examples: "Subtitles ON is the only way", "Spoilers enhance the experience"

3. **Content Preferences** (4 prompts)
   - Reality TV, anime, documentaries
   - Examples: "Reality TV is just as valid as scripted shows"

4. **Classics** (2 prompts)
   - Opinions on classic shows and movies
   - Examples: "The Office (US) vs The Office (UK)"

5. **Streaming Wars** (2 prompts)
   - Netflix quality, service fragmentation
   - Examples: "Too many streaming services is ruining entertainment"

6. **Would You Rather** (5 prompts)
   - Impossible choices for viewing preferences
   - Examples: "Never watch TV again or never watch movies again?"

7. **This or That** (5 prompts)
   - Quick preference questions
   - Examples: "Scary movies or romantic comedies?"

### Compatibility Scoring

The debate compatibility system finds the sweet spot:
- **60-80% agreement**: Perfect balance! (90+ points)
- **80-90% agreement**: Great minds think alike (80-85 points)
- **50-60% agreement**: Some differences, room for discussion (70-90 points)
- **Below 50% agreement**: Opposite views, exciting debates! (50-100 points)

The algorithm rewards having *some* common ground while maintaining individuality.

### API Endpoints

```javascript
// Get all debate prompts
GET /api/archetypes/debates/prompts

// Get prompts by type
GET /api/archetypes/debates/prompts?type=controversial

// Get random prompt
GET /api/archetypes/debates/random

// Save user's answer
POST /api/archetypes/debates/answer
{
  "userId": "user123",
  "promptId": "debate_1",
  "answer": "Agree"
}

// Get user's answers
GET /api/archetypes/debates/user/:userId
```

### Matching Integration

Debate compatibility adds up to 10 points to the overall match score based on answer compatibility.

## 📺 Enhanced Watch Together Invitations

Improved invitation system with quick templates and alternative time suggestions.

### Quick Invite Templates

Pre-filled templates for common watch scenarios:

1. **Tonight - Quick Watch**
   - Platform: Teleparty
   - Time: Tonight at 8 PM
   - Perfect for spontaneous viewing

2. **Weekend Movie Night**
   - Platform: Amazon Prime
   - Time: Next Saturday at 7 PM
   - Ideal for movie marathons

3. **Disney+ Family Night**
   - Platform: Disney+ GroupWatch
   - Time: Tonight at 6:30 PM
   - Family-friendly content

4. **Lunch Break Episode**
   - Platform: Zoom
   - Time: Today at noon
   - Quick episode during lunch

### Alternative Time Suggestions

Recipients can suggest alternative times if the original doesn't work:
- Propose different date/time
- Track multiple suggestions
- Easy coordination without back-and-forth messages

### API Endpoints

```javascript
// Get invitation templates
GET /api/watch-invitations/templates

// Suggest alternative time
POST /api/watch-invitations/suggest-alternative
{
  "invitationId": "watch_abc123",
  "proposedDate": "2026-01-20",
  "proposedTime": "19:30",
  "fromUserId": "user456"
}
```

## 💬 Enhanced Chat Features

### Message Reactions

Users can react to messages with emojis:
- Add/remove reactions
- Multiple reactions per message
- See who reacted with what

```javascript
// Add reaction
POST /api/chat/reaction/add
{
  "messageId": "chat_123",
  "userId": "user789",
  "emoji": "😂"
}

// Remove reaction
POST /api/chat/reaction/remove
{
  "messageId": "chat_123",
  "userId": "user789"
}
```

### Message Types

Support for different message types:
- **Text**: Standard messages
- **Voice**: Voice message support (placeholder)
- **GIF**: Animated GIF support (placeholder)
- **Sticker**: Sticker support (placeholder)

### Reply Threading

Users can reply to specific messages:
- Quote and respond to earlier messages
- Context-aware conversations
- Better conversation flow

### Typing Indicators

Placeholder endpoint for typing status:
- Real-time typing indicators require WebSocket
- Stream Chat integration recommended for production

```javascript
// Get typing status (placeholder)
GET /api/chat/typing/:userId/:otherUserId
```

## 🎯 Implementation Benefits

These unique features provide:

1. **Deeper Matching**: Beyond surface-level preferences to viewing personalities
2. **Conversation Starters**: Built-in icebreakers with debate prompts
3. **Better Coordination**: Quick templates and time suggestions for watch parties
4. **Engaging Interactions**: Reactions and replies make chat more dynamic
5. **Competitive Advantage**: Features not found in typical dating apps

## Future Enhancements

Potential additions to these features:
- Visual archetype badges on profiles
- Debate leaderboards (most controversial, most agreed)
- Smart template suggestions based on user patterns
- AI-powered conversation starters based on shared content
- Video reactions to messages
- Animated profile frames based on archetype
- Collaborative watchlists with matches
