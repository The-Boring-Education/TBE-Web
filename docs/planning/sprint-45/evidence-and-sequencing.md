# Evidence and Sequencing

This appendix identifies inspected code and proposed ordering. It is not evidence
of a successful production deployment or a commitment to ship within this sprint.
All paths are navigation aids; behavior contracts in the PRDs remain authoritative.

## Repository Ownership

- TBE-Web owns the identified learner-facing, admin, contributor, API, and test surfaces.
- Chitthi is the existing email transport. Its handler accepts both body and header API keys; the header used by TBE is supported. No Chitthi change is assumed.
- The-Boring-Agents is not required by the proposed deterministic roadmap/planner options. An AI option would need its own approved service contract.
- No sprint task inspected here establishes work in vidya-pod or The-Boring-Retreat. Do not create unrelated tasks in those repositories.

## Code Evidence

| Area               | Inspected Anchor                                                                                                                                                                                                             | What It Establishes                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Email behavior     | [Email helpers](../../../apps/api/src/lib/services/email.ts), [trigger service](../../../apps/api/src/lib/services/triggers.ts), [transport client](../../../apps/api/src/lib/services/client.ts)                            | Welcome, onboarding, enrollment, and completion triggers exist; a coordinated lifecycle policy/ledger is separate work. |
| DSA preferences    | [User schema](../../../apps/api/src/lib/database/models/User.ts)                                                                                                                                                             | Experience, timeline, target, language, target topics, and progress already have a home.                                |
| Roadmap display    | [InteractiveRoadmap](../../../packages/components/src/containers/Page/common/InteractiveRoadmap.tsx)                                                                                                                         | Existing topic presentation is not a cross-product schedule.                                                            |
| Commercial catalog | [SubscriptionPlan](../../../apps/api/src/lib/database/models/SubscriptionPlan.ts), [catalog service](../../../apps/api/src/lib/services/payment/subscriptionPlanCatalog.ts)                                                  | Stable catalog identifiers and duration/access fields exist.                                                            |
| Checkout           | [Create-order handler](../../../apps/api/src/pages/api/v1/payment/create-order.ts)                                                                                                                                           | Server identity and authoritative amount resolution already exist; the reported incident is not reproduced.             |
| Contributor intake | [Contributor page](../../../apps/contributor/src/pages/index.tsx), [links configuration](../../../apps/contributor/src/config/links.ts), [DevRel lead model](../../../apps/api/src/lib/database/models/DevRel/DevRelLead.ts) | Public intake links externally; legacy workflow structures do not establish a complete integrated launch flow.          |
| Shiksha learning   | [Course learn page](../../../apps/platform/src/pages/shiksha/%5BcourseSlug%5D/learn.tsx)                                                                                                                                     | Chapter selection, completion, and certificate behavior share a sensitive workflow.                                     |
| Analytics          | [Analytics utility](../../../packages/utils/src/analytics.ts)                                                                                                                                                                | GA4 and delegated event capture exist; adding a provider needs privacy and duplicate-event decisions.                   |
| Local setup        | [API scripts](../../../apps/api/package.json), [existing setup guide](../../../README.md)                                                                                                                                    | Specialized seeds exist, but a safe general OSS fixture workflow is not established by these scripts.                   |
| IDE                | [DSA dependencies](../../../apps/dsayatra/package.json)                                                                                                                                                                      | No Monaco/CodeMirror dependency is declared in the inspected app manifest.                                              |
| Testing            | [Testing scripts](../../../apps/testing/package.json), [Shiksha E2E](../../../apps/testing/src/e2e/platform/shiksha.spec.ts), [payment tests](../../../apps/testing/src/unit/api-routes/payment-create-order.test.ts)        | Existing tools and tests should be extended, not replaced.                                                              |

The leaderboard glossary and accepted live-counter ADR were inspected on the
open feature branch, not assumed to exist on the documentation base:
[glossary](https://github.com/The-Boring-Education/TBE-Web/blob/9045260c/CONTEXT.md)
and [ADR](https://github.com/The-Boring-Education/TBE-Web/blob/9045260c/docs/adr/0001-live-period-score-counters.md).
Reuse [parent #1263](https://github.com/The-Boring-Education/TBE-Web/issues/1263),
its existing child issues, and [PR #1279](https://github.com/The-Boring-Education/TBE-Web/pull/1279).

## Proposed Vertical Sequences

Each arrow represents a dependency, not a layer-by-layer implementation split.
Every implementation slice must demonstrate a complete user or operator outcome.
Gated sequences stay inside their draft parent until decisions are resolved.

| Workstream            | Complete Outcomes in Order                                                                                                                                                           | Gate                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Messaging             | Approved eligibility/consent policy; one-app preview and one milestone through ledger/transport; preference/unsubscribe recovery; additional approved recognition/community messages | Clock semantics, consent, cap, scheduler, sender |
| DSA roadmap           | Approved recommendation policy; save preferences and open one explained next item; full topic sequence; preview replacement after preference/progress changes                        | Ranking, prerequisites, access presentation      |
| Cross-product planner | Reviewed synthetic two-product scenario; save and follow a two-product plan; reflect source completion; recover missed work through reviewed replanning                              | Product home, sources, capacity, timezone        |
| DSA pricing           | Approved commercial matrix; one offer from pricing through checkout to entitlement; existing-purchaser migration and renewal/refund scenarios                                        | Price, eligibility, lifetime, migration          |
| Contributor program   | Approved track/intake/consent policy; synthetic application to reviewed decision; onboarding to first accepted mission                                                               | Program and form ownership                       |
| OSS data              | Safe seed to browse one synthetic course; add valid DSA content and test scenarios; clean-machine contributor walkthrough                                                            | Approve explicit local target/reset rules        |
| Shiksha UX            | Durable chapter URL; safe progress failure/retry; accessible mobile chapter drawer                                                                                                   | Small-slice approval; separate visual review     |
| Admin                 | Select one operator scenario; deliver and verify that complete authorized workflow                                                                                                   | Actual workflow and permission policy            |
| Analytics             | Provider/privacy decision; one validated semantic event through an approved pilot; expand only after data-quality review                                                             | Explicitly unresolved provider                   |
| Hall of Fame          | Select recognition subject and consent; review/publish/withdraw one synthetic entry                                                                                                  | Subject, privacy, moderation                     |
| IDE                   | Scope/threat-model decision; editor/draft workflow; optional one-language sample execution; judged submissions only after a separate decision                                        | Isolation, provider, budget, test cases          |

## Operational and Small Tasks

| Sprint Item               | Planned Outcome                                                                                                                          | Handoff                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Send emails to learners   | Consolidated in the messaging PRD; do not create an independent bulk sender.                                                             | Messaging policy owner                             |
| Lifecycle email looping   | Follow up on merged welcome-email PR #1070 rather than reopening it.                                                                     | Messaging parent                                   |
| Create Order API Bug      | Collect redacted reproduction, environment, request correlation, expected/actual result, and affected version; verify current fix state. | HITL; no fabricated regression                     |
| Strategy and Plan         | Maintain program decisions, reviewer capacity, and a non-duplicated starter backlog.                                                     | Program owner                                      |
| Audit All TBE Products    | Authorized GA report with timeframe, metric definitions, caveats, and recommended decisions.                                             | Human analytics owner; no invented numbers         |
| Audit DevRel Program      | Reconcile public tracks, intake, consent, reviewer rubric, and first-mission handoff.                                                    | Contributor parent and human operations            |
| Admin App Improvements    | Select the named workflow before writing its implementation issue.                                                                       | Admin discovery parent                             |
| Acknowledge Contributions | Preserve the existing Live status; verify the shipped surface before requesting a follow-up.                                             | Human verification; no duplicate implementation    |
| DSA Personalized Roadmap  | Standalone DSA recommendation feature; not the cross-product planner.                                                                    | Roadmap parent                                     |
| Building Leaderboard      | Review existing PR #1279 and launch checklist #1278 against parent #1263.                                                                | Existing issues only                               |
| Improve Webapp Icons      | Decide app identity assets versus in-product icons, approve an inventory, then create bounded asset/control tasks.                       | HITL design clarification                          |
| Dummy DB for OSS          | Deterministic, isolated synthetic data with safety checks.                                                                               | OSS parent and small AFK slices                    |
| Integrate PostHog         | Preserve the open provider choice and existing GA4 behavior.                                                                             | Analytics decision parent                          |
| Improve Shiksha Learn UX  | Three proposed small behavior slices plus separate visual review.                                                                        | Shiksha parent                                     |
| Business Email            | Approve provider/budget, provision mailbox, verify sender and DNS, document ownership.                                                   | Human operations; no purchases or DNS changes here |

The sprint summary also names pricing, five discovery interviews, the planner,
Hall of Fame, and the IDE without separate board tasks. Pricing and the three
features have draft PRDs. Discovery interviews stay human-led: define learning
questions, recruit five participants with consent, use a consistent guide, and
record anonymized findings that inform product decisions. Keep raw notes private.

## Delegation Rules

- Only fully specified, unblocked slices receive `ready-for-agent`.
- Dependency-blocked AFK work remains unready until its prerequisites are accepted.
- Use `good first issue` only for genuinely narrow work with runnable fixtures and clear expected behavior; avoid security, payments, migrations, and runner infrastructure.
- Public briefs contain no real applicant data, private analytics, provider credentials, or production database instructions.
- Normal maintainer review and required CI apply to both Copilot and OSS contributions.
- Existing parent issues are not modified or closed by this planning pass.
