# Spec: Monorepo Scaffold

## Overview

`docs/specs/agent-harness/spec.md` names this as an explicit unmet dependency: its hooks, `verify-chunk.ts`, `spec-runner`'s pre-flight check, and the `ping-route` placeholder spec all assume real workspaces with real `lint`/`typecheck`/`test`/`build` scripts exist. None of that is buildable yet. This spec (`docs/implementation-plan.md` Phase 0 item 2, with item 1 folded in as its first chunk) builds the pnpm + Turborepo monorepo — `apps/expo`, `apps/api`, `packages/core` — that everything else in this rebuild sits on top of.

Like the agent-harness spec, this is built by hand, not via `spec-runner` — the loop doesn't exist until the agent-harness spec is implemented, which itself can't be implemented until this one is.

---

## Scope

1. Freeze the current app into `legacy/`
2. Root pnpm + Turborepo configuration
3. `apps/expo` — Expo Router, TypeScript, managed workflow
4. `apps/api` — minimal TypeScript backend with one health-check route
5. `packages/core` — empty TypeScript package with one placeholder export
6. Shared root config: base `tsconfig`, lint config per workspace, `.gitignore`

**Out of scope:**
- CI pipeline (GitHub Actions) — next spec, wires this same Turborepo pipeline into GitHub Actions
- Golden-output fixtures for `calcSession()` — next spec, depends only on `legacy/` existing (chunk 1 here)
- Environment separation (second Supabase project) and Supabase CLI migration tooling — next spec, mostly account/config setup rather than code
- The agent harness itself (`.claude/hooks/`, `.claude/skills/`, `verify-chunk.ts`, `spec-runner`) — already spec'd in `docs/specs/agent-harness/spec.md`, implemented after this one
- Any real feature code beyond a health-check route and a placeholder screen/export

---

## Decisions made in this spec

These fill in gaps `docs/implementation-plan.md` left open or under-specified, needed to actually write working `package.json`/`turbo.json` files. Where they firm up something the implementation plan phrased loosely, the implementation plan gets a matching edit alongside this spec.

- **Backend framework: Fastify, not Express.** `docs/implementation-plan.md` Phase 1 item 1 says "Node/Express (or Fastify)," left open. Resolving now, since a working scaffold needs one: Fastify's TypeScript support is first-class (typed request/response without `@types/express` gaps), its plugin architecture suits Phase 1's auth middleware and RLS-scoped route pattern, and its built-in schema validation is a natural fit for typed API contracts later. This is a scaffold-level decision, not a late reversal — nothing has been built against Express to migrate away from.
- **`legacy/` freeze is the whole current app, not two files.** `docs/implementation-plan.md` Phase 0 item 1 says "move `src/App.jsx` and `api/generate.js` to `legacy/`." In practice, the root `package.json` (CRA scripts/deps), `public/`, and `vercel.json` only make sense together with those two files — moving just two files would leave an orphaned, non-functional `package.json` at the root, which is about to become the pnpm workspace root manifest anyway. This spec moves the entire current app (`src/`, `public/`, `api/`, `package.json`, `vercel.json`) into `legacy/` as one self-contained, still-runnable snapshot.
- **Package naming.** `packages/core` is published internally as `@homefield/core`. `apps/expo` and `apps/api` are not imported by name (they're deployables, not libraries), so they stay unscoped in their own `package.json`.
- **`packages/core` ships TypeScript source directly — no build/bundle step.** Consumed via the `workspace:*` protocol; Metro transpiles it for `apps/expo`, `tsx`/`tsc` transpile it for `apps/api`. This matches Expo's own documented monorepo guidance and avoids a whole class of "did I rebuild the shared package" staleness bugs. Its `build` script is `tsc --noEmit` (identical to `typecheck`) until there's an actual reason to emit compiled output.
- **Node version:** pin via `.nvmrc`. Use the current Node LTS that Expo's tooling officially supports as of implementation time — check `docs.expo.dev` at build time rather than trusting a version number written into this spec, since Expo's supported range shifts with each SDK release.

---

## Components

### 1. Freeze `legacy/` (chunk 1)

Move, unmodified: `src/` → `legacy/src/`, `public/` → `legacy/public/`, `api/` → `legacy/api/`, `package.json` → `legacy/package.json`, `vercel.json` → `legacy/vercel.json`.

Update `CLAUDE.md`: the current "Planned direction (not yet executed)" callout describes this as a future move — rewrite it in the past tense pointing at `legacy/`, and rewrite the rest of `CLAUDE.md`'s body (currently a description of `src/App.jsx` as if it were the live app) to describe the new monorepo structure instead, with a pointer into `legacy/CLAUDE.md`-equivalent context (or a short "see `legacy/` for the pre-rebuild app" note) for anyone who needs the old app's behavior.

**Acceptance criteria:**
- `legacy/` contains a complete, still-`npm install`-able snapshot of the pre-rebuild app (nothing missing that would make it fail to run if someone checked out `legacy/` alone)
- Nothing under `legacy/` differs from its pre-move content except its path
- `CLAUDE.md` no longer describes `src/App.jsx` as the live app

### 2. Root pnpm + Turborepo configuration

- `pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]`
- `.npmrc`: `node-linker=hoisted`
- `.nvmrc`: pinned Node version (see Decisions)
- Root `package.json`: `"private": true`, `"workspaces"` via the pnpm workspace file, `devDependencies: { turbo }`, root scripts delegating to Turborepo:
  ```json
  {
    "scripts": {
      "lint": "turbo run lint",
      "typecheck": "turbo run typecheck",
      "test": "turbo run test",
      "build": "turbo run build"
    }
  }
  ```
- `turbo.json`:
  ```json
  {
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
      "lint": {},
      "typecheck": { "dependsOn": ["^typecheck"] },
      "test": { "dependsOn": ["^build"] },
      "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] }
    }
  }
  ```
- `tsconfig.base.json` at root: `"strict": true` and the other shared compiler options every workspace's own `tsconfig.json` extends — kept minimal, workspace-specific settings (JSX mode, module resolution for Metro vs Node) stay in each workspace's own config, not forced into the shared base.
- `.gitignore` additions: `node_modules`, `.turbo`, `.expo`, `ios/`, `android/` (managed workflow — these shouldn't be committed even if `expo prebuild` is accidentally run locally), `dist/`, `.env*` (except `.env.example`), `coverage/`.

**Acceptance criteria:**
- `pnpm install` succeeds from the repo root with no workspace resolution errors
- `pnpm turbo run lint typecheck test build` exits 0 with all three workspaces scaffolded (components 3–5), even though there's nothing real to lint/test yet beyond placeholders

### 3. `apps/expo`

- Scaffolded via `npx create-expo-app` (TypeScript template), Expo Router enabled
- `eslint-config-expo` wired as-is — don't fight it with a competing shared config
- `jest-expo` preset wired with one placeholder test (e.g. a trivial render test of the default screen) so `test` has something real to run, not just an empty pass
- `tsconfig.json` extends the root `tsconfig.base.json`
- Managed workflow: no `ios/`/`android/` committed (decision #9 in `docs/implementation-plan.md`); `app.json`/`app.config.ts` has placeholder `name`/`slug`/bundle identifiers, to be finalized before Phase 4
- Default template demo content (the counter screen, tab-bar example) stripped down to a single minimal placeholder screen — leaving Expo's example app in place would confuse later chunks/agents about what's real
- Scripts: `lint` (`eslint`), `typecheck` (`tsc --noEmit`), `test` (`jest`), `build` (`expo export --platform web` — the one build check that's meaningful before there's a real app to export)

**Acceptance criteria:**
- `pnpm --filter expo lint typecheck test build` each exit 0
- `npx expo start` runs locally and shows the placeholder screen (manual check, not part of the automated pipeline)

### 4. `apps/api`

- Fastify + TypeScript, minimal
- One route: `GET /health` → `{ ok: true }`
- `tsconfig.json` extends the root base
- Scripts: `lint` (`eslint`), `typecheck` (`tsc --noEmit`), `test` (`jest`, one test hitting `/health` via Fastify's `.inject()`), `build` (`tsc`, emits to `dist/`), plus `dev` (`tsx watch src/index.ts`) and `start` (`node dist/index.js`) for local running — these two aren't part of the Turborepo pipeline, just convenience scripts

**Acceptance criteria:**
- `pnpm --filter api lint typecheck test build` each exit 0
- Running `pnpm --filter api dev` and requesting `/health` returns `{ ok: true }` (manual check)

### 5. `packages/core`

- `package.json` named `@homefield/core`
- One placeholder export (e.g. a `VERSION` constant) with one Jest test asserting it
- `tsconfig.json` extends the root base
- Scripts: `lint`, `typecheck`, `test`; `build` is `tsc --noEmit` per the Decisions section above

**Acceptance criteria:**
- `pnpm --filter @homefield/core lint typecheck test build` each exit 0
- `apps/api` can `import { VERSION } from "@homefield/core"` and it resolves correctly via the `workspace:*` protocol (prove the wiring works, even though there's nothing real to import yet)

### 6. Shared lint config

`apps/expo` uses `eslint-config-expo` directly. `apps/api` and `packages/core` share a lightweight `@typescript-eslint`-based config — either a root-level flat config (`eslint.config.js`) both workspaces import, or duplicated minimal per-workspace configs if sharing one adds more complexity than it saves at this size. Prefer the shared root config; fall back to duplication only if the two workspaces' lint needs diverge enough to make sharing awkward.

**Acceptance criteria:** `apps/api` and `packages/core` produce consistent lint results for equivalent code (same rule violations flagged the same way in both).

---

## Acceptance criteria (spec-level)

- `pnpm install` succeeds from the repo root
- `pnpm turbo run lint typecheck test build` succeeds across all three workspaces
- `legacy/` contains the complete, unmodified, still-runnable pre-rebuild app; `CLAUDE.md` reflects the new structure
- `apps/expo` runs locally and shows a placeholder screen
- `apps/api`'s `/health` route responds correctly when run locally
- `packages/core` is successfully imported by `apps/api` via the workspace protocol
- `.gitignore` excludes `node_modules`, `.turbo`, `.expo`, `ios/`, `android/`, `dist/`, `.env*`
- None of the out-of-scope items (CI wiring, golden fixtures, env separation, agent harness) are built as part of this spec

---

## Next spec

Once this lands, two things become possible in parallel: the **CI pipeline** spec (wires this exact Turborepo pipeline into GitHub Actions) and the **golden-output fixtures** spec (only needs `legacy/` frozen, from chunk 1 here). The **agent harness** spec (`docs/specs/agent-harness/spec.md`, already written) becomes implementable once both the scaffold here and CI exist.
