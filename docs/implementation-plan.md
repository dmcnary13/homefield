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

### 2. Resolved: the native app is a "reader," web is the only place to subscribe

**Decision:** subscription purchase and account/billing management happen exclusively on the web build. The native iOS/Android app has **no purchase UI and no purchase links at all** — it reads `plan_status` from the backend (same field, same endpoint the web build uses) and gates features accordingly. To subscribe or manage billing, a user goes to the website; the native app is read/practice-only relative to payments. This is the same shape as Netflix's or Spotify's mobile apps.

This is the standard, lowest-risk "reader app" pattern under Apple's guidelines — it avoids IAP engineering (no RevenueCat, no StoreKit/Play Billing integration, no 15–30% platform cut) entirely, at the cost of not being able to sell subscriptions from inside the native app. Because the app is Expo, this is implemented with platform-specific routing: the `Subscribe`/`Upgrade`/`Manage billing` screens exist only on the Expo **web** target (e.g. `.web.tsx` route overrides) and are simply absent from the native build — not present-but-disabled, genuinely not shipped, since even a non-functional purchase-adjacent affordance can complicate App Store review. Stripe Checkout (Phase 1, item 7) remains exactly as planned; it's just only ever reached through the web build.

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
    api/         # Node/TypeScript backend (Fastify — see docs/specs/monorepo-scaffold/spec.md)
  packages/
    core/        # shared types, API client, prompt builder, scoring engine
  docs/
  .claude/
  legacy/        # src/App.jsx and api/generate.js, frozen, moved here as reference
```

Use **pnpm** workspaces (with `node-linker=hoisted` in `.npmrc`) + **Turborepo** — this is one of Expo's own documented monorepo patterns and avoids fighting Metro's module resolution. Every workspace (`apps/expo`, `apps/api`, `packages/core`) is **TypeScript** — Expo's default project template is TS-first, so the whole monorepo is one language from day one, not just the backend. Don't invent a custom structure.

### 6. Resolved: preserve the current visual identity; plain RN StyleSheet

**Decision:** the rebuild is a faithful port, not a redesign. `legacy/src/App.jsx`'s current look — dark theme, the custom `RadarChart`/`LineChart` components, existing layout and copy — is the actual design spec for Phase 2, not just a behavioral reference. That resolves the styling question directly: plain RN `StyleSheet` (translating the existing inline style objects 1:1) rather than adopting a theming system like Tamagui/NativeWind, since there's no new design system to express — reproduce what exists.

`App.jsx` today also uses ad hoc `useState` for all server state, which doesn't port cleanly. **State/data-fetching**: React Query (or SWR) for all server state — job polling, pagination, and cross-screen cache sharing all need this and it should live in `packages/core`, shared by construction rather than by discipline.

### 7. No tests, no CI, no environment separation exist today

Not called out anywhere in the roadmap. There is one Supabase project, no staging environment, and no automated tests. This has to exist before real backend/auth code is written against it, not bolted on after.

### 8. The agent harness (`.claude/hooks/`, `.claude/skills/`) enforces this plan's own guardrails

`.claude/hooks/` and `.claude/skills/` exist in the repo but are empty scaffolding. Populating them isn't housekeeping — it's how the guardrails above actually get enforced instead of relying on memory and discipline across a fast-moving rebuild:

- **Hook: block edits to `legacy/`.** Once `src/App.jsx`/`api/generate.js` are frozen (Phase 0), a `PreToolUse` hook on Edit/Write rejects any tool call touching `legacy/**`. This makes decision-to-freeze self-enforcing instead of a rule someone has to remember.
- **Hook: typecheck/lint gate.** Run on file write or pre-commit across the monorepo workspaces, so type errors don't compound while multiple packages are being built in parallel.
- **Skill: `/verify-scoring`.** Runs the ported scoring engine in `packages/core` against the Phase 0 golden fixtures and reports any diff from the frozen reference. Turns decision #3's safety net into a one-command check instead of something that has to be run manually and remembered.
- **Skill: `/new-endpoint`.** Scaffolds a new authenticated, RLS-aware API route following the Phase 1 pattern (auth middleware, error handling, structured logging), so the handful of endpoints built in Phase 1 don't drift in structure as they're added one at a time.
- **Skill: `/smoke-test`.** Walks the manual critical-path checklist (login → new session → generate → view program) referenced in Phase 0 and Phase 3, useful for as long as there's no automated E2E coverage.

None of this is required to start Phase 1, but it's cheap to build once and pays for itself immediately — build it in Phase 0 alongside the monorepo scaffold, not as an afterthought once the rebuild is already underway.

### 9. Expo workflow: managed, not prebuild/CNG

The user has not built an Expo app before, and there's no custom native module planned anywhere in this project — `expo-image-picker`, `expo-document-picker`, `expo-notifications`, and `expo-secure-store` are all standard Expo SDK packages with config plugins, no ejecting required. Use the **managed workflow**: no `ios/`/`android/` native project folders committed to the repo; EAS Build generates them at build time from `app.json`/`app.config.ts`. This is simpler to reason about and matches Expo's own recommendation for exactly this situation. Revisit only if a future requirement needs a native module with no Expo config plugin.

### 10. The repo must be spec-runner-ready by the end of Phase 0

Phase 0 isn't just scaffolding — its job is to leave the repo in a state where **Phase 1 onward is executed as autonomous `spec-runner` loops**, not ad hoc direct work. That reprioritizes what "Agent harness" (decision #8) means: `spec-runner`, `plan-reviewer`, and a Homefield-specific `verify-chunk` script (adapted from the pattern inspected in `5-tool-ams`, see [docs/specs/agent-harness/spec.md](specs/agent-harness/spec.md)) are built in Phase 0, not deferred until Phase 1/2 code exists — they only need the monorepo scaffold's `lint`/`typecheck`/`test`/`build` scripts to exist and run, which decision #5's scaffold already provides even before any real feature code is written.

This has one unavoidable bootstrapping consequence: **Phase 0 itself is built by hand, not by the loop it's building** — `spec-runner` can't execute the spec that creates `spec-runner`. Phase 1 is the first phase actually run through it.

It also constrains how chunks get written from Phase 1 onward, since `spec-runner`'s verification step is `tsc`/`eslint`/`jest` only — no browser:

- **Acceptance criteria must be checkable by typecheck, lint, or a test command.** No chunk (in any phase) may have an acceptance criterion like "looks right" or "the flow feels smooth."
- **UI chunks (Phase 2 onward) get an additional, non-blocking visual-check requirement.** The loop still verifies and commits a UI chunk automatically once `tsc`/`eslint`/`jest` pass — it does not pause mid-run waiting on a human, which would defeat the point of an autonomous loop. Instead, every spec containing UI chunks lists them in a **"Visual QA"** section of the PR description, and that PR is not merged until a human has compared the running app against the legacy reference (decision #6: faithful port) for each listed chunk. Visual sign-off is a **PR-review-time gate**, not a loop-time gate.
- **Chunks branch off and PR back into `homefield-v0-1-0`**, not `main` — this branch is where the whole rebuild lives until it's ready to replace the current `main`. There is no separate `dev` branch (unlike `5-tool-ams`); this repo doesn't need that extra layer at its current size.
- **Progress tracking is `checklist.md` only** — no Jira sync (see [docs/specs/agent-harness/spec.md](specs/agent-harness/spec.md) open decisions).

---

## Open questions

Unlike the "Decisions" above, these don't have a recommendation baked in yet — they need an explicit answer, most of them from the user rather than inferred from the code.

**Needs product/business input:**
- **Beta feedback channel.** Phase 3 ends in "beta with real coaches" with no defined way to collect their feedback or usage data (no analytics tool is in the plan at all — not PostHog, not even basic pageview tracking). Needs a decision before Phase 3, not during it — doesn't block Phase 0/1/2 work.

**Answered:**
- **IAP approach** — resolved as decision #2: web-only subscriptions, native app is a reader with no purchase UI at all.
- **Visual/design direction** — resolved as decision #6: faithful port of the current look, not a redesign.
- **Existing Supabase data** — no migration needed. Current production Supabase is untouched by this work; the new schema is designed fresh on a separate project (Phase 0, item 3), with no cutover of the old database planned at this stage.

**Resolved here as engineering defaults (flagged in case there's a reason to override):**
- **Backend hosting**: Railway over Render — functionally similar, Railway's pricing model fits a low-traffic pre-launch app better. Either works; picking one now unblocks Phase 1 setup instead of leaving it open.
- **Job queue mechanism**: a Postgres-backed job table polled by a worker loop in `apps/api`, not a dedicated queue (BullMQ/Redis, SQS). Generation volume is low pre-launch; a real queue is easy to introduce later if the polling approach becomes a bottleneck, and not worth the operational overhead now.
- **Test tooling**: Jest across every workspace (`jest-expo` preset for `apps/expo`, plain Jest for `apps/api` and `packages/core`) rather than Vitest — `jest-expo` is Expo's own officially supported test runner and has none of Vitest's friction with React Native internals, and one test runner across the monorepo means `spec-runner`'s verify step runs the same command shape everywhere. Playwright stays for web E2E. Native E2E (Detox or EAS-based device testing) is deliberately deferred to Phase 4 — not worth the setup cost before there's a native build to test.
- **Web deployment target**: static/SSG export of the Expo Router web build, deployed on Vercel — keeps the existing Vercel account/domain useful without needing Next.js.

---

## Phase 0 — Foundations

1. **Freeze the current app into `legacy/`**: the whole app (`src/`, `public/`, `api/`, `package.json`, `vercel.json`), not just the two files originally called out here — see `docs/specs/monorepo-scaffold/spec.md` for why a partial move doesn't work once the root `package.json` becomes the pnpm workspace manifest. Update `CLAUDE.md` to point there as the behavioral reference. No further commits to this code except reference annotations.
2. **Monorepo scaffold** — see [docs/specs/monorepo-scaffold/spec.md](specs/monorepo-scaffold/spec.md): `apps/expo` (Expo's default TypeScript template, Expo Router, managed workflow per decision #9), `apps/api` (Fastify, minimal, one health-check route), and `packages/core` (`@homefield/core`, empty TS package with one placeholder export) — pnpm workspaces + Turborepo per decision #5. Each workspace gets real, working `lint`/`typecheck`/`test`/`build` scripts (`eslint-config-expo` for `apps/expo`; `jest-expo`/Jest per the test-tooling default above) wired through a `turbo.json` pipeline — there's nothing real to lint or test yet, but the *commands* must actually run and pass, since `verify-chunk` (item 7) depends on them existing.
3. **Environment separation**: second Supabase project for dev/staging, separate `ANTHROPIC_API_KEY` and Stripe test keys per environment, documented in `.env.example`.
4. **CI pipeline** (GitHub Actions): runs the same Turborepo pipeline (`turbo run lint typecheck test build`) as `verify-chunk` runs locally, on every PR — the two must not drift.
5. **Golden-output fixtures for `calcSession()`** — see decision #3. Generate these against `legacy/src/App.jsx` before any scoring code is rewritten.
6. **Database migration tooling** — adopt Supabase CLI migrations (`supabase/migrations/`) instead of ad hoc dashboard SQL.
7. **Agent harness**, per decision #8 and #10 — see [docs/specs/agent-harness/spec.md](specs/agent-harness/spec.md) for the full build-out:
   - Hooks: legacy-freeze path guard, typecheck/lint gate (`.claude/hooks/`, wired via `.claude/settings.json`)
   - Skills: `homefield-conventions`, `smoke-test`, `verify-scoring`, `new-endpoint`, `spec-reviewer`, `plan-reviewer`, `spec-runner` (`.claude/skills/`)
   - `scripts/verify-chunk.ts` — runs the Turborepo pipeline scoped to the current chunk's diff, writes a result log to `.claude/verify-logs/`
8. **Prove the loop works**: run `spec-runner` end-to-end against a trivial placeholder spec (e.g. "add a `ping` health-check route to `apps/api`") — one branch, one chunk, one commit, `checklist.md` updated, one PR opened against `homefield-v0-1-0`. This is the actual exit test for decision #10, not just a description of intent.

*Exit criteria: every workspace builds, lints, typechecks, and tests in CI against a non-production Supabase project; legacy code is frozen and a hook actively rejects edits to it; the placeholder spec in item 8 runs through `spec-runner` successfully, start to finish, with no manual intervention beyond reviewing the resulting PR.*

---

## Phase 1 — Backend, built secure from day one

Because nothing is live, there's no "harden an insecure app" step — the backend is simply built correctly the first time. This is the first phase run as an autonomous `spec-runner` loop (decision #10): write `docs/specs/backend/spec.md` covering the items below, split it into chunks, and let the loop execute it — don't do this phase as ad hoc direct work now that the harness supports it.

1. Stand up the async job endpoints from decision #1 on the Fastify service already scaffolded in Phase 0 (`docs/specs/monorepo-scaffold/spec.md` resolved Express-vs-Fastify in favor of Fastify).
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

Screens are built once, in TypeScript, using `legacy/src/App.jsx` purely as a spec for behavior and copy — not copied code. Also run via `spec-runner`; per decision #10, every chunk here carries the additional "Visual QA" PR-review gate on top of the normal typecheck/lint/test verification, since faithfully matching the legacy app's look (decision #6) isn't something the loop can check on its own.

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

Much smaller than it would have been under a "port later" plan, since the app is already Expo — this phase is about native-specific concerns, not rebuilding UI. It's also smaller than a typical mobile-prep phase because decision #2 already ruled out native IAP work entirely.

1. **Reader-app compliance check**: verify the native build has zero purchase UI, zero purchase links, and zero references to pricing/checkout — confirm this explicitly before submission, since it's the entire basis for skipping IAP.
2. EAS Build configuration for iOS and Android.
3. Platform QA: safe areas, keyboard avoidance, native navigation feel (tab bars, back gesture) — things the web build doesn't exercise.
4. Native crash reporting (Sentry's RN SDK or equivalent) alongside the web error tracking from Phase 3.

*Exit criteria: signed iOS and Android builds run the full critical path on physical devices.*

---

## Phase 5 — Mobile release

1. App Store / Play Store submission: developer accounts, privacy nutrition labels, screenshots, review guideline compliance — categorize correctly as a reader app per decision #2 (no purchase flow in the binary).
2. Compliance review: several age tiers in the scoring engine go down to under-14 athletes — this app very likely handles minors' data. Get a legal/privacy read on COPPA and equivalent obligations before wide release; this is not an engineering task but is a release blocker if skipped.
3. Beta via TestFlight / Play Internal Testing before public release.

*Exit criteria: app is live in both stores, or a documented reason one platform is deferred.*

---

## Summary timeline

| Phase | Focus | Rough effort |
|---|---|---|
| 0 | Foundations: freeze legacy, monorepo scaffold, CI, golden fixtures, full agent harness (incl. `spec-runner`), proven end-to-end | 1–1.5 weeks |
| 1 | Backend, built secure from day one | 2–3 weeks |
| 2 | Build the app in Expo | 4–6 weeks |
| 3 | Web release | 1–2 weeks |
| 4 | Mobile release prep | 1–2 weeks |
| 5 | Mobile release | 2–3 weeks |

Decisions #1–10 are all resolved as of this revision. The one remaining [open question](#open-questions) — beta feedback/analytics tooling — only needs answering before Phase 3, so it doesn't block starting Phase 0 now.
