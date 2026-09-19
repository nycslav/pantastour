import { tripPreferencesSchema } from '@saraya/contracts';

import { createMockItinerary } from '../services/mockAdapters';

const preferences = tripPreferencesSchema.parse({
  destinationId: 'siargao',
  startingPoint: 'Sayak Airport',
  durationDays: 5,
  budget: 'Comfort',
  interests: ['Surfing', 'Local food'],
  pace: 'Balanced',
  accessibilityNeeds: 'Step-free options where possible',
});

describe('itinerary adapters', () => {
  it('creates the requested number of structured days without Cebu assumptions', () => {
    const itinerary = createMockItinerary(preferences);
    expect(itinerary.days).toHaveLength(5);
    expect(itinerary.title).toContain('Siargao');
    expect(itinerary.title).not.toContain('Cebu');
    expect(itinerary.days.every((day) => day.stops.length === 4)).toBe(true);
  });

  it('rejects missing interests before generation', () => {
    expect(() => tripPreferencesSchema.parse({ ...preferences, interests: [] })).toThrow();
  });
});
