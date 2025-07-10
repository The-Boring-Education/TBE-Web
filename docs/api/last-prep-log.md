# Last Prep Log API Documentation

## Endpoint
`GET /api/v1/prepyatra/prep-log/last`

## Description
Fetches the most recently added prep log for a user and provides metadata to help the UI determine whether to show encouragement sections/modals for adding new logs.

## Parameters
- `userId` (string, required): The ID of the user whose last prep log should be retrieved

## Response Format

### Success Response (User has prep logs)
```json
{
  "status": true,
  "message": "Last prep log retrieved successfully",
  "data": {
    "_id": "log_id",
    "user": "user_id", 
    "title": "My Latest Prep Session",
    "description": "Studied system design patterns",
    "timeSpent": 90,
    "createdAt": "2024-01-05T10:30:00.000Z",
    "updatedAt": "2024-01-05T10:30:00.000Z"
  },
  "details": {
    "hasLogs": true,
    "daysSinceLastLog": 2,
    "shouldEncourage": false
  }
}
```

### Success Response (User has no prep logs)
```json
{
  "status": true,
  "message": "No prep logs found for user",
  "data": null,
  "details": {
    "hasLogs": false,
    "shouldEncourage": true
  }
}
```

### Error Responses

#### Missing or Invalid User ID
```json
{
  "status": false,
  "message": "Missing or invalid userId"
}
```

#### Database Error
```json
{
  "status": false,
  "message": "Database connection failed"
}
```

#### Method Not Allowed
```json
{
  "status": false,
  "message": "Method POST not allowed"
}
```

## Response Metadata

### `details` Object Properties
- `hasLogs` (boolean): Indicates whether the user has any prep logs
- `daysSinceLastLog` (number): Number of days since the user's last prep log entry (only present when hasLogs is true)
- `shouldEncourage` (boolean): Recommendation for showing encouragement UI
  - `true` when user has no logs OR last log was more than 3 days ago
  - `false` when user logged within the last 3 days

## Usage Examples

### Frontend Integration
```javascript
// Fetch user's last prep log status
const response = await fetch(`/api/v1/prepyatra/prep-log/last?userId=${userId}`);
const result = await response.json();

if (result.status && result.details.shouldEncourage) {
  // Show encouragement modal or section
  showEncouragementModal();
}
```

### cURL Example
```bash
curl -X GET "https://yourapp.com/api/v1/prepyatra/prep-log/last?userId=user123"
```

## Business Logic

The API applies the following encouragement logic:
- Users with no prep logs: Always encourage logging
- Users with prep logs older than 3 days: Encourage logging  
- Users with recent prep logs (≤3 days): Don't encourage

This helps the UI provide contextual motivation for users to maintain consistent logging habits.

## Database Function
The endpoint uses `getLastPrepLogByUserFromDB(userId)` which queries the PrepLog collection for the most recent entry by the specified user, sorted by `createdAt` in descending order.