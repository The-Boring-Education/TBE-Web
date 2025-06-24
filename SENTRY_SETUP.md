# Sentry Integration Guide for TBE Webapp

This guide covers the complete Sentry integration for error tracking and performance monitoring in the TBE Next.js application.

## 🎯 What's Integrated

✅ **Frontend Error Tracking** - React component errors, unhandled exceptions
✅ **Backend API Error Tracking** - API route errors, database errors  
✅ **Edge Runtime Support** - Middleware and edge function error tracking
✅ **Error Boundaries** - Graceful error handling with user-friendly fallbacks
✅ **Performance Monitoring** - Transaction tracking and performance insights
✅ **User Context** - Automatic user identification for better debugging
✅ **Custom Error Categories** - Specialized tracking for API, database, auth, and payment errors

## 🔧 Configuration Files

### Core Configuration
- `sentry.client.config.ts` - Browser-side error tracking
- `sentry.server.config.ts` - Server-side API error tracking  
- `sentry.edge.config.ts` - Edge runtime and middleware tracking
- `next.config.js` - Updated with Sentry webpack plugin

### Supporting Files
- `src/components/common/ErrorBoundary/index.tsx` - React error boundary
- `src/utils/sentry.ts` - Utility functions for manual error tracking
- `src/middleware.ts` - Enhanced with Sentry tracking
- `src/constant/envConfig.ts` - Environment variable configuration

## 🔐 Environment Variables

Create a `.env.local` file with:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://17f4e904e93ad0db8706fb1bd808d2c3@o4509552599695360.ingest.us.sentry.io/4509552601137152
SENTRY_AUTH_TOKEN=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
```

## 🚀 Usage Examples

### 1. Basic Error Tracking

```typescript
import { captureException } from '@/utils/sentry';

try {
  // Your code here
} catch (error) {
  captureException(error as Error, {
    tags: { section: 'user_profile' },
    extra: { userId: user.id }
  });
}
```

### 2. API Error Tracking

```typescript
import { captureAPIError } from '@/utils/sentry';

try {
  const response = await fetch('/api/users');
} catch (error) {
  captureAPIError(
    error as Error,
    '/api/users',
    'GET',
    500,
    { requestData: someData }
  );
}
```

### 3. Database Error Tracking

```typescript
import { captureDatabaseError } from '@/utils/sentry';

try {
  await User.findById(userId);
} catch (error) {
  captureDatabaseError(
    error as Error,
    'findById',
    'users',
    { userId }
  );
}
```

### 4. User Context Setting

```typescript
import { setUser } from '@/utils/sentry';

// Set user context for better error tracking
setUser({
  id: user.id,
  email: user.email,
  username: user.name
});
```

### 5. Performance Tracking

```typescript
import { trackPerformance } from '@/utils/sentry';

const startTime = Date.now();
// Your operation
const duration = Date.now() - startTime;
trackPerformance('database_query', duration);
```

## 🎨 Error Boundary Usage

The `ErrorBoundary` component automatically catches React errors:

```tsx
import ErrorBoundary from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## 📊 What Gets Tracked

### Automatic Tracking
- **Unhandled JavaScript errors**
- **Promise rejections** 
- **React component errors**
- **API route errors**
- **Middleware errors**
- **Performance metrics**

### Manual Tracking
- **Database operations**
- **Authentication flows**
- **Payment processing**
- **User actions** (breadcrumbs)
- **Performance bottlenecks**

## 🔍 Error Categories & Tags

All errors are automatically tagged with:
- `component`: client/server/edge
- `section`: api/database/authentication/payment
- `environment`: development/production
- `url`: Request URL
- `method`: HTTP method

## 🛠️ Development vs Production

### Development
- **Debug mode enabled** - Verbose logging
- **Higher sample rates** - More detailed tracking
- **Console logging** - Errors logged to console
- **Event IDs shown** - For debugging

### Production  
- **Optimized sample rates** - 10% for performance, 1% for replays
- **Error filtering** - Noise reduction
- **Silent uploads** - No console spam
- **User privacy** - Sensitive data masked

## 🚦 Testing the Integration

### 1. Test Error Boundary
```typescript
// Add this to any component to trigger an error
if (someCondition) {
  throw new Error('Test error for Sentry');
}
```

### 2. Test API Error Tracking
```typescript
// In an API route
import { captureAPIError } from '@/utils/sentry';

export default function handler(req, res) {
  try {
    throw new Error('Test API error');
  } catch (error) {
    captureAPIError(error, '/api/test', 'GET', 500);
    res.status(500).json({ error: 'Test error' });
  }
}
```

### 3. Test Manual Error Capture
```typescript
import { captureMessage } from '@/utils/sentry';

// Test custom message
captureMessage('Test Sentry integration', {
  level: 'info',
  tags: { test: 'true' }
});
```

## 📈 Monitoring & Alerts

Visit your Sentry dashboard at: https://sentry.io/organizations/the-boring-education/

### Key Metrics to Monitor
- **Error rate** - Percentage of requests with errors
- **Performance** - Page load times and API response times  
- **User impact** - How many users are affected by errors
- **Release health** - Error rates for new deployments

### Recommended Alerts
- **High error rate** - >5% error rate in production
- **New error types** - Previously unseen errors
- **Performance degradation** - 50% slower than baseline
- **User feedback** - User-reported issues

## 🔧 Customization

### Adding Custom Tags
```typescript
import { setTag } from '@/utils/sentry';

setTag('feature_flag', 'new_ui_enabled');
```

### Adding Custom Context  
```typescript
import { setContext } from '@/utils/sentry';

setContext('user_preferences', {
  theme: 'dark',
  language: 'en',
  notifications: true
});
```

### Filtering Errors
Update the `beforeSend` function in the Sentry config files to filter out unwanted errors.

## 🆘 Troubleshooting

### Common Issues

1. **Errors not appearing in Sentry**
   - Check DSN configuration
   - Verify environment variables
   - Check network connectivity

2. **Too many errors**
   - Adjust sample rates in config
   - Add error filtering in `beforeSend`
   - Review error grouping rules

3. **Missing source maps**
   - Ensure auth token is set
   - Check build process
   - Verify webpack plugin configuration

### Debug Mode
Set `debug: true` in Sentry config for detailed logging.

## 📚 Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Error Filtering Best Practices](https://docs.sentry.io/product/data-management-settings/filtering/)

---

**🎉 Your TBE webapp now has comprehensive error tracking and monitoring!**