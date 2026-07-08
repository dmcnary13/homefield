# Spec: Agent Harness for Homefield

## Overview

`docs/implementation-plan.md` (decisions #8 and #10, Phase 0 item 7) commits to populating `.claude/hooks/` and `.claude/skills/` — currently empty scaffolding — so this rebuild's guardrails (frozen `legacy/`, the scoring-engine golden-fixture safety net, consistent endpoint structure) are enforced automatically instead of relying on memory across a multi-week rebuild.

This spec has a second, harder requirement than originally scoped: **by the end of Phase 0, the repo must be ready to run Phase 1 onward as autonomous `spec-runner` loops** (implementation-plan.md decision #10), not just have hooks and a few reference skills. That means the full spec pipeline — `spec-reviewer`, `plan-reviewer`, `spec-runner`, and a `verify-chunk` script — gets built now, against Phase 0's minimal-but-real monorepo scaffold, rather than deferred until Phase 1/2 code exists to document. Phase 0 itself is still built by hand — `spec-runner` can't execute the spec that creates `spec-runner` — but everything from Phase 1 on runs through the loop.

Modeled on a working harness inspected at `C:\Users\jtn80\Code\5-tool-ams\.claude` (read-only inspection; nothing there was modified), adapted to Homefield's stack and scale: TypeScript everywhere, pnpm + Turborepo instead of Nx, Jest (`jest-expo` for the Expo app) instead of a mixed Vitest/Jest split, no Jira, and a much smaller team.

This spec also establishes `docs/specs/{name}/` as the standing convention for future specs in this repo — this file is the first one, and (per item 8 below) the second is the placeholder spec used to prove the loop itself works.

---

## Reference: the 5-tool-ams pattern (read-only inspection, not copied verbatim)

Observed at `C:\Users\jtn80\Code\5-tool-ams\.claude` (top level only; `.claude/worktrees/` contains full nested git worktree copies and was not used as a reference):

- **`settings.json`** wires `PreToolUse`/`PostToolUse` hooks on `Edit|Write|MultiEdit|NotebookEdit`, plus a `permissions.allow` list pre-approving routine build/git commands.
- **`hooks/pre-edit.ts`** — reads the tool call's JSON payload from stdin, extracts candidate file paths, exits 1 if any path matches a `BLOCKED_PATTERNS` regex list.
- **`hooks/post-edit.ts`** — on every `.ts`/`.tsx` write, maps the file's path to its owning project and runs that project's typecheck command, failing the hook if it doesn't pass.
- **`skills/`**, two kinds: *reference/convention skills* (`ams-conventions`, `auth-model`, `db-patterns`, `data-fetching`, `ui-patterns`) that auto-load by description match and document real conventions with real file paths; and a *process pipeline* — `spec-reviewer` (gates a spec for ambiguity/scope/missing acceptance criteria) → `task-scope-splitter` (splits an approved spec into ≤5-file, single-purpose chunks in `chunks.md`) → `chunks-to-jira` (Jira sync + `checklist.md`) → `spec-runner` (the autonomous loop: one branch per spec, one commit per chunk, `verify-chunk` after each with a 2-retry hard-stop, one PR at the end). `plan-reviewer` runs ad hoc against a single chunk's plan before code is written. `package-audit` is a separate read-only health-audit skill, out of scope here.
- **`scripts/verify-chunk.ts`** (repo root) — runs `lint`/`typecheck`/`test` scoped to the diff since the last chunk commit, writes a JSON log to `.claude/verify-logs/{chunkId}.json`.
- **`scripts/start-run.ts` / `finish-run.ts`** — wrap a `spec-runner` run with cost/token/iteration tracking in `.claude/run-logs/`.

Adopted as-is (adapted for tooling): the two hooks, the reference-skill idea, the spec→chunks→checklist→loop pipeline shape, `verify-chunk`. Not adopted: anything Nx-specific, Drizzle-specific paths, Jira integration, `start-run`/`finish-run` cost tracking (nice-to-have, not required for the loop to function — can be added later without changing the pipeline's shape), and worktree-based parallel execution (see Open Decisions).

---

## Scope

1. `.claude/settings.json` — hooks + permissions allowlist
2. `.claude/hooks/pre-edit.ts` and `.claude/hooks/post-edit.ts`
3. `.claude/skills/homefield-conventions/SKILL.md`
4. `.claude/skills/smoke-test/SKILL.md`, `verify-scoring/SKILL.md`, `new-endpoint/SKILL.md`
5. `.claude/skills/spec-reviewer/SKILL.md` and `plan-reviewer/SKILL.md`, adapted from the AMS pattern
6. `.claude/skills/spec-runner/SKILL.md`, adapted from the AMS pattern — no Jira, pnpm/Turborepo commands, branches off `homefield-v0-1-0`
7. `scripts/verify-chunk.ts` — the local verification script `spec-runner` and `post-edit.ts` both rely on
8. A placeholder spec (`docs/specs/ping-route/`) used solely to prove the loop works end-to-end (implementation-plan.md Phase 0 item 8) — this is throwaway/demonstration, not a real feature
9. `docs/specs/README.md` documenting the spec/chunks/checklist convention

**Depends on, but does not itself build:** the monorepo scaffold (`apps/expo`, `apps/api`, `packages/core` with real `lint`/`typecheck`/`test`/`build` scripts — implementation-plan.md Phase 0 item 2). Every acceptance criterion below that runs a real command assumes that scaffold already exists.

**Out of scope:**
- Any real application code in `apps/expo`, `apps/api`, `packages/core` beyond the placeholder spec
- `chunks-to-jira` / any Jira integration
- `.claude/worktrees/`-style isolated parallel execution
- `start-run.ts`/`finish-run.ts` cost-tracking (can be added later, doesn't change the pipeline)
- Reference/convention skills that document code that doesn't exist yet (`scoring-engine`, `data-fetching`, `expo-ui-patterns`, etc.) — these get written as follow-up chunks *inside* Phase 1/2's own specs, once there's real code to document, not invented speculatively here

---

## Conventions for autonomous spec loops

These are the repo-wide rules that make it safe to let `spec-runner` operate unsupervised from Phase 1 onward. They apply to every spec written after this one, not just this spec.

### Acceptance criteria must be machine-checkable

Every chunk's acceptance criteria must be verifiable by `tsc`, `eslint`, or `jest` — no exceptions, no "looks right" or "feels smooth" criteria, in any phase. This is what makes `verify-chunk` a real gate instead of a formality.

### UI chunks get a PR-review-time visual gate, not a loop-time one

`verify-chunk` has no browser — it cannot confirm a ported screen matches the legacy app's dark theme (implementation-plan.md decision #6: faithful port, not a redesign). Rather than pausing the loop mid-run to wait on a human — which would make it not actually autonomous — UI chunks are still verified and committed automatically once `tsc`/`eslint`/`jest` pass. Every spec containing UI chunks lists them under a **"Visual QA"** heading in the PR body (see `spec-runner`'s PR template, updated from the AMS version below); the PR is not merged until a human confirms each listed chunk against the running app. Visual sign-off is a merge-time gate, not a chunk-time gate.

### Chunks are workspace-scoped, not Nx-project-scoped

The global `task-scope-splitter` skill (already available, no local override needed unless it proves too Nx-specific in practice) sizes chunks by project/file count. For Homefield, "project" means one of the three workspaces (`apps/expo`, `apps/api`, `packages/core`). A chunk touching more than two of these, or mixing a `packages/core` change with the `apps/expo`/`apps/api` code that consumes it in the same chunk, should be split — shared-code changes land in one chunk, consumers update in the next.

### Branching and tracking

- One branch per spec, created off **`homefield-v0-1-0`** (not `main` — that's where the whole rebuild lives until Phase 3 is ready to replace the current `main`; there is no separate `dev` branch, unlike the AMS reference).
- One commit per chunk.
- One PR per spec, opened back into `homefield-v0-1-0` once all chunks are committed.
- Progress tracked in `docs/specs/{name}/checklist.md` only. No Jira, no external ticket sync (see Open Decisions).

### Language and test runner, for every chunk regardless of phase

TypeScript in every workspace. Jest as the test runner everywhere (`jest-expo` preset in `apps/expo`, plain Jest in `apps/api`/`packages/core`) — a chunk that introduces Vitest, a different test runner, or a JS (non-TS) file is out of convention and should be flagged by `plan-reviewer` before it's written.

---

## Components

### 1. `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|NotebookEdit",
        "hooks": [{ "type": "command", "command": "npx tsx .claude/hooks/pre-edit.ts" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|NotebookEdit",
        "hooks": [{ "type": "command", "command": "npx tsx .claude/hooks/post-edit.ts" }]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(pnpm --filter * typecheck)",
      "Bash(pnpm --filter * lint)",
      "Bash(pnpm --filter * test)",
      "Bash(pnpm --filter * build)",
      "Bash(npx turbo run *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git checkout *)",
      "Bash(pnpm install)",
      "Bash(npx tsx *)"
    ]
  }
}
```

`tsx` runs both hooks — faster startup than `ts-node`, no separate config file needed. Any consistently-used TypeScript runner is acceptable; this is the concrete default.

**Acceptance criteria:**
- `.claude/settings.json` is valid JSON
- Both hooks fire on a test `Edit` call (verified by temporarily adding a throwaway pattern to `pre-edit.ts`'s block list, confirming rejection, then reverting)

### 2. `.claude/hooks/pre-edit.ts` — protected-path guard

```typescript
const BLOCKED_PATTERNS: RegExp[] = [
  /(^|[\\/])legacy([\\/]|$)/i,              // frozen reference code — implementation-plan.md decision #8
  /(^|[\\/])\.env(\..*)?$/i,
  /(^|[\\/])pnpm-lock\.yaml$/i,
  /(^|[\\/])CLAUDE\.md$/i,
  /(^|[\\/])\.claude[\\/]hooks([\\/]|$)/i,
  /(^|[\\/])supabase[\\/]migrations([\\/]|$)/i,
];
```

Structure otherwise matches the AMS version: parse `tool_input` from stdin, extract `path`/`file_path`/`edits[].path`/`edits[].file_path`, exit 1 with the blocked path(s) named if any pattern matches, exit 0 otherwise.

`legacy/` only starts matching real files once Phase 0 item 1 (the freeze) has actually moved `src/App.jsx` and `api/generate.js` there — until then this pattern is inert, which is fine.

**Acceptance criteria:**
- Editing a file under `legacy/` (once it exists) exits 1 and names the path
- Editing a file under `apps/`, `packages/`, or `docs/` exits 0

### 3. `.claude/hooks/post-edit.ts` — typecheck gate

```typescript
const PROJECT_DIRS: Record<string, string> = {
  "apps/expo": "expo",
  "apps/api": "api",
  "packages/core": "core",
};
```

On every `.ts`/`.tsx` write, map the file to its workspace and run `pnpm --filter {project} typecheck`, failing the hook (exit 1, typecheck output surfaced) if it doesn't pass.

**Acceptance criteria:**
- A deliberate type error in any workspace causes the next `Edit`/`Write` to exit 1 with the typecheck output
- A correctly-typed edit exits 0

### 4. `.claude/skills/homefield-conventions/SKILL.md`

Modeled on `ams-conventions`. Documents, from `docs/implementation-plan.md` decision #5:
- Package table: `apps/expo` (Expo Router, TypeScript, managed workflow), `apps/api` (Node/TypeScript backend), `packages/core` (shared types, API client, prompt builder, scoring engine)
- Dependency direction: `apps/* -> packages/core`; `packages/core` depends on nothing internal; no app imports another app
- Pointers to `docs/implementation-plan.md` for the async-job API shape (decision #1), the dual auth shape (decision #4), and the golden-fixture requirement (decision #3)
- The conventions above (machine-checkable acceptance criteria, UI visual-QA gate, workspace-scoped chunks, TypeScript + Jest everywhere)

Updated as real conventions emerge in Phase 1/2, starting as a skeleton of decisions already made.

**Acceptance criteria:** file exists with YAML frontmatter (`name`, `description`) matching the AMS skill format; package table and dependency direction match decision #5 exactly.

### 5. `.claude/skills/smoke-test/SKILL.md`

Walks the manual critical-path checklist already referenced in `docs/implementation-plan.md` (Phase 0 item 4, Phase 3): login → new session → generate program → view program → coach roster view, naming the exact screen/action for each step.

**Acceptance criteria:** all five steps present, each naming a specific screen/action, not a vague outcome.

### 6. `.claude/skills/verify-scoring/SKILL.md`

Once the golden fixtures (Phase 0 item 5) and the ported scoring engine (Phase 1 item 4) both exist, runs the ported engine against the fixtures and reports any diff from the frozen `legacy/` reference. Until both exist, documents the exact comparison procedure and fixture location without anything to run yet.

**Acceptance criteria:** names the exact fixture location and the exact comparison performed.

### 7. `.claude/skills/new-endpoint/SKILL.md`

Scaffolds a new authenticated, RLS-aware `apps/api` route following the Phase 1 pattern. Starts as a skeleton referencing the *planned* shape from `docs/implementation-plan.md` Phase 1 (auth check → RLS-scoped query/job enqueue → typed response); filled in with a real code excerpt once the first endpoint lands in Phase 1.

**Acceptance criteria:** documents the endpoint shape implied by Phase 1, to be updated with a real example after the first endpoint is built.

### 8. `.claude/skills/spec-reviewer/SKILL.md`

Adapted directly from the AMS version — same four checks (ambiguity, scope, acceptance criteria, AI filler), same PASS/FAIL/PASS WITH WARNINGS output format. Two changes from the AMS original:
- "Touches more than 4 nx projects" becomes "touches more than 2 of the 3 workspaces" (there are only three workspaces total, so the AMS threshold doesn't translate directly)
- Acceptance-criteria check gains an explicit carve-out: a criterion requiring visual comparison to the legacy app is acceptable *only* if it's placed under the spec's "Visual QA" section (see Conventions above), not as a chunk's primary acceptance criterion

**Acceptance criteria:** running this skill against the placeholder spec (item 8 below) returns PASS.

### 9. `.claude/skills/plan-reviewer/SKILL.md`

Adapted from the AMS version: spec-match check, existing-pattern search (`grep`/`Glob` across `apps/`/`packages/` instead of Nx-specific `nx show`/`nx affected` commands), architecture-boundary check against `homefield-conventions`' dependency graph, and the same LOW/MEDIUM/HIGH risk labeling.

**Acceptance criteria:** running this skill against a trivial one-chunk plan for the placeholder spec (item 8) returns APPROVED.

### 10. `.claude/skills/spec-runner/SKILL.md`

Adapted from the AMS version, with these concrete changes:
- **Step 2 (branch prep):** base branch is `homefield-v0-1-0`, not `dev`
- **Step 2.5 (pre-flight):** fast path checks `pnpm -w exec turbo run typecheck --dry` (or equivalent) instead of `nx show projects`; slow path runs `pnpm install --frozen-lockfile` and confirms workspace symlinks under `node_modules/`
- **Step 5 (verify):** calls `npx tsx scripts/verify-chunk.ts {chunkId}`, which runs the Turborepo pipeline instead of `nx affected`
- **Step 6c (Jira transition):** removed entirely — no Jira. Checklist update (6a) and commit (6b) are the only per-chunk bookkeeping.
- **Step 7 (PR):** PR body template gains the **"Visual QA"** section (see Conventions above), listing every UI chunk in the spec that needs human comparison against the legacy app before merge. Non-UI specs (e.g. the placeholder in item 8, or most of Phase 1) omit this section entirely.
- **Hard stops:** identical to the AMS version (pre-edit hook blocking the same path twice, >2 verify retries on a chunk, >50 total iterations, a regression in a previously-committed chunk, ENOENT/spawn errors) — these are tooling-agnostic and transfer directly.

**Acceptance criteria:** see item 8 (the placeholder spec) — this skill's acceptance criterion *is* that placeholder run succeeding end-to-end.

### 11. `scripts/verify-chunk.ts`

```typescript
// Mirrors CI's pipeline, scoped to the diff since the last chunk commit
const results = [
  runStep("lint", "npx", ["turbo", "run", "lint", "--filter=...[HEAD~1]"]),
  runStep("typecheck", "npx", ["turbo", "run", "typecheck", "--filter=...[HEAD~1]"]),
  runStep("test", "npx", ["turbo", "run", "test", "--filter=...[HEAD~1]"]),
];
// writes .claude/verify-logs/{chunkId}.json, same shape as the AMS reference:
// { chunkId, base: "HEAD~1", timestamp, results: [{ step, passed, output }] }
```

Turborepo's `--filter=...[HEAD~1]` scopes to workspaces affected by the diff since the last commit, the direct equivalent of AMS's `nx affected --base=HEAD~1`.

**Acceptance criteria:** running against a commit with a deliberate lint error exits 1 and writes a log with `passed: false` for the `lint` step; running against a clean commit exits 0.

### 12. Placeholder spec: `docs/specs/ping-route/`

A throwaway spec — "add a `GET /ping` health-check route to `apps/api` returning `{ ok: true }`" — with exactly one chunk. Exists solely to exercise the full loop end-to-end (implementation-plan.md Phase 0 item 8): `spec-reviewer` passes it, `plan-reviewer` approves the one-chunk plan, `spec-runner` branches off `homefield-v0-1-0`, implements it, `verify-chunk` passes, commits, updates `checklist.md`, and opens a PR. The route itself can be deleted or kept trivially — its only purpose is proving the pipeline, not shipping a feature.

**Acceptance criteria:** the PR described above actually opens, with a real commit implementing a real (if trivial) route, and `docs/specs/ping-route/checklist.md` shows the one chunk checked off.

### 13. `docs/specs/README.md`

Convention note: specs live at `docs/specs/{spec-name}/spec.md`; a chunked spec adds `chunks.md` and `checklist.md`; UI-bearing specs include a "Visual QA" section in their eventual PR per the Conventions section above.

**Acceptance criteria:** file exists and names the file convention plus the Visual QA note.

---

## Open decisions

**Resolved in this revision:**
- **Test framework** — Jest (`jest-expo` for `apps/expo`) everywhere, not Vitest. See implementation-plan.md's engineering-defaults list.
- **UI chunk verification** — automated typecheck/lint/test plus a required-but-non-blocking PR-review-time visual check, not new visual-regression tooling. See Conventions above.
- **Expo workflow** — managed, not prebuild. See implementation-plan.md decision #9.

**Still skipped, recommended default unchanged:**
- **Jira integration.** No Jira project exists for this repo; `checklist.md` alone is enough at this scale. Revisit only if the team grows past what a plain checklist can coordinate.
- **`.claude/worktrees/`-style parallel execution.** Nothing to parallelize yet — Phase 0 through Phase 2 are sequential by design (each phase's exit criteria gates the next).
- **`start-run.ts`/`finish-run.ts` cost/token tracking.** Genuinely useful for measuring the harness over time, but not required for the loop to function. Can be added as a follow-up chunk inside any later spec without changing the pipeline's shape.

---

## Acceptance criteria (spec-level)

- `.claude/settings.json` exists, valid JSON, wires both hooks
- `.claude/hooks/pre-edit.ts` and `post-edit.ts` pass their component-level acceptance criteria
- All seven skills (`homefield-conventions`, `smoke-test`, `verify-scoring`, `new-endpoint`, `spec-reviewer`, `plan-reviewer`, `spec-runner`) exist with valid frontmatter
- `scripts/verify-chunk.ts` passes its component-level acceptance criteria
- The placeholder spec (`docs/specs/ping-route/`) runs through the full loop successfully and produces a real PR against `homefield-v0-1-0`
- `docs/specs/README.md` exists
- None of the explicitly out-of-scope items (Jira integration, worktree isolation, cost tracking, speculative reference skills) are built as part of this spec
