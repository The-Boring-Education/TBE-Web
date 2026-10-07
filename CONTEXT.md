# The Boring Education — Gamification

How TBE rewards learners for learning, and how that effort is ranked so learners stay motivated.

## Language

### Points

**Point Event**:
A single, immutable record that a learner gained or lost points for an action at a moment in time. Reversals (e.g. un-completing a question) are their own negative Point Events, never deletions. Learning Action Point Events are only ever created by the server after it has verified the learning happened; learners' browsers can only claim Engagement Actions.
_Avoid_: Action (overloaded with UI actions), activity

**Lifetime Points**:
The running total of all Point Events a learner has ever had. Never resets; drives **Level**.
_Avoid_: Total score, XP

**Level**:
A named tier (Noob → Legend) derived solely from **Lifetime Points**.
_Avoid_: Rank (rank belongs to leaderboards)

**Learning Action**:
A Point Event type that represents genuine learning effort on a **Learning Item** — completing a chapter, project, sheet, question, DSA topic, quiz (incl. perfect score), video, webinar, or creating a prep log. Only Learning Actions count toward a **Period Score**.
_Avoid_: Activity

**Base Learning Action** / **Bonus Learning Action**:
A Base Learning Action is direct effort on one Learning Item (a question, chapter, quiz attempt, video, webinar, prep log). A Bonus Learning Action is awarded only as a consequence of Base ones (perfect quiz score, finishing a sheet, DSA topic, project or course). Only Base Learning Actions are subject to the **Pace Limit**.

**Pace Limit**:
At most one Base Learning Action per learner per 3 minutes counts toward Period Score. Actions beyond the limit still record progress and earn Lifetime Points, but add nothing to Period Score.
_Avoid_: Rate limit (that's an infrastructure term)

**Leaderboard Exclusion**:
An admin decision that removes a learner from all leaderboards, Champions and Period Close emails, and which the learner cannot override. Used for abuse.
_Avoid_: Ban

**Engagement Action**:
A Point Event type that rewards platform engagement rather than learning — enrolling, logging in, daily visits, streak bonuses, sharing, referring, profile completion, feedback, certificate download, community help, recruiter adds. Earns **Lifetime Points** only.
_Avoid_: Bonus

**Learning Item**:
The specific thing a Learning Action is about (a chapter, a question, a quiz…). A learner's **net** contribution from one Learning Item never exceeds its value: repeating it (a retake, a second click) changes nothing, and un-completing then re-completing it nets to one award. The same holds for Lifetime Points — they only move when the item flips between done and not done.
_Avoid_: Content, resource

### Leaderboards

**Period**:
A fixed calendar window — a day, a week or a month — over which learners are ranked. All Period boundaries are in IST (Asia/Kolkata) for every learner: days run midnight–midnight, weeks run Monday–Sunday, months run 1st–last day.
_Avoid_: Tab, timeframe

**Period Score**:
The net sum of a learner's **Learning Action** Point Events inside one **Period**, across all TBE apps. Displayed floored at 0; only learners with a Period Score above 0 are ranked.
_Avoid_: Weekly points, leaderboard points

**Leaderboard**:
The ranking of learners by **Period Score** for one **Period**. v1 has a single global leaderboard (all apps combined) per Period.
_Avoid_: Scoreboard

**Rank**:
A learner's position on a **Leaderboard** for a given Period, counted among **Visible Learners** only.
_Avoid_: Level

**Leaderboard Visibility**:
A learner's choice (on by default) to appear on leaderboards other people see. A learner who turns it off still earns Period Score and can see their own Rank privately, but is absent from everyone else's view; admins always see everyone.
_Avoid_: Privacy mode, anonymous

**Visible Learner**:
A learner with Leaderboard Visibility on. Shown by full name to logged-in viewers and as first name + last initial (e.g. "Priya S.") to logged-out viewers.

**Tie-break**:
When two learners have the same Period Score, whoever reached that score first ranks higher. Ranks are never shared.

**Period Close**:
The moment a Period ends (midnight IST). Closing freezes its **Champions** and notifies the top finishers by email: top 3 for a day, top 10 for a week or month. Only Visible Learners are ever Champions or notified.

**Champion**:
One of the top 3 Visible Learners of a closed Period. Weekly and Monthly Champions earn a **Champion Badge** shown on their dashboard; Daily Champions are recorded but not badged.
_Avoid_: Winner, topper

## Relationships

- A learner has many **Point Events**; their sum is **Lifetime Points**, which determines one **Level**.
- A **Period Score** is derived from the subset of Point Events that are **Learning Actions** and fall inside that **Period**.
- Each **Period** has exactly one global **Leaderboard**; each learner with a non-zero Period Score has one **Rank** on it.

## Example dialogue

> **Dev:** Priya enrolled in three courses today — does that move her up the Daily leaderboard?
> **Domain expert:** No. Enrolling is an engagement Point Event; it raises her Lifetime Points and might level her up, but it isn't a Learning Action, so her Period Score is unchanged.
> **Dev:** And if she completes a question and then un-completes it?
> **Domain expert:** Two Point Events: +10 then −10. Her Period Score nets to zero.

## Flagged ambiguities

- "Leaderboard points" was used for both lifetime totals (legacy `/gamification/leaderboard` route) and period sums — resolved: rankings use **Period Score** only; **Lifetime Points** are never ranked in v1.
