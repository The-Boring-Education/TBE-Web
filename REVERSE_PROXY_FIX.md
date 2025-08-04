# 🔧 Reverse Proxy 404 Fix & Vercel Local Development Setup

## 🐛 Issues Fixed

### 1. **URL Construction Bug**

Fixed missing `/` in target URL construction in both:

- `src/pages/prepyatra/[[...slug]].tsx`
- `src/pages/quizzes/[[...slug]].tsx`

**Before:**

```javascript
const targetUrl = path ? `${proxyUrls.prepyatra}${path}` : proxyUrls.prepyatra;
```

**After:**

```javascript
const targetUrl = path ? `${proxyUrls.prepyatra}/${path}` : proxyUrls.prepyatra;
```

### 2. **Environment Variable Validation**

- Added proper fallback URLs for all environments
- Enhanced error handling for undefined variables
- Automatic URL validation in Next.js config

### 3. **Better Debugging Tools**

- Created `/prepyatra/debug` page for troubleshooting
- Added environment check API at `/api/env-check`
- Enhanced health check system

## 🛠️ New Tools Added

### 1. **Debug Page**

Visit: `http://localhost:3000/prepyatra/debug`

- Shows current environment configuration
- Tests all proxy URLs
- Displays validation status
- Quick health checks

### 2. **Configuration Test Script**

```bash
npm run test:proxy
```

- Validates environment variables
- Checks Next.js and Vercel config syntax
- Verifies Vercel CLI setup

### 3. **Vercel Development Setup**

```bash
npm run setup:vercel
```

- Automated Vercel CLI installation and setup
- Environment variable pulling
- Project linking

### 4. **New NPM Scripts**

```bash
npm run dev:vercel        # Start with Vercel dev (recommended)
npm run env:pull          # Pull env vars from Vercel
npm run env:pull:dev      # Pull development env vars
npm run debug:proxy       # Show debug instructions
npm run setup:vercel      # Complete Vercel setup
```

## 🚀 How to Fix Your 404 Issue

### Step 1: Set Up Vercel Local Development

```bash
# Run the automated setup
npm run setup:vercel

# Or manually:
npm install -g vercel
vercel login
vercel link
npm run env:pull
```

### Step 2: Set Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add these variables:

#### For Development Environment:

```bash
PREPYATRA_APP_URL=https://prep-yatra-git-development-tbe.vercel.app
QUIZ_APP_URL=https://the-boring-quizes-git-development-tbe.vercel.app
NEXT_PUBLIC_ONBOARDING_APP_URL=https://the-boring-onboarding-git-development-tbe.vercel.app
```

#### For Production Environment:

```bash
PREPYATRA_APP_URL=https://prepyatra.theboringeducation.com
QUIZ_APP_URL=https://quiz.theboringeducation.com
NEXT_PUBLIC_ONBOARDING_APP_URL=https://onboarding.theboringeducation.com
```

### Step 3: Test Locally with Vercel Dev

```bash
# Start Vercel development server (simulates Vercel environment)
npm run dev:vercel

# Test the routes:
# http://localhost:3000/prepyatra
# http://localhost:3000/quizzes
```

### Step 4: Debug if Routes Still Fail

```bash
# Check environment configuration
curl http://localhost:3000/api/env-check

# Use debug page
# Visit: http://localhost:3000/prepyatra/debug

# Check health status
curl http://localhost:3000/api/health
```

### Step 5: Deploy and Test

```bash
# Deploy to Vercel
vercel --prod

# Test on your deployment:
# https://tbe-dev-git-development-tbe.vercel.app/prepyatra
```

## 🔍 Why the 404 Happened

The 404 on `/prepyatra` indicates that:

1. **Vercel rewrites weren't working** - Environment variables weren't set properly
2. **Fallback mechanism activated** - Next.js served the `[[...slug]].tsx` page instead
3. **URL construction bug** - Even the fallback had incorrect URL formatting

## 🎯 Expected Behavior

### When Working Correctly:

1. User visits `theboringeducation.com/prepyatra`
2. Vercel rewrites to `$PREPYATRA_APP_URL` (your actual PrepYatra app)
3. User sees PrepYatra UI with TBE domain
4. SEO benefits from unified domain

### When Reverse Proxy Fails:

1. Vercel rewrite fails (missing env vars)
2. Next.js serves fallback page (`[[...slug]].tsx`)
3. Page redirects to actual PrepYatra URL
4. Maintains functionality but loses SEO benefits

## 📋 Troubleshooting Checklist

### ✅ Local Development

- [ ] Vercel CLI installed and logged in
- [ ] Project linked with `vercel link`
- [ ] Environment variables pulled with `npm run env:pull`
- [ ] Test with `npm run dev:vercel`
- [ ] Check `/prepyatra/debug` page

### ✅ Vercel Deployment

- [ ] Environment variables set in Vercel dashboard
- [ ] Variables set for correct environment (Development/Production)
- [ ] Target URLs are accessible
- [ ] Deploy and test `/prepyatra` route

### ✅ Debug Tools

- [ ] Run `npm run test:proxy` before deployment
- [ ] Check `/api/env-check` for configuration status
- [ ] Monitor `/api/health` for service status
- [ ] Use `/prepyatra/debug` for troubleshooting

## 🚨 Common Issues & Solutions

### Issue: Still getting 404

**Solution:** Check environment variables in Vercel dashboard

### Issue: Infinite redirect loop

**Solution:** Ensure target URLs don't redirect back to TBE

### Issue: CORS errors

**Solution:** Already handled in headers configuration

### Issue: Local development not working

**Solution:** Use `npm run dev:vercel` instead of `npm run dev`

## 📁 Files Modified/Added

### Modified:

- `src/pages/prepyatra/[[...slug]].tsx` - Fixed URL construction
- `src/pages/quizzes/[[...slug]].tsx` - Fixed URL construction
- `next.config.js` - Enhanced environment validation
- `src/utils/reverse-proxy.ts` - Improved URL handling
- `package.json` - Added new scripts

### Added:

- `src/pages/prepyatra/debug.tsx` - Debug page
- `src/utils/env-validation.ts` - Environment validation
- `src/pages/api/env-check.ts` - Environment check API
- `scripts/setup-vercel-dev.sh` - Automated setup
- `vercel-local-setup.md` - Setup documentation

## 🎉 Benefits

✅ **Fixed 404 issues** - Proper URL construction and environment handling  
✅ **Better debugging** - Comprehensive tools to identify issues  
✅ **Local development** - Proper Vercel environment simulation  
✅ **Automatic fallbacks** - System works even without environment variables  
✅ **Production ready** - Robust error handling and monitoring

Your reverse proxy should now work correctly across all environments! 🚀
