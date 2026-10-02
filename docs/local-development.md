# Local development

## Prerequisites

- Node.js 24
- pnpm
- PostgreSQL for API-backed features

Install the monorepo dependencies from the repository root:

```sh
pnpm install
```

The root preinstall script requires pnpm. Use the checked-in `pnpm-lock.yaml` to keep dependency versions consistent.

## Environment

| Variable | Used by | Required | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | API and database package | Yes for database access | PostgreSQL connection string |
| `PORT` | API and Vite apps | Yes | Listening port |
| `BASE_PATH` | Senior Companion and mockup Vite apps | Yes | Use `/` for a root-mounted local preview |
| `LOG_LEVEL` | API server | No | Controls server logging level |

Set secrets through your local or hosting environment. Do not commit `.env` files, credentials, or production database values.

## Run the apps

Run each app in a separate terminal:

```sh
pnpm --filter @workspace/senior-companion run dev
```

```sh
pnpm --filter @workspace/api-server run dev
```

```sh
pnpm --filter @workspace/mockup-sandbox run dev
```

The API is mounted at `/api`; its health check is `GET /api/healthz`.

## Database

The database package exposes Drizzle Kit commands. In development, after setting `DATABASE_URL`, apply the current schema with:

```sh
pnpm --filter @workspace/db run push
```

The package also exposes `push-force`. This can apply destructive schema changes; use it only against a disposable or backed-up development database after inspecting the proposed changes. This repository does not currently contain a SQL migration history. Production schema changes follow the hosting environment's migration process; do not run development push commands against production.

## Generate API code

Edit `lib/api-spec/openapi.yaml`, then regenerate the client and schemas:

```sh
pnpm --filter @workspace/api-spec run codegen
```

Generated outputs are written to `lib/api-client-react` and `lib/api-zod`. Keep the generator output compatible with the workspace's React Query and Zod versions.

## Checks and builds

```sh
pnpm run typecheck
pnpm run build
```

The root build runs the workspace typecheck before package builds. At the time these docs were prepared, the library, API-server, and mockup-sandbox checks passed, while the full workspace typecheck reported existing errors in the Senior Companion frontend. Check current output rather than assuming that baseline is unchanged.