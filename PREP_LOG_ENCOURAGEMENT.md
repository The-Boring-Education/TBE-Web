# Prep Log Encouragement Features - API Documentation

This document outlines the new features implemented to encourage users to log their daily progress in Prep Yatra.

## Overview

The implementation adds streak tracking, gamification rewards, and smart notification systems to motivate users to maintain consistent daily logging habits.

## Features Implemented

### 1. Streak Tracking System

**Database Schema Changes:**

- Added `prepLog` object to user model with:
  - `currentStreak`: Number of consecutive days logged
  - `longestStreak`: Best streak achieved by user
  - `lastLoggedDate`: Last date user logged progress
  - `totalLogs`: Total number of logs created

### 2. Enhanced Gamification

**New Point Actions:**

- `PREPLOG_STREAK_3`: 25 points for 3-day streak
- `PREPLOG_STREAK_7`: 50 points for 7-day streak
- `PREPLOG_STREAK_15`: 100 points for 15-day streak
- `PREPLOG_STREAK_30`: 200 points for 30-day streak

**Automatic Rewards:**

- Points are automatically awarded when streak milestones are reached
- Existing `PREPLOG_CREATED` (15 points) remains for each log entry

### 3. Smart Reminder System

**Personalized Messages Based On:**

- Current streak status
- Whether user logged today
- Total logs created
- Longest streak achieved

**Message Types:**

- Daily reminders for inactive users
- Streak encouragement for active users
- Recovery messages for broken streaks
- Congratulatory messages for consistent loggers

## API Endpoints

### GET `/api/v1/prepyatra/prep-log/stats`

Get comprehensive prep log statistics for a user.

**Parameters:**

- `userId` (required): User's MongoDB ObjectId

**Response:**

```json
{
  "status": true,
  "data": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastLoggedDate": "2024-01-15T00:00:00.000Z",
    "totalLogs": 45,
    "hasLoggedToday": true,
    "recentLogs": 7,
    "weeklyLogs": [...]
  }
}
```

### POST `/api/v1/prepyatra/prep-log/reminder`

Send personalized reminder notification to encourage logging.

**Body:**

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "reminderType": "daily" // optional: daily, streak_broken, streak_risk
}
```

**Response:**

```json
{
  "status": true,
  "message": "Prep log reminder sent successfully",
  "data": {
    "notification": {...},
    "userStats": {...},
    "reminderType": "daily"
  }
}
```

### GET `/api/v1/prepyatra/prep-log/users-for-reminder`

Get list of users who need reminders based on criteria.

**Parameters:**

- `reminderType` (optional): `daily`, `streak_risk`, `streak_broken`, `inactive`

**Response:**

```json
{
  "status": true,
  "data": {
    "reminderType": "daily",
    "usersCount": 150,
    "users": [
      {
        "userId": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "prepLogStats": {...}
      }
    ]
  }
}
```

## Automated Behavior

### When User Creates Prep Log:

1. **Streak Calculation:**

   - Check if user logged yesterday to continue streak
   - Reset to 1 if streak broken
   - Update longest streak if current exceeds it

2. **Gamification:**

   - Award 15 points for log creation
   - Check for streak milestones and award bonus points
   - Update user's gamification record

3. **Data Tracking:**
   - Update `lastLoggedDate` to today
   - Increment `totalLogs` counter
   - Prevent duplicate logging on same day

### Reminder Logic:

**Daily Reminders:**

- Target: Users who haven't logged today
- Message: Encouraging daily habit formation

**Streak Risk Alerts:**

- Target: Users with 3+ day streaks who haven't logged today
- Message: Emphasize not breaking the chain

**Recovery Messages:**

- Target: Users whose streaks were broken yesterday
- Message: Motivate to start fresh and beat previous record

## Integration Examples

### Scheduled Daily Reminders (Cron Job)

```javascript
// Example: Send daily reminders at 7 PM
async function sendDailyReminders() {
  const response = await fetch(
    '/api/v1/prepyatra/prep-log/users-for-reminder?reminderType=daily'
  );
  const { users } = await response.json();

  for (const user of users) {
    await fetch('/api/v1/prepyatra/prep-log/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.userId, reminderType: 'daily' }),
    });
  }
}
```

### Frontend Integration

```javascript
// Check user's logging status for today
async function checkDailyStatus(userId) {
  const response = await fetch(
    `/api/v1/prepyatra/prep-log/stats?userId=${userId}`
  );
  const { data } = await response.json();

  if (!data.hasLoggedToday) {
    showDailyReminderBanner(data.currentStreak);
  }
}

// Show streak achievements
function showStreakAchievement(streak) {
  if ([3, 7, 15, 30].includes(streak)) {
    showCelebrationAnimation(`🔥 ${streak} Day Streak!`);
  }
}
```

## Future Enhancements

### Potential Additional Features:

1. **Weekly/Monthly Challenges:** Target logging goals with bigger rewards
2. **Social Features:** Share streaks with community, leaderboards
3. **Smart Reminders:** AI-powered timing based on user's active hours
4. **Progress Visualization:** Charts showing logging consistency over time
5. **Streak Recovery:** Grace periods for maintaining streaks during breaks

### Performance Considerations:

- Add database indexes on `lastLoggedDate` for efficient reminder queries
- Consider caching user stats for frequently accessed data
- Implement batch processing for mass reminder notifications

## Testing

The implementation includes comprehensive validation:

- ✅ API endpoint structure and error handling
- ✅ Input validation and sanitization
- ✅ Proper HTTP status codes and responses
- ✅ TypeScript type safety
- ✅ Integration with existing gamification system

All endpoints properly handle database connection issues and provide meaningful error messages for debugging.
