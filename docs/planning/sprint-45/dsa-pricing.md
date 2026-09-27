# PRD: DSA Access Plans and Pricing

Status: commercial-policy draft; prices, eligibility, and migration are unapproved.

## Problem Statement

Learners preparing for a placement season may need a clearly bounded preparation
period, while longer-term learners may prefer lifetime access. Changing pricing
copy alone could misrepresent actual entitlements or alter promises made to
existing purchasers. The phrase "committed users" does not define an enforceable
eligibility policy.

## Solution

Define and validate the commercial policy first, then represent approved offers
through the existing subscription catalog, checkout, and entitlement system.
Pricing, charged amount, access duration, renewal/refund behavior, and existing
purchaser treatment must agree end to end.

## User Stories

1. As a prospective learner, I want access duration and included content stated clearly, so that I know what I am buying.
2. As a placement-season learner, I want to know when access starts and ends, so that the plan fits my preparation window.
3. As a long-term learner, I want lifetime access defined precisely, so that the term does not conceal exclusions.
4. As an existing purchaser, I want my existing entitlement preserved unless a reviewed policy says otherwise, so that a new offer does not remove promised access.
5. As a learner, I want eligibility checked fairly and explained, so that an offer is not based on an ambiguous label.
6. As a learner, I want displayed and checkout amounts to agree, so that there are no surprise charges.
7. As a learner using a coupon, I want the valid discount applied once, so that the final amount is correct.
8. As a purchaser, I want successful payment to grant the correct access once, so that gateway retries do not duplicate purchases.
9. As a learner with expired access, I want an honest renewal path, so that I can continue without losing learning progress.
10. As a learner requesting a refund, I want the effect on access explained, so that the purchase terms are understandable.
11. As an operator, I want plan changes previewed and versioned, so that changing today's catalog does not rewrite purchase history.
12. As a maintainer, I want rejected or tampered checkout requests to fail safely, so that client-supplied amounts cannot set the price.
13. As an operator, I want a reversible rollout, so that a mistaken offer can be disabled without corrupting existing entitlements.

## Implementation Decisions

Confirmed: reuse the existing subscription catalog and entitlement/payment
boundaries. The catalog already has stable plan identifiers, active flags, access
type, and duration; zero duration is documented as lifetime in that model.
Checkout already resolves an authoritative amount server-side.

Proposed, not yet approved:

- Define a versioned offer and entitlement policy before adding or changing catalog records.
- Separate offer availability from entitlement expiry: a seasonal sale deadline is not automatically an access expiry date.
- Preserve purchase-time amount, currency, duration, and policy version; do not recalculate old purchases from a changed catalog.
- Validate monetary units at every boundary. Existing catalog fields use INR naming; new money handling should use integer minor units only with an explicit, tested conversion or migration, not a silent unit change.
- Make eligibility a server-verifiable rule or a recorded admin grant, never an unverifiable "committed" browser flag.
- Protect current progress when access expires or a plan is disabled.

## Testing Decisions

Reuse subscription catalog, plan-merge, coupon lifecycle, seed-plan, and
create-order tests. Test displayed versus charged amount, units, coupons,
ownership, inactive plans, payment retries, expiry boundaries, lifetime behavior,
refund consequences, and migration fixtures. Payment providers are mocked; a
human-authorized sandbox checkout is a later release gate, not a planning action.

## Out of Scope

Selecting prices without a business decision, changing production plans, charging
users, executing refunds, retroactively removing access, promising placement
outcomes, or treating the vague order-bug ticket as a confirmed pricing defect.

## Further Notes

Blocking decisions: exact offers/prices, season start and end semantics, lifetime
definition, eligibility, existing-user treatment, renewals, refunds, taxes, and
policy owner. Keep internal revenue and pricing research in Notion, not public
issues. The order-bug ticket needs a reproducible scenario and deployed-version
verification before it can become a fix ticket.

## Technical Specification

### Contract and Invariants

An approved offer identifies product, stable plan identity, version, currency,
amount with explicit unit, access policy, sale window, eligibility, and active
state. An entitlement references a verified purchase or authorized grant and
records its effective start/expiry or explicit non-expiring state.

Checkout derives user identity and price on the server and rejects inactive,
ineligible, or invalid product/plan combinations. Payment confirmation is
idempotent for the gateway order/event identity. A catalog edit must not silently
rewrite existing entitlement duration. Avoid representing lifetime through an
arbitrary far-future timestamp.

Migration begins with a read-only affected-record report, a policy-approved
mapping, and rollback/reconciliation instructions. A catalog-only change is not
sufficient evidence that access checks honor the new policy.

### Acceptance Checks

- Approved pricing copy, checkout amount, and resulting access match the same offer version.
- Invalid or manipulated amounts cannot change the authoritative charge.
- Duplicate payment confirmations grant one entitlement only.
- Existing users retain the access defined by the approved migration policy.
- Expired access changes availability without deleting saved progress.
- The verified lifetime representation is honored by access checks, not only the pricing card.
- Disabling a sale does not revoke existing purchases.

### Rollout Gates

Approve commercial terms, reproduce/verify the existing order concern, run
catalog-to-entitlement tests, review migration dry runs, and perform an authorized
sandbox purchase. A human approves production catalog changes separately.
