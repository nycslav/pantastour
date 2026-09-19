# Integrations

Provider configuration and local/mock behavior must be documented for:

- Maps and geocoding
- PAGASA weather and warnings
- Firebase Cloud Messaging
- Photo storage
- RevenueCat subscriptions and webhooks
- Google Gemini itinerary generation, with deterministic local fallback
- Geoapify nearby-place discovery for grounded itinerary stops

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

## Geoapify place discovery

Create a Geoapify project and keep its API key only in the repository-root `.env`:

```text
GEOAPIFY_API_KEY=your_key_here
GEOAPIFY_RADIUS_METERS=15000
GEOAPIFY_PLACE_LIMIT=60
```

The API requests nearby dining, attraction, accommodation, and museum candidates around the
selected destination. Results are normalized and cached in memory for 15 minutes. Gemini receives
the candidate list and may reference only its IDs; the backend resolves those IDs to trusted names,
addresses, and coordinates before returning or saving the itinerary. Missing credentials, provider
errors, empty results, invalid candidate IDs, or AI errors preserve the deterministic fallback.

Never place this key in an `EXPO_PUBLIC_` variable. Verify Geoapify attribution and storage terms
before changing the current short-lived cache into durable place storage.

