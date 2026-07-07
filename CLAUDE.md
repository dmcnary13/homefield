# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Homefield is a proof-of-concept pitching development platform. Athletes/coaches enter Trackman biomechanics data (10 pitches × 11 columns), a client-side scoring engine grades the session across 5 buckets (Direction, Velocity, Shape, Arm Action, Command), and Claude generates an individualized throwing program from the results. It supports two user modes — Athlete (self-tracking) and Coach (multi-athlete roster) — with a Stripe subscription paywall. Data persists in Supabase.

See [docs/roadmap.md](docs/roadmap.md) for the non-technical audit of known issues and target architecture, and [docs/implementation-plan.md](docs/implementation-plan.md) for the phased, sequenced technical plan (backend extraction, async generation job architecture, RLS, mobile port, etc.). The implementation plan is the source of truth for how and in what order this app changes — read it before making structural changes.

## Commands

```
npm start   # react-scripts dev server (CRA)
npm run build   # production build
```

No test suite, linter, or typecheck script currently exists in `package.json`. Deployment is Vercel (`vercel.json` rewrites `/api/*` to serverless functions and everything else to `index.html` for SPA routing).

## Architecture

**This is almost entirely one file: [src/App.jsx](src/App.jsx) (~2,650 lines).** Nearly all state, business logic, the scoring engine, the Claude prompt builder, and every screen's UI live here. There is no router — navigation is a single `screen` string in React state (`'landing'`, `'authChoice'`, `'coachDash'`, `'athleteHome'`, `'athleteProfile'`, `'newSession'`, `'sessionDetail'`, etc.), and screens are rendered via conditional blocks inside the default-exported `App()` component near the bottom of the file. When orienting in this file, search for the `screen ===` checks rather than trying to read top to bottom.

Key regions of `App.jsx`, in order:
- **Supabase REST helpers** (`sb`, `sbAuth`) — hand-rolled `fetch` wrappers, not the `@supabase/supabase-js` client (kept minimal since the original artifact sandbox couldn't install packages). The Supabase URL and publishable key are hardcoded client-side.
- **`calcSession(rows, info)`** — the proprietary scoring math engine. Takes the 10×11 pitch grid plus athlete info (age is used to age-adjust floors for velocity/IVB/spin), computes per-column averages and stdevs, and derives the 5 bucket scores. This is dense, formula-heavy code — treat the magic numbers as intentional tuning, not something to "clean up" without domain input.
- **`buildPrompt(result, info, priorSessions)`** — assembles the large Claude prompt from the scoring output, including longitudinal context from the athlete's prior sessions.
- Presentational components: `RadarChart`, `LineChart`, `CsvUpload`, `PitchTable`, `BucketBar`, `PricingModal`, `TopBar`, `MechanicsImages`, `RngTracker`, `ProgramDisplay`.
- **`STRIPE_LINKS`** — hardcoded (test-mode) Stripe Checkout URLs per plan tier/billing period.
- **`export default function App()`** — top-level state (auth, athletes, accounts, current session, `mechanicsImages`, generation progress) and all screens.
- **`generateProgram(result, info)`** — builds the prompt, POSTs to `/api/generate` with `model: 'claude-sonnet-4-5-20250929'`, and parses recovery-weight (`Noz`) mentions out of the response text to seed the RNG (weighted-ball) velocity tracker.

**[api/generate.js](api/generate.js)** is a thin Vercel serverless proxy: it forwards the request body verbatim to the Anthropic Messages API using `ANTHROPIC_API_KEY` from the environment, with no auth check on the caller and no request validation.

**Known-broken data flow:** mechanics images are captured into the `mechanicsImages` state and saved to Supabase, but `generateProgram` sends Claude a plain string `content`, not a multimodal content array — so uploaded images are never actually passed to the model despite the prompt instructing Claude to analyze them. See the roadmap for the fix.

## Working in this codebase

- There is no component/module boundary today — `App.jsx` is the whole app. When adding anything nontrivial, prefer extracting a new module over growing this file further, even though the existing code doesn't do this itself.
- The scoring formulas in `calcSession` and the age-tier floors (velocity/IVB/spin) encode real coaching domain knowledge; don't alter the numeric thresholds without explicit direction.
- Secrets (Supabase key, Stripe links) are currently client-side/hardcoded by necessity of the current architecture — this is tracked as a known issue in the roadmap, not something to silently "fix" as a drive-by change.
