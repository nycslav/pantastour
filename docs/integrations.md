# Integrations

Provider configuration and local/mock behavior must be documented for:

- Maps and geocoding
- PAGASA weather and warnings
- Firebase Cloud Messaging
- Photo storage
- RevenueCat lifetime/consumable purchases and webhooks
- OpenAI itinerary generation

Every provider should have an adapter interface so feature tests can use deterministic fakes.

## RevenueCat monetization

The mobile application owns a custom Saraya paywall behind the provider-neutral `PremiumGateway`.
RevenueCat types remain inside the RevenueCat adapter. The application displays localized prices
from RevenueCat and never embeds a price as the store source of truth.

### Existing Test Store configuration

| Purpose | Identifier | RevenueCat setup |
| --- | --- | --- |
| Premium entitlement | `saraya_premium` | Granted only by the lifetime product |
| Lifetime product | `saraya_premium_lifetime` | Non-consumable, attached to `saraya_premium` |
| Generation pack | `saraya_generations_10` | Consumable, not attached to an entitlement |
| Offering | `default` | Current offering containing both packages |
| Lifetime package | `saraya_premium_lifetime` | Exposes the lifetime product |
| Top-up package | `saraya_generations_10` | Exposes the consumable product |

These identifiers are defaults in `revenuecat.config.ts` and must exactly match RevenueCat. They can
be overridden with `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`,
`EXPO_PUBLIC_REVENUECAT_OFFERING_ID`, `EXPO_PUBLIC_REVENUECAT_LIFETIME_PACKAGE_ID`, and
`EXPO_PUBLIC_REVENUECAT_TOP_UP_PACKAGE_ID`.

The intended generation-pack configuration is USD $5.00. Configure that price in each store; the
app uses RevenueCat's localized `priceString` at runtime. Test Store keys are for development and
preview only. Production must use the Android public SDK key and matching Google Play products.

### Quota behavior

- Free: 3 included generations for the lifetime of the account; no regeneration.
- Lifetime Premium: 10 included generations per UTC calendar month and Premium feature access.
- Purchased generation credits do not reset.
- Included quota is consumed before purchased quota.
- A generation is consumed only after itinerary generation succeeds.
- Top-ups are deduplicated by the store/RevenueCat transaction identifier.

The current mobile `LocalGenerationQuotaGateway` persists demo state in AsyncStorage. It is not
secure, is not synchronized across devices, and is not account-authoritative. Once authentication
and Member 2's itinerary backend are available, the API must own quota rows, calendar rollover,
transaction-id uniqueness, and an atomic generate-then-consume operation. RevenueCat webhooks must
idempotently record top-ups. The app should then replace the local gateway with an API adapter.

