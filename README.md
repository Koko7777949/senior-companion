# Senior Companion

رفيق كبار السن (Senior Companion) is an Arabic, right-to-left care coordination dashboard for an older adult and their care team. It includes a React web app, an Express API, a PostgreSQL data layer, and shared OpenAPI-generated client and validation packages.

> **Safety and privacy:** This repository is a software prototype, not an emergency-response service or a source of medical advice. The API currently has no authentication or user/tenant isolation, so records are shared. Do not use it with real patient or health information until the security and operational gaps in [Limitations and safety](docs/limitations-and-safety.md) are addressed.

## Workspace

| Path | Purpose |
| --- | --- |
| `artifacts/senior-companion` | Arabic RTL web dashboard |
| `artifacts/api-server` | Express API, mounted at `/api` |
| `artifacts/mockup-sandbox` | Isolated component preview app |
| `lib/db` | PostgreSQL connection and Drizzle schemas |
| `lib/api-spec` | OpenAPI 3.1 source and Orval configuration |
| `lib/api-client-react` | Generated React Query client and hooks |
| `lib/api-zod` | Generated Zod schemas |
| `scripts` | Workspace utility scripts |

## Requirements

- Node.js 24
- pnpm
- PostgreSQL for the API and persistent data

Install dependencies from the repository root:

```sh
pnpm install
```

The API requires `DATABASE_URL` and `PORT`. The Vite apps require `PORT` and `BASE_PATH`; for a local root-mounted preview, use `BASE_PATH=/`. See [Local development](docs/local-development.md) for run commands and database setup.

## Documentation

The GitBook-compatible documentation is organized in [`SUMMARY.md`](SUMMARY.md). Start with [Introduction](docs/introduction.md), or go directly to the [API reference](docs/api-reference.md).

## Current verification status

The shared library, API-server, and mockup-sandbox typechecks have passed. The full workspace typecheck currently reports existing TypeScript errors in the Senior Companion frontend. The API health endpoint and web preview have been verified in the Replit development environment.

## License

The root package metadata declares the MIT license. See `package.json`.