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
