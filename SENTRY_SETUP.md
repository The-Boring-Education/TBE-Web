# Sentry Setup Guide

## Fixing the "No auth token provided" Warning

The warning occurs because Sentry needs an auth token to create releases and upload source maps during deployment.

### 1. Generate Sentry Auth Token

1. Go to [Sentry Auth Tokens](https://sentry.io/settings/auth-tokens/)
2. Click "Create New Token"
3. Give it a name like "TBE Platform Deploy"
4. Select the following scopes:
    - `project:releases` (required for creating releases)
    - `project:write` (required for uploading source maps)
5. Copy the generated token

### 2. Set Environment Variable

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new variable:
    - **Name**: `SENTRY_AUTH_TOKEN`
    - **Value**: Your generated Sentry auth token
    - **Environment**: Production (and Preview if needed)

#### For Local Development:

Create a `.env.local` file in `apps/platform/` directory:

```bash
# Sentry Configuration
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### 3. Verify Configuration

The configuration has been updated in `apps/platform/next.config.js` to use the `SENTRY_AUTH_TOKEN` environment variable.

After setting up the environment variable, the warning should disappear on your next deployment.

### Optional: Disable Release Creation

If you don't want Sentry to create releases during build, you can disable it by adding this to your `sentryWebpackPluginOptions`:

```javascript
// Disable release creation
dryRun: true,
```

This will skip the release creation process entirely.
