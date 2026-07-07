# .claude/

Claude Code project configuration.

- `hooks/` — shell/JS hooks that run on Claude Code lifecycle events (e.g. pre-commit checks, formatting on file write). Configured via `settings.json` once hooks are added; empty for now.
- `skills/` — project-specific skills invoked with `/skill-name`. Empty for now.

Nothing is populated yet — this structure exists so hooks and skills have a home as the V1 roadmap (see [docs/roadmap.md](../docs/roadmap.md)) is implemented.
