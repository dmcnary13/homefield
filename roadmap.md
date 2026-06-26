# Homefield — Codebase Audit & V1 Roadmap

## What This App Is

A pitching development platform that ingests Trackman biomechanics data (10 pitches, 11 columns each), runs a proprietary scoring engine across 5 performance buckets (Direction, Velocity, Shape, Arm Action, Command), and calls Claude to generate a complete, individualized throwing program for the athlete. It supports two user modes — Athlete (self-tracking) and Coach (multi-athlete roster management) — with a tiered Stripe subscription model. Data persists in Supabase. Image upload UI exists for 6 delivery positions (Peak Leg Lift through Release Point) to support visual analysis alongside the data.

The concept is excellent. The domain logic is deep and sophisticated. The current implementation is a functional proof of concept with serious structural issues that block it from becoming a real product.

---

## Audit Findings

### Critical Bug: Image Analysis Is Completely Non-Functional

This is the highest-priority issue. The prompt contains hundreds of lines of detailed image analysis instructions telling Claude to evaluate photos at each delivery position and cross-reference them with the Trackman data. The UI lets users upload photos for all 6 positions. The images are saved to Supabase. But when `generateProgram()` calls Claude, the API payload is:

```js
messages: [{ role: 'user', content: prompt }]
```

`content` is a plain string. Claude receives zero images. Every image the user uploads is silently ignored. The prompt tells Claude to analyze images "if provided" — but they are never provided. The `IMAGE ANALYSIS` section in every generated program either outputs nothing or hallucinates based on the text data alone.

**The fix** requires sending Claude a `content` array with both `text` and `image` blocks using the vision format:

```js
content: [
  { type: 'text', text: prompt },
  { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: '...' } },
  // ...one block per uploaded image
]
```

The images are already available as base64 data URLs in `mechanicsImages` state — they need to be included in the API call, not just saved to the database.

---

### Security Issues

**Supabase key hardcoded in client-side source.** Anyone who opens DevTools sees the full Supabase URL and API key. More dangerously, there is no Row Level Security on the tables. Any authenticated user can query `select=*` on `accounts`, `athletes`, and `sessions` and get every user's data. The key must move to the backend, and RLS policies must be added to scope every query to the authenticated user's own data.

**The API proxy has no authentication.** `api/generate.js` accepts any POST request and forwards it to Anthropic. There is no check that the caller is a logged-in Homefield user with an active subscription. Anyone who discovers the endpoint can hit it directly and burn through the Anthropic API budget.

**Stripe checkout links are test-mode and hardcoded.** There is no webhook handler to confirm payment completion, no server-side enforcement of plan tier, and no subscription status check before generating programs. Plan limits are enforced entirely client-side, which means a user can bypass them by manipulating state.

**Access tokens stored in localStorage.** This is susceptible to XSS. For an application handling personal athlete data, HttpOnly cookies or in-memory token storage is preferable.

---

### Architectural Issues

**2,650-line single-file React component.** All state management, business logic, math engine, auth flow, and UI are in one file. This is not maintainable or scalable and will become unworkable well before mobile parity.

**No routing library.** Screen navigation is driven by a `screen` string in React state (`'landing'`, `'coachDash'`, `'newSession'`, etc.). Deep links, back-button behavior, browser history, and URL sharing are all absent. Mobile navigation requires a proper router.

**The scoring math engine runs in the browser.** The `calcSession()` function contains the proprietary scoring formula — weights, floors, correlations, all of it. Every user can read it. For a commercial product, this belongs on the server behind an authenticated API endpoint.

**No TypeScript.** The app models athletes, sessions, results, and accounts as plain JS objects. This makes refactoring and cross-platform code sharing error-prone.

**All data loaded at startup.** On login, every account, every athlete, and every session is fetched into React state. For a coach with 50 athletes and 200 sessions, this will be slow and will get worse over time.

**No error boundary or retry logic.** If the Claude generation fails (it is a ~2-minute API call), the user sees "Error generating program." with no recovery path and no partial save.

---

## V1 Roadmap

The stack below gives you iOS, Android, iPad, tablet, and web desktop from a single shared codebase with a proper backend.

---

### Layer 1: Backend API

**Technology: Node.js + Express (or Fastify), deployed on Railway or Render**

This layer does not exist yet. Everything that is currently happening in the browser needs to move here.

**Endpoints to build:**

`POST /auth/signup` and `POST /auth/login` — thin wrappers around Supabase Auth that set HttpOnly cookies. The Supabase key never leaves the server.

`POST /sessions/calculate` — receives the 10×11 pitch data and athlete info, runs the scoring engine, returns the result. The scoring formula is now private.

`POST /sessions/generate` — authenticated and subscription-checked endpoint. Receives the calculation result, athlete info, and uploaded image files (as multipart form data or base64). Assembles the Claude request with both text and vision content blocks. Streams the response back to the client. This is also where rate limiting and per-account generation quotas live.

`GET/POST/DELETE /athletes` and `/sessions` — CRUD with auth middleware so every query is scoped to the calling user. This replaces the direct Supabase calls from the frontend.

`POST /webhooks/stripe` — receives Stripe events, updates `plan_tier` and `plan_status` in the database. Subscription state is now server-authoritative.

**Claude vision call format (the fix for the broken image analysis):**

```js
const content = [{ type: 'text', text: prompt }];
for (const [position, base64] of Object.entries(mechanicsImages)) {
  if (base64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: base64.split(',')[1] }
    });
    content.push({ type: 'text', text: `Above image: ${position}` });
  }
}
await anthropic.messages.create({
  model: 'claude-opus-4-7',
  max_tokens: 16000,
  messages: [{ role: 'user', content }]
});
```

**Model recommendation:** Upgrade from `claude-sonnet-4-5-20250929` to `claude-opus-4-7` for program generation. The prompt is among the most sophisticated sports-science prompts imaginable. Vision analysis quality matters enormously here. Sonnet handles the vision but Opus will produce materially better biomechanical diagnosis when interpreting images alongside Trackman data.

---

### Layer 2: Database & Storage

**Technology: Supabase (keep it — add RLS and Storage)**

The Supabase schema is sound. What needs to change:

**Row Level Security** — every table gets policies that scope reads and writes to `auth.uid() = user_id`. No cross-account data access is possible.

**Supabase Storage** for mechanics images. Currently images are stored as base64 blobs in the `sessions` JSONB column. This is fine at low scale but degrades fast. Store images as files in a Supabase Storage bucket (`mechanics-images/{sessionId}/{position}.jpg`), save the URLs in the session record. The backend fetches the files when building the Claude request.

**Pagination** on the sessions query. Do not load all sessions at startup — load the most recent 20 and paginate.

**Stripe subscription columns** — add `plan_status`, `stripe_customer_id`, `stripe_subscription_id`, and `current_period_end` to `accounts`. Plan enforcement becomes a server-side check against `plan_status = 'active'`.

---

### Layer 3: Mobile & Web Frontend

**Technology: Expo (React Native + React Native Web)**

This is the key architectural decision. Expo lets you write one React Native codebase that compiles to iOS native, Android native, and web. The web build runs in the browser at desktop size. You get four targets from one codebase.

**Why Expo over separate React + React Native:**
- The existing UI is custom-designed with no component library, which means you would rewrite it entirely for native anyway
- React Native Web means the same components render on desktop browsers
- Expo Router provides file-based navigation that works identically on all platforms
- Expo handles push notifications, camera access (for in-app photo capture), and file system access across platforms

**Navigation: Expo Router**

Replace the `screen` state variable with Expo Router file-based navigation:

```
app/
  (auth)/
    landing.tsx
    login.tsx
    signup.tsx
  (coach)/
    dashboard.tsx
    athlete/[id].tsx
  (athlete)/
    home.tsx
  session/
    new.tsx
    [id].tsx
```

Deep links, back navigation, URL sharing, and tab bars all come from the router.

**Shared business logic: TypeScript package**

Extract everything that is not UI into a shared `packages/core` package:
- Type definitions for Athlete, Session, Result, Account
- The prompt builder function (the server calls it, but having it typed is valuable)
- API client with typed request/response shapes

**Platform-specific adaptations needed:**

Image capture on mobile — the web version uses `<input type="file">`. On mobile, replace with `expo-image-picker` which accesses the camera or photo library natively. The component interface stays the same; the implementation differs per platform.

CSV upload — on mobile, use `expo-document-picker` to select a Trackman CSV from Files or Google Drive. Parse it identically to the web version.

Push notifications — when a program finishes generating (~2-minute process), the user should get a native notification. Expo Notifications handles this. The backend sends the push when generation completes.

Streaming — the ~2-minute generation time is the biggest UX challenge. Add server-sent events or WebSocket streaming so the program text appears progressively as Claude generates it. This makes the wait feel fast even when it is not.

---

### Layer 4: Payments

**Technology: Stripe (move to live mode with proper webhook verification)**

Replace the hardcoded Stripe links with Stripe Checkout Sessions created server-side. The flow:

1. User selects a plan in the app
2. App calls `POST /billing/checkout` with the selected plan
3. Server creates a Stripe Checkout Session and returns the URL
4. App opens the URL (web: redirect; mobile: in-app browser via Expo WebBrowser)
5. On success, Stripe sends a `checkout.session.completed` webhook to `POST /webhooks/stripe`
6. Server updates `plan_status = 'active'` in the database
7. App polls or listens for the status change before unlocking features

For mobile, consider Stripe's React Native SDK instead of an in-app browser for a native payment sheet experience.

---

### Layer 5: Performance & Infrastructure

**Anthropic API:** Enable prompt caching by adding `cache_control: { type: 'ephemeral' }` to the system prompt block. The system prompt (the 1,000+ lines of coaching instructions) is the same for every request. Caching it will cut generation cost by ~80% and reduce latency on the cached portion.

**CDN for mechanics images:** Serve from Supabase Storage with a CDN prefix. Images saved once should load fast everywhere.

**Observability:** Add structured logging on the backend (Pino or Winston). Log every generation request with athlete ID, duration, token count, and whether images were included. This gives visibility into actual usage patterns.

---

## Implementation Priority Order

### Phase 1 — Fix the broken feature and secure the app (1–2 weeks)

1. Fix the Claude vision call in `api/generate.js` to include images. This is a ~20-line change and unblocks the core value proposition.
2. Move the Supabase key to the backend. Stop exposing it client-side.
3. Add authentication middleware to the API endpoint.
4. Enable Supabase RLS on all tables.
5. Replace test Stripe links with server-side Checkout Session creation.

### Phase 2 — Backend extraction (2–3 weeks)

1. Move the scoring engine to a backend endpoint.
2. Move image storage from JSONB blobs to Supabase Storage.
3. Add Stripe webhook handler for subscription lifecycle.
4. Add pagination to session loading.
5. TypeScript the entire backend.

### Phase 3 — Cross-platform frontend (4–6 weeks)

1. Initialize Expo project with Expo Router.
2. Port screens one by one: Landing → Auth → Dashboard → New Session → Session Detail.
3. Replace browser file inputs with `expo-image-picker` and `expo-document-picker`.
4. Add push notifications for generation completion.
5. Add streaming for the generation UX.
6. QA on iOS Simulator, Android Emulator, and mobile browsers.

### Phase 4 — Upgrade & polish (2–3 weeks)

1. Upgrade Claude model to Opus 4.7 for program generation.
2. Add prompt caching.
3. Add error boundaries and retry logic for failed generations.
4. Performance audit: bundle size, load time, Supabase query optimization.
5. Beta with real coaches.

---

## Technology Summary

| Layer | Current | V1 Target |
|---|---|---|
| Frontend | React SPA (single file) | Expo (React Native + Web) |
| Navigation | `screen` state string | Expo Router |
| Backend | Vercel serverless proxy | Node.js + Express on Railway/Render |
| Database | Supabase (no RLS) | Supabase with RLS + Storage |
| Auth | Supabase Auth (client-side key) | Supabase Auth (server-side key) |
| AI | Claude Sonnet (text only, broken vision) | Claude Opus 4.7 (text + vision, streaming) |
| Payments | Hardcoded test Stripe links | Stripe Checkout Sessions + webhooks |
| Image storage | Base64 in session JSONB | Supabase Storage bucket |
| Language | JavaScript | TypeScript throughout |

---

The proof of concept proves the product works. The domain model is excellent. The scoring engine is sophisticated. The prompt engineering is elite-level. Phase 1 alone — fixing the image analysis call and securing the backend — turns this into a functional commercial product. Phases 2–4 make it one ready to ship to the App Store.
