# API application

This directory contains the Express API and background jobs.

- `src/modules` contains business capabilities.
- `src/integrations` contains external provider adapters.
- `src/platform` contains database, cache, HTTP, logging, and configuration infrastructure.
- `src/jobs` contains schedulable job entry points.
- `tests` contains cross-module and end-to-end tests.

Each module should expose a narrow public interface and normally use route, controller, service, repository, schema, policy, and test files.

## Commands

Run these commands from the repository root:

```text
npm run dev:api
npm run test --workspace=@saraya/api
npm run typecheck --workspace=@saraya/api
npm run lint --workspace=@saraya/api
npm run build --workspace=@saraya/api
```

When `DATABASE_URL` is configured outside tests, the destination module reads from PostgreSQL and
uses PostGIS for nearby searches. Without database configuration, it falls back to the validated
records in `database/seeds/destinations.json` so API development can continue independently.

Initialize a configured database with `npm run db:migrate`, then load the catalog with
`npm run db:seed`.

The itinerary module uses the official OpenAI SDK when `OPENAI_API_KEY` is present. Set
`OPENAI_MODEL` to override the default `gpt-5-mini`, or set `ITINERARY_GENERATOR=deterministic` to
force the zero-network fallback. Both implementations return the same shared validated contract.

