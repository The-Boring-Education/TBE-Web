# Email Service Module

A comprehensive email system for The Boring Education platform that handles automated email triggers for user engagement.

## 🎯 Features

- **Centralized Email Management** - All email functionality in one place
- **Beautiful Templates** - Branded, responsive email templates  
- **Automated Triggers** - Smart email triggers for user actions
- **Cross-Product Support** - API that all TBE products can use
- **Extensible Design** - Easy to add new triggers and templates
- **Non-blocking** - Email sending doesn't block main user flows

## 📁 Structure

```
src/services/email/
├── client.ts          # Email API client for 3rd party service
├── templates.ts       # HTML email templates
├── triggers.ts        # Email trigger service
├── index.ts          # Main exports
└── README.md         # This documentation
```

## 🚀 Quick Start

### Environment Variables

Add these to your `.env` file:

```bash
EMAIL_SERVICE_URL=https://chitthi-development.up.railway.app
EMAIL_API_KEY=your-breevo-api-key
FROM_EMAIL=sachin@theboringeducation.com
```

### Basic Usage

```typescript
import { sendWelcomeEmail } from '@/utils/email';

// Send welcome email to new user
await sendWelcomeEmail({
  email: 'user@example.com',
  name: 'John Doe',
  userId: 'user123'
});
```

## 📧 Available Email Triggers

### 1. Welcome Email
Sent when a user signs up for the platform.

```typescript
import { sendWelcomeEmail } from '@/utils/email';

await sendWelcomeEmail({
  email: 'user@example.com',
  name: 'John Doe', 
  userId: 'user123'
});
```

### 2. Course Enrollment
Sent when a user enrolls in a Shiksha course.

```typescript
import { sendCourseEnrollmentEmail } from '@/utils/email';

await sendCourseEnrollmentEmail({
  userEmail: 'user@example.com',
  userName: 'John Doe',
  userId: 'user123',
  courseName: 'React Fundamentals',
  courseDescription: 'Learn React from scratch',
  courseId: 'course123'
});
```

### 3. Project Enrollment
Sent when a user enrolls in a project.

```typescript
import { sendProjectEnrollmentEmail } from '@/utils/email';

await sendProjectEnrollmentEmail({
  userEmail: 'user@example.com',
  userName: 'John Doe',
  userId: 'user123',
  projectName: 'Todo App',
  projectDescription: 'Build a full-stack todo application',
  projectId: 'project123'
});
```

### 4. Interview Prep Enrollment
Sent when a user enrolls in interview preparation.

```typescript
import { sendInterviewPrepEnrollmentEmail } from '@/utils/email';

await sendInterviewPrepEnrollmentEmail({
  userEmail: 'user@example.com',
  userName: 'John Doe',
  userId: 'user123',
  sheetName: 'DSA Problems',
  sheetDescription: 'Data Structures and Algorithms practice',
  sheetId: 'sheet123'
});
```

## 🔌 API Endpoints

### Send Email
`POST /api/v1/email/send`

Send a custom email directly.

```bash
curl -X POST https://your-domain.com/api/v1/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "user@example.com",
    "subject": "Custom Email",
    "html_content": "<h1>Hello World!</h1>"
  }'
```

### Email Triggers
`POST /api/v1/email/triggers`

Trigger automated emails.

```bash
curl -X POST https://your-domain.com/api/v1/email/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "WELCOME",
    "data": {
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "userId": "user123"
    }
  }'
```

## 🎨 Email Templates

All templates are:
- **Mobile responsive** 
- **Brand consistent** with TBE colors and style
- **Personal** - signed by Sachin as Co-founder
- **Action-oriented** with clear CTAs
- **Social links** included (GitHub, Instagram, YouTube, Prep Yatra)

Template customization is done in `templates.ts`.

## 🔧 Extending the System

### Adding New Trigger Types

1. **Add trigger type** to `src/interfaces/email.ts`:
```typescript
export type EmailTriggerType = 
  | 'WELCOME'
  | 'COURSE_ENROLLMENT'
  | 'PROJECT_ENROLLMENT'
  | 'INTERVIEW_PREP_ENROLLMENT'
  | 'YOUR_NEW_TRIGGER'; // Add this
```

2. **Create template** in `src/services/email/templates.ts`:
```typescript
export const yourNewTemplate = (data: YourDataType): string => {
  // Template implementation
};
```

3. **Add to trigger service** in `src/services/email/triggers.ts`:
```typescript
case 'YOUR_NEW_TRIGGER':
  return {
    subject: 'Your Subject',
    htmlContent: yourNewTemplate(data as YourDataType),
  };
```

4. **Create utility function** in `src/utils/email.ts`:
```typescript
export const sendYourNewEmail = async (data: YourDataType) => {
  // Implementation
};
```

### Adding New Products

The email system is designed to work across all TBE products. Other products can:

1. **Call the API directly** using HTTP requests
2. **Import utilities** if they're part of the same codebase
3. **Use the trigger endpoints** for automated emails

## ⚠️ Important Notes

- **Non-blocking**: All email sending is non-blocking and won't fail user operations
- **Error handling**: Comprehensive error logging without breaking user flows  
- **Rate limiting**: Consider implementing rate limiting for high-volume scenarios
- **Testing**: Test with actual email addresses in development

## 🔍 Monitoring

Monitor email success/failure through:
- Application logs (console.log statements)
- Error tracking (existing Sentry integration)
- Email service dashboard

## 🤝 Usage by Other Products

For **Prep Yatra** and other TBE products:

```bash
# From any TBE product, call the email API
curl -X POST https://main-app-domain.com/api/v1/email/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "WELCOME",  
    "data": {
      "userEmail": "user@example.com",
      "userName": "John Doe",
      "userId": "user123"
    }
  }'
```

This centralizes all email logic in the main TBE webapp while allowing all products to leverage it.

---

Built with ❤️ for The Boring Education community 🇮🇳