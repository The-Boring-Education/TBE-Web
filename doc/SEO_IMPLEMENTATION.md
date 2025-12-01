# 🚀 SEO Implementation Guide - TBE Platform

## 📋 Overview

This document outlines the comprehensive SEO implementation for The Boring Education (TBE) Platform. The SEO system is designed to work across all apps in the monorepo (Platform, PrepYatra, Quizes, etc.) with a unified, extensible architecture.

## 🏗️ Architecture

### Core Components

1. **App Configuration** (`@tbe/constants/apps`)
   - Defines app-specific configurations (domain, default titles, descriptions)
   - Supports all TBE apps: platform, prep-yatra, quizes, onboarding, techyatra, dsayatra, resume-yatra

2. **SEO Metadata Generator** (`@tbe/constants/pages/seo`)
   - `getSEOMeta(basePath, appId)` - Generates SEO metadata for any route and app
   - App-specific metadata support
   - Fallback to platform defaults

3. **SEO Component** (`@tbe/components/layout/SEO`)
   - Enhanced SEO component with app-aware domain configuration
   - Comprehensive meta tags (Open Graph, Twitter Cards, etc.)
   - Automatic canonical URL generation

4. **SEO Wrapper** (`@tbe/components/layout/SEOWrapper`)
   - Convenient wrapper for automatic SEO handling
   - Auto-detects app from domain
   - Simplifies integration across pages

5. **Pre-fetch Props Utility** (`@tbe/utils/global`)
   - `getPreFetchProps({ slug, appId })` - Generates Next.js static props with SEO
   - Supports all apps

## 📦 Implementation

### 1. Basic Usage (Platform App)

```tsx
// apps/platform/src/pages/index.tsx
import { SEO } from '@tbe/components';
import { getPreFetchProps, routes, PAGE_REFRESH_TIMEOUT } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';

const Home = ({ seoMeta }: PageProps) => {
  return (
    <>
      <SEO seoMeta={seoMeta} />
      {/* Your page content */}
    </>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ slug: routes.home })),
  revalidate: PAGE_REFRESH_TIMEOUT.veryVeryLong,
});

export default Home;
```

### 2. PrepYatra App Usage

```tsx
// apps/prep-yatra/src/pages/index.tsx
import { SEO } from '@tbe/components';
import { getPreFetchProps, routes } from '@tbe/constants';
import type { PageProps } from '@tbe/interface';

const PrepYatraHome = ({ seoMeta }: PageProps) => {
  return (
    <>
      <SEO seoMeta={seoMeta} appId="prep-yatra" />
      {/* Your page content */}
    </>
  );
};

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ 
    slug: routes.prepYatra.home,
    appId: 'prep-yatra' 
  })),
});

export default PrepYatraHome;
```

### 3. Using SEO Wrapper (Automatic)

```tsx
// apps/prep-yatra/src/pages/dashboard.tsx
import { SEOWrapper } from '@tbe/components';
import { routes } from '@tbe/constants';

const Dashboard = () => {
  return (
    <>
      <SEOWrapper appId="prep-yatra" slug={routes.prepYatra.dashboard} />
      {/* Your page content */}
    </>
  );
};

export default Dashboard;
```

### 4. Custom Metadata Override

```tsx
import { SEO } from '@tbe/components';
import { getSEOMeta, routes } from '@tbe/constants';

const CustomPage = () => {
  const baseMeta = getSEOMeta(routes.home, 'platform');
  const customMeta = {
    ...baseMeta,
    title: 'Custom Page Title | The Boring Education',
    description: 'Custom description for this specific page',
  };

  return (
    <>
      <SEO seoMeta={customMeta} appId="platform" />
      {/* Your page content */}
    </>
  );
};
```

## 🎯 Best Practices

### ✅ DO

1. **Always use `getPreFetchProps` for static pages**
   ```tsx
   export const getStaticProps = async () => ({
     ...(await getPreFetchProps({ slug: routes.home, appId: 'platform' })),
   });
   ```

2. **Specify appId explicitly for non-platform apps**
   ```tsx
   <SEO seoMeta={seoMeta} appId="prep-yatra" />
   ```

3. **Use route constants from `@tbe/constants`**
   ```tsx
   import { routes } from '@tbe/constants';
   // ✅ Good
   getPreFetchProps({ slug: routes.prepYatra.dashboard })
   // ❌ Bad
   getPreFetchProps({ slug: '/dashboard' })
   ```

4. **Add app-specific routes to `routes.ts`**
   ```tsx
   // packages/constants/src/routes.ts
   prepYatra: {
     home: "/",
     dashboard: "/dashboard",
     // ... more routes
   }
   ```

5. **Add app-specific SEO metadata in `seo.ts`**
   ```tsx
   // packages/constants/src/pages/seo.ts
   if (appId === 'prep-yatra') {
     const prepYatraMeta = {
       [routes.prepYatra.dashboard]: {
         title: 'Dashboard | PrepYatra',
         // ... metadata
       }
     };
   }
   ```

### ❌ DON'T

1. **Don't hardcode domains**
   ```tsx
   // ❌ Bad
   <SEO seoMeta={seoMeta} domain="https://prepyatra.theboringeducation.com" />
   
   // ✅ Good
   <SEO seoMeta={seoMeta} appId="prep-yatra" />
   ```

2. **Don't duplicate SEO metadata**
   ```tsx
   // ❌ Bad - Creating metadata manually
   const meta = { title: '...', description: '...' };
   
   // ✅ Good - Using getSEOMeta
   const meta = getSEOMeta(routes.home, 'platform');
   ```

3. **Don't skip canonical URLs**
   - The SEO component automatically generates canonical URLs
   - Always use the SEO component, don't manually add canonical tags

## 🔧 Adding New Apps

### Step 1: Add App Configuration

```tsx
// packages/constants/src/apps.ts
export const APP_CONFIGS: Record<AppIdentifier, AppConfig> = {
  // ... existing apps
  'new-app': {
    identifier: 'new-app',
    name: 'New App',
    domain: 'https://newapp.theboringeducation.com',
    defaultTitle: 'New App | The Boring Education',
    defaultDescription: 'Description of the new app',
    defaultImage: 'https://newapp.theboringeducation.com/images/og-image.png',
  },
};
```

### Step 2: Add Routes

```tsx
// packages/constants/src/routes.ts
const routes = {
  // ... existing routes
  newApp: {
    home: "/",
    dashboard: "/dashboard",
    // ... more routes
  }
};
```

### Step 3: Add SEO Metadata

```tsx
// packages/constants/src/pages/seo.ts
const getAppSpecificSEOMeta = (basePath, appId, appConfig) => {
  if (appId === 'new-app') {
    const newAppMeta = {
      [routes.newApp.home]: {
        title: 'New App Home | The Boring Education',
        siteName: 'New App',
        description: '...',
        url: routes.newApp.home,
        keywords: '...',
        ...seoCommonMeta,
        image: appConfig.defaultImage || seoCommonMeta.image,
      },
      // ... more routes
    };
    return newAppMeta[basePath] || null;
  }
  // ...
};
```

### Step 4: Use in Pages

```tsx
// apps/new-app/src/pages/index.tsx
import { SEO } from '@tbe/components';
import { getPreFetchProps, routes } from '@tbe/constants';

const Home = ({ seoMeta }) => (
  <>
    <SEO seoMeta={seoMeta} appId="new-app" />
    {/* Content */}
  </>
);

export const getStaticProps = async () => ({
  ...(await getPreFetchProps({ 
    slug: routes.newApp.home,
    appId: 'new-app' 
  })),
});
```

## 📊 SEO Checklist

### Meta Tags ✅
- [x] Title tag (unique per page)
- [x] Meta description (unique, 150-160 characters)
- [x] Meta keywords
- [x] Robots meta tag
- [x] Canonical URL
- [x] Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- [x] Twitter Card tags
- [x] Author and publisher tags

### Technical SEO ✅
- [x] App-aware domain configuration
- [x] Automatic canonical URL generation
- [x] Proper URL structure
- [x] Mobile-friendly (handled by app layout)
- [x] Fast loading (handled by Next.js optimization)

### Content SEO 📝
- [ ] Unique, descriptive titles
- [ ] Compelling meta descriptions
- [ ] Relevant keywords
- [ ] Proper heading hierarchy (H1, H2, etc.)
- [ ] Alt text for images
- [ ] Internal linking structure

## 🚀 Future Improvements

### High Priority
1. **Structured Data (JSON-LD)**
   - Add schema.org markup for better rich snippets
   - Organization, BreadcrumbList, Article schemas

2. **Sitemap Generation**
   - Automatic sitemap.xml generation per app
   - Dynamic sitemap updates

3. **Twitter Card Enhancement**
   - Enable Twitter card previews
   - Add Twitter handle configuration

4. **Analytics Integration**
   - Track SEO performance
   - Monitor click-through rates

### Medium Priority
1. **Multi-language Support**
   - hreflang tags for internationalization
   - Language-specific metadata

2. **Dynamic OG Images**
   - Generate OG images dynamically
   - Include page-specific information

3. **SEO Testing**
   - Automated SEO audits
   - Lighthouse CI integration

### Low Priority
1. **A/B Testing**
   - Test different meta descriptions
   - Optimize titles for CTR

2. **SEO Dashboard**
   - Internal tool for SEO management
   - Bulk metadata updates

## 📚 Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Google Search Central](https://developers.google.com/search)

## 🐛 Troubleshooting

### Issue: Wrong domain in canonical URL
**Solution**: Ensure `appId` is correctly specified
```tsx
<SEO seoMeta={seoMeta} appId="prep-yatra" />
```

### Issue: Missing SEO metadata
**Solution**: Add route to `getAppSpecificSEOMeta` or `getPlatformSEOMeta`

### Issue: Duplicate meta tags
**Solution**: Don't manually add meta tags, use the SEO component

## 📝 Notes

- All SEO metadata is centralized in `packages/constants/src/pages/seo.ts`
- App configurations are in `packages/constants/src/apps.ts`
- Routes are defined in `packages/constants/src/routes.ts`
- The SEO component automatically handles domain configuration based on appId
- Canonical URLs are automatically generated and exclude query parameters

---

**Last Updated**: 2024
**Maintained By**: TBE Platform Team

