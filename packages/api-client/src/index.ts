import {
  destinationDetailSchema,
  destinationSummarySchema,
  generatedItinerarySchema,
  nearbyDestinationSummarySchema,
  type DiscoveryQuery,
  type GeneratedItinerary,
  type NearbyDestinationQueryInput,
  type TripPreferences,
} from '@saraya/contracts';
import { z } from 'zod';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function createApiClient(baseUrl: string, getAccessToken?: () => Promise<string | null>) {
  const request = async (path: string, init?: RequestInit) => {
    const token = await getAccessToken?.();
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    if (!response.ok) throw new ApiClientError('Saraya API request failed.', response.status);
    return response.json() as Promise<unknown>;
  };

  return {
    destinations: {
      async list(query: DiscoveryQuery) {
        const params = new URLSearchParams();
        if (query.search) params.set('search', query.search);
        if (query.islandGroup) params.set('islandGroup', query.islandGroup);
        if (query.interest) params.set('interest', query.interest);
        const data = await request(`/destinations?${params.toString()}`);
        return z.array(destinationSummarySchema).parse(data);
      },
      async getById(id: string) {
        return destinationDetailSchema.parse(await request(`/destinations/${encodeURIComponent(id)}`));
      },
      async nearby(query: NearbyDestinationQueryInput) {
        const params = new URLSearchParams({
          latitude: String(query.latitude),
          longitude: String(query.longitude),
        });
        if (query.radiusKm !== undefined) params.set('radiusKm', String(query.radiusKm));
        if (query.limit !== undefined) params.set('limit', String(query.limit));
        const data = await request(`/destinations/nearby?${params.toString()}`);
        return z.array(nearbyDestinationSummarySchema).parse(data);
      },
    },
    itineraries: {
      async generate(preferences: TripPreferences, signal?: AbortSignal) {
        return generatedItinerarySchema.parse(await request('/itineraries/generate', {
          method: 'POST', body: JSON.stringify(preferences), signal,
        }));
      },
      async save(itinerary: GeneratedItinerary) {
        await request('/itineraries', { method: 'POST', body: JSON.stringify(itinerary) });
      },
      async getById(id: string) {
        return generatedItinerarySchema.parse(
          await request(`/itineraries/${encodeURIComponent(id)}`),
        );
      },
    },
  };
}

export type SarayaApiClient = ReturnType<typeof createApiClient>;
