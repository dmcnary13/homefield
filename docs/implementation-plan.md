# Homefield Implementation Plan

Technical companion to [roadmap.md](roadmap.md). The roadmap explains *what's wrong and where we're going* for a non-technical audience. This document is *how we actually get there* — phased, sequenced, with the engineering decisions the roadmap doesn't make explicit.

Two ship checkpoints anchor this plan: a **secured, working web release** (real users, web only), then a **mobile release** (App Store / Play Store). The roadmap goes straight from "fix + secure" to "backend" to "mobile" with no explicit point where we stop and ship the web app to real users — this plan adds that checkpoint deliberately, so mobile work doesn't block getting a fixed, secure product in front of coaches.

---

## Decisions the roadmap doesn't make

These aren't phases — they're calls that change how the phases below get built. Get them settled early; retrofitting any of them later is expensive.

### 1. Program generation must become an async job, not a blocking HTTP call

The roadmap frames the ~2-minute generation time as a UX problem ("add streaming so it feels fast"). It's also an infrastructure problem: Vercel serverless functions have execution timeouts (10s on Hobby, up to 300s on Pro with `maxDuration` configured), and a single blocking HTTP request held open for 2 minutes is fragile on mobile networks regardless.

The backend needs a job model from the start:

```
POST /sessions/generate        → { jobId }  (enqueues, returns immediately)
GET  /sessions/generate/:jobId → { status: 'pending'|'running'|'done'|'error', text? }
```

Web polls or opens an SSE stream on the job; native additionally gets a push notification on completion (already in the roadmap's Layer 3, but it depends on this job model existing — it can't be bolted onto a synchronous endpoint later). Build this in Phase 2, not deferred to the mobile phase.

### 2. Apple's in-app purchase requirement changes the payments plan

The roadmap's payments section (Layer 4) assumes Stripe end-to-end. Once this ships as a native iOS app, Apple requires In-App Purchase for digital subscriptions (Apple takes 15–30%) unless the app qualifies for a narrow exception (e.g., "reader" apps, or the EU External Purchase Link entitlement, which has its own restrictions). Stripe-only checkout inside a native app risks App Store rejection.

This needs a decision before Phase 4 (mobile groundwork), not discovered during app store submission: either budget for RevenueCat/native IAP on mobile while keeping Stripe on web, or scope the mobile app as web-subscription-only (redirect to browser to manage billing, common pattern for "reader" positioning). Flag this for product/business input — it's not purely an engineering call.

### 3. Migrating the scoring engine needs a golden-output safety net

`calcSession()` in `src/App.jsx` is the proprietary IP. The roadmap says "move it to a backend endpoint" as a one-line item. Before porting a single line, generate a fixture set: representative pitch grids × ages, run them through the *current* client code, and snapshot the outputs. The backend port is only done when it reproduces those snapshots exactly. Without this, a subtle rounding or ordering bug in the port silently changes every athlete's score with no one noticing until a coach questions it.

### 4. Auth strategy must work for web and native from day one

The roadmap says "set HttpOnly cookies." That's correct for web but doesn't exist as a concept for native apps. Design the auth endpoints to issue both a cookie (web) and a bearer token suitable for `expo-secure-store` (native) from the same login flow now, rather than bolting on a second auth path when mobile starts.

### 5. Cut over frontend-to-backend endpoint by endpoint, not all at once

The current frontend talks to Supabase directly for everything. The roadmap implies replacing this wholesale in Phase 2. A big-bang cutover on a live app is high-risk with zero test coverage. Migrate one resource at a time (sessions read → sessions write → athletes → auth), with the old direct-Supabase path removed only after the new endpoint is verified in production. This is slower but each step is independently revertible.

### 6. No tests, no CI, no environment separation exist today

Not called out anywhere in the roadmap. There is currently one Supabase project, no staging environment, and no automated tests of any kind. This has to exist before Phase 1 changes RLS policies or auth on a live app — you need a way to verify a policy change doesn't lock out real users before it's in production.

---

## Phase 0 — Foundations (before touching product code)

1. **Environment separation**: second Supabase project for dev/staging, separate `ANTHROPIC_API_KEY` and Stripe test keys per environment, documented in `.env.example`.
2. **CI pipeline** (GitHub Actions): run build + (once they exist) tests on every PR. Doesn't need to be sophisticated — it needs to exist.
3. **Golden-output fixtures for `calcSession()`** — see decision #3 above. Do this before any scoring code moves.
4. **Manual smoke-test checklist** in `docs/` covering the critical path (login → new session → generate program → view program → coach roster view) until real E2E tests exist. Run it before every deploy in the interim.
5. **Database migration tooling** — adopt Supabase CLI migrations (`supabase/migrations/`) instead of ad hoc dashboard SQL, so schema changes are reviewable and reproducible across environments.

*Exit criteria: a PR can be opened, built, and smoke-tested against a non-production Supabase project before it touches real data.*

---

## Phase 1 — Fix the core bug, then secure the app

Split into two PRs deliberately — they touch overlapping files but have very different risk profiles, and you want the ability to ship the bug fix without waiting on security review.

### 1a. Fix the vision call (isolated, ship first)
- `api/generate.js` + `generateProgram()`: send `mechanicsImages` as multimodal `content` blocks instead of a plain string, per the roadmap's snippet.
- Verify against the smoke-test checklist with a session that has all 6 images uploaded — confirm the generated program actually references what's in the photos.

### 1b. Security hardening (higher risk — stage it)
1. Add Supabase RLS policies scoped to `auth.uid()` on `accounts`, `athletes`, `sessions` — **write and test policies against a copy of production data in staging before applying to production.** Getting RLS wrong locks out real users; this is the single highest-risk step in this phase.
2. Move the Supabase key server-side; frontend calls the new backend instead of Supabase directly for the resources RLS now protects (start the strangler-fig migration from decision #5 here, not in Phase 2 — auth has to move together with RLS).
3. Add auth middleware to `/api/generate` — reject unauthenticated or over-quota requests.
4. Replace hardcoded test Stripe links with server-created Checkout Sessions; add webhook handling for `checkout.session.completed`.
5. Add basic error tracking (Sentry or equivalent) — this is the first point a real backend exists to instrument, don't wait until Phase 4's polish pass.

*Exit criteria: no client-side code holds a Supabase key or unscoped data access; a user cannot generate a program without an active subscription.*

---

## Phase 2 — Backend extraction

1. Stand up the Node/Express (or Fastify) service per the roadmap's Layer 1, starting with the async job endpoints from decision #1.
2. Continue the strangler-fig migration: move `athletes`/`sessions` CRUD behind authenticated backend endpoints, resource by resource, deleting the direct Supabase call from the frontend only after each one is verified live.
3. Move the scoring engine server-side using the Phase 0 golden fixtures to verify parity.
4. Move mechanics images from JSONB blobs to Supabase Storage. Add client-side compression/resizing before upload (mobile camera photos can be several MB; Claude's vision API has practical size/dimension limits the roadmap doesn't mention) — resize to a sane max dimension before the base64 encode.
5. Add pagination to session loading (most recent 20, load more on demand).
6. Add Stripe webhook-driven `plan_status` as the server-authoritative subscription check.
7. Define and enforce actual per-tier generation quotas server-side (the roadmap gestures at "rate limiting lives here" without specifying limits — pick numbers tied to the pricing tiers and enforce them in the job-creation endpoint).
8. TypeScript the backend as it's written (greenfield code — no reason to write it in JS first).

*Exit criteria: frontend no longer imports the Supabase client directly for any protected resource; the scoring formula is not present in any client-shipped bundle.*

---

## Phase 3 — Web V1 release

This checkpoint doesn't exist in the original roadmap as a distinct phase — it's folded into "Phase 4 polish," which is scoped after the mobile rewrite. Pulling it forward means real users get the fixed, secured product without waiting on the Expo migration.

1. Error boundaries + retry affordance around the generation flow (currently a dead-end "Error generating program" with no recovery).
2. Wire the async job UI: progress polling against the real job state instead of the current fake `setInterval` stage-ticker in `generateProgram()`.
3. Enable Anthropic prompt caching on the system prompt (roadmap Layer 5) — do this now, it's cheap and directly cuts the cost of every generation from day one of the new backend.
4. Structured logging on the backend (generation duration, token count, image count, failure rate) — the observability the roadmap defers to Phase 4.
5. Basic uptime/alerting on the backend and the generation job queue.
6. Beta with real coaches on web, per the roadmap's Phase 4 item — moved up because it no longer needs to wait on mobile.

*Exit criteria: web app is the primary product surface for a real beta cohort, running on the new backend, with monitoring in place.*

---

## Phase 4 — Mobile groundwork (decisions before code)

Don't start porting screens until these are settled — they change how the port is done.

1. **Resolve the IAP question** (decision #2) with product/business input.
2. **Cross-platform styling decision**: `App.jsx` today is entirely inline style objects, which don't port to React Native as-is. Pick an approach (RN `StyleSheet`, or a cross-platform system like Tamagui/NativeWind) before screen porting starts — "port screens one by one" in the original roadmap understates that every screen's styling is being rewritten, not copied.
3. **Data-fetching/state layer**: introduce React Query (or SWR) for server state — polling the generation job, pagination, and cache sharing across screens all need this, and it should be shared between web and native via the `packages/core` extraction, not reinvented per platform.
4. Extract `packages/core` (types, API client, prompt builder) per the roadmap's Layer 3 — this can start immediately, independent of the Expo project itself.
5. Initialize the Expo project with Expo Router alongside the existing web app (not replacing it yet).

*Exit criteria: a throwaway "hello world" Expo screen can authenticate against the real backend and hit one real endpoint, proving the shared core package and auth strategy work end-to-end on native.*

---

## Phase 5 — Mobile port

Matches the roadmap's Phase 3 sequencing, now unblocked by Phase 4's decisions:

1. Port screens in order: Landing → Auth → Dashboard → New Session → Session Detail.
2. Replace file inputs with `expo-image-picker` (camera/photo library) and `expo-document-picker` (CSV import).
3. Wire push notifications to the async job completion event from decision #1.
4. QA across iOS Simulator, Android Emulator, and mobile web (React Native Web).

*Exit criteria: full session-creation-to-program-generation flow works on a physical iOS and Android device.*

---

## Phase 6 — Mobile release

1. Resolve payments integration per the Phase 4 IAP decision (RevenueCat/native IAP wiring, or the web-billing-redirect pattern).
2. App Store / Play Store submission: developer accounts, privacy nutrition labels, screenshots, review guideline compliance (subscription disclosure requirements in particular, given the IAP question above).
3. Compliance review: several age tiers in the scoring engine go down to under-14 athletes — this app very likely handles minors' data. Get a legal/privacy read on COPPA and equivalent obligations before wide release; this is not an engineering task but is a release blocker if skipped.
4. Native crash reporting (Sentry's RN SDK or equivalent) alongside the web error tracking from Phase 3.
5. Beta via TestFlight / Play Internal Testing before public release.

*Exit criteria: app is live in both stores, or a documented reason one platform is deferred.*

---

## Summary timeline

| Phase | Focus | Rough effort |
|---|---|---|
| 0 | Foundations: CI, env separation, golden fixtures | 3–5 days |
| 1a | Fix vision call | 1–2 days |
| 1b | Security hardening | 1–2 weeks |
| 2 | Backend extraction + async job architecture | 2–3 weeks |
| 3 | Web V1 release | 1–2 weeks |
| 4 | Mobile groundwork + decisions | 1–2 weeks |
| 5 | Mobile port | 4–6 weeks |
| 6 | Mobile release | 2–3 weeks |

Phases 0/1a can start immediately. Phase 4's decisions (IAP, styling) should be made as early as possible even though the work happens later — they affect how Phase 2's shared code is structured.
