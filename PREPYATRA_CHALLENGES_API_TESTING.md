# PrepYatra Challenges API Testing Guide

This guide provides comprehensive testing for all PrepYatra challenges APIs in the correct sequence.

## Base URL
```
http://localhost:3000/api/v1/prepyatra/challenges
```

## Test Data Setup
Before testing, ensure you have a valid user ID. You can use any existing user ID from your database or create a test user.

**Test User ID**: `507f1f77bcf86cd799439011` (replace with actual user ID)

---

## 1. Create a New Challenge

### API Call
```bash
POST /api/v1/prepyatra/challenges
```

### Payload
```json
{
  "name": "30 Days Coding Challenge",
  "totalDays": 30,
  "category": "Programming",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Expected Response (201)
```json
{
  "success": true,
  "message": "Challenge created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "name": "30 Days Coding Challenge",
    "totalDays": 30,
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-02-14T10:00:00.000Z",
    "category": "Programming",
    "currentDay": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 2. Get All Challenges for User

### API Call
```bash
GET /api/v1/prepyatra/challenges?userId=507f1f77bcf86cd799439011
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Challenges retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "name": "30 Days Coding Challenge",
      "totalDays": 30,
      "startDate": "2024-01-15T10:00:00.000Z",
      "endDate": "2024-02-14T10:00:00.000Z",
      "category": "Programming",
      "currentDay": 0,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 3. Get Specific Challenge

### API Call
```bash
GET /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Challenge retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "name": "30 Days Coding Challenge",
    "totalDays": 30,
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-02-14T10:00:00.000Z",
    "category": "Programming",
    "currentDay": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 4. Add Progress Log for Day 1

### API Call
```bash
POST /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/logs
```

### Payload
```json
{
  "day": 1,
  "progressText": "Completed basic setup and solved first coding problem",
  "hoursSpent": 2.5,
  "nextGoals": ["Learn new algorithm", "Practice more problems"]
}
```

### Expected Response (201)
```json
{
  "success": true,
  "message": "Log created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "challenge": "507f1f77bcf86cd799439012",
    "day": 1,
    "progressText": "Completed basic setup and solved first coding problem",
    "hoursSpent": 2.5,
    "nextGoals": ["Learn new algorithm", "Practice more problems"],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 5. Get Challenge Progress

### API Call
```bash
GET /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/progress
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Progress retrieved successfully",
  "data": {
    "challengeId": "507f1f77bcf86cd799439012",
    "totalDays": 30,
    "completedDays": 1,
    "currentDay": 1,
    "progressPercentage": 3.33,
    "totalHours": 2.5,
    "currentStreak": 1,
    "maxStreak": 1,
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-02-14T10:00:00.000Z",
    "isActive": true
  }
}
```

---

## 6. Get Challenge Logs

### API Call
```bash
GET /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/logs
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "challenge": "507f1f77bcf86cd799439012",
      "day": 1,
      "progressText": "Completed basic setup and solved first coding problem",
      "hoursSpent": 2.5,
      "nextGoals": ["Learn new algorithm", "Practice more problems"],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## 7. Update Challenge Log

### API Call
```bash
PUT /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/logs/507f1f77bcf86cd799439013
```

### Payload
```json
{
  "progressText": "Completed basic setup and solved first coding problem. Also learned about time complexity.",
  "hoursSpent": 3.0,
  "nextGoals": ["Learn new algorithm", "Practice more problems", "Review data structures"]
}
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Log updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "challenge": "507f1f77bcf86cd799439012",
    "day": 1,
    "progressText": "Completed basic setup and solved first coding problem. Also learned about time complexity.",
    "hoursSpent": 3.0,
    "nextGoals": ["Learn new algorithm", "Practice more problems", "Review data structures"],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 8. Add Progress Log for Day 2

### API Call
```bash
POST /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/logs
```

### Payload
```json
{
  "day": 2,
  "progressText": "Solved 3 medium difficulty problems and learned about dynamic programming",
  "hoursSpent": 4.0,
  "nextGoals": ["Practice DP problems", "Learn graph algorithms"]
}
```

### Expected Response (201)
```json
{
  "success": true,
  "message": "Log created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "challenge": "507f1f77bcf86cd799439012",
    "day": 2,
    "progressText": "Solved 3 medium difficulty problems and learned about dynamic programming",
    "hoursSpent": 4.0,
    "nextGoals": ["Practice DP problems", "Learn graph algorithms"],
    "createdAt": "2024-01-16T10:00:00.000Z",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

---

## 9. Update Challenge Details

### API Call
```bash
PUT /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012
```

### Payload
```json
{
  "name": "30 Days Advanced Coding Challenge",
  "totalDays": 30,
  "category": "Advanced Programming",
  "isActive": true
}
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Challenge updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "name": "30 Days Advanced Coding Challenge",
    "totalDays": 30,
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-02-14T10:00:00.000Z",
    "category": "Advanced Programming",
    "currentDay": 2,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

---

## 10. Get Updated Challenge Progress

### API Call
```bash
GET /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/progress
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Progress retrieved successfully",
  "data": {
    "challengeId": "507f1f77bcf86cd799439012",
    "totalDays": 30,
    "completedDays": 2,
    "currentDay": 2,
    "progressPercentage": 6.67,
    "totalHours": 7.5,
    "currentStreak": 2,
    "maxStreak": 2,
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-02-14T10:00:00.000Z",
    "isActive": true
  }
}
```

---

## 11. Get User Challenge Statistics

### API Call
```bash
GET /api/v1/prepyatra/challenges/stats/507f1f77bcf86cd799439011
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "totalChallenges": 1,
    "activeChallenges": 1,
    "completedChallenges": 0,
    "totalHours": 7.5,
    "totalDaysLogged": 2,
    "averageHoursPerDay": 3.75,
    "completionRate": 0
  }
}
```

---

## 12. Delete Challenge Log

### API Call
```bash
DELETE /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/logs/507f1f77bcf86cd799439014
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Log deleted successfully"
}
```

---

## 13. Deactivate Challenge

### API Call
```bash
DELETE /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Challenge deactivated successfully"
}
```

---

## 14. Verify Challenge Deactivation

### API Call
```bash
GET /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Challenge retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "name": "30 Days Advanced Coding Challenge",
    "totalDays": 30,
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-02-14T10:00:00.000Z",
    "category": "Advanced Programming",
    "currentDay": 2,
    "isActive": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

---

## 15. Final Statistics Check

### API Call
```bash
GET /api/v1/prepyatra/challenges/stats/507f1f77bcf86cd799439011
```

### Expected Response (200)
```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "totalChallenges": 1,
    "activeChallenges": 0,
    "completedChallenges": 0,
    "totalHours": 3.0,
    "totalDaysLogged": 1,
    "averageHoursPerDay": 3.0,
    "completionRate": 0
  }
}
```

---

## Error Testing Scenarios

### 1. Invalid User ID
```bash
GET /api/v1/prepyatra/challenges?userId=
```
**Expected**: 400 Bad Request - "User ID is required"

### 2. Invalid Challenge ID
```bash
GET /api/v1/prepyatra/challenges/invalid-id
```
**Expected**: 404 Not Found - "Challenge not found"

### 3. Missing Required Fields
```bash
POST /api/v1/prepyatra/challenges
```
**Payload**: `{}`
**Expected**: 400 Bad Request - "Name, total days, and user/userId are required"

### 4. Duplicate Log Entry
```bash
POST /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012/logs
```
**Payload**: Same day as existing log
**Expected**: 409 Conflict - "Log already exists for this day"

### 5. Method Not Allowed
```bash
PATCH /api/v1/prepyatra/challenges/507f1f77bcf86cd799439012
```
**Expected**: 405 Method Not Allowed

---

## Testing Tools

### Using cURL
```bash
# Example for creating a challenge
curl -X POST http://localhost:3000/api/v1/prepyatra/challenges \
  -H "Content-Type: application/json" \
  -d '{
    "name": "30 Days Coding Challenge",
    "totalDays": 30,
    "category": "Programming",
    "userId": "507f1f77bcf86cd799439011"
  }'
```

### Using Postman
1. Import the collection
2. Set base URL: `http://localhost:3000/api/v1/prepyatra/challenges`
3. Update the user ID in environment variables
4. Run tests in sequence

### Using Thunder Client (VS Code)
1. Create new collection
2. Set base URL
3. Create requests for each endpoint
4. Test in sequence order

---

## Notes
- Replace `507f1f77bcf86cd799439011` with an actual user ID from your database
- The challenge ID (`507f1f77bcf86cd799439012`) will be generated when you create the first challenge
- Log IDs will be generated when you create logs
- All timestamps are in ISO format
- The API follows RESTful conventions
- CORS is enabled for all endpoints
- Database connection is handled automatically
