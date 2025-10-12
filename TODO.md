# Authentication Migration TODO

This document outlines all the environment variables that need to be updated and deployment steps after migrating from Google OAuth to GitHub OAuth with NextAuth across all apps.

## 🎯 Overview

We've successfully migrated from Google OAuth to GitHub OAuth using NextAuth for a unified, secure authentication system across all TBE apps. This provides:

- ✅ **Single Sign-On (SSO)** across all apps
- ✅ **Centralized auth logic** in `@tbe/auth` package
- ✅ **GitHub OAuth only** (removed Google OAuth)
- ✅ **Consistent security patterns** across all apps
- ✅ **Server-side sessions** for better security

---

## 📋 GitHub OAuth Setup

### 1. Create GitHub OAuth Application

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the details:
    - **Application name**: `TBE Platform` (or your preferred name)
    - **Homepage URL**: `https://theboringeducation.com`
    - **Authorization callback URL**: Add multiple callback URLs for each app:
        ```
        https://api.theboringeducation.com/api/auth/callback/github
        https://platform.theboringeducation.com/api/auth/callback/github
        https://prepyatra.theboringeducation.com/api/auth/callback/github
        https://quizes.theboringeducation.com/api/auth/callback/github
        https://techyatra.theboringeducation.com/api/auth/callback/github
        https://dsayatra.theboringeducation.com/api/auth/callback/github
        http://localhost:3000/api/auth/callback/github
        http://localhost:3001/api/auth/callback/github
        http://localhost:3002/api/auth/callback/github
        http://localhost:3003/api/auth/callback/github
        http://localhost:3004/api/auth/callback/github
        ```
    - Note: GitHub OAuth apps support multiple callback URLs.

4. After creating the app, note down:
    - **Client ID**
    - **Client Secret** (generate if needed)

### 2. Alternative: Use a Single Wildcard Domain (Recommended for Production)

If you want to simplify, you can create separate OAuth apps for:

- **Production**: `https://[subdomain].theboringeducation.com`
- **Development**: `http://localhost:[port]`

---

## 🔐 Environment Variables

### Standard Environment Variables for ALL Apps

Every app needs these **exact same** environment variables:

```bash
# GitHub OAuth Credentials (SAME FOR ALL APPS)
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_SECRET=your_github_secret_here

# NextAuth Configuration (UNIQUE PER APP)
NEXTAUTH_URL=https://[app-subdomain].theboringeducation.com
# For local dev:
# NEXTAUTH_URL=http://localhost:[port]

# NextAuth Secret (SAME FOR ALL APPS FOR SSO)
NEXTAUTH_SECRET=your_generated_secret_here
# Generate with: openssl rand -base64 32

# Cookie Domain for SSO (PRODUCTION ONLY)
COOKIE_DOMAIN=.theboringeducation.com
# Leave blank for local development

# API URL (SAME FOR ALL APPS)
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com
# For local dev:
# NEXT_PUBLIC_API_URL=http://localhost:3004
```

---

## 📱 Environment Variables by App

### 1. API App (`apps/api`)

**Old variables to REMOVE:**

```bash
GOOGLE_AUTH_CLIENT_ID
GOOGLE_AUTH_CLIENT_SECRET
```

**New variables to ADD:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret

# NextAuth
NEXTAUTH_URL=https://api.theboringeducation.com
NEXTAUTH_SECRET=your_shared_secret

# SSO (Production only)
COOKIE_DOMAIN=.theboringeducation.com

# Database (Keep existing)
MONGODB_URI=your_mongodb_connection_string

# Admin
ADMIN_SECRET=your_admin_secret
```

---

### 2. Platform App (`apps/platform`)

**Old variables to REMOVE:**

```bash
GOOGLE_AUTH_CLIENT_ID
GOOGLE_AUTH_CLIENT_SECRET
```

**New variables to ADD:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret

# NextAuth
NEXTAUTH_URL=https://platform.theboringeducation.com
NEXTAUTH_SECRET=your_shared_secret

# SSO (Production only)
COOKIE_DOMAIN=.theboringeducation.com

# API URL
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com

# Database (Keep existing)
MONGODB_URI=your_mongodb_connection_string
```

---

### 3. Prep-Yatra App (`apps/prep-yatra`)

**Old variables to REMOVE:**

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

**New variables to ADD:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret

# NextAuth
NEXTAUTH_URL=https://prepyatra.theboringeducation.com
NEXTAUTH_SECRET=your_shared_secret

# SSO (Production only)
COOKIE_DOMAIN=.theboringeducation.com

# API URL (Keep existing or add)
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com

# Onboarding URL (Keep existing)
NEXT_PUBLIC_ONBOARDING_URL=https://onboarding.theboringeducation.com
```

---

### 4. Quizes App (`apps/quizes`)

**Old variables to REMOVE:**

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

**New variables to ADD:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret

# NextAuth
NEXTAUTH_URL=https://quizes.theboringeducation.com
NEXTAUTH_SECRET=your_shared_secret

# SSO (Production only)
COOKIE_DOMAIN=.theboringeducation.com

# API URL (Keep existing)
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com
```

---

### 5. Tech Yatra App (`apps/techyatra`)

**Old variables to REMOVE:**

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

**New variables to ADD:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret

# NextAuth
NEXTAUTH_URL=https://techyatra.theboringeducation.com
NEXTAUTH_SECRET=your_shared_secret

# SSO (Production only)
COOKIE_DOMAIN=.theboringeducation.com

# API URL
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com
```

---

### 6. DSA Yatra App (`apps/dsayatra`)

**New variables to ADD:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret

# NextAuth
NEXTAUTH_URL=https://dsayatra.theboringeducation.com
NEXTAUTH_SECRET=your_shared_secret

# SSO (Production only)
COOKIE_DOMAIN=.theboringeducation.com

# API URL
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com
```

---

### 7. Onboarding App (`apps/onboarding`)

**New variables to ADD:**

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret

# NextAuth
NEXTAUTH_URL=https://onboarding.theboringeducation.com
NEXTAUTH_SECRET=your_shared_secret

# SSO (Production only)
COOKIE_DOMAIN=.theboringeducation.com

# API URL
NEXT_PUBLIC_API_URL=https://api.theboringeducation.com
```

---

## 🚀 Deployment Order

To ensure smooth deployment, follow this order:

### Phase 1: Install Dependencies

```bash
# From project root
pnpm install
```

### Phase 2: Deploy Shared Package First

```bash
# The @tbe/auth package must be available for all apps
# This is automatically handled by pnpm workspace
# No separate deployment needed
```

### Phase 3: Deploy API App

```bash
cd apps/api
# Set environment variables in your deployment platform
# Deploy
```

### Phase 4: Deploy Platform App

```bash
cd apps/platform
# Set environment variables in your deployment platform
# Deploy
```

### Phase 5: Deploy Other Apps (Any Order)

```bash
# Prep-Yatra
cd apps/prep-yatra
# Deploy

# Quizes
cd apps/quizes
# Deploy

# Tech Yatra
cd apps/techyatra
# Deploy

# DSA Yatra
cd apps/dsayatra
# Deploy

# Onboarding
cd apps/onboarding
# Deploy
```

---

## 🧪 Post-Deployment Testing Checklist

Test each app after deployment:

### For Each App:

1. **Sign In Test**
    - [ ] Navigate to app URL
    - [ ] Click "Sign In with GitHub"
    - [ ] Authorize GitHub
    - [ ] Verify successful redirect to dashboard

2. **Session Persistence Test**
    - [ ] Sign in to App
    - [ ] Refresh the page
    - [ ] Verify still authenticated

3. **Sign Out Test**
    - [ ] Click sign out
    - [ ] Verify redirect to home/login
    - [ ] Verify cannot access protected routes

4. **SSO Test (Important!)**
    - [ ] Sign in to Platform app
    - [ ] Navigate to Prep-Yatra app
    - [ ] Verify automatically authenticated (SSO working)
    - [ ] Try on other apps

5. **Protected Routes Test**
    - [ ] Try accessing dashboard without auth
    - [ ] Verify redirect to login page
    - [ ] Verify callback URL preserves intended destination

### API-Specific Tests:

1. **API Authentication Test**

    ```bash
    # Get session token from browser DevTools > Application > Cookies
    # Test authenticated endpoint
    curl -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
         https://api.theboringeducation.com/api/v1/user
    ```

2. **Admin Endpoint Test**
    ```bash
    # Should return 403 for non-admin users
    # Should work for admin email
    ```

---

## 🔄 Rollback Plan

If issues occur, here's how to rollback:

### Option 1: Quick Rollback

1. Revert to previous deployment
2. Restore Google OAuth environment variables
3. Deploy previous version

### Option 2: Keep New System, Fix Issues

1. Check environment variables are set correctly
2. Verify GitHub OAuth app callback URLs
3. Check `NEXTAUTH_SECRET` is the same across all apps for SSO
4. Verify `COOKIE_DOMAIN` is set correctly for production

---

## 📝 Important Notes

1. **Same Secret for SSO**: All apps must use the **exact same** `NEXTAUTH_SECRET` for SSO to work across subdomains.

2. **Cookie Domain**: Set `COOKIE_DOMAIN=.theboringeducation.com` in production ONLY. Leave it unset for local development.

3. **Local Development**: Each app runs on a different port. Use:
    - API: `http://localhost:3004`
    - Platform: `http://localhost:3000`
    - Prep-Yatra: `http://localhost:3001`
    - Quizes: `http://localhost:3002`
    - Tech Yatra: `http://localhost:3003`
    - DSA Yatra: `http://localhost:3004`

4. **GitHub OAuth Scopes**: We request `read:user user:email` scopes. This is minimal and sufficient.

5. **Database User Schema**: Update the User model to change `provider` enum from `["google", "github"]` to just `["github"]`. Existing Google users will need to re-authenticate with GitHub.

6. **Session Duration**: Sessions last 30 days by default. Configure in `packages/auth/src/config/session.ts` if needed.

---

## 🐛 Troubleshooting

### Issue: "NEXTAUTH_SECRET is required"

**Solution**: Make sure `NEXTAUTH_SECRET` is set in environment variables.

### Issue: SSO not working across apps

**Solution**:

1. Verify all apps use the same `NEXTAUTH_SECRET`
2. Verify `COOKIE_DOMAIN=.theboringeducation.com` is set in production
3. Check that all apps are on the same root domain

### Issue: "Invalid OAuth callback"

**Solution**:

1. Verify the callback URL in GitHub OAuth app settings
2. Make sure `NEXTAUTH_URL` matches your actual app URL
3. Check that app URL in GitHub matches exactly (no trailing slashes)

### Issue: Users can't sign in

**Solution**:

1. Check browser console for errors
2. Verify `GITHUB_CLIENT_ID` and `GITHUB_SECRET` are correct
3. Check that GitHub OAuth app is not suspended
4. Verify API is accessible and database connection works

### Issue: Authentication works but can't access API

**Solution**:

1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check CORS settings on API
3. Verify API can connect to MongoDB

---

## ✅ Success Criteria

The migration is successful when:

1. ✅ All apps can authenticate with GitHub
2. ✅ SSO works across all apps (sign in once, authenticated everywhere)
3. ✅ Sessions persist across page refreshes
4. ✅ Protected routes redirect to login properly
5. ✅ Sign out works correctly
6. ✅ User data is created/retrieved from MongoDB correctly
7. ✅ No console errors related to auth
8. ✅ All existing features work as before

---

## 📞 Support

If you encounter issues during deployment:

1. Check this document first
2. Review the code in `packages/auth/`
3. Check browser DevTools console for errors
4. Verify environment variables are set correctly
5. Test locally first before deploying to production

---

## 🎉 Post-Migration

After successful deployment:

1. **Update Documentation**: Update any user-facing docs mentioning Google OAuth
2. **Monitor Logs**: Watch for auth-related errors in first 24-48 hours
3. **User Communication**: Inform users about the change to GitHub OAuth
4. **Cleanup**: Remove old Google OAuth-related code (see cleanup section below)

---

## 🧹 Cleanup Checklist

After successful deployment and testing, clean up old code:

### Files to Delete:

- [ ] `apps/prep-yatra/src/contexts/AuthContext.tsx`
- [ ] `apps/quizes/src/contexts/AuthContext.tsx`
- [ ] Any other custom Google OAuth integration files

### Code to Remove:

- [ ] All `@react-oauth/google` imports
- [ ] GoogleOAuthProvider components
- [ ] Custom Google OAuth sign-in logic
- [ ] localStorage-based auth (if used)

### Dependencies to Remove:

- [ ] `@react-oauth/google` from all package.json files
- [ ] Run `pnpm install` to update lockfile

---

**Last Updated**: October 12, 2025
**Migration Status**: ✅ Complete - Ready for Deployment
