# Reverse Proxy Setup for TBE Products

This document explains how to configure reverse proxy for hosting Prep Yatra and The Boring Quizzes under the main TBE domain.

## Overview

Instead of using client-side redirects (which cause SPA routing issues), we now use:

1. **Vercel Rewrites** - Server-side reverse proxy at the CDN level
2. **Next.js Rewrites** - Application-level fallbacks and health checks
3. **Fallback Pages** - Enhanced user experience when reverse proxy fails

## Architecture

```
User Request: theboringeducation.com/prepyatra
       ↓
Vercel Rewrite: $PREPYATRA_APP_URL (e.g., https://prepyatra.theboringeducation.com)
       ↓
If rewrite fails → Next.js fallback → Enhanced redirect page
```

## Environment Variables

### Production Environment

```bash
PREPYATRA_APP_URL=https://prepyatra.theboringeducation.com
QUIZ_APP_URL=https://quiz.vercel.app
NEXT_PUBLIC_ONBOARDING_APP_URL=https://onboarding.vercel.app
```

### Development Environment

```bash
PREPYATRA_APP_URL=https://prep-yatra-git-development-tbe.vercel.app
QUIZ_APP_URL=https://the-boring-quizes-git-development-tbe.vercel.app
NEXT_PUBLIC_ONBOARDING_APP_URL=https://the-boring-onboarding-git-development-tbe.vercel.app
```

### Local Development

```bash
PREPYATRA_APP_URL=http://localhost:5173
QUIZ_APP_URL=http://localhost:5174
NEXT_PUBLIC_ONBOARDING_APP_URL=http://localhost:5175
```

## Vercel Configuration

### Environment Variables Setup

1. **In Vercel Dashboard:**

   - Go to Project Settings → Environment Variables
   - Add variables for each environment (Production, Preview, Development)

2. **Variable Substitution:**
   Vercel automatically replaces `$VARIABLE_NAME` in `vercel.json` with actual values.

### vercel.json Configuration

```json
{
  "rewrites": [
    {
      "source": "/prepyatra/:match*",
      "destination": "$PREPYATRA_APP_URL/:match*"
    },
    {
      "source": "/quizzes/:match*",
      "destination": "$QUIZ_APP_URL/:match*"
    }
  ]
}
```

## Next.js Configuration

### Rewrites for Health Checks and Fallbacks

```javascript
// next.config.js
async rewrites() {
  return {
    beforeFiles: [
      // Health check endpoints
      {
        source: '/api/health/prepyatra',
        destination: `${process.env.PREPYATRA_APP_URL}/api/health`,
      }
    ],
    afterFiles: [
      // Fallback routes
      {
        source: '/prepyatra/:path*',
        destination: '/prepyatra-fallback?path=:path*',
      }
    ],
  };
}
```

## SEO Benefits

1. **Proper URLs** - theboringeducation.com/prepyatra instead of external domains
2. **Meta Tags** - Consistent branding and social sharing
3. **Structured Data** - Rich snippets in search results
4. **Canonical URLs** - Proper SEO authority
5. **Performance** - CDN-level caching and optimization

## Performance Optimizations

1. **Caching Headers**

   ```
   Cache-Control: public, s-maxage=60, stale-while-revalidate=300
   ```

2. **Preconnect Headers**

   ```html
   <link rel="preconnect" href="target-domain.com" />
   <link rel="dns-prefetch" href="target-domain.com" />
   ```

3. **CDN-level Rewriting** - No server processing for most requests

## Security Considerations

1. **Frame Options** - `X-Frame-Options: SAMEORIGIN` for embedded content
2. **Content Security** - Proper CSP headers for mixed content
3. **CORS Handling** - Configured for cross-origin resource sharing
4. **Path Sanitization** - Input validation for security

## Monitoring and Health Checks

### Health Check Endpoints

- `/api/health/prepyatra` - Checks PrepYatra service status
- `/api/health/quizzes` - Checks Quiz service status

### Fallback Behavior

1. Vercel rewrite fails → Next.js handles request
2. Enhanced fallback page with countdown
3. Manual redirect option for users
4. Contact information for support

## Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Deploy Changes** to trigger new configuration
3. **Test Routes**:
   - `theboringeducation.com/prepyatra`
   - `theboringeducation.com/quizzes`
4. **Verify SEO** with tools like Google Search Console

## Troubleshooting

### Common Issues

1. **Environment Variables Not Working**

   - Check variable names match exactly
   - Verify environment-specific values
   - Redeploy after variable changes
   - **Error**: `destination does not start with /`, `http://`, or `https://`
     - **Cause**: Environment variables are undefined or invalid
     - **Solution**: Set proper environment variables or use the automatic fallbacks

2. **Rewrite Not Working**

   - Check vercel.json syntax
   - Verify target URL accessibility
   - Check Vercel function logs
   - Verify environment variables are set correctly

3. **SEO Issues**

   - Verify canonical URLs
   - Check meta tag rendering
   - Test with social media debuggers

4. **Undefined URL Errors**

   - **Error**: `undefined/api/health` in destination
   - **Cause**: Missing environment variables
   - **Solution**: The system now includes automatic fallbacks and validation

### Testing Commands

```bash
# Test configuration before deployment
npm run test:proxy

# Test environment setup during development
curl http://localhost:3000/api/env-check

# Test health endpoints (production)
curl https://theboringeducation.com/api/health/prepyatra
curl https://theboringeducation.com/api/health/quizzes
curl https://theboringeducation.com/api/health

# Test reverse proxy
curl -H "User-Agent: Mozilla/5.0" https://theboringeducation.com/prepyatra

# Check headers
curl -I https://theboringeducation.com/prepyatra
```

### Development Tools

1. **Configuration Test Script**

   ```bash
   npm run test:proxy
   ```

   - Validates environment variables
   - Checks Next.js and Vercel config syntax
   - Provides recommendations

2. **Environment Check API** (Development only)

   ```
   GET /api/env-check
   ```

   - Returns current environment configuration
   - Shows validation status
   - Lists missing variables and warnings

3. **Health Check Dashboard**
   ```
   GET /api/health
   ```
   - Overall system health status
   - Individual service status
   - Response time metrics

## Future Enhancements

1. **Real-time Health Monitoring** - Dashboard for service status
2. **A/B Testing** - Route percentage to different versions
3. **Geographic Routing** - Different services based on user location
4. **Advanced Caching** - Service-specific cache strategies
5. **Analytics Integration** - Track reverse proxy performance

## Support

For issues with reverse proxy setup:

- Check Vercel function logs
- Review environment variable configuration
- Contact support@theboringeducation.com
