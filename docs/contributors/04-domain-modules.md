# 04 — Domain modules

| Field              | Value                                                                                                |
| :----------------- | :--------------------------------------------------------------------------------------------------- |
| Owner              | _(unassigned — small enough that one person could own all five modules)_                             |
| Companion chapters | [02 Contribution Ledger](./02-contribution-ledger.md), [03 Review workflow](./03-review-workflow.md) |

Five pure-function modules. Each is a single file exporting one
function and its types — no classes, no singletons, no side effects.
Imported from API handlers and from tests directly. Tests for each
module are table-driven.

| Module                   | Path                                              | Signature                                                                                    |
| :----------------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------- |
| Tier Resolver            | `apps/api/src/lib/contributor/tier.ts`            | `tier(points: number) → Tier`                                                                |
| Submission State Machine | `apps/api/src/lib/contributor/submissionState.ts` | `canTransition(from: Status, to: Status) → boolean`                                          |
| Cohort Clock             | `apps/api/src/lib/contributor/cohortClock.ts`     | `cohortClock(startedAt: Date, now: Date) → { endsAt, daysRemaining, inCohort, graduatedAt }` |
| Proof URL Classifier     | `apps/api/src/lib/contributor/proofUrl.ts`        | `classify(url: string) → { kind, canonicalUrl, parts?, warnings }`                           |
| Escalation Router        | `apps/api/src/lib/contributor/escalation.ts`      | `route(tier: Tier, category: Category) → { channel, target, priority }`                      |

## 1. Tier Resolver

```ts
export type Tier = "contributor" | "lead" | "captain";

export function tier(points: number): Tier {
  if (points >= 100) return "captain";
  if (points >= 50) return "lead";
  return "contributor";
}
```

The thresholds `50` and `100` are the **only** place those numbers
appear in code. Moving them is a one-line change plus a backfill of
`DevRelLead.currentTier`.

**Tests (table-driven)**: `-1 → contributor`, `0 → contributor`,
`49 → contributor`, `50 → lead`, `99 → lead`, `100 → captain`,
`1000 → captain`.

## 2. Submission State Machine

```ts
export type Status =
  "pending" | "approved" | "changes_requested" | "rejected" | "retracted";

const ALLOWED: Record<Status, Status[]> = {
  pending: ["approved", "changes_requested", "rejected"],
  changes_requested: ["pending", "rejected"],
  approved: ["retracted"],
  rejected: [],
  retracted: [],
};

export function canTransition(from: Status, to: Status): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}
```

Full semantics in [03](./03-review-workflow.md). The function is
pure; the state updates are the caller's job.

**Tests**: a 5×5 transition table. Every valid transition returns
true; every disallowed one returns false. The ALLOWED map is the
test fixture — one copy of the rules, in the module.

## 3. Cohort Clock

Calendar-month arithmetic, not `+120 days`. A lead who joins on
Jan-15 graduates on May-15; a Jan-31 start snaps to the last day of
the target month if May had no 31st (it does; Feb doesn't — Oct-31
start → Feb-28 or Feb-29).

```ts
export function cohortClock(startedAt: Date, now: Date) {
  const endsAt = addCalendarMonths(startedAt, 4); // snapping rule above
  const daysRemaining = Math.max(0, floor((endsAt - now) / DAY));
  const inCohort = now < endsAt;
  return {
    endsAt,
    daysRemaining,
    inCohort,
    graduatedAt: inCohort ? null : endsAt,
  };
}
```

**Tests**: Jan-15 + 4mo = May-15; Jan-31 + 4mo = May-31 (May has
31); Oct-31 + 4mo = Feb-28 (or Feb-29 in a leap year); `daysRemaining`
floors at 0 past `endsAt`; `inCohort` is false exactly at `endsAt`
(not inclusive).

## 4. Proof URL Classifier

```ts
export type ProofKind =
  | "github_pr"
  | "github_issue"
  | "blog"
  | "tweet"
  | "linkedin"
  | "youtube"
  | "drive"
  | "other";

export function classify(url: string): {
  kind: ProofKind;
  canonicalUrl: string; // trimmed, normalized
  parts?: { owner: string; repo: string; number: number }; // github_pr only
  warnings: string[]; // never throws; non-URL input → kind: "other" + warning
};
```

Rules:

- `github.com/<owner>/<repo>/pull/<n>` → `github_pr` with `parts`.
- `github.com/<owner>/<repo>/issues/<n>` → `github_issue`.
- `twitter.com/...` or `x.com/...` → `tweet`.
- `linkedin.com/...` → `linkedin`.
- `youtube.com/...` or `youtu.be/...` → `youtube`.
- `drive.google.com/...` → `drive`.
- A URL with scheme http(s) and a hostname → `blog`.
- Anything else → `other` with a warning.

**Tests**: one case per rule, plus the three edge cases (empty
string, non-URL text, github URL with query/fragment).

The `parts` output of `github_pr` is what a future webhook-based
auto-approval will match against. Keep the shape stable.

## 5. Escalation Router

```ts
export type Channel = "calendly" | "in_app_inbox" | "email";
export type Category = "mentorship" | "proposal" | "task_blocker" | "general";

export function route(
  tier: Tier,
  category: Category,
  cfg: EscalationConfig,
): {
  channel: Channel;
  target: string; // URL for calendly/email; "inbox" for in_app_inbox
  priority: "normal" | "high";
};
```

Policy for v1:

| tier               | category       | → channel                     | priority |
| :----------------- | :------------- | :---------------------------- | :------- |
| captain            | _any_          | `calendly` (fallback `email`) | normal   |
| lead / contributor | `task_blocker` | `in_app_inbox`                | high     |
| lead / contributor | _any other_    | `in_app_inbox`                | normal   |

`cfg.calendlyUrl` and `cfg.fallbackEmail` come from env vars. If the
Calendly URL is missing, Captain messages route to `email`.

**Tests**: tier × category table; one test for the Calendly-missing
fallback.

## 6. Where tests live

```
apps/testing/src/unit/contributor/
├── tier.test.ts
├── submissionState.test.ts
├── cohortClock.test.ts
├── proofUrl.test.ts
└── escalation.test.ts
```

Prior art for structure: `apps/testing/src/unit/hooks/useGamification.test.ts`.
