# Mobile application

This directory hosts the Expo Router application. Its implementation preserves the monorepo layout:

- `app/` contains route and layout files only.
- `src/features/` contains feature-owned UI and behavior.
- `src/core/` contains device and application infrastructure.
- `src/ui/` contains generic design-system components.
- `src/test/` contains shared test setup and helpers.

Do not commit provider secrets to the mobile bundle. All OpenAI and privileged integration calls must go through the API.

## Member 1 Shipathon slice

The current mobile implementation provides the Saraya Discover, destination-detail, trip-preference,
premium-handoff, generation, and itinerary-result flow. It follows the existing route/feature/UI
boundaries and leaves replaceable tab shells for teammate-owned features.

The app defaults to deterministic nationwide fixtures. To connect Member 2's API later, set:

```text
EXPO_PUBLIC_DATA_MODE=api
EXPO_PUBLIC_API_BASE_URL=http://<reachable-host>:3000
```

Use `EXPO_PUBLIC_MOCK_PREMIUM=true` to exercise the existing-premium path. When false or omitted, the
mock adapter demonstrates the free-user handoff that Member 3's RevenueCat adapter will replace.

Commands:

```text
npm run start --workspace=@saraya/mobile
npm run lint --workspace=@saraya/mobile
npm run typecheck --workspace=@saraya/mobile
npm run test --workspace=@saraya/mobile
```

