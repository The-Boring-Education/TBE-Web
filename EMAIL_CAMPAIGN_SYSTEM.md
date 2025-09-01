# Automated Email Campaign System for TBE

## Overview

This system provides automated email functionality to send personalized emails to learners based on their progress, engagement, and learning patterns. The system supports scheduled emails, template-based content, and detailed analytics.

## Features

### 1. **Email Templates**
- **Progress Appraisal**: Personalized progress updates and achievements
- **Learning Encouragement**: Motivational content to keep learners engaged
- **Community Invitation**: Invitations to join the TBE community
- **Changelog**: Platform updates and new features

### 2. **Learner Segmentation**
- **ALL_LEARNERS**: All registered users
- **ACTIVE_LEARNERS**: Users with recent activity (configurable timeframe)
- **INACTIVE_LEARNERS**: Users with no recent activity
- **HIGH_PERFORMERS**: Users with high completion rates
- **NEW_LEARNERS**: Recently registered users

### 3. **Automation Features**
- Daily scheduled emails at 10 AM (via App Script)
- Personalized content with template variables
- Batch processing to avoid rate limits
- Email delivery tracking and analytics
- A/B testing capabilities

## API Endpoints

### 1. **Bulk Email Sending**
```
POST /api/v1/email/send-bulk
```

**Request Body:**
```json
{
  "templateId": "template_id_here",
  "segment": "ACTIVE_LEARNERS",
  "filters": {
    "lastActivityDays": 7,
    "limit": 100
  },
  "customSubject": "Optional custom subject",
  "customContent": "Optional custom content",
  "variables": {
    "customVar": "value"
  }
}
```

### 2. **App Script Integration**
```
POST /api/v1/email/app-script-trigger
```

**Request Body:**
```json
{
  "templateCategory": "LEARNING_ENCOURAGEMENT",
  "segment": "ACTIVE_LEARNERS",
  "apiKey": "your_api_key_here"
}
```

### 3. **Template Management**
```
POST /api/v1/email/seed-templates
```
Creates sample email templates for all categories.

## Database Models

### 1. **EmailTemplate**
```typescript
{
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
  category: 'PROGRESS_APPRAISAL' | 'LEARNING_ENCOURAGEMENT' | 'COMMUNITY_INVITATION' | 'CHANGELOG';
  isActive: boolean;
}
```

### 2. **EmailCampaign**
```typescript
{
  name: string;
  templateId: string;
  targetAudience: {
    segment: string;
    filters?: object;
  };
  schedule: {
    type: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
    scheduledAt?: Date;
    recurring?: object;
  };
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'PAUSED';
  stats: object;
}
```

### 3. **EmailLog**
```typescript
{
  campaignId?: string;
  userId: string;
  userEmail: string;
  userName: string;
  templateId: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED' | 'BOUNCED';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
}
```

## Setup Instructions

### 1. **Environment Variables**
Add to your `.env` file:
```
APP_SCRIPT_API_KEY=your_secure_api_key_here
```

### 2. **Seed Templates**
Make a POST request to `/api/v1/email/seed-templates` to create sample templates.

### 3. **App Script Setup**
Create a Google Apps Script with the following code:

```javascript
function sendDailyEmails() {
  const url = 'https://your-domain.com/api/v1/email/app-script-trigger';
  const payload = {
    templateCategory: 'LEARNING_ENCOURAGEMENT',
    segment: 'ACTIVE_LEARNERS',
    apiKey: 'your_api_key_here'
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    console.log('Email trigger response:', response.getContentText());
  } catch (error) {
    console.error('Error triggering emails:', error);
  }
}

// Set up daily trigger at 10 AM
function createDailyTrigger() {
  ScriptApp.newTrigger('sendDailyEmails')
    .timeBased()
    .everyDays(1)
    .atHour(10)
    .create();
}
```

## Usage Examples

### 1. **Send Progress Appraisal Emails**
```javascript
const response = await fetch('/api/v1/email/send-bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'progress_template_id',
    segment: 'ACTIVE_LEARNERS',
    filters: { lastActivityDays: 7 }
  })
});
```

### 2. **Send Community Invitations**
```javascript
const response = await fetch('/api/v1/email/send-bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'community_template_id',
    segment: 'NEW_LEARNERS',
    filters: { signupDays: 3 }
  })
});
```

### 3. **Send Platform Updates**
```javascript
const response = await fetch('/api/v1/email/send-bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'changelog_template_id',
    segment: 'ALL_LEARNERS',
    customSubject: 'Exciting New Features Available!',
    variables: {
      newFeature: 'Interactive Challenges',
      releaseDate: '2024-01-15'
    }
  })
});
```

## Template Variables

Available template variables that can be used in email templates:

- `{{userName}}` - User's display name
- `{{userEmail}}` - User's email address
- `{{currentDate}}` - Current date
- Custom variables can be passed in the `variables` object

## Email Categories

### 1. **Progress Appraisal**
- Purpose: Recognize user achievements and progress
- Frequency: Weekly or monthly
- Content: Progress reports, achievements, milestones

### 2. **Learning Encouragement**
- Purpose: Motivate users to continue learning
- Frequency: Daily (10 AM)
- Content: Motivational messages, learning tips, encouragement

### 3. **Community Invitation**
- Purpose: Encourage community participation
- Frequency: For new users or inactive users
- Content: Community benefits, invitation to join discussions

### 4. **Changelog**
- Purpose: Inform users about platform updates
- Frequency: When new features are released
- Content: New features, improvements, bug fixes

## Security Considerations

1. **API Key Protection**: Use environment variables for API keys
2. **Rate Limiting**: Implement rate limiting on email endpoints
3. **Input Validation**: Validate all user inputs
4. **Email Logging**: Log all email activities for audit purposes
5. **Unsubscribe Management**: Implement unsubscribe functionality

## Monitoring and Analytics

The system provides:
- Email delivery tracking
- Open and click rates
- Template performance metrics
- User engagement analytics
- Error tracking and reporting

## Future Enhancements

1. **A/B Testing**: Test different email templates and content
2. **Personalization**: More advanced personalization based on user behavior
3. **Drip Campaigns**: Multi-email sequences
4. **Advanced Segmentation**: More sophisticated user segmentation
5. **Email Templates Editor**: Visual template editor
6. **Analytics Dashboard**: Comprehensive analytics interface

## Support

For questions or issues with the email campaign system, please contact the development team or create an issue in the repository.
