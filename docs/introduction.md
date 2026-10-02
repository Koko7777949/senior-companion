# Introduction

Senior Companion is a monorepo for a care coordination dashboard. The interface is in Arabic and uses right-to-left layout. Its screens cover a patient profile, medication reminders and daily logs, family contacts, alerts, connected-device records, and a printable report.

The project is organized as a pnpm workspace. Deployable apps live in `artifacts/`, and shared libraries live in `lib/`. The web app calls the API through generated React Query hooks; the API persists records in PostgreSQL using Drizzle ORM.

## Main components

- **Web app** — `artifacts/senior-companion`
- **API server** — `artifacts/api-server`
- **Component preview app** — `artifacts/mockup-sandbox`
- **OpenAPI source and generator config** — `lib/api-spec`
- **Generated API client and schemas** — `lib/api-client-react` and `lib/api-zod`
- **Database schema and connection** — `lib/db`

## Documentation map

- [Architecture](architecture.md) describes the request and data flow.
- [Local development](local-development.md) covers prerequisites, commands, and database setup.
- [API reference](api-reference.md) summarizes the HTTP operations and links to the OpenAPI source.
- [Data model](data-model.md) describes the persistent entities.
- [Limitations and safety](limitations-and-safety.md) lists implementation gaps that matter before handling real care data.

## Source of truth

The OpenAPI definition at `lib/api-spec/openapi.yaml` is the source for the generated client and Zod schemas. Update the specification first, then run the code-generation command documented in [Local development](local-development.md).