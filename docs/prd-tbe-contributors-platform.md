# Product Requirements Document (PRD)

# TBE Contributors Platform & Gamified Onboarding Program

| Attribute                  | Details                                                    |
| :------------------------- | :--------------------------------------------------------- |
| **Document Version**       | 1.0.0                                                      |
| **Status**                 | Approved / Ready for Engineering                           |
| **Product**                | The Boring Education (TBE) Contributors Platform           |
| **Target Cohort Duration** | 4 Months per Cohort                                        |
| **Owner / Founder**        | Sachin Shukla                                              |
| **Target Monorepo Apps**   | `apps/contributor`, `apps/admin`, `apps/api`, `packages/*` |

---

## 1. Executive Summary

The **TBE Contributor Program** is a structured, gamified 4-month initiative created by The Boring Education to mobilize learners, developers, and creators to build open educational technology products and foster an empowering tech community.

The **TBE Contributors Platform** provides a centralized web portal where contributors can onboard, choose their contribution track, discover tasks tagged with Experience Points (XP), submit work proofs, track their XP progression through a 3-tier hierarchy (**Contributor → Lead → Captain**), and interact directly with the founder and community leadership. Simultaneously, administrators and maintainers can manage tasks, review submissions, and award XP through the **TBE Admin App**.

---

## 2. Problem Statement & Opportunity

### The Problem

1. **Friction in Onboarding**: Aspiring open-source and community contributors struggle to know where to begin, what repository issues are ready, or what community tasks need attention.
2. **Fragmented Work Tracking**: Contributions submitted via Google Forms, Discord messages, or isolated GitHub Pull Requests create administrative overhead and lose momentum.
3. **Lack of Transparent Progression**: Contributors lack clear visibility into how their efforts accumulate towards recognition, leadership roles, certificates, and perks.
4. **Founder Accessibility Barrier**: Enthusiastic contributors often want mentorship, guidance, or feedback but lack an organized channel to reach out directly.

### The Opportunity

By unifying the contributor experience into a purpose-built platform within the TBE monorepo ecosystem, we provide:

- A clear, step-by-step onboarding journey for both **Code** and **Community** tracks.
- A transparent, verified **XP Economy** that rewards consistent value creation.
- A smooth workflow: **Pick → Work → Submit → Review → Get XP**.
- A high-retention 4-month cohort structure with milestone achievements and tangible rewards.

---

## 3. Target Audience & User Personas

| Role                                | Description                                                                                       | Key Motivations                                                             | Key Needs                                                                         |
| :---------------------------------- | :------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **New Learner / Applicant**         | Student or early engineer eager to build real projects or create tech content.                    | Gain industry-grade experience, build proof-of-work, learn in public.       | Clear track selection, beginner-friendly tasks, step-by-step guidance.            |
| **TBE Contributor (Level 1)**       | Active participant completing routine issues, documentation, or social discussions.               | Earn XP, get PRs merged, build consistency.                                 | Curated task showcase with point values, seamless submission dashboard.           |
| **TBE Lead (Level 2)**              | High-initiative contributor organizing college study jams, running webinars, or moderating chats. | Leadership experience, team collaboration, ecosystem impact.                | Visibility on community impact, event support, direct feedback loop.              |
| **TBE Captain (Level 3 - 100+ XP)** | Veteran contributor who achieved 100+ XP, acting as mentor and initiative owner.                  | Swag, internships, letter of recommendation, core team collaboration.       | Prestige badges, founder 1:1s, ability to guide newcomers and assist reviews.     |
| **Admin / Founder (Sachin Shukla)** | Core team maintainer reviewing submissions and setting roadmap priorities.                        | High-quality outputs, automated XP tracking, scalable community operations. | Fast approval/rejection queue in Admin app, audit trails, direct contact channel. |

---

## 4. Program Structure & Core Rules

### 4.1 Cohort Duration: 4 Months

- Each cohort runs for a dedicated **4-month window** (16 weeks).
- **Month 1 (Onboarding & Activation)**: Track selection, first contribution completed within 7 days, foundation building.
- **Month 2 (Consistency & Acceleration)**: Regular task pick-ups, intermediate features/content, reaching Lead status.
- **Month 3 (Initiative & Leadership)**: Complex modules, community events, hitting 100 XP milestone for Captain rank.
- **Month 4 (Graduation & Showcase)**: Final capstone deliverables, swags & certificates distribution, internship evaluations.

### 4.2 The Two Tracks

#### A. Code Track

- **Core Focus**: Engineering TBE web apps, open-source repositories, developer tools, and platform infrastructure.
- **Contribution Types**:
  - Picking GitHub issues across TBE apps (`platform`, `prepyatra`, `quizes`, `contributor`, etc.).
  - Bug fixes, refactoring, writing unit/integration tests.
  - Implementing new features, UI components, and API routes.
  - Improving technical documentation, READMEs, and contributor setup guides.
- **Verification Proof**: GitHub Pull Request URL (must be merged or verified by maintainer).

#### B. Community Track

- **Core Focus**: Community engagement, educational content, social advocacy, and peer support.
- **Contribution Types**:
  - Writing technical blog posts, guides, study sheets, and Twitter/LinkedIn threads.
  - Answering doubts and mentoring newcomers in TBE Discord / WhatsApp / Telegram groups.
  - Hosting or coordinating virtual study jams, hackathons, and campus meetups.
  - Creating reels, memes, video breakdowns, and educational assets.
- **Verification Proof**: Published URL (blog, post, video), event recording, or verified screenshot/transcript links.

---

## 5. Gamification & XP System

### 5.1 XP Philosophy

- XP is **earned through verifiable value delivered**, never arbitrary clicks.
- Small tasks yield small XP; high-impact, complex tasks yield high XP.
- XP is immutable and recorded in a ledger table in the database.

### 5.2 XP Tiers & Milestones

| XP Range       | Role / Tier         | Key Perks & Responsibilities                                                                                                                                                                                                     |
| :------------- | :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 – 49 XP**  | **TBE Contributor** | • Access to contributor channels<br>• Showcase on public leaderboard<br>• Eligibility for Contributor Certificate upon 4-month graduation                                                                                        |
| **50 – 99 XP** | **TBE Lead**        | • Host official study jams / events<br>• Event budget & community support<br>• Priority code review and feature ownership                                                                                                        |
| **100+ XP**    | **TBE Captain**     | • **Captain Badge** unlocked immediately upon crossing 100 XP<br>• Exclusive TBE Goodies & Swags shipped home<br>• Direct 1:1 monthly strategy calls with Founder<br>• Top consideration for TBE Internships and recommendations |

### 5.3 Typical XP Matrix (Reference Guide)

| Scope                       | Code Track XP                                                         | Community Track XP                                                       |
| :-------------------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Small / Good First Task** | 5 – 10 XP (Typo fixes, simple CSS adjustment, docs enhancement)       | 5 – 10 XP (Welcoming 5 newcomers, sharing verified feedback, short post) |
| **Medium Task**             | 15 – 25 XP (Component development, API endpoint fix, bug resolution)  | 15 – 25 XP (Comprehensive technical blog, hosting 1-hour study session)  |
| **Large / Complex Task**    | 30 – 50 XP (Full page/feature implementation, test suite integration) | 30 – 50 XP (Campus workshop organization, video tutorial series)         |
| **Heroic Initiative**       | 50 – 75+ XP (Architecture refactor, core app launch, major event)     | 50 – 75+ XP (Organizing a campus hackathon with 100+ learners)           |

---

## 6. Functional Requirements

### FR-1: Contributor Onboarding Flow

- **FR-1.1**: The landing page (`apps/contributor`) must provide clear calls-to-action for onboarding.
- **FR-1.2**: Contributors authenticate using TBE single sign-on / NextAuth (GitHub, Google, or Email).
- **FR-1.3**: Onboarding wizard prompts user to:
  1. Select Primary Track (`Code`, `Community`, or `Hybrid`).
  2. Fill in profile details (GitHub handle, LinkedIn, Discord/WhatsApp username, college/role).
  3. Review the **How We Work** charter (**Pick → Work → Submit → Review → Get XP**).
  4. Prompt to pick their **First Task**.

### FR-2: Contribution Task Showcase (Available Tasks)

- **FR-2.1**: A dedicated catalog showing all currently available tasks.
- **FR-2.2**: Filters by:
  - Track (`Code` vs `Community`)
  - Difficulty (`Beginner`, `Intermediate`, `Advanced`)
  - XP Value (`5 XP` to `50+ XP`)
  - Category (Frontend, Backend, Docs, Social, Event, Content)
- **FR-2.3**: Task detail cards show description, acceptance criteria, estimated time, and direct action link (e.g. GitHub issue URL or content guidelines).

### FR-3: Submission Workflow

- **FR-3.1**: Contributors can click **"Submit Contribution"** from any task card or from a global modal.
- **FR-3.2**: Submission form requires:
  - Associated Task ID (or "Custom / Independent Contribution" option)
  - Track (`Code` or `Community`)
  - Title and detailed description of work done
  - Proof URL (GitHub PR link, tweet/post link, Google Drive / ImageKit evidence)
  - Notes for the reviewer
- **FR-3.3**: Upon submission, the record enters `pending` state, visible on both the user's dashboard and the Admin app review queue.

### FR-4: Admin Review & XP Awarding System

- **FR-4.1**: Dedicated tab in `apps/admin` (e.g., `/admin/contributors/submissions`).
- **FR-4.2**: Reviewer can view all pending submissions with proof links, contributor profile, and requested XP.
- **FR-4.3**: Review actions:
  - **Approve**: Assigns XP (defaults to task XP, can be adjusted), adds positive feedback, immediately updates contributor's total XP and checks for tier promotion (e.g., reaching 100 XP promotes to Captain).
  - **Request Changes**: Sends feedback notes back to contributor; submission moves to `changes_requested`.
  - **Reject**: Marks submission as `rejected` with mandatory reason note.
- **FR-4.4**: All review actions are logged with reviewer ID and timestamp.

### FR-5: Contributor Dashboard

- **FR-5.1**: Displays contributor summary header:
  - Name, avatar, and active Track
  - **Total XP** earned and current Tier badge (**Contributor**, **Lead**, or **Captain**)
  - Progress bar to next tier (e.g., `45 / 100 XP to Captain`)
  - Cohort days remaining (out of 4 months)
- **FR-5.2**: **My Submissions Table / Cards**:
  - Filter by status (`Approved`, `Pending`, `Changes Requested`, `Rejected`).
  - Shows task name, submission date, proof link, XP awarded, reviewer feedback.
- **FR-5.3**: **XP History & Activity Feed**:
  - Timeline of all approved contributions and bonus XP awarded.

### FR-6: "Message Founder" Feature

- **FR-6.1**: Persistent button present on the Contributor Dashboard and navigation bar: **"Message Founder"**.
- **FR-6.2**: Clicking the button opens an action drawer/modal with:
  - Direct 1:1 options: Calendly/booking link for Captains/Leads, direct Telegram/Discord handle, or direct in-app message dispatch to Sachin Shukla's priority inbox.
  - Contextual prompt: "Need guidance on a task? Have an idea for TBE? Blocked on a review? Let Sachin know!"

---

## 7. Non-Functional Requirements (NFRs)

| Category              | Requirement                                                                                                                                                                 |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance**       | Dashboard and Task Catalog initial load under 1.2s; API endpoints response time < 200ms p95.                                                                                |
| **Data Integrity**    | XP events must be recorded atomically in an immutable ledger to prevent double-crediting or balance drift.                                                                  |
| **Security & RBAC**   | Only authenticated users with `admin` role in `AdminUser` collection can review submissions and mint XP. Contributors can only read/edit their own profile and submissions. |
| **Responsive Design** | Full responsiveness across mobile, tablet, and desktop (Tailwind CSS matching TBE design system).                                                                           |
| **Accessibility**     | Semantic HTML, keyboard accessible modals, ARIA labels, meeting WCAG 2.1 AA standards.                                                                                      |

---

## 8. Success Metrics & Key Performance Indicators (KPIs)

1. **Activation Rate**: $\ge 70\%$ of onboarded contributors complete their First Contribution within 14 days.
2. **Review Turnaround Time**: Submissions reviewed and acted upon by admins within $\le 48\text{ hours}$.
3. **Captain Milestone Attainment**: $\ge 15\%$ of contributors reach $\ge 100\text{ XP}$ (Captain level) within the 4-month cycle.
4. **Cohort Completion Rate**: $\ge 50\%$ active contributors still contributing in Month 4.
5. **Code & Community Output**:
   - $\ge 150$ merged pull requests across TBE repositories per cohort.
   - $\ge 200$ community posts, guides, and peer assistances logged.

---

## 9. Future Scope (Post-v1)

- Automated GitHub Webhooks integration to auto-verify merged PRs and allocate XP directly.
- Public Contributor Leaderboard page with seasonal podiums.
- Automatic PDF certificate generation with cryptographic verification ID upon 4-month cohort graduation.
- Discord / Telegram bot syncing contributor XP and badges automatically.
