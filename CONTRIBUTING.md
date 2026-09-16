# Contributing to Saraya

## Branches

- `main` contains tested releases.
- `develop` contains integrated development work.
- Create short-lived branches from `develop`: `feature/*`, `fix/*`, `docs/*`, `test/*`, or `chore/*`.
- Open pull requests into `develop`; do not push directly to `main` or `develop`.

## Pull requests

- Keep a pull request focused on one feature or infrastructure change.
- Include tests, screenshots for UI changes, migration notes, and environment-variable changes where applicable.
- Request the reviewer assigned in `docs/ownership.md`.
- Do not rewrite a migration another developer has already used; add a new migration.
- Merge `develop` into `main` only after the principal user flows pass.

## Module boundaries

- Expo Router files should only compose screens and handle routing.
- Business and presentation logic belongs in `apps/mobile/src/features`.
- API business logic belongs in `apps/api/src/modules`.
- External provider SDKs belong in `apps/api/src/integrations`.
- Cross-application HTTP contracts belong in `packages/contracts`.
- The mobile app must access the API through `packages/api-client`.

