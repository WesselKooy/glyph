# Local Development

Use this path when you want to test the web app and database-backed API together.

## One-time setup

Install dependencies:

```sh
pnpm install
```

Create local env files:

```sh
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

The API and Prisma CLI both need `DATABASE_URL`. Keep the values in
`packages/db/.env` and `apps/api/.env` aligned when testing locally.

## Start Postgres

```sh
pnpm db:up
```

Apply migrations and seed playable puzzles:

```sh
pnpm db:migrate:deploy
pnpm db:seed
```

## Start the apps

In one terminal:

```sh
pnpm api:dev
```

In another terminal:

```sh
pnpm dev
```

Open:

- Web app: http://localhost:3000
- API health: http://localhost:3001/health
- Admin puzzles: http://localhost:3000/admin/puzzles

If the web app starts on another port because `3000` is already in use, keep
`NEXT_PUBLIC_API_BASE_URL` pointed at the API port, not the web port.

## Trigger.dev jobs

The jobs workspace lives in `apps/jobs`. It is reserved for asynchronous work
such as future AI puzzle generation tasks.

Create the local jobs env file:

```sh
cp apps/jobs/.env.example apps/jobs/.env
```

Required values:

```sh
TRIGGER_SECRET_KEY="tr_dev_xxxxxxxxxx"
TRIGGER_PROJECT_REF="proj_xxxxxxxxxx"
```

Get these values from your Trigger.dev project. You can also authenticate the
Trigger.dev CLI with:

```sh
pnpm --filter @glyph/jobs exec trigger login
```

Typecheck the jobs app:

```sh
pnpm jobs:typecheck
```

Run Trigger.dev locally:

```sh
pnpm jobs:dev
```

The initial smoke task is `smoke-test` in `apps/jobs/src/trigger/smoke.ts`. It
accepts a payload shaped like:

```json
{
  "message": "hello",
  "count": 2
}
```

It returns a deterministic echo response with `echoedMessage`, `count`, and
`checksum`. While `pnpm jobs:dev` is running, trigger it from the Trigger.dev
local dev UI or project dashboard.

## Reset local data

For a normal schema update:

```sh
pnpm db:migrate:deploy
pnpm db:seed
```

To stop Postgres without deleting data:

```sh
pnpm db:down
```
