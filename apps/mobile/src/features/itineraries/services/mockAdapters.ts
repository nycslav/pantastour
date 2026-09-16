import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient } from '@pantastour/api-client';
import {
  generatedItinerarySchema,
  tripPreferencesSchema,
  type GeneratedItinerary,
  type ItineraryStop,
  type TripPreferences,
} from '@pantastour/contracts';

import { mockDestinations } from '@/features/discovery/data/mockDestinations';

import type { ItineraryGateway, PendingItineraryStore, PremiumAccessGateway, PremiumEntitlement } from '../gateways';

const PENDING_KEY = '@saraya/pending-itinerary';
const wait = (milliseconds: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, milliseconds);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Generation cancelled', 'AbortError'));
    }, { once: true });
  });

export const createMockItinerary = (preferences: TripPreferences): GeneratedItinerary => {
  const destination = mockDestinations.find((item) => item.id === preferences.destinationId);
  if (!destination) throw new Error('Destination unavailable');

  const days = Array.from({ length: preferences.durationDays }, (_, dayIndex) => {
    const primary = destination.highlights[dayIndex % destination.highlights.length] ?? destination.name;
    const secondary = destination.highlights[(dayIndex + 1) % destination.highlights.length] ?? 'Local community';
    const stop = (suffix: string, time: string, title: string, detail: string, kind: ItineraryStop['kind']): ItineraryStop => ({
      id: `day-${dayIndex + 1}-${suffix}`, time, title, detail, kind,
    });
    return {
      dayNumber: dayIndex + 1,
      title: dayIndex === 0 ? `Welcome to ${destination.name}` : `${primary} and local stories`,
      stops: [
        stop('start', '7:30 AM', `${preferences.startingPoint} departure`, `${preferences.pace} pace · travel time checked`, 'transport'),
        stop('activity', '10:00 AM', primary, 'Community-aware visit with time to explore', 'activity'),
        stop('meal', '1:00 PM', 'Local lunch', `${preferences.budget} budget · dietary notes can be added`, 'meal'),
        stop('stay', '5:30 PM', `${secondary} area stay`, 'Rest, review the day, and prepare for tomorrow', 'stay'),
      ],
    };
  });

  return generatedItinerarySchema.parse({
    id: `mock-${preferences.destinationId}-${preferences.durationDays}`,
    destinationId: preferences.destinationId,
    title: `${destination.name}: ${destination.tags.slice(0, 3).join(', ')}`,
    subtitle: `${preferences.durationDays} days · ${preferences.budget} · ${preferences.pace}`,
    preferences,
    days,
    generatedAt: new Date().toISOString(),
  });
};

export class MockItineraryGateway implements ItineraryGateway {
  async generate(preferences: TripPreferences, signal?: AbortSignal) {
    await wait(900, signal);
    return createMockItinerary(preferences);
  }

  async save(_itinerary: GeneratedItinerary) {
    await wait(180);
  }
}

export class MockPremiumAccessGateway implements PremiumAccessGateway {
  private entitlement: PremiumEntitlement = process.env.EXPO_PUBLIC_MOCK_PREMIUM === 'true' ? 'active' : 'inactive';

  async getEntitlement() {
    await wait(180);
    return this.entitlement;
  }

  async requestPurchase() {
    await wait(450);
    this.entitlement = 'active';
    return this.entitlement;
  }
}

export class AsyncPendingItineraryStore implements PendingItineraryStore {
  async load() {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = tripPreferencesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  }

  async save(preferences: TripPreferences) {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(preferences));
  }

  async clear() {
    await AsyncStorage.removeItem(PENDING_KEY);
  }
}

class ApiItineraryGateway implements ItineraryGateway {
  private readonly client = createApiClient(process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000');

  generate(preferences: TripPreferences, signal?: AbortSignal) {
    return this.client.itineraries.generate(preferences, signal);
  }

  save(itinerary: GeneratedItinerary) {
    return this.client.itineraries.save(itinerary);
  }
}

export const itineraryGateway: ItineraryGateway =
  process.env.EXPO_PUBLIC_DATA_MODE === 'api'
    ? new ApiItineraryGateway()
    : new MockItineraryGateway();
export const premiumAccessGateway: PremiumAccessGateway = new MockPremiumAccessGateway();
export const pendingItineraryStore: PendingItineraryStore = new AsyncPendingItineraryStore();
