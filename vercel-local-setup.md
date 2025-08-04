# Vercel Local Development Setup

## Installation

Install Vercel CLI globally:

```bash
npm i -g vercel
```

## Login to Vercel

```bash
vercel login
```

## Link to Your Project

```bash
vercel link
```

## Pull Environment Variables

```bash
# Pull all environment variables from Vercel
vercel env pull .env.local

# Or pull specific environments
vercel env pull .env.development --environment=development
vercel env pull .env.production --environment=production
```

## Environment Variables Setup

### In Vercel Dashboard

1. Go to your project settings
2. Navigate to Environment Variables
3. Add these variables for each environment:

#### Production Environment:

```
PREPYATRA_APP_URL=https://prepyatra.theboringeducation.com
QUIZ_APP_URL=https://quiz.theboringeducation.com
NEXT_PUBLIC_ONBOARDING_APP_URL=https://onboarding.theboringeducation.com
```

#### Development Environment:

```
PREPYATRA_APP_URL=https://prep-yatra-git-development-tbe.vercel.app
QUIZ_APP_URL=https://the-boring-quizes-git-development-tbe.vercel.app
NEXT_PUBLIC_ONBOARDING_APP_URL=https://the-boring-onboarding-git-development-tbe.vercel.app
```

#### Preview Environment:

```
PREPYATRA_APP_URL=https://prep-yatra-git-development-tbe.vercel.app
QUIZ_APP_URL=https://the-boring-quizes-git-development-tbe.vercel.app
NEXT_PUBLIC_ONBOARDING_APP_URL=https://the-boring-onboarding-git-development-tbe.vercel.app
```

## Local Development Commands

### Using Vercel Local Development (Recommended)

```bash
# Start Vercel dev server (simulates Vercel environment)
npm run dev:vercel

# Or directly
vercel dev
```

### Using Next.js Development

```bash
# Regular Next.js development (uses .env.local)
npm run dev
```

### Test Reverse Proxy Configuration

```bash
# Test configuration before deployment
npm run test:proxy
```

## Testing Reverse Proxy

### 1. Test Environment Configuration

Visit: `http://localhost:3000/api/env-check`

### 2. Test Health Checks

Visit: `http://localhost:3000/api/health`

### 3. Test Reverse Proxy Routes

- `http://localhost:3000/prepyatra`
- `http://localhost:3000/quizzes`

### 4. Debug Page (if routes fail)

Visit: `http://localhost:3000/prepyatra/debug`

## Debugging 404 Issues

If you're getting 404 on `/prepyatra`:

1. **Check Environment Variables:**

   ```bash
   vercel env ls
   ```

2. **Verify URLs are accessible:**

   ```bash
   curl -I https://prep-yatra-git-development-tbe.vercel.app
   ```

3. **Check Vercel Functions Logs:**

   ```bash
   vercel logs --follow
   ```

4. **Test locally with Vercel dev:**
   ```bash
   vercel dev --debug
   ```

## File Structure for Environment Variables

Create these files locally (they're gitignored):

### `.env.local` (for local development)

```bash
PREPYATRA_APP_URL=http://localhost:5173
QUIZ_APP_URL=http://localhost:5174
NEXT_PUBLIC_ONBOARDING_APP_URL=http://localhost:5175
# ... other variables
```

### `.env.development` (pulled from Vercel)

```bash
PREPYATRA_APP_URL=https://prep-yatra-git-development-tbe.vercel.app
QUIZ_APP_URL=https://the-boring-quizes-git-development-tbe.vercel.app
NEXT_PUBLIC_ONBOARDING_APP_URL=https://the-boring-onboarding-git-development-tbe.vercel.app
# ... other variables
```

## Common Issues & Solutions

### 1. 404 on `/prepyatra`

- **Cause**: Reverse proxy not working
- **Solution**: Check environment variables in Vercel dashboard

### 2. `destination does not start with /` error

- **Cause**: Environment variables are undefined
- **Solution**: Set proper environment variables or use automatic fallbacks

### 3. CORS Issues

- **Cause**: Different domains
- **Solution**: Already handled in headers configuration

### 4. Local development not working

- **Cause**: Missing environment variables
- **Solution**: Use `vercel env pull` to get variables

## Deployment Checklist

Before deploying:

1. ✅ Run `npm run test:proxy`
2. ✅ Set environment variables in Vercel dashboard
3. ✅ Test with `vercel dev` locally
4. ✅ Verify target URLs are accessible
5. ✅ Deploy and test `/prepyatra` route
