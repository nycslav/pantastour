# Integrations

Provider configuration and local/mock behavior must be documented for:

- Maps and geocoding
- PAGASA weather and warnings
- Firebase Cloud Messaging
- Photo storage
- RevenueCat subscriptions and webhooks
- Google Gemini itinerary generation, with deterministic local fallback

Every provider should have an adapter interface so feature tests can use deterministic fakes.

## Gemini itinerary generation

Create a Gemini API key in Google AI Studio, then place it only in the repository-root `.env`:

```text
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.6-flash
ITINERARY_GENERATOR=
```

Never use an `EXPO_PUBLIC_` name for this key and never commit `.env`. With no key, with
`ITINERARY_GENERATOR=deterministic`, or when Gemini returns an error, the backend produces the same
validated itinerary contract through its deterministic generator.

