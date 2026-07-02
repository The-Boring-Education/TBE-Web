# Changelog

User-facing release notes for TBE Web. For the full commit-level history, see the [GitHub Releases page](https://github.com/The-Boring-Education/TBE-Web/releases).

## [v2.16.5](https://github.com/The-Boring-Education/TBE-Web/releases/tag/v2.16.5) — July 2, 2026

### Fixed
- Gamification points and streaks (visible on DSA Yatra, Interview Prep, and other product sheets) could fail to load after your first visit to a page. Returning to a sheet you'd already opened sometimes showed points as missing entirely, because the browser served a cached "not modified" response that the app didn't know how to read. Points and streaks now load reliably every time, whether it's your first visit or a return trip.

## [v2.16.4](https://github.com/The-Boring-Education/TBE-Web/releases/tag/v2.16.4) — July 2, 2026

### New
- Added a new admin dashboard for managing platform content and users, including sign-in/sign-out and CRUD tooling for admins.
- Added GA4 analytics tracking to better understand user activation across the platform.
- Introduced freemium guardrails on core subjects and sheets so free and paid access are clearly differentiated.

### Improved
- Refined the checkout page layout for a cleaner purchase flow.
- Polished onboarding: the loading state now stays active until a redirect decision is made, preventing a brief flash of the dashboard for users who haven't finished onboarding.
- Cleaned up back-button behavior, navigation, and mobile layout wrapping across DSA Yatra study guides.
- Prep Yatra goal timelines now display properly formatted dates instead of raw values.

### Fixed
- Resolved several test and environment-configuration issues affecting the onboarding gate to improve platform stability.

## [v2.16.3](https://github.com/The-Boring-Education/TBE-Web/releases/tag/v2.16.3) — June 20, 2026

### Improved
- Restyled the Interview Sheets page with cover images and a cleaner grid layout.
- Tightened spacing on the Interview Prep page and mobile category capsules.
- Moved shared algorithm visualizers into a common package so they render consistently across products.

### Fixed
- Fixed leaderboard streak calculations so your best streak is now correctly saved and displayed.
- Markdown now renders correctly in Interview Sheets, matching the OnCampus experience.

---

Older releases are available on the [GitHub Releases page](https://github.com/The-Boring-Education/TBE-Web/releases).
