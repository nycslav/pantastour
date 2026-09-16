import {
  destinationDetailSchema,
  destinationSummarySchema,
  generatedItinerarySchema,
  type DiscoveryQuery,
  type GeneratedItinerary,
  type TripPreferences,
} from '@pantastour/contracts';
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
    },
  };
}

export type SarayaApiClient = ReturnType<typeof createApiClient>;
