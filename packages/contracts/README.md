# Shared contracts

This package is the source of truth for API request, response, pagination, enum, and runtime validation contracts. Organize exports by feature and infer TypeScript types from runtime schemas where possible.

Dependency direction:

```text
contracts <- api-client <- mobile
contracts <- api
```

This package must not import from either application.

