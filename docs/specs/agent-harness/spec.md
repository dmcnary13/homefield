# Spec: Agent Harness for Homefield

## Overview

`docs/implementation-plan.md` (decision #8, Phase 0 item 7) commits to populating `.claude/hooks/` and `.claude/skills/` — currently empty scaffolding — so this rebuild's guardrails (frozen `legacy/`, the scoring-engine golden-fixture safety net, consistent endpoint structure) are enforced automatically instead of relying on memory across a multi-week rebuild. This spec makes that concrete, modeled on a working harness inspected at `C:\Users\jtn80\Code\5-tool-ams\.claude` (a more mature sibling project) and adapted to Homefield's stack: no Nx, no Jira, no Drizzle — pnpm/Turborepo, Supabase, and a much smaller team.

This spec also establishes `docs/specs/{name}/` as the standing convention for future specs in this repo — this file is the first one.

---

## Reference: the 5-tool-ams pattern (read-only inspection, not copied verbatim)

Observed at `C:\Users\jtn80\Code\5-tool-ams\.claude` (top level only; `.claude/worktrees/` contains full nested git worktree copies and was not used as a reference):

- **`settings.json`** wires `PreToolUse`/`PostToolUse` hooks on `Edit|Write|MultiEdit|NotebookEdit`, plus a `permissions.allow` list pre-approving routine build/git commands so the harness's own tooling doesn't trigger constant permission prompts.
- **`hooks/pre-edit.ts`** — reads the tool call's JSON payload from stdin, extracts candidate file paths, and exits 1 (blocking the edit) if any path matches a `BLOCKED_PATTERNS` regex list (`.env*`, lockfile, `CLAUDE.md`, `AGENTS.md`, `.claude/hooks/` itself, migration directories).
- **`hooks/post-edit.ts`** — on every `.ts`/`.tsx` write, maps the file's path to its owning project via a lookup table and runs that project's typecheck command synchronously, failing the hook (and surfacing the error to the agent) if it doesn't pass.
- **`skills/`**, two distinct kinds:
  - *Reference/convention skills* (`ams-conventions`, `auth-model`, `db-patterns`, `data-fetching`, `ui-patterns`) — not commands, loaded automatically when their `description` matches the task at hand. Each documents one slice of "how this codebase actually works" (package dependency graph, the `Actor` auth type, query-function conventions, server-component-vs-client-hook rules, component library conventions) with real file paths and real code excerpts, not generic advice.
  - *Process skills* forming a spec pipeline: `spec-reviewer` (gates a spec for ambiguity/scope/missing acceptance criteria before anything is chunked) → `task-scope-splitter` (splits an approved spec into ≤5-file, ≤2-project, single-purpose chunks written to `chunks.md`) → `chunks-to-jira` (creates a Jira Epic + one Task per chunk, writes `checklist.md`) → `spec-runner` (autonomous loop: one branch per spec, one commit per chunk, runs `verify-chunk` after each chunk with a 2-retry hard-stop policy, opens one PR when all chunks are checked off). `plan-reviewer` runs ad hoc against a single chunk's proposed plan before code is written.
  - `package-audit` — a read-only, single-package-at-a-time health audit skill that writes a dated report and explicitly never edits code or spans multiple packages in one run.
- **`scripts/verify-chunk.ts`** (repo root, not `.claude/`) — runs the same `lint`/`typecheck`/`test` targets as CI, scoped to the diff since the last chunk commit, and writes a JSON result log to `.claude/verify-logs/{chunkId}.json`.
- **`scripts/start-run.ts` / `finish-run.ts`** — wrap a `spec-runner` run with a run log (`.claude/run-logs/{runId}.json`) capturing tokens, cost, iteration count, and chunk pass/fail counts, so harness performance is measurable across runs and harness versions.

The parts of this worth adopting for Homefield: the two-hook pattern, the reference-skill idea, and the spec→chunks→checklist→loop pipeline shape. The parts that don't transfer as-is: anything Nx-specific (`nx affected`, `nx run {project}:typecheck`), Drizzle-specific migration paths, and the Jira integration (see Open Decisions).

---

## Scope

This spec covers building the harness itself. It produces:

1. `.claude/settings.json` — hooks + permissions allowlist
2. `.claude/hooks/pre-edit.ts` and `.claude/hooks/post-edit.ts`
3. `.claude/skills/homefield-conventions/SKILL.md` — the one reference skill that can be written now, since the monorepo layout is already decided
4. `.claude/skills/smoke-test/SKILL.md`, `.claude/skills/verify-scoring/SKILL.md`, `.claude/skills/new-endpoint/SKILL.md` — the three skills named in `docs/implementation-plan.md` decision #8
5. A short `docs/specs/README.md` documenting the spec/chunks/checklist convention for future specs

**Out of scope for this spec:**
- Any application code in `apps/expo`, `apps/api`, `packages/core` (Phase 1/2 work)
- `scripts/verify-chunk.ts` and a `spec-runner` skill — these depend on real build/test/typecheck commands existing in a real monorepo, which doesn't exist yet (see Sequencing below)
- Jira integration (`chunks-to-jira` equivalent) — gated on an open decision below
- `.claude/worktrees/`-style isolated parallel execution — premature at this project's current size

---

## Sequencing

This spec only covers what's buildable *before* `apps/`/`packages/` exist. `spec-runner`, `verify-chunk`, and the remaining reference skills (`scoring-engine`, `data-fetching`, `expo-ui-patterns`, etc., mirroring AMS's `auth-model`/`db-patterns`/`ui-patterns`) depend on real typecheck/test/build commands and real code to document — they get written as follow-up specs once Phase 0's monorepo scaffold (implementation-plan.md, Phase 0 item 2) and Phase 1's backend exist, not invented speculatively now for code that doesn't exist yet. `homefield-conventions` is the one exception: the package layout is already decided (implementation-plan.md decision #5), so it can be documented now even though the packages themselves are empty.

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

Use `tsx` rather than AMS's `ts-node` — faster startup, no separate `ts-node` config needed. This is an implementation choice, not a hard requirement; any TypeScript runner is acceptable as long as it's used consistently between both hooks.

**Acceptance criteria:**
- `.claude/settings.json` is valid JSON
- Making a trivial `Edit` call while both hooks are wired triggers `pre-edit.ts` (verified by temporarily adding a path to `BLOCKED_PATTERNS` that matches the test file, confirming the edit is rejected, then reverting)

### 2. `.claude/hooks/pre-edit.ts` — protected-path guard

Same structure as AMS's version (parse `tool_input` from stdin, extract `path`/`file_path`/`edits[].path`/`edits[].file_path`, test against a pattern list, exit 1 with a message naming the blocked path(s) if any match). Homefield's `BLOCKED_PATTERNS` differ from AMS's:

```typescript
const BLOCKED_PATTERNS: RegExp[] = [
  /(^|[\\/])legacy([\\/]|$)/i,              // frozen reference code — see implementation-plan.md decision #8
  /(^|[\\/])\.env(\..*)?$/i,
  /(^|[\\/])pnpm-lock\.yaml$/i,
  /(^|[\\/])CLAUDE\.md$/i,
  /(^|[\\/])\.claude[\\/]hooks([\\/]|$)/i,
  /(^|[\\/])supabase[\\/]migrations([\\/]|$)/i,
];
```

`legacy/` is only added to this list once Phase 0's freeze step (implementation-plan.md, Phase 0 item 1) has actually moved `src/App.jsx` and `api/generate.js` there — until that move happens, this pattern has nothing to match and is inert, which is fine.

**Acceptance criteria:**
- Attempting an `Edit` on a file under `legacy/` (once it exists) exits 1 and prints a message naming the path
- Attempting an `Edit` on an unrelated file (e.g. a new file under `apps/`) exits 0

### 3. `.claude/hooks/post-edit.ts` — typecheck gate

Same dispatch structure as AMS: map an edited `.ts`/`.tsx` file's path to its owning workspace, run that workspace's typecheck script, fail the hook if it doesn't pass. Homefield's project map (per implementation-plan.md decision #5's layout):

```typescript
const PROJECT_DIRS: Record<string, string> = {
  "apps/expo": "expo",
  "apps/api": "api",
  "packages/core": "core",
};
```

Command per workspace: `pnpm --filter {project} typecheck` (or the Turborepo equivalent, `npx turbo run typecheck --filter={project}`) — pick one and use it consistently; it should match whatever Phase 0's monorepo scaffold (implementation-plan.md Phase 0 item 2) actually wires as each workspace's `typecheck` script.

**Acceptance criteria:**
- Introducing a deliberate type error in a `.ts` file under any of the three workspaces and triggering an `Edit`/`Write` causes the hook to exit 1 with the typecheck output
- A correctly-typed edit exits 0

### 4. `.claude/skills/homefield-conventions/SKILL.md`

Modeled on `ams-conventions`. Documents, using the actual layout from `docs/implementation-plan.md` decision #5:

- The package table: `apps/expo` (Expo Router app — iOS/Android/web), `apps/api` (Node backend), `packages/core` (shared types, API client, prompt builder, scoring engine)
- The dependency direction: `apps/* -> packages/core`; `packages/core` depends on nothing internal; no app imports another app
- A pointer to `docs/implementation-plan.md` for the async-job API shape (decision #1), the dual web-cookie/native-token auth shape (decision #4), and the golden-fixture requirement before touching scoring logic (decision #3)

This file should be updated as real conventions emerge in Phase 1/2 (e.g. once the API's actual auth-middleware pattern exists, once React Query usage settles into a repeated shape) — it starts as a skeleton of decisions already made, not a finished document.

**Acceptance criteria:**
- File exists at `.claude/skills/homefield-conventions/SKILL.md` with YAML frontmatter (`name`, `description`) matching the format in every AMS skill inspected above
- Package table and dependency direction match `docs/implementation-plan.md` decision #5 exactly

### 5. `.claude/skills/smoke-test/SKILL.md`

Walks the manual critical-path checklist already referenced in `docs/implementation-plan.md` (Phase 0 item 4, Phase 3): login → new session → generate program → view program → coach roster view. Until real E2E coverage exists, this is a slash-command-driven manual walkthrough — the skill's job is to name the exact steps and exact URLs/screens to check, not to automate anything.

**Acceptance criteria:**
- File exists with the five steps listed above, each naming the specific screen/action to verify (not "check that things work")

### 6. `.claude/skills/verify-scoring/SKILL.md`

Runs the ported scoring engine (once it exists in `packages/core`, Phase 1 item 4) against the golden fixtures generated in Phase 0 item 5, and reports any diff from the frozen `legacy/` reference. Until the fixtures and the ported engine both exist, this skill's instructions describe the comparison procedure but there is nothing to run yet.

**Acceptance criteria:**
- File exists and names the exact fixture location and the exact comparison it performs (fixture output vs. `packages/core` scoring output, byte/value-level diff)

### 7. `.claude/skills/new-endpoint/SKILL.md`

Scaffolds a new authenticated, RLS-aware API route in `apps/api` following the Phase 1 pattern (auth middleware, structured logging, error handling shape) once that pattern exists from the first one or two real endpoints built in Phase 1. Like `homefield-conventions`, this starts as a skeleton referencing the *planned* shape from `docs/implementation-plan.md` Phase 1, and gets filled in with a real code excerpt once the first endpoint is built — mirroring how AMS's skills quote real file paths and real code, not hypothetical patterns.

**Acceptance criteria:**
- File exists and at minimum documents the endpoint shape implied by Phase 1 (auth check → RLS-scoped query/job enqueue → typed response), to be updated with a real example after the first endpoint lands

### 8. `docs/specs/README.md`

Short convention note: specs live at `docs/specs/{spec-name}/spec.md`; a chunked spec adds `chunks.md` (chunk boundaries, scope, acceptance criteria) and `checklist.md` (progress tracking); this file (`docs/specs/agent-harness/spec.md`) is the first example.

**Acceptance criteria:**
- File exists and names the three-file convention (`spec.md`, `chunks.md`, `checklist.md`)

---

## Open decisions

**Needs a decision, not blocking the components above:**
- **Jira integration.** AMS syncs chunks to Jira Epics/Tasks (`chunks-to-jira`) so ticket state and code state stay linked. Homefield doesn't have a Jira project referenced anywhere in this repo's docs. Recommended default: skip it — track chunk progress in `checklist.md` alone, which is simpler for a project this size and avoids standing up a Jira project with no other use. Revisit if the team grows past what a plain checklist can coordinate.
- **`spec-runner` and `verify-chunk`.** Valuable once Phase 0's monorepo scaffold exists with real typecheck/lint/test scripts to run — not buildable yet (see Sequencing). Track as a follow-up spec once `apps/`/`packages/` exist with working scripts.
- **`.claude/worktrees/`-style parallel execution.** AMS uses isolated git worktrees per active run for parallel chunk execution. Recommended default: skip for now — Homefield's Phase 0–2 work is sequential by design (see `docs/implementation-plan.md`'s phase dependencies), so there's no parallel workload yet to isolate.

---

## Acceptance criteria (spec-level)

- `.claude/settings.json` exists, is valid JSON, and wires both hooks
- `.claude/hooks/pre-edit.ts` and `.claude/hooks/post-edit.ts` exist and pass the per-component acceptance criteria above
- `.claude/skills/homefield-conventions/SKILL.md`, `smoke-test/SKILL.md`, `verify-scoring/SKILL.md`, `new-endpoint/SKILL.md` all exist with valid frontmatter
- `docs/specs/README.md` exists
- None of the out-of-scope items (`spec-runner`, `verify-chunk`, Jira integration, worktree isolation) are built as part of this spec
