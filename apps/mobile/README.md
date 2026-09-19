# Mobile application

This directory hosts the Expo Router application. Its implementation preserves the monorepo layout:

- `app/` contains route and layout files only.
- `src/features/` contains feature-owned UI and behavior.
- `src/core/` contains device and application infrastructure.
- `src/ui/` contains generic design-system components.
- `src/test/` contains shared test setup and helpers.

Do not commit provider secrets to the mobile bundle. All OpenAI and privileged integration calls must go through the API.

## Current mobile integration

The mobile application uses the Saraya API for destination discovery, destination details, itinerary
generation, and itinerary persistence. It follows the existing route, feature, gateway, and shared UI
boundaries while leaving teammate-owned features in their assigned modules.

Set the reachable API URL before starting the mobile application:

```text
EXPO_PUBLIC_API_BASE_URL=http://<reachable-host>:3000
```

The application does not fall back to fabricated destination or itinerary data. Until the teammate-owned
RevenueCat integration is configured, premium itinerary access reports that the service is unavailable
instead of simulating a successful purchase.

Commands:

```text
npm run start --workspace=@saraya/mobile
npm run lint --workspace=@saraya/mobile
npm run typecheck --workspace=@saraya/mobile
npm run test --workspace=@saraya/mobile
```

