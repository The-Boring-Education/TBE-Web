# PRD: Safe Synthetic Data for OSS Development

Status: proposed, suitable for small agent slices after issue-breakdown approval.

## Problem Statement

Contributors need representative local data to browse learning experiences and
verify changes. Existing specialized seed scripts do not establish a complete,
safe contributor dataset. Sharing production exports or relying on an implicit
database connection would create unnecessary privacy and data-loss risks.

## Solution

Provide a deterministic synthetic dataset for an explicitly isolated local
database, with dry-run validation, repeatable upserts, and a narrowly scoped reset.
Start with one browseable course, then add a DSA fixture. Coordinate instructions
with the existing contributor-guide PR instead of writing a competing guide.

## User Stories

1. As a contributor, I want a documented local setup, so that I can begin without asking for production credentials.
2. As a contributor, I want a small synthetic course, so that I can see a realistic chapter list and content.
3. As a contributor, I want a synthetic DSA topic and questions, so that I can exercise the roadmap and access states.
4. As a contributor, I want repeatable seeding, so that a second run does not duplicate data.
5. As a contributor, I want dry-run output before writes, so that I can see the intended target and changes.
6. As a contributor, I want seed failures explained without secrets, so that I can fix configuration safely.
7. As a maintainer, I want production and remote targets refused, so that a mistaken environment cannot mutate real data.
8. As a maintainer, I want only fixture-owned records reset, so that unrelated local experiments survive.
9. As a maintainer, I want original synthetic content and reserved test addresses, so that no personal or licensed production content is distributed.
10. As a tester, I want stable references between fixtures, so that API and browser assertions are reproducible.
11. As a tester, I want external sends and payment calls absent from seeding, so that setup cannot trigger real actions.
12. As a contributor, I want authentication limitations documented honestly, so that synthetic content is not confused with a production auth bypass.

## Implementation Decisions

Confirmed: synthetic fixture runner and data-safety tests are approved module
boundaries. TBE API owns MongoDB data, and tests stay in the centralized test app.

Proposed for issue approval:

- Add a dedicated OSS fixture command with an explicit local target, separate from production-capable content migration and subscription seed commands.
- Allow loopback hosts and an explicitly documented local Compose service only; require an exact dedicated database name such as `tbe_oss`.
- Reject SRV/remote targets, non-OSS database names, and production environment modes. Never infer a connection from production configuration.
- Validate the complete fixture graph before writing; upsert stable fixture identities with a namespace/version marker.
- Provide a dry run and a separately confirmed, namespace-scoped reset; never drop a database or clear a whole collection.
- V1 supports anonymous catalog browsing and mocked-auth tests. A local signed-in workflow must use an existing supported mechanism or a separate security-reviewed proposal, not a new runtime auth bypass.

## Testing Decisions

Reuse subscription-seed tests for command/input conventions and existing
MongoDB-backed integration helpers for fixture writes. Assert remote/production
refusal before opening a database connection, stable counts after two runs,
foreign-key/reference validity, and preservation of unrelated records. Reuse
Shiksha/DSA browser fixtures for the learning flows. Mock all external clients and
assert zero email, payment, and AI calls during seed/reset.

## Out of Scope

Production snapshots, anonymization claims about real user data, changing
production authentication, distribution of provider keys, global resets, running
existing production seed commands, and seeding every TBE product in one change.

## Further Notes

The existing contributor-guide PR is #1241. A clean-machine onboarding checklist
should augment that work after coordination. Docker availability and local MongoDB
requirements must be stated, not assumed. No database is touched during planning.

## Technical Specification

### Contract and Invariants

Inputs are an explicit connection target, fixture version, action (preview, seed,
or reset), and confirmation for reset. Validate host, database name, environment,
and fixture references before connecting. Parse connection strings with a
supported parser rather than substring matching a hostname.

Output is a redacted target description and created/updated/unchanged counts or a
structured refusal/failure. Dry run is read-only and does not send external
requests. Failures leave the command retryable; do not promise transaction-wide
atomicity unless the chosen local MongoDB topology supports it.

Each fixture record has a stable identity and explicit ownership. Reset deletes
only records owned by that fixture namespace/version. A local record that shares
a user-facing title but lacks fixture ownership must not be overwritten.

The first vertical slice includes one synthetic Shiksha course with chapters,
the seed command, documented browse path, and API/browser verification. The
second adds a DSA topic, sample questions, and access/progress test scenarios.

### Acceptance Checks

- The default command cannot connect to or write production/remote data.
- Preview lists intended changes and produces zero writes.
- Two seed runs leave the same fixture identities and counts.
- Reset preserves an unrelated sentinel record in every touched collection.
- The synthetic course can be listed and its public content can be browsed locally.
- DSA fixtures resolve valid question/topic references after the follow-up slice.
- Logs contain no connection credentials or real personal data.

### Rollout Gates

Approve the local-host/database allowlist and reset behavior, run against an
isolated test database, then have a contributor verify the clean-machine guide.
Do not set up a shared public database as a shortcut.
