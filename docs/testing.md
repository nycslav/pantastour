# Testing strategy

Tests should cover module business rules, API/database integration, provider-adapter behavior with fakes, and principal mobile user flows.

Required cross-feature flows:

1. Onboarding to discovery
2. Destination to bucket list to check-in
3. Festival reminder and safety alert
4. Free quota, lifetime Premium, monthly included quota, and purchased generation credits

## Monetization acceptance coverage

Automated mobile tests use provider fakes and cover Free's 3 lifetime generations, success-only
consumption, exhaustion gating, lifetime Premium activation/restoration, the 10-credit monthly UTC
calendar reset, top-up persistence, included-before-top-up consumption, transaction deduplication,
purchase cancellation/failure, preference preservation, and prevention of generation calls when no
credit remains.

The mobile quota implementation is demo-only. Full integration testing remains blocked on stable
account identity and server quota persistence. When those land, API tests must prove concurrent
requests cannot overspend quota, generation failures roll back consumption, webhook redelivery does
not duplicate top-ups, and the same account observes one balance across devices.

## Mobile continuous integration

`.github/workflows/mobile-ci.yml` runs for relevant pull requests, pushes to `main` or `develop`,
and manual dispatches. It installs the exact dependency graph from `package-lock.json`, checks Expo
SDK compatibility and Android delivery configuration, then runs the mobile linter, TypeScript
compiler, and Jest suite with coverage.

The workflow intentionally does not receive RevenueCat, Expo, or EAS credentials. Purchase
tests use mocked gateways, and Android cloud builds remain an explicitly invoked delivery step.

Run the same required checks locally before opening a pull request:

```powershell
npm.cmd ci
npm.cmd run doctor --workspace=@saraya/mobile
npm.cmd run android:check
npm.cmd run lint --workspace=@saraya/mobile
npm.cmd run typecheck --workspace=@saraya/mobile
npm.cmd run test --workspace=@saraya/mobile -- --ci --coverage
```

