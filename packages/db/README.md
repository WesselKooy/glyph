# @glyph/db

Prisma and Postgres package for Glyph.

## Environment

Set `DATABASE_URL` before running Prisma commands. You can export it in your shell or create `packages/db/.env` from `packages/db/.env.example`:

```sh
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/glyph?schema=public"
```

The schema contains the core Link Grid puzzle, gameplay, guess, and rating models.

For full local web plus API testing, see `docs/local-development.md`.

## Commands

- `pnpm --filter @glyph/db generate`
- `pnpm --filter @glyph/db migrate:dev`
- `pnpm --filter @glyph/db migrate:deploy`
- `pnpm --filter @glyph/db migrate:status`
- `pnpm --filter @glyph/db seed`
- `pnpm --filter @glyph/db studio`
