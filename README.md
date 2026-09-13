# PantasTour

PantasTour is a personalized mobile travel companion for discovering and exploring the Philippines.

## Repository layout

- `apps/mobile` — Expo and React Native mobile application
- `apps/api` — Express REST API and background jobs
- `packages/contracts` — shared request, response, and validation contracts
- `packages/api-client` — typed client used by the mobile application
- `packages/eslint-config` — shared lint configuration
- `packages/typescript-config` — shared TypeScript configuration
- `database` — PostGIS migrations, seed data, and database documentation
- `docs` — product, architecture, API, testing, and operational documentation

## Prerequisites

- Node.js LTS and npm
- Docker Desktop or compatible Docker/Compose installation

Node.js is not installed in the environment that created this initial scaffold. Generate and commit `package-lock.json` only after the team has selected and installed the supported Node.js LTS version.

## First-time setup

1. Copy `.env.example` to `.env` and fill in local values.
2. Bootstrap the Expo and Express dependencies listed in each application's README.
3. Run `docker compose up -d postgres redis`.
4. Run the database migrations and seed commands selected by the team.
5. Use short-lived branches created from `develop` and open pull requests back into `develop`.

## Project documents

- [Product specification](docs/product-spec.md)
- [Team ownership](docs/ownership.md)
- [Architecture](docs/architecture.md)
- [Contributing](CONTRIBUTING.md)

