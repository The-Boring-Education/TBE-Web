# TBE-Web

The Boring Education platform monorepo: a family of Next.js learning apps sharing
UI, hooks, and services through `@tbe/*` packages, with a single MongoDB-backed
API. This glossary fixes the language used across those apps so that similarly
named things mean the same thing. It is a glossary only, not a specification.

## Learning experience

**Learning Environment**:
The shared, dark, full-screen shell a learner sits inside while consuming any
learning content across products. Implemented once and reused, not re-built per
app.
_Avoid_: Learning layout, course shell, study mode (when you mean the shared shell)

**Learning surface**:
One product's learning content mounted inside the Learning Environment — Shiksha
courses, Projects, DSA sheets, OnCampus subjects, interview-prep sheets. A
surface supplies content and navigation; it does not own the shell chrome.
_Avoid_: Learning page, module, section (when you mean a whole product's reader)

**Shell chrome**:
The parts of the Learning Environment that are the same regardless of surface:
the top navbar, back control, gamification badge, progress bar, and the sidebar
drawer. The theme decision applies to chrome, not to rendered content.
_Avoid_: Frame, wrapper, header

**Navigation item**:
One entry in a learning surface's sidebar — a chapter, a question, or a section —
carrying an id, a label, a completion status, and an optional lock. The shared
shell consumes a normalized list of these rather than each surface's raw shape.
_Avoid_: Link, menu entry, list item (when you mean the typed contract)

**Content area**:
The scrollable region of a learning surface that holds the actual chapter body,
question detail, or MDX. Distinct from shell chrome; its visual design is not
governed by the Learning Environment theme decision.
_Avoid_: Body, main, viewport

## Analytics

**Semantic event**:
An explicitly named, versioned analytics event with an allowlisted property set —
as opposed to an automatically captured DOM interaction. TBE emits semantic
events deliberately and does not rely on autocapture.
_Avoid_: Track, hit, ping, autocapture event

**Sink**:
A destination that a semantic event is dispatched to. TBE fans one event out to
multiple sinks (GA4, PostHog). A sink is registered, is env-gated, no-ops when
unconfigured, and cannot throw into the caller.
_Avoid_: Provider, backend, transport, destination (pick "sink")

**Provider**:
The analytics vendor behind a sink (Google Analytics 4, PostHog). Used when
talking about the vendor and its account, not the code path — that is the sink.
_Avoid_: Platform, tool

**Delegated click stream**:
The existing capture-phase document click listener that emits one `UI_CLICK`
semantic event per interactive element. It is the single authoritative source of
UI-click data; PostHog autocapture stays off so clicks are not double-counted.
_Avoid_: Global listener, click tracker

**Session replay**:
PostHog's DOM recording of a learner's session. At TBE it masks all text and
inputs; it does not mask canvas or images, which is a deliberately accepted risk
(see `docs/adr/0003`). Enabled on learning surfaces, geo-disabled for EU/UK.
_Avoid_: Recording, screen capture, replay session

**Consent**:
The learner's analytics preference, resolved from Do Not Track / Global Privacy
Control signals and a persistent profile opt-out. TBE does not use a blocking
consent banner.
_Avoid_: Cookie acceptance, GDPR banner, opt-in

## Flagged ambiguities

- **"Learning environment" vs "learning surface"**: the Environment is the shared
  shell; a surface is one product's content inside it. Never use "learning
  environment" to mean a single product's reader page.
- **"Sink" vs "provider"**: the sink is the code path and its contract; the
  provider is the vendor. GA4-the-account is a provider; the GA4 fan-out target
  is a sink.

## Example dialogue

> **Dev**: Shiksha's learn page has its own drawer and its own chapter mapping.
> Do I rebuild the drawer?
>
> **Expert**: No. The drawer is shell chrome, so it belongs to the Learning
> Environment, not the surface. Shiksha is a learning surface — it should hand
> the shell a normalized list of navigation items and let the shell render the
> drawer.
>
> **Dev**: And the analytics on those chapter clicks?
>
> **Expert**: Those are semantic events. They already flow through the delegated
> click stream, so leave that alone — don't turn on PostHog autocapture or every
> click lands twice. The event fans out to both sinks. GA4 and PostHog are the
> providers behind those sinks.
>
> **Dev**: Does replay record the chapter content?
>
> **Expert**: On a learning surface, yes, with text and inputs masked. Just know
> canvas and images aren't masked — that's the accepted risk in ADR 0003, and
> it's why replay is off entirely for resume-yatra in practice.
