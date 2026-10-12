---
status: accepted
---

# Leaderboards are live Period Score counters, not cron snapshots

Leaderboards are served from per-learner, per-Period score counters that are incremented in the same request that records a Point Event, and read through a `{period, score desc}` index behind a short CDN cache. We chose this over the previous design (a cron-built `Leaderboard` snapshot computed by scanning every `Gamification.actions[]`) because the motivation loop depends on a learner seeing their Rank move immediately after learning, and because the snapshot design required cron infrastructure, full-collection scans and a writable filesystem — none of which we had working in production.

## Consequences

- The legacy `Leaderboard` snapshot model and `POST /api/v1/leaderboard` generator are retired; historical Period results are simply the counters of past Periods.
- DB cost is bounded: one Point Event insert + one `bulkWrite` of three counter upserts per Learning Action; board reads are index-only and CDN-cached for ~30s.
- Counters for Periods in progress at launch were backfilled from legacy `actions[]` without Learning Item de-duplication (those events carry no item id).
