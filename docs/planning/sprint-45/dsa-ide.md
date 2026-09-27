# PRD: DSA Coding Workspace and Execution Boundary

Status: discovery draft; editor-only versus execution/judging remains undecided.

## Problem Statement

Learners may need a coding workspace near a DSA question, but "integrate an IDE"
does not specify whether it means an editor, sample execution, or a judged
submission system. Those options have very different security, content, cost,
and operational requirements. Executing untrusted learner code inside the API
application would create an unacceptable isolation risk.

## Solution

Choose the smallest useful workspace behavior, reuse a proven editor, and keep
any execution behind a separate isolated runner adapter. Preserve question
access and existing learning progress. Sample runs must not silently become
verified completions or leaderboard awards.

## User Stories

1. As a learner, I want the question and editor visible together, so that I can work without losing context.
2. As a learner, I want supported languages clearly listed, so that I do not write code the runner cannot execute.
3. As a learner, I want drafts preserved across navigation, so that accidental page changes do not discard work.
4. As a learner, I want separate drafts per question and language, so that switching languages does not overwrite unrelated code.
5. As a learner, I want reset to require confirmation when it discards edits, so that a click does not erase work.
6. As a learner, I want sample-run output and errors distinguished, so that I can understand what happened.
7. As a learner, I want queued, running, finished, timed-out, and unavailable states, so that slow execution is not presented as a frozen button.
8. As a learner, I want output limits and truncation explained, so that huge output cannot make the workspace unusable.
9. As a learner, I want mobile and keyboard-accessible controls, so that the workspace is not desktop-pointer-only.
10. As a learner, I want my draft privacy and retention explained, so that code is not shared unexpectedly.
11. As an operator, I want execution quotas and a kill switch, so that abuse or cost spikes can be contained.
12. As a maintainer, I want untrusted code isolated from application secrets and network access, so that a learner cannot access production systems.
13. As a maintainer, I want sample runs separated from judged submissions, so that an arbitrary successful program cannot award learning progress.
14. As a learner, I want question access enforced before execution, so that the workspace respects my entitlement.

## Implementation Decisions

Confirmed: use a proven editor and an isolated execution-adapter boundary if
execution is selected. The DSA README mentions editor options, but the inspected
app dependencies do not establish an integrated editor or runner.

Proposed, not yet approved:

- Choose an established editor such as Monaco or CodeMirror after bundle size, accessibility, mobile, and language needs are reviewed.
- Begin with an editor/draft slice or one-language sample-run slice, depending on the approved scope.
- Never invoke learner code with application-server processes, dynamic evaluation, or production credentials.
- Use an external sandboxed runner with bounded CPU, memory, wall time, output, and network permissions; review provider isolation and data handling before integration.
- Keep runner credentials server-only and validate language identifiers against a server-owned allowlist.
- Add judged submissions only after question test cases, scoring, anti-abuse, and award semantics are approved.

## Testing Decisions

Use editor interaction tests and mocked runner contract tests for accepted,
rejected, timeout, oversized-output, malformed-result, and outage cases. Test
ownership, entitlement, quotas, and per-question/language draft isolation. Browser
tests cover mobile framing, keyboard controls, draft recovery, and a mocked sample
run. Actual sandbox validation and provider configuration are separate human
security/release gates. No learner code is executed during this planning pass.

## Out of Scope

Running untrusted code in TBE API or The-Boring-Agents, choosing a paid runner
without approval, supporting every language, a collaborative editor, AI code
generation, automatic awards from sample runs, and migrating all questions to a
new judge before their test-case contract exists.

## Further Notes

Blocking decisions: editor-only versus sample execution versus judging, initial
language, runner/provider and budget, test-case ownership, draft persistence and
retention, anonymous access, quotas, and completion/award semantics. A vendor
choice and threat review are required before a runner issue can be agent-ready.

## Technical Specification

### Contract and Invariants

A workspace session identifies the authenticated learner, question, language,
draft revision, and selected execution mode. A run request validates ownership,
access, language, input/code size, quota, and idempotency before dispatch.

The runner adapter maps a bounded request to a job identifier and a normalized
result: state, stdout/stderr with truncation metadata, exit/result category, and
execution measurements. Results are untrusted data; escape output and never
render it as arbitrary HTML. Polling is bounded and stops on terminal state or
navigation cleanup. A retry of the same request does not silently create multiple
billable jobs.

Store drafts only in the approved persistence layer and partition by learner,
question, and language. Handle guest-to-auth transitions explicitly if guests are
supported. Reset and conflicts need defined behavior. Changing question access
does not expose protected statements or hidden tests through saved sessions.

Sample execution cannot mark a question complete or award points. A future judge
must use server-owned hidden tests and verified results; that policy is a
separate decision, not a browser boolean.

### Acceptance Checks

- Drafts survive the approved navigation/reload scenario without crossing users or languages.
- Reset does not discard edits without confirmation.
- Unsupported language, oversized input, and exhausted quota are rejected before runner dispatch.
- Timeout and runner outage leave the draft intact and expose a retryable UI state where appropriate.
- Output is bounded, escaped, and does not shift controls off-screen.
- No application secret or unrestricted application network is available to learner code.
- A sample run never changes canonical progress or Period Score.

### Rollout Gates

Approve scope, persistence, provider, and budget; review the isolation threat
model; test one language and one synthetic question; then enable a constrained
pilot with monitoring and a kill switch. Judging requires additional content and
award-policy approval.
