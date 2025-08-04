# 📧 Email System Setup Guide

## 🚀 Quick Setup

### 1. Environment Configuration

Add these variables to your `.env` file:

```bash
# Email Service Configuration
EMAIL_SERVICE_URL=https://chitthi-development.up.railway.app
EMAIL_API_KEY=your-breevo-api-key  
FROM_EMAIL=sachin@theboringeducation.com
```

### 2. Get Your API Key

1. Contact the email service provider or use the provided API key
2. Replace `your-breevo-api-key` with your actual API key
3. Ensure `FROM_EMAIL` is properly configured

### 3. Test the Setup

```bash
# Test with curl
curl -X POST http://localhost:3000/api/v1/email/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "WELCOME",
    "data": {
      "userEmail": "your-email@example.com",
      "userName": "Test User",
      "userId": "test123"
    }
  }'
```

## 🎯 Current Email Triggers

✅ **Welcome Email** - When users sign up
✅ **Course Enrollment** - When users enroll in Shiksha courses  
✅ **Project Enrollment** - When users enroll in projects
✅ **Interview Prep Enrollment** - When users enroll in interview prep

## 🔧 Usage Examples

### From Your Code

```typescript
import { sendWelcomeEmail } from '@/utils/email';

// In user creation endpoint
await sendWelcomeEmail({
  email: user.email,
  name: user.name,
  userId: user._id
});
```

### From Other TBE Products

```javascript
// From Prep Yatra or any other TBE product
const response = await fetch('https://main-tbe-app.com/api/v1/email/triggers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    trigger: 'WELCOME',
    data: {
      userEmail: 'user@example.com',
      userName: 'John Doe',
      userId: 'user123'
    }
  })
});
```

## 📍 Integration Points

The email system is already integrated into:

- ✅ `src/pages/api/v1/user/index.ts` - User signup
- ✅ `src/pages/api/v1/user/shiksha/enroll.ts` - Course enrollment
- ✅ `src/pages/api/v1/user/projects/enroll.ts` - Project enrollment  
- ✅ `src/pages/api/v1/user/interview-prep/enroll.ts` - Interview prep enrollment

## 🛠️ Development & Testing

### Test Individual Templates

```bash
# Run the test file (update email address first)
npx ts-node src/services/email/test-email.ts
```

### Monitor Emails

Check logs for:
```
Email trigger WELCOME sent to user@example.com: SUCCESS
Email trigger COURSE_ENROLLMENT sent to user@example.com: FAILED
```

## 🚨 Troubleshooting

### Email Not Sending?

1. **Check API Key**: Ensure `EMAIL_API_KEY` is correctly set
2. **Check URL**: Verify `EMAIL_SERVICE_URL` is accessible
3. **Check Logs**: Look for error messages in console
4. **Test Manually**: Use curl to test the API directly

### Common Issues

- **Invalid API Key**: Check with email service provider
- **Network Issues**: Ensure external API access is allowed
- **Rate Limiting**: Don't send too many emails too quickly

### Email Service Response

Success Response:
```json
{
  "status": true,
  "message": "WELCOME email sent successfully",
  "data": { "success": true, "message": "Email sent successfully" }
}
```

Error Response:
```json
{
  "status": false,
  "message": "Failed to send WELCOME email",
  "error": "API key not configured"
}
```

## 🎨 Email Previews

All emails include:
- 🎯 The Boring Education branding
- 👋 Personal greeting from Sachin
- 🔗 Social media links (GitHub, Instagram, YouTube, Prep Yatra)
- 📱 Mobile-responsive design
- 🎨 Professional purple gradient theme

## 🔄 Next Steps

1. **Set up environment variables**
2. **Test with your email address** 
3. **Monitor email delivery**
4. **Add more triggers as needed**

## 📞 Support

For email system issues:
1. Check this guide first
2. Review logs for error messages
3. Test with curl commands
4. Verify environment configuration

---

**Happy Emailing!** 📧✨