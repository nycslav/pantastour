# Mobile application

This directory is reserved for the Expo Router application.

Bootstrap it after Node.js LTS is installed, preserving this layout:

- `app/` contains route and layout files only.
- `src/features/` contains feature-owned UI and behavior.
- `src/core/` contains device and application infrastructure.
- `src/ui/` contains generic design-system components.
- `src/test/` contains shared test setup and helpers.

Do not commit provider secrets to the mobile bundle. All OpenAI and privileged integration calls must go through the API.

