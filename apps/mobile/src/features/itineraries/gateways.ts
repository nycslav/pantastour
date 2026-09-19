import type { GeneratedItinerary, TripPreferences } from '@saraya/contracts';

export interface ItineraryGateway {
  generate(preferences: TripPreferences, signal?: AbortSignal): Promise<GeneratedItinerary>;
  save(itinerary: GeneratedItinerary): Promise<void>;
}

export interface PendingItineraryStore {
  load(): Promise<TripPreferences | null>;
  save(preferences: TripPreferences): Promise<void>;
  clear(): Promise<void>;
}
