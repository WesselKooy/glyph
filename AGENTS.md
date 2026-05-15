# AGENTS.md

## Product

This repository is for a web/PWA puzzle app where users solve short hidden-link/category puzzles.

The MVP focuses on one core game mode: **Link Grid**.

A Link Grid puzzle shows a shuffled set of tiles. The player must find hidden groups of related items. After solving, the app reveals concise explanations for each group and asks the player whether the puzzle felt fair.

The long-term product vision is a personalized daily puzzle app that creates clever, validated hidden-connection puzzles around a user’s interests. However, the MVP must stay narrow: prove that the core puzzle loop is fun before adding broad personalization, multiple puzzle types, payments, or community features.

## Product principle

This is not a generic “AI puzzle generator.”

The product should feel like:

> A quality-controlled daily puzzle app that uses AI to propose puzzle candidates, validates them, and only publishes puzzles that are fair, satisfying, and fun.

AI is a candidate generator, not the source of truth.

The core moat is puzzle quality control:
- structured puzzle data
- deterministic validation
- ambiguity checks
- solver simulation
- admin review
- user feedback loops

## Stack

Use the following stack unless explicitly instructed otherwise:

- Monorepo: pnpm workspaces
- Frontend: Next.js App Router, TypeScript, Tailwind, shadcn/ui
- Backend: NestJS, TypeScript
- Database: Postgres
- ORM: Prisma with Prisma Migrate
- Jobs/workflows: Trigger.dev
- Shared validation: Zod schemas
- Frontend data fetching: start simple with fetch; add TanStack Query only when useful
- Local state: React state first; Zustand only if local UI state becomes genuinely complex
- Auth: not part of the first MVP; add later with Clerk or Better Auth if needed

## Repository structure

Target structure:

```txt
apps/
  web/        # Next.js frontend and admin UI
  api/        # NestJS API
  jobs/       # Trigger.dev tasks

packages/
  db/         # Prisma schema, Prisma client, migrations
  schemas/    # Shared Zod schemas and DTO shapes
  domain/     # Pure puzzle rules, validators, scoring helpers
  ai/         # LLM client, prompts, structured-output helpers
docs/
  mvp-scope.md
  gameplay-rules.md
  technical-architecture.md
```

Keep the structure simple. Do not introduce microservices.

## Architecture rules

- Build this as a modular monolith, not a distributed system.
- Do not add Kubernetes, Kafka, event sourcing, CQRS, GraphQL, or microservices.
- Keep puzzle domain logic out of React components.
- The backend owns gameplay validation.
- The frontend owns interaction, selection state, layout, and animation.
- Store core puzzle data relationally, not only as JSON blobs.
- JSON fields are acceptable for raw AI output, validation issues, and metadata.
- Generated AI output must be parsed and validated before being persisted as a usable puzzle.
- Public daily puzzles should not be published directly from AI without review until the validation system has proven itself.
- Build admin/review tooling early. It is part of the product engine, not a back-office afterthought.

## MVP build order

Build in this order:

1. Playable hardcoded Link Grid frontend
2. NestJS API skeleton
3. Prisma/Postgres models
4. Database-backed gameplay
5. Puzzle rating
6. Admin review screen
7. Manual puzzle creation
8. AI generation job
9. Deterministic validation
10. Ambiguity critic
11. Solver simulation
12. Quality scoring
13. Auth and personalization later

Do not skip directly to AI generation. First prove that the puzzle game itself is enjoyable.

## Out of scope for early MVP

Do not implement these unless explicitly asked:

- Native iOS or Android app
- User accounts
- Payments
- Subscriptions
- Community puzzle packs
- Multiplayer
- Crosswords
- Wordle-like games
- Lateral mystery mode
- Full personalization engine
- User-generated public puzzle marketplace
- Complex analytics platform
- Fine-tuning
- pgvector
- Notifications
- Social feed

## Gameplay rules

A Link Grid puzzle contains several hidden groups of related items.

Supported early formats:
- 3 groups of 4 items: 12 tiles, good for onboarding
- 4 groups of 4 items: 16 tiles, standard mode

Gameplay flow:
1. User sees shuffled tiles.
2. User selects exactly the required group size.
3. User submits the guess.
4. Backend checks whether selected item IDs exactly match an unsolved group.
5. Correct groups are revealed.
6. Wrong guesses increment the mistake counter.
7. The puzzle ends when all groups are solved or the mistake limit is reached.
8. The result screen shows explanations and asks for a fairness rating.

## Backend ownership

The backend should enforce:
- valid puzzle ID
- valid play session
- selected item count
- selected item IDs belonging to the puzzle
- selected items not already solved
- correct/incorrect guess
- mistake count
- solved state
- persisted guess history

The frontend should not be trusted as the source of truth for gameplay results.

## AI generation rules

The generation pipeline should be asynchronous.

Preferred flow:
1. Create `GenerationJob`.
2. Trigger background task.
3. Generate structured puzzle candidate.
4. Validate candidate with Zod.
5. Run deterministic validation.
6. Run ambiguity critic.
7. Run solver simulation.
8. Compute quality score.
9. Save as `READY_FOR_REVIEW` or `REJECTED`.
10. Human admin approves before publication.

Do not treat a raw LLM response as a finished puzzle.

## Quality rules for generated puzzles

Generated puzzles should be rejected or flagged if:
- items are duplicated
- group labels are vague
- item text is too long for mobile
- categories are too broad
- categories overlap too much
- a reasonable alternate grouping exists
- explanations are weak or missing
- facts are likely wrong
- puzzle requires overly obscure knowledge for its difficulty
- puzzle is boring, generic, or too easy for the requested difficulty

## Coding standards

- Use TypeScript throughout.
- Prefer clear, boring code over clever abstractions.
- Keep functions small and named by domain intent.
- Use shared Zod schemas for cross-boundary shapes where practical.
- Add tests for pure domain logic.
- Avoid new dependencies unless they clearly reduce complexity.
- Keep changes scoped to the task.
- Do not silently reformat unrelated files.
- Do not implement unrelated features while completing a task.

## Before finishing a task

Run the relevant commands if configured:
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build` when relevant

If a command fails because setup is incomplete, explain what failed and why.

## Good Codex task behavior

When implementing a task:
- Read this file first.
- Read the relevant docs in `/docs`.
- Make the smallest useful change.
- Preserve existing working behavior.
- Add or update tests where appropriate.
- Do not invent large architecture that was not requested.
- Explain any notable trade-offs in the final response.

## Product taste

This app should feel:
- clever
- calm
- polished
- fair
- slightly educational
- satisfying to solve
- mobile-friendly

Avoid making it feel like:
- a cheap AI content generator
- a clone of a single existing puzzle game
- a random trivia app
- a messy collection of unrelated puzzle types
