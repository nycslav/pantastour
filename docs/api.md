# API conventions

The team must agree on these contracts before parallel feature development:

- API version prefix
- success and error envelope formats
- validation-error representation
- authentication and token-refresh behavior
- pagination format
- date/time and coordinate representation
- idempotency rules for check-ins, invitations, webhooks, and job processing

Use plural resource names consistently, such as `/check-ins`, `/destinations`, and `/festivals`.

## Planned monetization and quota contract

This contract cannot be implemented until authentication, account persistence, and the itinerary
generation service are available. The eventual API must expose an authenticated quota snapshot and
make itinerary generation the atomic quota boundary. A mobile request must never independently
decrement a server counter.

Required behavior:

- Resolve lifetime Premium from synchronized RevenueCat entitlement state.
- Store Free lifetime usage, the current UTC calendar-month Premium usage, and purchased credits.
- Generate first, then atomically record one consumption only when generation succeeds.
- Consume included quota before purchased credits.
- Enforce a unique RevenueCat/store transaction ID for every top-up credit.
- Treat webhook retries as idempotent and return the same balance across devices.
- Reject generation before calling OpenAI when no eligible credit exists.

The provider-neutral schemas are exported from `@saraya/contracts/monetization`. Exact endpoint
names and response envelopes should be finalized jointly with the authentication and itinerary API.

