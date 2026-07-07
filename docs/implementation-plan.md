# Homefield Implementation Plan

Technical companion to [roadmap.md](roadmap.md). The roadmap explains *what's wrong and where we're going* for a non-technical audience. This document is *how we actually get there* — phased, sequenced, with the engineering decisions the roadmap doesn't make explicit.

**Strategy: skip the intermediate CRA/Next.js rewrite. Go straight to Expo.** The current app (`src/App.jsx`) is a pre-launch proof of concept with no real users — there is nothing to migrate live and nothing to keep running as a stopgap. Rather than harden the existing Create React App in place and port it to Expo later, we build the real app once, directly in an Expo + Expo Router monorepo, which targets iOS, Android, and web from the same codebase. `src/App.jsx` is **frozen as a read-only spec** — it stays in the repo unmodified as the reference for scoring formulas, prompt text, and screen behavior, but gets no further bug fixes, features, or security patches. Everything real is built fresh.

This collapses what would otherwise be two UI builds (a hardened CRA/Next.js web app, then a separate Expo port) into one. Two ship checkpoints anchor the result: a **web release** (Expo Router's web export, replacing the CRA app entirely), then a **mobile release** (App Store / Play Store).

---

## Decisions the roadmap doesn't make

These aren't phases — they're calls that change how the phases below get built. Get them settled early; retrofitting any of them later is expensive.

### 1. Program generation must be an async job, not a blocking HTTP call

The roadmap frames the ~2-minute generation time as a UX problem ("add streaming so it feels fast"). It's also an infrastructure problem: a single blocking HTTP request held open for 2 minutes is fragile on serverless platforms (execution timeouts) and on mobile networks regardless. Since the backend is being built from scratch, design it as a job from day one:

```
POST /sessions/generate        → { jobId }  (enqueues, returns immediately)
GET  /sessions/generate/:jobId → { status: 'pending'|'running'|'done'|'error', text? }
```

Web polls or opens an SSE stream on the job; native additionally gets a push notification on completion. Because the same Expo codebase serves both, this only needs to be built once.

### 2. Apple's in-app purchase requirement changes the payments plan

The roadmap's payments section (Layer 4) assumes Stripe end-to-end. Once this ships as a native iOS app, Apple requires In-App Purchase for digital subscriptions (Apple takes 15–30%) unless the app qualifies for a narrow exception (e.g., "reader" apps, or the EU External Purchase Link entitlement, which has its own restrictions). Stripe-only checkout inside a native app risks App Store rejection.

Because the app is Expo from day one, this decision now affects the *web* build too, not just a later mobile phase — resolve it before building the billing screen at all: either budget for RevenueCat/native IAP on mobile while keeping Stripe on web, or scope the app as web-subscription-only (manage billing via browser redirect even from the native app shell, a common "reader app" pattern). Flag this for product/business input — it's not purely an engineering call.

### 3. Porting the scoring engine needs a golden-output safety net

`calcSession()` in `src/App.jsx` is the proprietary IP. Before porting a single line into the new backend, generate a fixture set: representative pitch grids × ages, run them through the *frozen* reference implementation, and snapshot the outputs. The new implementation is only done when it reproduces those snapshots exactly. Without this, a subtle rounding or ordering bug in the rewrite silently changes every athlete's score with no one noticing until a coach questions it.

### 4. Auth must issue both a web cookie and a native token from the same login

Native apps have no concept of an HttpOnly cookie. Design the auth endpoints to return both a cookie (consumed by the Expo web build) and a bearer token suitable for `expo-secure-store` (consumed by the native build) from the same login call, so there's one auth implementation, not two.

### 5. Monorepo tooling and layout

Set this up once, correctly, before any app code exists:

```
homefield/
  apps/
    expo/        # Expo Router app — iOS, Android, and web from one codebase
    api/         # Node/Express (or Fastify) backend
  packages/
    core/        # shared types, API client, prompt builder, scoring engine
  docs/
  .claude/
  legacy/        # src/App.jsx and api/generate.js, frozen, moved here as reference
```

Use Yarn (or pnpm with `node-linker=hoisted`) workspaces + Turborepo — this is Expo's own documented monorepo pattern and avoids fighting Metro's module resolution. Don't invent a custom structure.

### 6. Styling and state-management approach, decided before the first screen is built

`App.jsx` today is entirely inline style objects and ad hoc `useState`. Neither ports to a real app. Pick both up front, since every screen built afterward depends on the choice:
- **Styling**: RN `StyleSheet` (minimal dependency) or a cross-platform system like Tamagui/NativeWind (more consistent theming across web/iOS/Android, more setup cost). Given this app has a distinct existing visual identity (dark theme, custom charts), lean toward NativeWind/Tamagui only if the team wants systematic theming; otherwise plain `StyleSheet` is fine to start.
- **State/data-fetching**: React Query (or SWR) for all server state — job polling, pagination, and cross-screen cache sharing all need this and it should live in `packages/core`, shared by construction rather than by discipline.

### 7. No tests, no CI, no environment separation exist today

Not called out anywhere in the roadmap. There is one Supabase project, no staging environment, and no automated tests. This has to exist before real backend/auth code is written against it, not bolted on after.

---

## Phase 0 — Foundations

1. **Freeze `src/App.jsx` and `api/generate.js`**: move them to `legacy/` unmodified, update `CLAUDE.md` to point there as the behavioral reference. No further commits to this code except reference annotations.
2. **Monorepo scaffold**: set up the `apps/`/`packages/` layout and workspace tooling from decision #5. Empty apps that build and run — no features yet.
3. **Environment separation**: second Supabase project for dev/staging, separate `ANTHROPIC_API_KEY` and Stripe test keys per environment, documented in `.env.example`.
4. **CI pipeline** (GitHub Actions): build + typecheck + (once they exist) tests on every PR, for both `apps/expo` and `apps/api`.
5. **Golden-output fixtures for `calcSession()`** — see decision #3. Generate these against `legacy/src/App.jsx` before any scoring code is rewritten.
6. **Database migration tooling** — adopt Supabase CLI migrations (`supabase/migrations/`) instead of ad hoc dashboard SQL.

*Exit criteria: empty Expo app and empty API service both build in CI against a non-production Supabase project; legacy code is clearly marked as frozen.*

---

## Phase 1 — Backend, built secure from day one

Because nothing is live, there's no "harden an insecure app" step — the backend is simply built correctly the first time.

1. Stand up the Node/Express (or Fastify) service in `apps/api` with the async job endpoints from decision #1.
2. Auth endpoints per decision #4 (cookie + token from one login flow). Supabase Auth stays the identity provider; the Supabase key lives only in `apps/api`, never shipped to a client.
3. RLS policies on `accounts`, `athletes`, `sessions` scoped to `auth.uid()`, written and tested against staging data — since there's no live traffic, there's no risk in getting this right before anything depends on it.
4. `/sessions/calculate` endpoint running the ported scoring engine (`packages/core`), verified against the Phase 0 golden fixtures.
5. `/sessions/generate` endpoint: the async job from decision #1, sending Claude the corrected multimodal `content` array (text + images) — this is where the roadmap's "broken vision call" bug simply never gets reintroduced, because the new implementation is built correctly rather than patched.
6. Supabase Storage for mechanics images (not JSONB blobs); client-side compression/resizing before upload, since Claude's vision API has practical size limits the roadmap doesn't mention.
7. Stripe Checkout Sessions created server-side + webhook handling for `checkout.session.completed`, writing a server-authoritative `plan_status`.
8. Per-tier generation quotas enforced in the job-creation endpoint (the roadmap gestures at "rate limiting lives here" without specifying limits — pick numbers tied to the pricing tiers).
9. Structured logging + error tracking (Sentry or equivalent) from the start, not deferred to a later polish phase.
10. TypeScript throughout — greenfield code, no reason to write it in JS first.

*Exit criteria: every endpoint the Expo app will need exists, is authenticated, is RLS-scoped, and is covered by the golden fixtures where it touches scoring.*

---

## Phase 2 — Build the app in Expo

Screens are built once, using `legacy/src/App.jsx` purely as a spec for behavior and copy — not copied code.

1. Expo Router file structure (per the roadmap's Layer 3 sketch): `(auth)`, `(coach)`, `(athlete)`, `session/`.
2. Build screens in order: Landing → Auth → Dashboard (coach + athlete) → New Session (CSV upload + pitch table + mechanics images) → Session Detail / Program Display.
3. Image capture: `expo-image-picker` (camera/photo library) from the start — no separate "web file input" implementation to later replace.
4. CSV import: `expo-document-picker`.
5. Wire the async job UI: real progress polling against `/sessions/generate/:jobId`, replacing the fake `setInterval` stage-ticker from the legacy code with actual job state.
6. Push notifications wired to job completion (works on native immediately; on web it can no-op or fall back to in-page state).
7. Enable Anthropic prompt caching on the system prompt (roadmap Layer 5) — cheap, and cuts generation cost from the first request the new backend serves.

*Exit criteria: full session-creation-to-program-generation flow works end-to-end in the Expo web build and in an iOS/Android simulator.*

---

## Phase 3 — Web release

First ship checkpoint. This is the Expo Router web export — there is no separate CRA app to retire, since it was never carrying real traffic.

1. Error boundaries + retry affordance around the generation flow.
2. Pagination on session loading (most recent 20, load more on demand).
3. Basic uptime/alerting on the backend and the job queue.
4. Deploy `apps/api` somewhere that supports long-running requests for the generation job (Railway/Render, not a strict-timeout serverless platform — the async job model from decision #1 reduces how much this matters, but the worker processing the job still needs to run somewhere without a hard 2-minute ceiling).
5. Beta with real coaches on the Expo web build.

*Exit criteria: the Expo web app is the product, live to a real beta cohort, with monitoring in place.*

---

## Phase 4 — Mobile release prep

Much smaller than it would have been under a "port later" plan, since the app is already Expo — this phase is about native-specific concerns, not rebuilding UI.

1. Resolve and implement the IAP decision (decision #2) — RevenueCat/native IAP wiring, or the web-billing-redirect pattern.
2. EAS Build configuration for iOS and Android.
3. Platform QA: safe areas, keyboard avoidance, native navigation feel (tab bars, back gesture) — things the web build doesn't exercise.
4. Native crash reporting (Sentry's RN SDK or equivalent) alongside the web error tracking from Phase 3.

*Exit criteria: signed iOS and Android builds run the full critical path on physical devices.*

---

## Phase 5 — Mobile release

1. App Store / Play Store submission: developer accounts, privacy nutrition labels, screenshots, review guideline compliance (subscription disclosure requirements in particular, given the IAP question above).
2. Compliance review: several age tiers in the scoring engine go down to under-14 athletes — this app very likely handles minors' data. Get a legal/privacy read on COPPA and equivalent obligations before wide release; this is not an engineering task but is a release blocker if skipped.
3. Beta via TestFlight / Play Internal Testing before public release.

*Exit criteria: app is live in both stores, or a documented reason one platform is deferred.*

---

## Summary timeline

| Phase | Focus | Rough effort |
|---|---|---|
| 0 | Foundations: freeze legacy, monorepo scaffold, CI, golden fixtures | 3–5 days |
| 1 | Backend, built secure from day one | 2–3 weeks |
| 2 | Build the app in Expo | 4–6 weeks |
| 3 | Web release | 1–2 weeks |
| 4 | Mobile release prep | 1–2 weeks |
| 5 | Mobile release | 2–3 weeks |

Decisions #2 (IAP), #5 (monorepo layout), and #6 (styling/state) should be settled before Phase 1 code is written — they shape the structure of `packages/core` and the backend's auth/billing surface, and are expensive to change once screens exist.
