import type { GeneratedItinerary, TripPreferences } from '@pantastour/contracts';

export interface ItineraryGateway {
  generate(preferences: TripPreferences, signal?: AbortSignal): Promise<GeneratedItinerary>;
  save(itinerary: GeneratedItinerary): Promise<void>;
}

export type PremiumEntitlement = 'inactive' | 'active' | 'expired';

export interface PremiumAccessGateway {
  getEntitlement(): Promise<PremiumEntitlement>;
  requestPurchase(): Promise<PremiumEntitlement>;
}

export interface PendingItineraryStore {
  load(): Promise<TripPreferences | null>;
  save(preferences: TripPreferences): Promise<void>;
  clear(): Promise<void>;
}
