# API application

This directory contains the Express API and background jobs.

- `src/modules` contains business capabilities.
- `src/integrations` contains external provider adapters.
- `src/platform` contains database, cache, HTTP, logging, and configuration infrastructure.
- `src/jobs` contains schedulable job entry points.
- `tests` contains cross-module and end-to-end tests.

Each module should expose a narrow public interface and normally use route, controller, service, repository, schema, policy, and test files.

