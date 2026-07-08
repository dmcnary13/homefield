# docs/specs/

Convention for implementation specs, one directory per spec:

```
docs/specs/{spec-name}/
  spec.md        # required — the spec itself: overview, scope, components, acceptance criteria
  chunks.md       # optional — spec broken into commit-sized chunks, if the spec is split for execution
  checklist.md    # optional — per-chunk progress tracking, checked off as chunks land
```

`spec.md` is the source of truth; `chunks.md` and `checklist.md` are derived from it, not the other way around.

Every chunk's acceptance criteria must be checkable by `tsc`, `eslint`, or `jest` — that's what `spec-runner` verifies automatically. If a spec contains UI chunks whose correctness can't be checked that way (e.g. matching the legacy app's visual design), it includes a **"Visual QA"** section listing those chunks; a human confirms them against the running app before the spec's PR is merged. This is a merge-time gate, not something `spec-runner` blocks on mid-loop.

See [agent-harness/spec.md](agent-harness/spec.md) for the first example.
