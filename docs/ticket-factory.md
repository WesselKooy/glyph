# Ticket Factory

This repo uses two separate automations:

1. Create GitHub issues from structured ticket JSON files.
2. Start Codex implementation only when an issue is deliberately labeled `codex-ready`.

Do not make every new issue start Codex. New manual and generated tickets should begin with `needs-spec`.

## Ticket Creation

Ticket batches live in `tickets/` as JSON arrays.

Create issues with:

```bash
pnpm tickets:create tickets/m1-playable-prototype.json
```

Each ticket should include:

- `title`
- `labels`
- `body`

The issue body must contain these sections before `codex-ready` is allowed:

- `## Context`
- `## Goal`
- `## Requirements`
- `## Out of scope`
- `## Acceptance criteria`
- `## Test plan`

GitHub issue forms render headings with `###`, so the guard workflows accept either `##` or `###`.

## Codex Gate

The issue lifecycle is:

```txt
needs-spec
  -> codex-ready
  -> codex-working
  -> needs-human-review
```

Only adding `codex-ready` starts the Codex implementation workflow.

Issues labeled `risk:high` do not auto-run. Start those manually after review.

The workflow starts Codex by posting an `@codex implement this issue` comment. It does not use `openai/codex-action`, does not require an OpenAI API key, and does not run Codex through the API from GitHub Actions.

## Labels

Create these labels in GitHub:

```txt
needs-spec
codex-ready
codex-working
needs-human-review
changes-requested
merge-ready

risk:low
risk:medium
risk:high

size:xs
size:s
size:m
size:l

type:feature
type:bug
type:refactor
type:test
type:docs
type:chore

area:web
area:api
area:db
area:jobs
area:admin
area:gameplay
area:ai
area:validation
area:infra
```

## GitHub Project Setup

Configure the project auto-add rule in GitHub:

```txt
Repository: glyph
Filter: label:needs-spec OR label:codex-ready
```

Suggested views:

```txt
Needs Spec        label:needs-spec
Ready for Codex   label:codex-ready
In Progress       label:codex-working
Needs Review      label:needs-human-review
```

## Codex Account Setup

This lightweight workflow relies on your GitHub/Codex integration responding to `@codex` issue comments. Test it with one tiny `codex-ready` issue before promoting a batch.

Keep merge approval manual. The automation may ask Codex to create branches and PRs, but humans remain the merge gate.
