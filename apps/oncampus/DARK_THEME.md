# Dark Theme Support for OnCampus App

This document explains the dark theme implementation for the OnCampus app components.

## Overview

Dark theme support has been added to the following components:
- `packages/components/src/layout/Navbar.tsx`
- `packages/components/src/containers/Cards/LoginCardNew.tsx`
- `packages/components/src/containers/Cards/Items/PrimaryCardWithCTA.tsx`

## How It Works

The dark theme uses Tailwind CSS's class-based dark mode strategy:
- Dark mode is enabled by adding the `dark` class to the `<html>` element
- All components use Tailwind's `dark:` variant to specify dark theme styles
- The theme persists across page reloads using localStorage

## Usage

### Enabling Dark Mode

To enable dark mode programmatically:

```javascript
document.documentElement.classList.add('dark');
localStorage.setItem('theme', 'dark');
```

### Disabling Dark Mode

To disable dark mode:

```javascript
document.documentElement.classList.remove('dark');
localStorage.setItem('theme', 'light');
```

### Using the ThemeToggle Component

A reusable `ThemeToggle` component has been created in `apps/oncampus/src/components/ThemeToggle.tsx`:

```tsx
import { ThemeToggle } from '../components/ThemeToggle';

// In your component
<ThemeToggle />
```

This component:
- Automatically detects user's system theme preference
- Persists theme choice in localStorage
- Provides a toggle button with sun/moon icons

## Modified Components

### Navbar
- Background: `bg-white dark:bg-gray-900`
- Text colors: `text-black dark:text-white`
- Border colors updated for dark mode
- Icons use className instead of color prop for dynamic theming

### LoginCardNew
- Card background: `bg-white dark:bg-gray-900`
- Text colors adapted for readability in both themes
- Border colors: `border-gray-200 dark:border-gray-700`
- Button styles updated for dark mode

### PrimaryCardWithCTA
- Container background: `bg-white dark:bg-gray-800`
- Text colors updated for contrast
- Badge colors adapted for dark theme
- Premium/Purchased indicators maintain visibility

### GradientContainer
- Default background updated to support dark mode
- Maintains hover effects in both themes

## Configuration

The dark mode is configured in `apps/oncampus/tailwind.config.ts`:

```typescript
{
  darkMode: 'class',
  // ... rest of config
}
```

This enables class-based dark mode, allowing manual control through the `dark` class.

## Testing

To test dark mode:

1. Start the development server:
   ```bash
   pnpm run dev:oncampus
   ```

2. Navigate to `http://localhost:3007`

3. Use the theme toggle button to switch between light and dark modes

4. Check that:
   - Navbar adapts to the theme
   - Login page components display correctly
   - All text remains readable
   - Icons and borders are visible

## Browser Support

Dark mode works in all modern browsers that support:
- Tailwind CSS v3
- CSS custom properties
- `prefers-color-scheme` media query

## Future Enhancements

Potential improvements:
- Add smooth transitions between themes
- Support system theme preference sync
- Add theme toggle to all pages
- Create a global theme context for React
