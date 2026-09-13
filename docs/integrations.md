# Integrations

Provider configuration and local/mock behavior must be documented for:

- Maps and geocoding
- PAGASA weather and warnings
- Firebase Cloud Messaging
- Photo storage
- RevenueCat subscriptions and webhooks
- OpenAI itinerary generation

Every provider should have an adapter interface so feature tests can use deterministic fakes.

