# Technical Architecture

## Goal

Build a small but mature web/PWA puzzle app using a TypeScript-native SaaS architecture.

The app should start narrow and grow deliberately:
1. playable hardcoded frontend
2. database-backed gameplay
3. admin review
4. AI candidate generation
5. validation pipeline
6. personalization and accounts later

The architecture should support growth without becoming enterprise cosplay.

## Stack

Use:

```txt
Frontend:
  Next.js App Router
  TypeScript
  Tailwind
  shadcn/ui

Backend:
  NestJS
  TypeScript
  REST API

Database:
  Postgres
  Prisma ORM
  Prisma Migrate

Jobs:
  Trigger.dev

Shared packages:
  Zod schemas
  domain validators
  AI helpers

Deployment:
  Vercel for web
  Render/Fly/Railway/DigitalOcean for API
  managed Postgres
  Trigger.dev Cloud
```

## Monorepo structure

Target structure:

```txt
puzzle-app/
  apps/
    web/
      app/
      components/
      lib/
      features/
        puzzle/
        admin/
    api/
      src/
        modules/
          puzzles/
          gameplay/
          ratings/
          generation/
          validation/
          admin/
          users/
    jobs/
      src/
        tasks/
          generate-puzzle.ts
          validate-puzzle.ts
          repair-puzzle.ts
          publish-daily.ts

  packages/
    db/
      prisma/
        schema.prisma
      src/
        client.ts
    schemas/
      src/
        puzzle.schema.ts
        generation.schema.ts
        gameplay.schema.ts
        validation.schema.ts
    domain/
      src/
        validators/
        scoring/
        puzzle-rules.ts
    ai/
      src/
        openai-client.ts
        prompts/
        structured-output.ts

  docs/
    mvp-scope.md
    gameplay-rules.md
    technical-architecture.md

  AGENTS.md
  package.json
  pnpm-workspace.yaml
```

## Architectural principle

Keep this as a modular monolith.

Do not build:
- microservices
- Kubernetes
- Kafka
- GraphQL
- event sourcing
- CQRS
- complex service mesh
- separate deployable services for each domain

Maturity means:
- clear boundaries
- typed contracts
- durable jobs
- simple deployment
- good tests
- readable domain logic
- useful admin tools
- observable production behavior

## Frontend responsibilities

The Next.js app owns:

- rendering puzzle screens
- tile selection UI
- animations
- responsive layout
- result screen
- admin UI
- generation status UI
- local interaction state

The frontend may hold local UI state for:
- selected tiles
- shuffled item order
- open modals
- animation state
- currently displayed hint

The frontend should not be the source of truth for:
- whether a guess is correct
- how many mistakes are persisted
- whether a play session is complete
- whether a puzzle is published
- admin status transitions

## Backend responsibilities

The NestJS API owns:

- puzzle retrieval
- play session creation
- guess validation
- mistake tracking
- solved state
- rating persistence
- admin status changes
- generation job creation
- validation result persistence
- access control later

Suggested modules:

```txt
PuzzlesModule
GameplayModule
RatingsModule
GenerationModule
ValidationModule
AdminModule
UsersModule later
```

## API style

Use REST for the MVP.

Avoid GraphQL.

Use clear endpoints:

```txt
GET    /puzzles/daily
GET    /puzzles/:id

POST   /play-sessions
GET    /play-sessions/:id
POST   /play-sessions/:id/guess
POST   /play-sessions/:id/hint

POST   /puzzles/:id/rating

GET    /admin/puzzles
GET    /admin/puzzles/:id
POST   /admin/puzzles/:id/approve
POST   /admin/puzzles/:id/reject
POST   /admin/puzzles/:id/publish

POST   /generation-jobs
GET    /generation-jobs/:id
```

## Shared schemas

Use Zod in `packages/schemas` for shared shapes where useful:

- puzzle DTOs
- gameplay requests/responses
- AI-generated candidate shape
- validation issue shape
- generation job status

Do not overdo shared types at the expense of clarity.

## Database design

Use Postgres as the source of truth.

Core models:

```txt
Puzzle
PuzzleGroup
PuzzleItem
PlaySession
Guess
PuzzleRating
GenerationJob
ValidationRun
```

Optional later models:

```txt
User
UserInterest
DailyPuzzle
PuzzlePack
PuzzleShareLink
PromptTemplate
ItemEmbedding
```

## Initial Prisma model concept

```prisma
model Puzzle {
  id              String        @id @default(cuid())
  title           String
  type            PuzzleType    @default(LINK_GRID)
  theme           String?
  difficulty      Difficulty
  status          PuzzleStatus  @default(DRAFT)
  source          PuzzleSource  @default(MANUAL)
  qualityScore    Float?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  groups          PuzzleGroup[]
  playSessions    PlaySession[]
  ratings         PuzzleRating[]
  validationRuns  ValidationRun[]
}

model PuzzleGroup {
  id          String       @id @default(cuid())
  puzzleId    String
  label       String
  explanation String
  gentleHint  String?
  strongHint  String?

  puzzle      Puzzle       @relation(fields: [puzzleId], references: [id], onDelete: Cascade)
  items       PuzzleItem[]
}

model PuzzleItem {
  id        String      @id @default(cuid())
  groupId   String
  text      String
  order     Int?

  group     PuzzleGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
}

model PlaySession {
  id          String    @id @default(cuid())
  puzzleId    String
  userId      String?
  mistakes    Int       @default(0)
  hintsUsed   Int       @default(0)
  solved      Boolean   @default(false)
  startedAt   DateTime  @default(now())
  completedAt DateTime?

  puzzle      Puzzle    @relation(fields: [puzzleId], references: [id])
  guesses     Guess[]
}

model Guess {
  id            String      @id @default(cuid())
  playSessionId String
  itemIds       String[]
  correct       Boolean
  createdAt     DateTime    @default(now())

  playSession   PlaySession @relation(fields: [playSessionId], references: [id], onDelete: Cascade)
}

model PuzzleRating {
  id          String   @id @default(cuid())
  puzzleId    String
  userId      String?
  fairness    String
  difficulty  String?
  comment     String?
  createdAt   DateTime @default(now())

  puzzle      Puzzle   @relation(fields: [puzzleId], references: [id], onDelete: Cascade)
}

model GenerationJob {
  id              String   @id @default(cuid())
  status          String
  topic           String?
  difficulty      String?
  promptVersion   String?
  model           String?
  rawOutput       Json?
  parsedOutput    Json?
  error           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ValidationRun {
  id          String   @id @default(cuid())
  puzzleId    String
  validator   String
  passed      Boolean
  score       Float?
  issues      Json
  createdAt   DateTime @default(now())

  puzzle      Puzzle   @relation(fields: [puzzleId], references: [id], onDelete: Cascade)
}

enum PuzzleType {
  LINK_GRID
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EVIL
}

enum PuzzleStatus {
  DRAFT
  VALIDATING
  REJECTED
  READY_FOR_REVIEW
  APPROVED
  PUBLISHED
}

enum PuzzleSource {
  MANUAL
  AI_GENERATED
  USER_CUSTOM
}
```

Treat this as a starting point, not sacred.

## Gameplay backend flow

### Start session

```txt
POST /play-sessions
```

Input:
```json
{
  "puzzleId": "..."
}
```

Backend:
- validates puzzle exists
- creates play session
- returns session ID and puzzle data

### Submit guess

```txt
POST /play-sessions/:id/guess
```

Input:
```json
{
  "selectedItemIds": ["...", "...", "...", "..."]
}
```

Backend:
- validates session
- validates items
- checks exact group match
- stores guess
- updates mistakes or solved state
- returns result

## AI generation architecture

AI generation must be async.

Flow:

```txt
Frontend/Admin
  ↓
POST /generation-jobs
  ↓
API creates GenerationJob
  ↓
Trigger.dev task starts
  ↓
LLM generates structured candidate
  ↓
Zod validates shape
  ↓
deterministic validator runs
  ↓
ambiguity critic runs
  ↓
solver simulation runs
  ↓
quality score computed
  ↓
candidate saved as READY_FOR_REVIEW or REJECTED
  ↓
admin reviews
```

Do not make the user wait on a long-running API request.

## Generation job states

Use explicit states:

```txt
QUEUED
GENERATING
PARSING
VALIDATING_STRUCTURE
VALIDATING_AMBIGUITY
SIMULATING_SOLVERS
REPAIRING
REJECTED
READY_FOR_REVIEW
APPROVED
PUBLISHED
FAILED
```

These states make debugging easier.

## Validation pipeline

The validation pipeline should include:

### 1. Schema validation

Uses Zod to verify:
- required fields
- group count
- item count
- string lengths
- valid difficulty
- non-empty explanations

### 2. Deterministic validation

Checks:
- unique item text
- unique group labels
- no duplicate item IDs
- no empty hints if hints are required
- max tile text length
- no category label directly revealed by item text
- supported puzzle size

### 3. Ambiguity critic

An LLM attempts to find:
- alternative valid groupings
- ambiguous items
- overlapping categories
- weak categories
- factual risks
- unfair difficulty

### 4. Solver simulation

An LLM sees only the shuffled items and attempts to solve.

If simulated solvers repeatedly fail or find different plausible solutions, flag or reject the puzzle.

### 5. Quality scoring

Compute a score from:
- deterministic validation
- ambiguity score
- solver success
- explanation quality
- novelty
- mobile readability

Reject if:
- high-severity ambiguity exists
- deterministic validation fails
- quality score is too low
- solver simulation fails repeatedly

## Admin review architecture

Admin UI should support:

- puzzle list
- filtering by status
- puzzle detail page
- preview as player
- validation run display
- approve/reject/publish buttons
- manual puzzle creation
- manual puzzle editing later
- ratings/feedback display

Admin review is part of the product quality loop.

## Auth strategy

Do not add auth immediately.

Start anonymous.

Add auth when needed for:
- saved streaks
- personalization
- custom puzzle gifts
- user puzzle history
- payments

Likely options:
- Clerk for speed
- Better Auth for more app-owned TypeScript-native auth

## State management

Use local React state for:
- selected tiles
- shuffled display order
- animation state
- current UI modals

Use server/API state for:
- puzzle data
- play session
- guess result
- ratings
- generation job status

Add TanStack Query only when useful, especially for:
- generation job polling
- admin lists
- play session mutations
- ratings

Avoid Zustand until local UI state becomes genuinely hard to manage.

## Deployment

Suggested MVP deployment:

```txt
Web:
  Vercel

API:
  Render, Fly.io, Railway, or DigitalOcean

Database:
  Managed Postgres

Jobs:
  Trigger.dev Cloud
```

Keep deployment boring.

## Observability

Track at least:

- API errors
- failed generation jobs
- generation duration
- LLM cost per generated puzzle
- validation failure reasons
- approval rate
- completion rate
- average mistakes
- hint usage
- fairness ratings
- ambiguous/wrong reports
- repeat play behavior

Do not build a complex analytics system early. Start with logs and simple database queries.

## Development workflow

Recommended order:

```txt
1. Build hardcoded Next.js game.
2. Add NestJS health endpoint.
3. Add Prisma/Postgres.
4. Add puzzle schema and seed data.
5. Serve puzzles from API.
6. Validate guesses on backend.
7. Add ratings.
8. Add admin review.
9. Add manual puzzle creation.
10. Add Trigger.dev.
11. Add AI candidate generation.
12. Add validation pipeline.
13. Add auth/personalization only after usage justifies it.
```

## Testing strategy

Prioritize tests for pure domain logic:

- exact group matching
- wrong guess handling
- duplicate item IDs
- already solved groups
- mistake limit
- session completion
- deterministic puzzle validation
- quality scoring

UI tests can come later.

## Anti-overbuilding rules

Do not add:
- auth before anonymous play works
- payments before retention exists
- personalization before users like generic daily puzzles
- more puzzle types before Link Grid is fun
- advanced AI validation before manual puzzles feel good
- native mobile before web/PWA is validated

## Core architectural test

Every technical decision should answer:

> Does this move us closer to a stranger enjoying one puzzle and wanting another?

If not, defer it.
